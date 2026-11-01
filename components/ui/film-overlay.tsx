import React, { useEffect, useRef } from 'react';

export function FilmOverlay({ intensity = .6 }: { intensity?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const overlay = ref.current, stage = document.querySelector<HTMLElement>('.hero-section');
    const root = document.getElementById('film-root');
    if (!overlay || !stage) return;
    let enabled = true, visible = true, disposed = false;
    let timer: ReturnType<typeof setTimeout>;
    let dustCleanup: ReturnType<typeof setTimeout>;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const tile = document.createElement('canvas'); tile.width = tile.height = 256;
    const ctx = tile.getContext('2d')!;
    const noise = ctx.createImageData(256, 256);
    for (let i = 0; i < noise.data.length; i += 4) {
      const value = 128 + (Math.random() + Math.random() + Math.random() - 1.5) * 110;
      noise.data[i] = noise.data[i + 1] = noise.data[i + 2] = value; noise.data[i + 3] = 255;
    }
    ctx.putImageData(noise, 0, 0);
    overlay.style.setProperty('--noise-tile', `url(${tile.toDataURL()})`);
    stage.classList.add('film-stage');
    stage.style.setProperty('--film-level', String(Math.max(0, Math.min(1, intensity))));
    root?.style.setProperty('--film-level', String(Math.max(0, Math.min(1, intensity))));
    const particles = overlay.querySelector<HTMLElement>('.film-particles')!;
    let scratchAt = performance.now() + 8000 + Math.random() * 7000;
    const dust = () => {
      if (disposed) return;
      if (enabled && visible && !document.hidden && !motion.matches) {
        particles.replaceChildren();
        const scratch = performance.now() > scratchAt;
        if (scratch) scratchAt = performance.now() + 8000 + Math.random() * 7000;
        const count = scratch ? 1 : 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          const dot = document.createElement('i');
          dot.className = scratch ? 'film-scratch' : 'film-speck';
          dot.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 70}%;--speck-size:${1 + Math.random() * 2}px`;
          particles.appendChild(dot);
        }
      }
      dustCleanup = setTimeout(() => particles.replaceChildren(), 160);
      timer = setTimeout(dust, 2000 + Math.random() * 3000);
    };
    const sync = () => {
      const active = enabled && visible && !document.hidden && document.documentElement.dataset.journeyIdleFrozen !== 'true';
      stage.dataset.film = enabled ? 'on' : 'off';
      if (root) root.dataset.film = enabled ? 'on' : 'off';
      overlay.dataset.paused = String(!active);
      stage.dataset.filmPaused = String(!active);
      clearTimeout(timer); particles.replaceChildren();
      if (active && !motion.matches) timer = setTimeout(dust, 2000 + Math.random() * 3000);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'g' || event.repeat || event.ctrlKey || event.metaKey || event.altKey || (event.target as HTMLElement)?.closest('input,textarea,select,[contenteditable="true"]')) return;
      enabled = !enabled; sync();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(stage);
    document.addEventListener('visibilitychange', sync); window.addEventListener('keydown', key);
    motion.addEventListener('change', sync); window.addEventListener('journey-debug-idle', sync); sync();
    return () => {
      disposed = true; clearTimeout(timer); clearTimeout(dustCleanup); observer.disconnect();
      document.removeEventListener('visibilitychange', sync); window.removeEventListener('keydown', key);
      motion.removeEventListener('change', sync); window.removeEventListener('journey-debug-idle', sync); stage.classList.remove('film-stage');
      stage.style.removeProperty('--film-level'); delete stage.dataset.film; delete stage.dataset.filmPaused;
      root?.style.removeProperty('--film-level'); if (root) delete root.dataset.film;
    };
  }, [intensity]);
  return <div ref={ref} className="film-overlay" aria-hidden="true"><div className="film-haze"/><div className="film-grain"/><div className="film-vignette"/><div className="film-particles"/></div>;
}
