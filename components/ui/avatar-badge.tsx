import React from 'react';
import { CharacterArt } from './character-art';

/** View only. The hero's one GSAP context owns arrival and cleanup. */
export function AvatarBadge() {
  return <>
    <span className="avatar-dock-target" aria-hidden="true" />
    <button id="avatar-badge" type="button" aria-label="Say hi, scroll to contact"
      onClick={() => window.dispatchEvent(new Event('journey-contact'))}>
      <span className="avatar-hover">
        <span className="avatar-label" aria-hidden="true">SAY HI</span>
        <span className="avatar-motion">
          <span className="avatar-pulse" aria-hidden="true" />
          <span className="avatar-dock-pulse" aria-hidden="true" />
          <span className="avatar-settle"><span className="avatar-face">
            <svg viewBox="0 0 650 650" aria-hidden="true"><CharacterArt badge /></svg>
          </span></span>
        </span>
      </span>
    </button>
  </>;
}
