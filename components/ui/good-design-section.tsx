import React, { useLayoutEffect, useRef } from 'react';
import { sceneReady } from '../../src/scroll-ready';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { NightStars, NightFinish } from './night-scenery';
import './good-design-section.css';

gsap.registerPlugin(ScrollTrigger);

export const GoodDesignSection = () => {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current!;
    let disposed = false;
    const originals = Array.from(root.querySelectorAll<HTMLElement>('.focus-line')).map(line => ({ line, nodes: Array.from(line.childNodes) }));
    const ctx = gsap.context(() => {}, root);

    document.fonts.ready.then(() => {
      if (disposed) return;
      ctx.add(() => {
        originals.forEach(({ line }) => {
          const words = line.textContent!.split(/\s+/).filter(Boolean);
          const nodes: Node[] = [];
          words.forEach((word, index) => {
            if (index) nodes.push(document.createTextNode(' '));
            const span = document.createElement('span');
            span.className = `focus-word${word === 'focus' ? ' focus-word-amber' : ''}`;
            span.textContent = word;
            nodes.push(span);
          });
          line.replaceChildren(...nodes);
        });
        const mm = gsap.matchMedia();
        mm.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, media => {
          const $ = <T extends Element = HTMLElement,>(selector: string) => root.querySelector<T>(selector)!;
          const stage = $('.focus-stage');
          const words = Array.from(root.querySelectorAll<HTMLElement>('.focus-word'));
          const frame = $('.focus-finder'), pulse = $('.focus-finder-pulse');
          const cream = $('.focus-finder-cream'), amber = $('.focus-finder-amber');
          const cross = $('.focus-cross'), label = $('.focus-af');
          const glow = $('.focus-glow'), subtitle = $('.focus-subtitle'), underline = $('.focus-underline');
          if (media.conditions!.reduce) {
            gsap.set(words, { opacity: 1, filter: 'blur(0px)', y: 0 });
            gsap.set(subtitle, { opacity: 1, y: 0 });
            gsap.set(underline, { scaleX: 1, transformOrigin: '0 50%' });
            gsap.set(frame, { opacity: 0 });
            gsap.set(glow, { opacity: 0 });
            return;
          }

          const state = { scan: 0, lock: 0 };
          const geo = { takeX: 0, focusX: 0, y: 0, w: 1, h: 1, stageW: 1 };
          const layoutPosition = (element: HTMLElement) => {
            let x = 0, y = 0, node: HTMLElement | null = element;
            while (node && node !== stage) { x += node.offsetLeft; y += node.offsetTop; node = node.offsetParent as HTMLElement | null; }
            return { x, y };
          };
          const measure = () => {
            const take = words[2], focus = words[3];
            const a = layoutPosition(take), b = layoutPosition(focus);
            geo.takeX = a.x + take.offsetWidth / 2;
            geo.focusX = b.x + focus.offsetWidth / 2;
            geo.y = b.y + focus.offsetHeight / 2;
            geo.w = focus.offsetWidth + 48; geo.h = focus.offsetHeight + 48;
            geo.stageW = stage.clientWidth;
            frame.style.width = `${geo.w}px`; frame.style.height = `${geo.h}px`;
            const corner = 20, inset = 2, right = geo.w - inset, bottom = geo.h - inset;
            const path = `M${inset} ${inset + corner}V${inset}H${inset + corner}M${right - corner} ${inset}H${right}V${inset + corner}M${right} ${bottom - corner}V${bottom}H${right - corner}M${inset + corner} ${bottom}H${inset}V${bottom - corner}`;
            root.querySelectorAll<SVGSVGElement>('.focus-brackets').forEach(svg => svg.setAttribute('viewBox', `0 0 ${geo.w} ${geo.h}`));
            root.querySelectorAll<SVGPathElement>('.focus-brackets path').forEach(p => p.setAttribute('d', path));
          };
          measure();
          // The frame's pose has one owner; timeline state is independent of layout.
          gsap.set(frame, { x: 0, y: 0, xPercent: -50, yPercent: -50, scaleX: 1, scaleY: 1, opacity: 0, transformOrigin: '50% 50%' });
          gsap.set(glow, { x: 0, y: 0, xPercent: -50, yPercent: -50, opacity: 0 });
          gsap.set(words, { opacity: .18, filter: 'blur(10px)', y: 20 });
          gsap.set(subtitle, { opacity: 0, y: 24 });
          gsap.set(underline, { scaleX: 0, transformOrigin: '0 50%' });
          gsap.set(pulse, { scale: 1, transformOrigin: '50% 50%' });
          gsap.set(cream, { opacity: 1 });
          gsap.set([amber, cross, label], { opacity: 0 });
          const setX = gsap.quickSetter(frame, 'x', 'px'), setY = gsap.quickSetter(frame, 'y', 'px');
          const setScaleX = gsap.quickSetter(frame, 'scaleX'), setScaleY = gsap.quickSetter(frame, 'scaleY');
          const glowX = gsap.quickSetter(glow, 'x', 'px'), glowY = gsap.quickSetter(glow, 'y', 'px');
          const render = () => {
            const scanX = geo.takeX + geo.stageW * (-.12 + state.scan * .24);
            const sizeLock = Math.min(1, Math.max(0, state.lock));
            setX(scanX + (geo.focusX - scanX) * state.lock); setY(geo.y);
            setScaleX((1.6 * geo.stageW / geo.w) * (1 - sizeLock) + sizeLock);
            setScaleY(1.6 * (1 - sizeLock) + sizeLock);
            glowX(geo.focusX); glowY(geo.y);
          };
          render();
          const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none', immediateRender: false }, onUpdate: render });
          timeline.addLabel('resolve', 0).addLabel('scan', 35).addLabel('reveal', 70)
            .to(words.slice(0, 2), { opacity: 1, filter: 'blur(0px)', y: 0, duration: 22, stagger: 13, ease: 'power2.out' }, 0)
            .to(frame, { opacity: .5, duration: 2 }, 35)
            .to(state, { scan: 1, duration: 12, ease: 'sine.inOut' }, 35)
            .to(state, { lock: 1, duration: 14, ease: 'back.out(1.6)' }, 47)
            .to(label, { opacity: 1, duration: 2 }, 59)
            .to(words.slice(2), { opacity: 1, filter: 'blur(0px)', y: 0, duration: 2, ease: 'power2.out' }, 60)
            .to(cream, { opacity: 0, duration: 1 }, 61)
            .to(amber, { opacity: 1, duration: 1 }, 61)
            .to(cross, { opacity: 1, duration: 1 }, 61)
            .to(cross, { opacity: 0, duration: 2 }, 63)
            .to(pulse, { scale: 1.08, duration: 3, ease: 'sine.inOut' }, 62)
            .to(pulse, { scale: 1, duration: 3, ease: 'sine.inOut' }, 65)
            .to(glow, { opacity: .16, duration: 9, ease: 'sine.out' }, 61)
            .to(subtitle, { opacity: 1, y: 0, duration: 18, ease: 'power2.out' }, 70)
            .to(frame, { opacity: .35, duration: 12 }, 70)
            .to(underline, { scaleX: 1, duration: 20, ease: 'power2.out' }, 80);
          ScrollTrigger.create({
            id: 'focus-statement', trigger: root, animation: timeline, start: 'top top', end: () => `+=${window.innerHeight * 2.6}`,
            pin: stage, pinType: 'transform', pinSpacing: true, scrub: .4, anticipatePin: 1, invalidateOnRefresh: true,
            onRefreshInit: measure, onRefresh: render,
          });
        });
        sceneReady('focus');
        return () => mm.revert();
      });
    });

    return () => { disposed = true; ctx.revert(); originals.forEach(({ line, nodes }) => line.replaceChildren(...nodes)); };
  }, []);

  return <section ref={rootRef} className="focus-night night-scene" aria-label="Great things take focus">
    <div className="focus-stage">
      <svg className="focus-stars" aria-hidden="true"><NightStars count={25} twinkle/></svg>
      <div className="focus-glow" aria-hidden="true"/>
      <div className="focus-composition">
        <h2 className="focus-line focus-line-first">Great things</h2>
        <h2 className="focus-line focus-line-second">take <span className="focus-word-amber">focus</span></h2>
        <div className="focus-subtitle-wrap"><p className="focus-subtitle">and I build them to last</p><span className="focus-underline" aria-hidden="true"/></div>
      </div>
      <div className="focus-finder" aria-hidden="true"><div className="focus-finder-pulse">
        <svg className="focus-brackets focus-finder-cream"><path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/></svg>
        <svg className="focus-brackets focus-finder-amber"><path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/></svg>
        <span className="focus-af">AF</span>
        <svg className="focus-cross" viewBox="0 0 24 24"><path d="M12 4V20M4 12H20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
      </div></div>
      <NightFinish/>
    </div>
  </section>;
};
