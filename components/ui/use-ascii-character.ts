import { useEffect, useRef, useState } from 'react';
import { AsciiRaster, GLYPHS } from './ascii-raster';
import { liteMode, mobileMode } from '../../src/mobile-mode';

export interface AsciiCharacterOptions {
  cellWidth?: number; cellHeight?: number; fontSize?: number; charRamp?: string;
  colorMode?: 'mono' | 'tinted'; fps?: number; ascii?: boolean;
}
export interface AsciiClock {
  progress: number; scroll: number; enabled: boolean; ready: boolean; running: boolean;
  update: (progress: number) => void; measure: () => void; wake: () => void;
  whenReady: Promise<void>; freezeIdle: boolean;
}
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => { const t = clamp(n); return t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2; };

/** Closed-lid wave frames at rest; a stable source during the scroll compile. */
export function useAsciiCharacter({ cellWidth = 5, cellHeight = 9, fontSize = 9,
  charRamp = GLYPHS, colorMode = 'tinted', fps = 30, ascii = true }: AsciiCharacterOptions) {
  const containerRef = useRef<HTMLDivElement>(null), svgRef = useRef<SVGSVGElement>(null), canvasRef = useRef<HTMLCanvasElement>(null);
  const readySignal = useRef<{ promise: Promise<void>; resolve: () => void } | null>(null);
  if (!readySignal.current) {
    let done!: () => void;
    const promise = new Promise<void>(resolve => { done = resolve; });
    readySignal.current = { promise, resolve: done };
  }
  const resolveRef = useRef<AsciiClock>({ progress: 0, scroll: 0, enabled: ascii, ready: false, running: false,
    update: () => {}, measure: () => {}, wake: () => {}, whenReady: readySignal.current.promise, freezeIdle: false });
  const [enabled, setEnabled] = useState(ascii);
  const [ready, setReady] = useState(false);
  resolveRef.current.enabled = enabled;
  useEffect(() => { setEnabled(ascii); }, [ascii]);
  useEffect(() => {
    const button = containerRef.current?.closest('.hero-section')?.querySelector<HTMLButtonElement>('.experiment-toggle');
    const toggle = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'a' || event.repeat || event.metaKey || event.ctrlKey || event.altKey ||
        (event.target as HTMLElement)?.closest('input,textarea,select,[contenteditable="true"]')) return;
      setEnabled(value => !value);
    };
    const click = () => setEnabled(value => !value);
    button?.setAttribute('aria-checked', String(enabled));
    button?.addEventListener('click', click); window.addEventListener('keydown', toggle);
    resolveRef.current.update(resolveRef.current.scroll);
    return () => { button?.removeEventListener('click', click); window.removeEventListener('keydown', toggle); };
  }, [enabled]);

  useEffect(() => {
    const container = containerRef.current!, svg = svgRef.current!, canvas = canvasRef.current!;
    const output = canvas.getContext('2d');
    const raster = document.createElement('canvas');
    const rasterContext = raster.getContext('2d', { willReadFrequently: true });
    if (!output || !rasterContext) return;
    const clock = resolveRef.current, motion = matchMedia('(prefers-reduced-motion:reduce)');
    clock.freezeIdle = liteMode;
    clock.ready = false;
    const renderer = new AsciiRaster();
    const rate = 1000 / Math.min(60, Math.max(1, fps));
    let disposed = false, visible = true, frame = 0, lastFrame = -Infinity, generation = 0;
    let waveFrames: HTMLCanvasElement[] = [], paintedWave = -1;
    let bodyFrame: HTMLCanvasElement | null = null;
    let paintedGazeX = Infinity, paintedGazeY = Infinity;
    const gaze = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const pupils = Array.from(svg.querySelectorAll<SVGCircleElement>('.mascot-pupil'));
    const hand = svg.querySelector<SVGElement>('#hand');
    const neutralEyes = () => {
      pupils.forEach((pupil, index) => {
        pupil.setAttribute('cx', String((index ? 362 : 236) + gaze.x));
        pupil.setAttribute('cy', String(237 + gaze.y));
      });
    };
    let pictureReady = false, width = 0, height = 0, lastDpr = 0, paintedProgress = -1;
    const pointer = { x: -1000, y: -1000, time: -Infinity };
    const debug = () => ({ running: clock.running, dissolve: clock.progress, ready: clock.ready, enabled: clock.enabled });
    (container as any).__asciiState = debug;
    (container as any).__asciiClock = clock;

    // The controller alone owns SVG/canvas opacity; readiness never rebuilds GSAP.
    const visibility = () => {
      container.dataset.idle = String(clock.scroll === 0 && !clock.freezeIdle);
      const asciiVisible = clock.enabled && clock.ready && !motion.matches;
      svg.style.opacity = String(asciiVisible ? ease(clock.scroll / .18) : 1);
      canvas.style.opacity = String(asciiVisible ? 1 - ease((clock.scroll - .155) / .025) : 0);
    };
    const render = (time: number) => {
      if (!pictureReady || disposed || clock.scroll >= .18) return;
      if (liteMode && paintedWave === 0) return;
      const phaseChanged = paintedProgress !== clock.progress;
      // Keep the original 30fps raster budget. Compile frames at rest can be
      // reused exactly; a return to zero always paints immediately.
      if (clock.scroll > 0 && !phaseChanged) return;
      if (time - lastFrame < rate && !(clock.scroll === 0 && phaseChanged)) return;
      lastFrame = time; paintedProgress = clock.progress;
      const waveIndex = clock.scroll === 0 && !clock.freezeIdle && !motion.matches
        ? Math.floor(time / (1800 / 16)) % 16 : 0;
      const eyeChanged = Math.abs(gaze.x - paintedGazeX) > .1 || Math.abs(gaze.y - paintedGazeY) > .1;
      // A still wave frame and settled pupils produce identical glyphs. Reuse
      // that output instead of matching the entire source thirty times a second.
      if (clock.scroll === 0 && !phaseChanged && waveIndex === paintedWave && !eyeChanged) return;
      if (waveFrames.length && (waveIndex !== paintedWave || eyeChanged)) {
        rasterContext.clearRect(0, 0, raster.width, raster.height);
        rasterContext.drawImage(bodyFrame!, 0, 0);
        rasterContext.drawImage(waveFrames[waveIndex], Math.round(raster.width * (liteMode ? 310 : 420) / 600), Math.round(raster.height * 110 / 600));
        // Draw pupils into the source before glyph matching, in the same SVG space.
        rasterContext.save();
        rasterContext.scale(raster.width / 600, raster.height / 600);
        rasterContext.fillStyle = getComputedStyle(svg).getPropertyValue('--character-ink').trim();
        for (const cx of [236, 362]) {
          rasterContext.beginPath();
          rasterContext.arc(cx + (clock.scroll === 0 ? gaze.x : 0), 237 + (clock.scroll === 0 ? gaze.y : 0), 8, 0, Math.PI * 2);
          rasterContext.fill();
        }
        rasterContext.restore();
        renderer.invalidateSource(); paintedWave = waveIndex; paintedGazeX = gaze.x; paintedGazeY = gaze.y;
      }
      // Fixed phase at zero makes a return pixel-identical to the first portrait.
      // The source, cell grid and canvas backing store survive visibility changes.
      const shaderTime = clock.progress * 1200;
      renderer.render(raster, output, shaderTime, motion.matches,
        { x: -1000, y: -1000, time: -Infinity },
        false, false, liteMode ? 0 : clock.progress);
    };
    const active = () => !liteMode && clock.scroll < .18 && !motion.matches && visible && !document.hidden;
    const stop = () => { cancelAnimationFrame(frame); frame = 0; clock.running = false; };
    const loop = (time: number) => {
      frame = 0;
      if (disposed || !active()) { clock.running = false; return; }
      const idle = clock.scroll === 0 && !clock.freezeIdle;
      gaze.x += ((idle ? gaze.targetX : 0) - gaze.x) * .18;
      gaze.y += ((idle ? gaze.targetY : 0) - gaze.y) * .18;
      neutralEyes();
      const waveIndex = idle ? Math.floor(time / (1800 / 16)) % 16 : 0;
      const angle = 13 * Math.sin(waveIndex / 16 * Math.PI * 2);
      hand?.setAttribute('transform', `${liteMode ? 'translate(-110 0) ' : ''}rotate(${angle} 520 285)`);
      if (clock.enabled) render(time);
      frame = requestAnimationFrame(loop); clock.running = true;
    };
    const start = () => {
      if (!disposed && !frame && active()) { frame = requestAnimationFrame(loop); clock.running = true; }
    };
    clock.wake = start;
    clock.update = progress => {
      clock.scroll = clamp(progress); clock.progress = clamp(progress / .18);
      visibility();
      if (clock.scroll > 0 || motion.matches || clock.freezeIdle) {
        gaze.x = gaze.y = 0; neutralEyes(); hand?.removeAttribute('transform');
      }
      // Render immediately from the current uniform, even when RAF was paused.
      // No async decode, layout read, or accumulated age enters this path.
      render(performance.now());
      if (active()) start(); else stop();
    };
    clock.measure = () => {
      const title = container.closest('.hero-section')?.querySelector('.hero-name');
      if (!title) { renderer.setOverlap(null); return; }
      const name = title.getBoundingClientRect(), bounds = container.getBoundingClientRect();
      renderer.setOverlap({ left: name.left - bounds.left, top: name.top - bounds.top,
        right: name.right - bounds.left, bottom: name.bottom - bounds.top });
    };
    const snapshot = (angle = 0, part: 'body' | 'hand' = 'body') => {
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.querySelectorAll('style,[data-journey-decoration],.mascot-pupil').forEach(node => node.remove());
      clone.setAttribute('width', String(raster.width)); clone.setAttribute('height', String(raster.height));
      clone.style.cssText = 'opacity:1;display:block;';
      // Serialized SVGs have no document stylesheet: carry the same visual tokens
      // into the source bitmap so SVG and tinted ASCII always share their fills.
      const colors = getComputedStyle(svg);
      for (const token of ['--character-skin', '--character-ink', '--character-shirt', '--character-inner', '--white']) {
        clone.style.setProperty(token, colors.getPropertyValue(token).trim());
      }
      // Compile always uses the same closed-lid pose; the lid only lifts later.
      clone.querySelectorAll<SVGElement>('g[id]').forEach(part => {
        part.removeAttribute('transform'); part.style.cssText = 'animation:none;transform:none;';
      });
      const hand = clone.querySelector<SVGElement>('#hand');
      hand?.style.removeProperty('transform');
      hand?.setAttribute('transform', `${liteMode ? 'translate(-110 0) ' : ''}rotate(${angle} 520 285)`);
      if (part === 'body') hand?.remove();
      else if (hand) {
        hand.parentElement!.replaceChildren(hand);
        clone.setAttribute('viewBox', liteMode ? '310 110 210 250' : '420 110 210 250');
        clone.setAttribute('width', String(Math.round(raster.width * 210 / 600)));
        clone.setAttribute('height', String(Math.round(raster.height * 250 / 600)));
      }
      return new XMLSerializer().serializeToString(clone);
    };
    const resize = (force = false) => {
      const nextWidth = container.clientWidth, nextHeight = container.clientHeight;
      if (!nextWidth || !nextHeight) return;
      const dpr = liteMode ? 1 : devicePixelRatio || 1;
      if (!force && nextWidth === width && nextHeight === height && dpr === lastDpr) return;
      width = nextWidth; height = nextHeight; lastDpr = dpr;
      const cap = Math.max(1, Math.sqrt(width * height / (Math.max(3, cellWidth) * Math.max(5, cellHeight) * 20000)));
      const cw = mobileMode ? 9 : Math.max(3, cellWidth) * cap, ch = mobileMode ? 16 : Math.max(5, cellHeight) * cap;
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      raster.width = Math.max(1, Math.round(width * 1.25)); raster.height = Math.max(1, Math.round(height * 1.25));
      renderer.configure(width, height, cw, ch, Math.max(6, fontSize) * cap, dpr, charRamp, colorMode);
      pictureReady = false;
      const version = ++generation;
      const rw = raster.width, rh = raster.height;
      const decode = async (angle: number, part: 'body' | 'hand') => {
        const picture = new Image();
        picture.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(snapshot(angle, part));
        await picture.decode();
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = part === 'body' ? rw : Math.round(rw * 210 / 600);
        frameCanvas.height = part === 'body' ? rh : Math.round(rh * 250 / 600);
        frameCanvas.getContext('2d')!.drawImage(picture, 0, 0, frameCanvas.width, frameCanvas.height);
        return frameCanvas;
      };
      // Cache one body plus sixteen small hand crops, rather than sixteen
      // full-resolution portraits. This avoids hundreds of MB on large screens.
      void Promise.all([decode(0, 'body'), Promise.all(Array.from({ length: liteMode ? 1 : 16 }, (_, index) =>
        decode(13 * Math.sin(index / 16 * Math.PI * 2), 'hand')))]).then(([body, frames]) => {
        if (disposed || version !== generation) return;
        bodyFrame = body; waveFrames = frames; paintedWave = -1;
        renderer.invalidateSource();
        pictureReady = true; clock.ready = true; setReady(true); paintedProgress = -1; lastFrame = -Infinity;
        clock.update(clock.scroll); readySignal.current!.resolve();
      }).catch(error => {
        if (disposed || version !== generation) return;
        clock.ready = false; setReady(false); visibility(); readySignal.current!.resolve();
        console.error('ASCII character snapshot failed', error);
      });
    };
    const resizeObserver = new ResizeObserver(() => resize()); resizeObserver.observe(container);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting; if (visible) start(); else stop();
    }); intersection.observe(container);
    const sync = () => clock.update(clock.scroll);
    const hero = container.closest('.hero-section')!;
    const move = (event: PointerEvent) => {
      if (liteMode || clock.scroll > 0 || motion.matches || event.pointerType === 'touch') return;
      const matrix = svg.getScreenCTM();
      if (!matrix) return;
      const local = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const dx = local.x - 299, dy = local.y - 237;
      const length = Math.hypot(dx, dy);
      const distance = Math.min(13, length / 16);
      gaze.targetX = length ? dx / length * distance : 0;
      gaze.targetY = length ? dy / length * distance : 0;
      start();
    };
    const leave = () => { gaze.targetX = gaze.targetY = 0; };
    document.addEventListener('visibilitychange', sync);
    hero.addEventListener('pointermove', move as EventListener);
    hero.addEventListener('pointerleave', leave);
    motion.addEventListener('change', sync);
    visibility(); resize(); clock.measure();
    document.fonts.ready.then(() => { if (!disposed && !mobileMode) resize(true); });
    return () => {
      disposed = true; stop(); resizeObserver.disconnect(); intersection.disconnect();
      document.removeEventListener('visibilitychange', sync);
      hero.removeEventListener('pointermove', move as EventListener); hero.removeEventListener('pointerleave', leave);
      hand?.removeAttribute('transform');
      motion.removeEventListener('change', sync);
      clock.update = () => {}; clock.measure = () => {}; clock.wake = () => {};
      delete (container as any).__asciiState; delete (container as any).__asciiClock;
    };
  }, [cellWidth, cellHeight, fontSize, charRamp, colorMode, fps]);
  return { containerRef, svgRef, canvasRef, resolveRef, showAscii: ready && enabled };
}
