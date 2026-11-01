import gsap from 'gsap';

/** Called only inside the master gsap.context; no ScrollTrigger or autonomous flight. */
export function createAvatarJourney(badge: HTMLButtonElement, mobile: boolean, reduced: boolean, idleFrozen: () => boolean) {
  const marker = document.querySelector<HTMLElement>('.avatar-dock-target')!;
  const motion = badge.querySelector('.avatar-motion')!;
  const settle = badge.querySelector('.avatar-settle')!;
  const pulse = badge.querySelector('.avatar-pulse')!;
  const dockPulse = badge.querySelector('.avatar-dock-pulse')!;
  const eyes = badge.querySelectorAll('.mascot-eye');
  const pupils = badge.querySelectorAll('.mascot-pupil');
  const hand = badge.querySelector('#badge-hand')!;
  let dock = { x: 0, y: 0, scale: 1, width: 0, cx: 0, cy: 0 };
  let docked = false, visible = true, idleActive = false;
  const measure = () => {
    const rect = marker.getBoundingClientRect();
    dock = { x: rect.left + rect.width / 2 - innerWidth / 2,
      y: rect.top + scrollY + rect.height / 2 - innerHeight / 2, scale: rect.width / 280,
      width: rect.width, cx: rect.left + rect.width / 2, cy: rect.top + scrollY + rect.height / 2 };
  };
  measure();
  gsap.set(badge, { x: 0, y: 0, xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0, rotation: -12 });
  gsap.set([motion, settle], { scaleX: 1, scaleY: 1 });
  gsap.set([pulse, dockPulse], { scale: 1, opacity: 0 });
  gsap.set(eyes, { scaleY: 1, transformOrigin: '50% 50%', transformBox: 'fill-box' });
  gsap.set(pupils, { x: 0, y: 0 });
  gsap.set(hand, { rotation: 0, transformOrigin: '520px 285px', transformBox: 'view-box' });
  const wave = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 4.4, data: 'badge-idle' })
    .to(hand, { rotation: 14, duration: .15, ease: 'sine.inOut' })
    .to(hand, { rotation: -14, duration: .3, ease: 'sine.inOut' })
    .to(hand, { rotation: 0, duration: .15, ease: 'sine.inOut' });
  const syncIdle = () => {
    const active = docked && visible && !document.hidden && !reduced && !idleFrozen();
    if (active === idleActive) return;
    idleActive = active;
    if (active) wave.play(0); else { wave.pause(0, true); gsap.set(pupils, { x: 0, y: 0 }); }
  };
  const flight = gsap.timeline({ paused: true, defaults: { immediateRender: false }, data: 'badge-arrival' });
  if (reduced) {
    gsap.set(badge, { x: () => dock.x, y: () => dock.y, scale: () => dock.scale, rotation: 0 });
    flight.to(badge, { autoAlpha: 1, duration: .3, ease: 'power2.out' });
  } else {
    flight.addLabel('tiny', 0).addLabel('expand', .35).addLabel('pulse', .55).addLabel('blink', .72)
      .addLabel('glide', .95).addLabel('descend', 1.05).addLabel('unsquash', 1.2)
      .addLabel('untilt', 1.27).addLabel('dock', 1.7).addLabel('settle', 1.78)
      .to(badge, { scale: .25, autoAlpha: 1, duration: .35, ease: 'power2.out' }, 'tiny')
      .to(badge, { scale: 1, rotation: 0, duration: .6, ease: 'back.out(2)' }, 'expand')
      .to(pulse, { opacity: .3, duration: .001 }, 'pulse')
      .to(pulse, { scale: 1.3, opacity: 0, duration: .449 }, 'pulse+=0.001')
      .to(eyes, { scaleY: .1, duration: .07, repeat: 1, yoyo: true }, 'blink')
      .to(badge, { x: () => dock.x, duration: mobile ? .62 : .75, ease: 'power2.out' }, 'glide')
      .to(badge, { y: () => dock.y - (mobile ? 12 : 35), duration: .65, ease: 'power3.in' }, 'descend')
      .to(badge, { scale: () => dock.scale, duration: .75, ease: 'power2.inOut' }, 'glide')
      .to(badge, { rotation: 8, duration: .32, ease: 'sine.inOut' }, 'glide')
      .to(badge, { rotation: 0, duration: .43, ease: 'sine.inOut' }, 'untilt')
      .to(motion, { scaleX: 1.06, scaleY: .95, duration: .25 }, 'glide')
      .to(motion, { scaleX: 1, scaleY: 1, duration: .5 }, 'unsquash')
      .to(badge, { y: () => dock.y, duration: .25, ease: 'power2.out' }, 'dock')
      .to(settle, { scale: 1.08, duration: .08, ease: 'power2.out' }, 'dock')
      .to(settle, { scale: 1, duration: .17, ease: 'elastic.out(1,.6)' }, 'settle')
      .to(dockPulse, { opacity: .3, duration: .001 }, 'dock')
      .to(dockPulse, { scale: 1.3, opacity: 0, duration: .249 }, 'dock+=0.001');
  }
  const update = (progress: number) => {
    docked = progress >= 1;
    badge.disabled = !docked;
    badge.dataset.docked = String(docked);
    badge.dataset.state = progress <= 0 ? 'hidden' : docked ? 'docked' : progress < .35 / 1.95 ? 'tiny' : progress < .95 / 1.95 ? 'expand' : 'glide';
    badge.style.willChange = progress > 0 && progress < 1 && !reduced ? 'transform' : '';
    syncIdle();
  };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncIdle(); }); observer.observe(badge);
  const track = (event: PointerEvent) => {
    if (!idleActive || event.pointerType === 'touch') return;
    const dx = event.clientX - dock.cx, dy = event.clientY - dock.cy, length = Math.hypot(dx, dy) || 1;
    const radius = Math.min(3, length / 70) * 420 / dock.width;
    gsap.set(pupils, { x: dx / length * radius, y: dy / length * radius });
  };
  const resetPupils = () => gsap.set(pupils, { x: 0, y: 0 });
  document.addEventListener('visibilitychange', syncIdle);
  window.addEventListener('pointermove', track, { passive: true }); document.addEventListener('pointerleave', resetPupils);
  update(0);
  return { flight, measure, update, dispose: () => {
    observer.disconnect(); wave.kill(); gsap.killTweensOf(pupils);
    document.removeEventListener('visibilitychange', syncIdle); window.removeEventListener('pointermove', track);
    document.removeEventListener('pointerleave', resetPupils);
    badge.style.removeProperty('will-change'); badge.disabled = true;
    delete badge.dataset.docked; delete badge.dataset.state;
  } };
}
