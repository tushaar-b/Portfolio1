import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { AsciiClock } from './use-ascii-character';

/** A small mobile clock; About becomes normal document content below the pin. */
export function mobileHeroJourney(hero: HTMLElement, journey: HTMLElement, clock: AsciiClock) {
  const scene = hero.querySelector<HTMLElement>('.journey-scene')!;
  const camera = hero.querySelector<HTMLElement>('.journey-camera')!;
  const character = hero.querySelector<HTMLElement>('.character-stage')!;
  const headline = hero.querySelector<HTMLElement>('.next-screen')!;
  const lid = hero.querySelector('#lid')!;
  const tiles = hero.querySelector<HTMLElement>('.tiles')!;
  const ui = hero.querySelectorAll<HTMLElement>('.hero-nav,.hero-scroll,.experiment-toggle');
  const name = hero.querySelector<HTMLElement>('.hero-name')!;
  const subtitle = hero.querySelector<HTMLElement>('.hero-subtitle')!;
  const state = { dissolve: 0 };
  const nodes = ['JS', 'PY', 'REACT', 'NODE', 'CSS', 'TS'].map((mark, i) => {
    const tile = document.createElement('div'); tile.className = 'tech-tile';
    const face = document.createElement('span'); face.textContent = mark;
    face.style.background = ['#C9D3EE', '#F4A640', '#F6F0E4'][i % 3];
    tile.append(face); tiles.append(tile); return tile;
  });
  const opening = () => ({ x: hero.clientWidth / 2, y: character.offsetTop + character.clientWidth * .25 });
  const target = (i: number) => {
    const c = opening(), pair = Math.floor(i / 2), angle = [40, 63, 85][pair] * Math.PI / 180;
    const radius = hero.clientWidth * [.28, .35, .42][pair];
    const minY = subtitle.offsetTop + subtitle.offsetHeight + 42;
    return {
      x: gsap.utils.clamp(42, hero.clientWidth - 42, c.x + (i % 2 ? 1 : -1) * Math.sin(angle) * radius),
      y: gsap.utils.clamp(minY, hero.clientHeight - 70, c.y - Math.cos(angle) * radius),
    };
  };
  gsap.set([scene, camera], { autoAlpha: 1, scale: 1 });
  gsap.set(headline, { autoAlpha: 0, clipPath: 'none' });
  gsap.set(nodes, { x: () => opening().x, y: () => opening().y, xPercent: -50, yPercent: -50, scale: .2, opacity: 0 });
  const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none', immediateRender: false }, onUpdate: () => {
    const t = timeline.time(); clock.update(state.dissolve);
    ui.forEach(node => { node.inert = t > 0; }); scene.inert = t >= 1.9;
    headline.inert = t < 3.15;
    camera.style.willChange = t >= 1.9 && t < 2.85 ? 'transform' : '';
    (lid as SVGElement).style.willChange = t >= .35 && t < .9 ? 'transform' : '';
    nodes.forEach(node => { node.style.willChange = t >= .9 && t < 1.55 ? 'transform, opacity' : ''; });
  }});
  timeline.to(state, { dissolve: .18, duration: .35 }, 0)
    .to(ui, { autoAlpha: 0, duration: .25 }, 0)
    .to(lid, { y: -76, duration: .55 }, .35);
  nodes.forEach((node, i) => timeline.to(node, {
    x: () => target(i).x, y: () => target(i).y, scale: 1, opacity: 1, duration: .55,
  }, .9 + Math.floor(i / 2) * .05));
  timeline.to([name, subtitle], { autoAlpha: 0, duration: .2 }, 1.75)
    .to(camera, { scale: 40, transformOrigin: () => `${opening().x}px ${opening().y}px`, duration: .95 }, 1.9)
    .to(nodes, { opacity: 0, duration: .2 }, 1.9)
    .fromTo(hero, { backgroundColor: '#2E2A4F' }, { backgroundColor: '#E7B0DE', duration: .3 }, 2.85)
    .to(scene, { autoAlpha: 0, duration: .3 }, 2.85)
    .set(headline, { visibility: 'visible' }, 3.15)
    .to(headline, { '--mobile-headline-opacity': 1, duration: .35 }, 3.15)
    .to({}, { duration: .3 }, 3.5);
  ScrollTrigger.create({ id: 'hero-journey', trigger: journey, animation: timeline,
    start: 'top top', end: () => `+=${hero.clientHeight * 3}`, pin: hero, pinType: 'transform',
    pinSpacing: true, scrub: true, invalidateOnRefresh: true, refreshPriority: 10 });
  return () => {
    nodes.forEach(node => node.remove()); ui.forEach(node => { node.inert = false; });
    scene.inert = false; headline.inert = false;
    [camera, lid, ...nodes].forEach(node => (node as HTMLElement).style.removeProperty('will-change'));
  };
}
