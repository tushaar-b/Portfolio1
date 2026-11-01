import Matter from 'matter-js';
import { techStack, type TechItem } from './tech-stack-data';

// This module, Matter, and the logo paths are fetched only near the section.
export function mountCargo(section: HTMLElement, stage: HTMLDivElement, canvas: HTMLCanvasElement, tooltip: HTMLOutputElement, reduced: boolean) {
  const mobile = matchMedia('(max-width:639px)').matches;
  const engine = Matter.Engine.create({ enableSleeping: true });
  const world = engine.world;
  const palette = getComputedStyle(section);
  const token = (name: string) => palette.getPropertyValue(name).trim();
  const navy = token('--ride-road'), cream = '#F1EEE6', amber = token('--ride-amber');
  const context = canvas.getContext('2d')!;
  const dpr = mobile ? 1 : Math.min(devicePixelRatio, 1.5);
  let width = stage.clientWidth, height = stage.clientHeight;
  const floorY = () => height - section.clientHeight * (mobile ? .12 : .17);
  const wallOptions = { isStatic: true, render: { visible: false } };
  const floor = Matter.Bodies.rectangle(width / 2, floorY() + 25, width + 200, 50, wallOptions);
  const left = Matter.Bodies.rectangle(-25, 230, 50, 920, wallOptions);
  const right = Matter.Bodies.rectangle(width + 25, 230, 50, 920, wallOptions);
  Matter.Composite.add(world, [floor, left, right]);
  const balls: Matter.Body[] = [];
  let frame = 0, visible = false, disposed = false, dropped = false, lastTime = 0, accumulator = 0;
  let selected: Matter.Body | undefined;
  const timers: ReturnType<typeof setTimeout>[] = [];

  // Sphere lighting and its shadow are rasterized once, never during a frame.
  const sphere = document.createElement('canvas'); sphere.width = 300; sphere.height = 300;
  const paint = sphere.getContext('2d')!; paint.scale(2, 2);
  const gradient = paint.createRadialGradient(55, 45, 0, 75, 65, 70);
  gradient.addColorStop(0, cream); gradient.addColorStop(.3, cream);
  gradient.addColorStop(.65, token('--about-mist')); gradient.addColorStop(.85, token('--about-skin')); gradient.addColorStop(1, navy);
  paint.shadowColor = 'rgba(6,8,22,.5)'; paint.shadowBlur = 18; paint.shadowOffsetY = 10;
  paint.fillStyle = gradient; paint.beginPath(); paint.arc(75, 65, 50, 0, Math.PI * 2); paint.fill();
  paint.shadowColor = 'transparent'; paint.shadowBlur = 0; paint.shadowOffsetY = 0;
  paint.strokeStyle = amber; paint.globalAlpha = .28; paint.lineWidth = 1.5;
  paint.beginPath(); paint.arc(75, 65, 49, Math.PI * 1.03, Math.PI * 1.58); paint.stroke(); paint.globalAlpha = 1;
  paint.fillStyle = cream; paint.filter = 'blur(4px)'; paint.beginPath(); paint.ellipse(59, 38, 14, 9, 0, 0, Math.PI * 2); paint.fill(); paint.filter = 'none';
  const cached = new Map<string, { icon: HTMLCanvasElement; label: HTMLCanvasElement }>();
  techStack.forEach(tech => {
    const icon = document.createElement('canvas'); icon.width = 96; icon.height = 96;
    const ink = icon.getContext('2d')!;
    if (tech.icon) { ink.scale(4, 4); ink.fillStyle = tech.icon.hex === '000000' ? token('--color-primary') : `#${tech.icon.hex}`; ink.fill(new Path2D(tech.icon.path)); }
    else { ink.fillStyle = cream; ink.beginPath(); ink.arc(48, 48, 46, 0, Math.PI * 2); ink.fill(); ink.fillStyle = navy; ink.font = '600 14px Outfit'; ink.textAlign = 'center'; ink.fillText(tech.name, 48, 52, 88); }
    const label = document.createElement('canvas'); label.width = 220; label.height = 32;
    const text = label.getContext('2d')!; text.fillStyle = navy; text.font = '800 20px Outfit'; text.textAlign = 'center'; text.textBaseline = 'middle'; text.fillText(tech.name, 110, 16);
    cached.set(tech.id, { icon, label });
  });
  const positionTooltip = () => {
    if (!selected) { tooltip.hidden = true; return; }
    tooltip.hidden = false; tooltip.textContent = selected.plugin.tech.name;
    tooltip.style.left = `${selected.position.x}px`; tooltip.style.top = `${selected.position.y - selected.circleRadius! - 10}px`;
  };
  const draw = () => {
    context.setTransform(dpr, 0, 0, dpr, 0, 0); context.clearRect(0, 0, width, height);
    balls.forEach(ball => {
      const radius = ball.circleRadius!, item = cached.get(ball.plugin.tech.id)!;
      context.save(); context.translate(ball.position.x, ball.position.y); context.rotate(ball.angle);
      context.drawImage(sphere, -radius * 1.5, -radius * 1.3, radius * 3, radius * 3);
      context.drawImage(item.icon, -radius * .36, -radius * .46, radius * .72, radius * .72);
      context.drawImage(item.label, -55, radius * .28, 110, 16); context.restore();
    });
    positionTooltip();
  };
  const wake = () => { if (!disposed && visible && !document.hidden && !frame) { lastTime = 0; frame = requestAnimationFrame(tick); } };
  const mouse = Matter.Mouse.create(canvas);
  mouse.pixelRatio = dpr;
  const constraint = Matter.MouseConstraint.create(engine, { mouse, constraint: { stiffness: .2, render: { visible: false } } });
  if (!reduced) Matter.Composite.add(world, constraint);
  function tick(time: number) {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    if (!reduced) {
      accumulator += lastTime ? Math.min(50, time - lastTime) : 1000 / 60;
      lastTime = time;
      while (accumulator >= 1000 / 60) { Matter.Engine.update(engine, 1000 / 60); accumulator -= 1000 / 60; }
    }
    draw();
    if (!reduced && (mouse.button === 0 || balls.some(body => !body.isSleeping))) frame = requestAnimationFrame(tick);
  }
  const spawn = () => {
    if (dropped || disposed) return; dropped = true;
    const list = techStack.flatMap(tech => Array.from({ length: tech.copies }, () => tech)).slice(0, mobile ? 24 : 36);
    let pileX = 0, pileBottom = floorY(), rowHeight = 0;
    const create = (tech: TechItem, index: number) => {
      if (disposed) return;
      const radius = 50 * ({ lg: 1.15, md: 1, sm: .85 }[tech.size]) * (mobile ? .85 : 1);
      if (pileX + 2 * radius > width) { pileX = 0; pileBottom -= rowHeight; rowHeight = 0; }
      const x = reduced ? pileX + radius : index < Math.ceil(list.length / 2) ? width / 2 + Math.random() * Math.max(0, width / 2 - radius) : radius + Math.random() * Math.max(0, width - radius * 2);
      const ball = Matter.Bodies.circle(x, reduced ? pileBottom - radius : -100 - Math.random() * 200, radius, { restitution: .7, friction: .008, density: .05, isStatic: reduced, plugin: { tech } });
      pileX += 2 * radius; rowHeight = Math.max(rowHeight, radius * 2);
      if (!reduced) Matter.Body.setVelocity(ball, { x: (Math.random() - .5) * 8, y: 0 });
      balls.push(ball); Matter.Composite.add(world, ball); wake();
    };
    list.forEach((tech, i) => { if (reduced) create(tech, i); else timers.push(setTimeout(() => create(tech, i), i * 40)); });
    if (reduced) draw();
  };
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (entry.intersectionRatio >= .3) spawn();
    if (visible) wake(); else { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
  }, { threshold: [0, .3] });
  visibility.observe(section);
  const tab = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else wake(); };
  document.addEventListener('visibilitychange', tab);
  const point = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    selected = Matter.Query.point(balls, { x: (event.clientX - rect.left) * width / rect.width, y: (event.clientY - rect.top) * height / rect.height }).pop();
    positionTooltip(); if (event.type === 'pointerdown' || mouse.button === 0) wake();
  };
  const leave = (event: PointerEvent) => { if (event.pointerType !== 'touch') { selected = undefined; positionTooltip(); } };
  canvas.addEventListener('pointerdown', point); canvas.addEventListener('pointermove', point); canvas.addEventListener('pointerleave', leave);
  const resize = new ResizeObserver(() => {
    const oldWidth = width; width = stage.clientWidth; height = stage.clientHeight;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); canvas.setAttribute('data-pixel-ratio', String(dpr));
    canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
    Matter.Body.scale(floor, (width + 200) / (oldWidth + 200), 1);
    Matter.Body.setPosition(floor, { x: width / 2, y: floorY() + 25 }); Matter.Body.setPosition(right, { x: width + 25, y: 230 });
    balls.forEach(body => { if (!body.isStatic) Matter.Sleeping.set(body, false); }); draw(); wake();
  });
  resize.observe(stage);
  return () => {
    disposed = true; timers.forEach(clearTimeout); cancelAnimationFrame(frame); visibility.disconnect(); resize.disconnect();
    document.removeEventListener('visibilitychange', tab);
    canvas.removeEventListener('pointerdown', point); canvas.removeEventListener('pointermove', point); canvas.removeEventListener('pointerleave', leave);
    canvas.removeEventListener('mousemove', mouse.mousemove); canvas.removeEventListener('mousedown', mouse.mousedown); canvas.removeEventListener('mouseup', mouse.mouseup);
    canvas.removeEventListener('wheel', mouse.mousewheel); canvas.removeEventListener('touchmove', mouse.mousemove); canvas.removeEventListener('touchstart', mouse.mousedown); canvas.removeEventListener('touchend', mouse.mouseup);
    Matter.Mouse.clearSourceEvents(mouse); Matter.Events.off(engine); Matter.Composite.clear(world, false); Matter.Engine.clear(engine); cached.clear();
  };
}
