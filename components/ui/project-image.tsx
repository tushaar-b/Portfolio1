import React, { useLayoutEffect, useRef, useState } from 'react';
import { mobileMode } from '../../src/mobile-mode';

const dimensions: Record<string, [number, number]> = {
  'rover': [1024, 768], 'aarthi-3': [2940, 1522],
  'composite-1': [1024, 547], 'composite-2': [1024, 547], 'composite-3': [1024, 547], 'composite-4': [1024, 547],
  'mess-1': [1024, 528], 'mess-2': [1024, 528],
};
export function ProjectImage({ src, alt, eager = false, priority = false }: { src: string; alt: string; eager?: boolean; priority?: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const [limit, setLimit] = useState(0);
  const name = src.split('/').pop()!.replace(/\.[^.]+$/, '');
  const [width, height] = dimensions[name] || [1200, 750];
  const available = mobileMode ? [600] : [300, 600, Math.min(width, 1200)].filter(size => size <= limit);
  useLayoutEffect(() => {
    if (mobileMode) return;
    const image = ref.current!;
    const resize = new ResizeObserver(([entry]) => setLimit(Math.max(300, Math.floor(entry.contentRect.width * 2))));
    resize.observe(image);
    return () => resize.disconnect();
  }, []);
  return <img ref={ref} src={available.length ? `/assets/${name}-${available[available.length - 1]}.webp` : undefined}
    srcSet={available.length ? available.map(size => `/assets/${name}-${size}.webp ${size}w`).join(', ') : undefined}
    sizes="(max-width: 639px) 90vw, (min-width: 1200px) 480px, calc((90vw - 5rem) / 2)"
    width={width} height={height} alt={alt} loading={!mobileMode && (eager || priority) ? 'eager' : 'lazy'} decoding="async" fetchPriority={!mobileMode && priority ? 'high' : 'auto'}
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>;
}
