import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const selectors = {
  lid: '#character-svg #lid', tiles: '.tech-tile', svg: '#character-svg', canvas: '#ascii-canvas',
  name: '.hero-name', nav: '.hero-nav', badge: '#avatar-badge', background: '.stage', camera: '.journey-camera',
  portal: '.portal', next: '.next-screen', content: '.next-content', foregroundLid: '#journey-raised-lid',
};
export function installJourneyDebug() {
  if (!import.meta.env.DEV && !new URLSearchParams(location.search).has('debug')) return () => {};
  const panel = document.createElement('aside');
  panel.id = 'journey-debug'; panel.hidden = new URLSearchParams(location.search).get('debug') !== '1';
  panel.setAttribute('aria-label', 'Journey animation diagnostics');
  panel.style.cssText = 'position:fixed;top:12px;right:12px;z-index:100000;background:#12172B;color:#F6F0E4;padding:8px;font:11px/1.4 monospace;border:1px solid #C9D3EE;border-radius:8px;max-width:230px;pointer-events:none';
  const output = document.createElement('pre'); output.style.margin = '0 0 8px'; panel.append(output);
  const master = () => ScrollTrigger.getById('hero-journey');
  const sample = () => {
    const trigger = master(), timeline = trigger?.animation;
    const ascii = (document.querySelector('.character-renderer') as any)?.__asciiState?.();
    return { scrollY: Math.round(scrollY), pinned: ScrollTrigger.getAll().filter(t => t.pin).map(t => ({id:t.vars.id || 'unnamed', start:Math.round(t.start), end:Math.round(t.end), scrollProgress:+t.progress.toFixed(4), masterProgress:+(t.animation?.progress() || 0).toFixed(4)})), scroll: trigger?.progress ?? 0, master: timeline?.progress() ?? 0,
      beat: timeline?.currentLabel() || 'initial', ascii: ascii || { running: false },
      badge: document.querySelector<HTMLElement>('#avatar-badge')?.dataset.state || document.querySelector<HTMLElement>('#avatar-badge')?.dataset.docked || 'hidden',
      triggers: ScrollTrigger.getAll().length, tweens: gsap.globalTimeline.getChildren().length };
  };
  const snapshot = () => Object.fromEntries(Object.entries(selectors).map(([name, selector]) => [name,
    [...document.querySelectorAll<HTMLElement>(selector)].map(node => {
      const style = getComputedStyle(node);
      return { transform: style.transform, svgTransform: node.getAttribute('transform'), opacity: style.opacity,
        visibility: style.visibility, background: style.backgroundColor, color: style.color, filter: style.filter,
        inert: node.inert, arrival: node.dataset.arrival ?? null, docked: node.dataset.docked ?? null };
    })]));
  const jump = (progress: number) => {
    const trigger = master(); if (!trigger) return;
    window.dispatchEvent(new CustomEvent('journey-debug-jump', { detail: trigger.start + (trigger.end - trigger.start) * progress }));
    ScrollTrigger.update();
    trigger.getTween()?.progress(1);
    const actual = trigger.progress < .000001 ? 0 : trigger.progress > .999999 ? 1 : trigger.progress;
    trigger.animation?.progress(actual);
  };
  for (const progress of [0, .18, .45, .8, .95, 1]) {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = `${progress * 100}%`;
    button.style.cssText = 'margin-right:6px;padding:5px 9px;background:#E4EAF6;color:#1B2347;border:0;border-radius:3px;cursor:pointer';
    button.hidden=true; button.addEventListener('click', () => jump(progress)); panel.append(button);
  }
  document.body.append(panel);
  const key = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() !== 'd' || event.repeat || event.metaKey || event.ctrlKey || event.altKey ||
      (event.target as HTMLElement)?.closest('input,textarea,select,[contenteditable="true"]')) return;
    panel.hidden = !panel.hidden;
  };
  const render = () => { if (!panel.hidden) { const state=sample(); output.textContent=`Y ${state.scrollY}px\n`+state.pinned.map(p=>`${p.id}: ${(p.masterProgress*100).toFixed(1)}%`).join('\n'); } };
  const audit = () => {
    const triggers = ScrollTrigger.getAll(), ids = triggers.map(t => t.vars.id).filter(Boolean);
    const duplicates = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
    const tweens = gsap.globalTimeline.getChildren(true, true, false) as gsap.core.Tween[];
    const conflicts: { target: string; property: string }[] = [];
    // Only report actually overlapping ranges, not sequential keyframes of one owner.
    const owners = new Map<any, Map<string, gsap.core.Tween[]>>();
    for (const tween of tweens) for (const target of tween.targets()) {
      if (!(target instanceof Element) || !target.closest('.journey, #avatar-root')) continue;
      const map = owners.get(target) || new Map(); owners.set(target, map);
      for (const property of ['x','y','scale','scaleX','scaleY','rotation','opacity']) {
        if (!(property in tween.vars)) continue;
        const previous = map.get(property) || [];
        if (previous.some(other => Math.max(other.globalTime(0), tween.globalTime(0)) <
          Math.min(other.globalTime(other.duration()), tween.globalTime(tween.duration())) - .000001)) {
          conflicts.push({ target: target.id || target.getAttribute('class') || target.tagName, property });
        }
        previous.push(tween); map.set(property, previous);
      }
    }
    console.info('[journey-debug] ownership audit', { duplicates, conflicts });
    return { duplicates, conflicts };
  };
  const freezeIdle = (frozen = true) => {
    const clock = (document.querySelector('.character-renderer') as any)?.__asciiClock;
    if (clock) clock.freezeIdle = frozen;
    document.documentElement.dataset.journeyIdleFrozen = String(frozen);
    window.dispatchEvent(new Event('journey-debug-idle'));
  };
  const refreshAudit = () => {
    const ids = ScrollTrigger.getAll().map(trigger => trigger.vars.id).filter(Boolean);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length) console.error('[journey-debug] duplicate ScrollTriggers', duplicates);
  };
  ScrollTrigger.addEventListener('refresh', refreshAudit);
  (window as any).__journeyDebug = { sample, snapshot, jump, audit, freezeIdle };
  (window as any).__scrollStoryQA = {
    sample,
    seek: (y: number) => {
      window.dispatchEvent(new CustomEvent('journey-debug-jump', {detail:y}));
      ScrollTrigger.update();
      ScrollTrigger.getAll().forEach(t => {
        t.getTween()?.progress(1);
        if(t.animation) t.animation.progress(Math.max(0, Math.min(1, (y-t.start)/(t.end-t.start))));
      });
      render();
    },
    refresh: () => ScrollTrigger.refresh(),
  };
  document.addEventListener('keydown', key); gsap.ticker.add(render);
  return () => { ScrollTrigger.removeEventListener('refresh', refreshAudit); delete document.documentElement.dataset.journeyIdleFrozen; panel.remove(); document.removeEventListener('keydown', key); gsap.ticker.remove(render); delete (window as any).__journeyDebug; delete (window as any).__scrollStoryQA; };
}
