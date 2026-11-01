import { useEffect, type RefObject } from 'react';

/** Move the DOM name and the whole character in opposite directions. */
export function useHeroDepth(ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const hero = ref.current?.closest<HTMLElement>('.hero-section');
    if (!hero) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, x = 0, y = 0;
    const update = () => {
      frame = 0;
      if (motion.matches) {
        hero.style.setProperty('--depth-x', '0px'); hero.style.setProperty('--depth-y', '0px');
        return;
      }
      const scroll = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / hero.clientHeight));
      hero.style.setProperty('--depth-x', `${x * 8}px`);
      hero.style.setProperty('--depth-y', `${Math.min(8, y * 4 + scroll * 8)}px`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const pointer = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
      schedule();
    };
    const leave = () => { x = 0; y = 0; schedule(); };
    hero.addEventListener('pointermove', pointer, { passive: true });
    hero.addEventListener('pointerleave', leave);
    window.addEventListener('scroll', schedule, { passive: true });
    motion.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame); hero.removeEventListener('pointermove', pointer);
      hero.removeEventListener('pointerleave', leave); window.removeEventListener('scroll', schedule);
      motion.removeEventListener('change', schedule);
      hero.style.removeProperty('--depth-x'); hero.style.removeProperty('--depth-y');
    };
  }, [ref]);
}
