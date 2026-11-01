import { FilmOverlay } from './film-overlay';
import { createPortal } from 'react-dom';
import { AvatarBadge } from './avatar-badge';
import { CharacterArt } from './character-art';
import React from 'react';
import { useHeroJourney } from './use-hero-journey';
import { useAsciiCharacter, type AsciiCharacterOptions } from './use-ascii-character';

export interface WavingCharacterProps extends AsciiCharacterOptions {
  size?: number | string;
  className?: string;
}

/** Layer IDs and pivots use the SVG's 600 × 600 coordinate system. */
export function WavingCharacter({ size = '100%', className = '', ...asciiOptions }: WavingCharacterProps) {
  const { containerRef, svgRef, canvasRef, showAscii, resolveRef } = useAsciiCharacter(asciiOptions);
  useHeroJourney(containerRef, resolveRef);
  return (<>
    <div data-ascii={showAscii} ref={containerRef} className={`character-renderer ${className}`.trim()} style={{ width: size, maxWidth: '100%', aspectRatio: '1', position: 'relative' }}>
    <svg
      id="character-svg"
      ref={svgRef}
      style={{ pointerEvents: 'none' }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 600"
      preserveAspectRatio="xMidYMax meet"
      width={size}
      height={size}
      className="waving-character"
      role="img"
      aria-label="Friendly purple open-lid mascot waving hello"
      fill="var(--character-skin)"
      stroke="var(--character-ink)"
      strokeWidth="8"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <style>{`
        .waving-character { display: block; max-width: 100%; height: auto; overflow: hidden; }
        .waving-character #body {
          transform-box: view-box; transform-origin: 300px 600px;
          animation: none;
        }
        .waving-character #hand {
          /* The shared animation clock rotates in SVG coordinates at the wrist. */
          animation: none;
        }
        .waving-character #lid {
          transform-box: fill-box; transform-origin: 50% 100%;
          animation: none;
        }
        @keyframes mascot-breathe { from { transform: scaleY(1); } to { transform: scaleY(1.015); } }
        @keyframes mascot-open {
          0% { transform: translateY(25px) rotate(0deg); }
          65% { transform: translateY(-36px) rotate(-11deg); }
          82% { transform: translateY(-27px) rotate(-6deg); }
          100% { transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .waving-character #body, .character-renderer[data-idle="true"] .waving-character #hand, .waving-character #lid { animation: none; }
        }
      `}</style>
      <CharacterArt />
    </svg>
    <canvas id="ascii-canvas" ref={canvasRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
    </div>
    {createPortal(<AvatarBadge />, document.getElementById('avatar-root')!)}
    {createPortal(<FilmOverlay />, document.getElementById('film-root')!)}
  </>);
}

export default WavingCharacter;
