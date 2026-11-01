import React from 'react';

/** Shared paths for the hero and its closed-lid avatar. */
export function CharacterArt({ badge = false }: { badge?: boolean }) {
  return <g fill="var(--character-skin)" stroke="var(--character-ink)" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round">
      {/* Back layers: neck and arm are overlapped by the head and dome. */}
      <g id={badge ? "badge-neck" : "neck"}>
        <rect x="270" y="325" width="60" height="60" />
      </g>
      <g id={badge ? "badge-arm" : "arm"} fill="none" stroke="var(--character-shirt)" strokeWidth="56">
        <path d="M430 480 C494 535 562 521 551 438 L520 285" />
      </g>
      <g id={badge ? "badge-body" : "body"} fill="var(--character-shirt)" stroke="none">
        <path d="M60 610 C60 477.452 167.452 370 300 370 C432.548 370 540 477.452 540 610 V660 H60 Z" />
      </g>
      <g id={badge ? "badge-head" : "head"}>
        <g id={badge ? "badge-ears" : "head-ears"}>
        <path d="M190 222 C160 204 155 254 190 252 Z" />
        <path d="M410 222 C440 204 445 254 410 252 Z" />
        </g>
        <g id={badge ? "badge-interior" : "head-interior"}>
        {/* Dark inner opening ellipse (the open jar opening matching MAIN_123) */}
        <ellipse id={badge ? "badge-opening" : "head-opening"} cx="300" cy="150" rx="110" ry="26" fill={badge ? "var(--character-inner)" : "var(--dive-interior, var(--character-inner))"} stroke="var(--character-ink)" strokeWidth="8" />
        {/* Inner depth shading ellipse */}
        <ellipse id={badge ? "badge-opening-glow" : "head-opening-glow"} cx="300" cy="150" rx="85" ry="18" fill="var(--character-inner)" opacity="0" stroke="none" />
        {!badge && <g id="head-tunnel" data-journey-decoration="true" opacity="0">
          <defs><clipPath id="head-tunnel-clip" clipPathUnits="userSpaceOnUse"><ellipse cx="300" cy="150" rx="110" ry="26" fill="white" stroke="none" /></clipPath></defs>
          <g id="head-tunnel-rings" clipPath="url(#head-tunnel-clip)" fill="none" stroke="color-mix(in srgb, var(--inner) 75%, var(--cream))" strokeWidth="1">
            {Array.from({ length:6 }, (_, i) => <ellipse key={i} cx="300" cy="150" rx={(i+1)*16} ry={(i+1)*16*26/110} vectorEffect="non-scaling-stroke" strokeOpacity=".25" />)}
          </g>
        </g>}
        </g>
        <g id={badge ? "badge-face-surface" : "head-face-surface"}>
        {/* Head jar body - smooth open jar rim, no scallops on the head */}
        <path id={badge ? "badge-head-body" : "head-body"} d="M190 150 A110 26 0 0 0 410 150 V270 Q410 340 340 340 H260 Q190 340 190 270 Z" fill="var(--character-skin)" stroke="var(--character-ink)" strokeWidth="8" />
        </g>
      </g>
      <g id={badge ? "badge-rim" : "head-rim"}>
      {/* Front rim outline and soft contact shadow */}
      <path id={badge ? "badge-front-rim" : "head-front-rim"} d="M190 150 A110 26 0 0 0 410 150" fill="none" stroke="var(--character-ink)" strokeWidth="8" />
      <path id={badge ? "badge-rim-shadow" : "head-rim-shadow"} d="M194 150 A106 24 0 0 0 406 150" fill="none" stroke="var(--character-ink)" strokeWidth="4" opacity="0.35" />
      </g>
      <g id={badge ? "badge-face" : "face"}>
        <path d="M216 206 Q234 193 252 203 M343 203 Q362 193 380 206" fill="none" strokeWidth="5" />
        <g className="mascot-eye"><circle cx="236" cy="237" r="26" fill="var(--white)" />
                <circle className="mascot-pupil" cx="243" cy="239" r="8" fill="var(--character-ink)" stroke="none" /></g><g className="mascot-eye"><circle cx="362" cy="237" r="26" fill="var(--white)" />
        <circle className="mascot-pupil" cx="369" cy="239" r="8" fill="var(--character-ink)" stroke="none" /></g>
        <path d="M299 244 Q284 265 299 267 Q311 266 305 258" fill="none" strokeWidth="5" />
        <path d="M278 292 H322 L313 309 H287 Z" fill="var(--character-ink)" stroke="none" />
      </g>
      {/* Single lid matching MAIN_123: dark rounded cap on top + scalloped hair band underneath */}
      <g id={badge ? "badge-lid" : "lid"}>
        {/* Scalloped hair band underneath */}
        <path d="M185 106 H415 V116 Q398.57 146 382.14 116 Q365.71 146 349.28 116 Q332.85 146 316.42 116 Q300 146 283.57 116 Q267.14 146 250.71 116 Q234.28 146 217.85 116 Q201.42 146 185 116 Z" fill="var(--character-skin)" stroke="var(--character-ink)" strokeWidth="8" />
        {/* Dark cap on top */}
        <rect x="180" y="86" width="240" height="26" rx="8" ry="8" fill="var(--character-ink)" stroke="var(--character-ink)" strokeWidth="2" />
      </g>
      <g id={badge ? "badge-hand" : "hand"}>
        {/* Wrist (520,285) stays inside the arm's round end cap at every angle. */}
        <path d="M500 289 L493 267 L471 237 Q463 226 472 220 Q480 215 488 226 L500 241 L494 194 Q493 182 503 182 Q513 181 514 193 L519 228 L519 179 Q519 167 529 167 Q539 167 539 179 L539 227 L544 188 Q546 176 556 178 Q566 180 564 192 L560 232 L567 205 Q568 194 573 197 Q581 200 577 212 L569 257 Q571 274 543 289 Z" />
        <path d="M500 242 Q522 253 513 267" fill="none" strokeWidth="5" />
      </g>
  </g>;
}
