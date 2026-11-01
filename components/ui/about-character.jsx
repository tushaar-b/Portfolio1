import React from 'react';

/* The drawing is one skeleton. Translate-only parents place each joint; GSAP
 * rotates the inner joint around local 0,0. A foot cannot leave its own knee. */
function Leg({side,x,y,offset=0}) {
 return <g data-layer={`${side}-leg`} transform={`translate(${x} ${y})`}><g data-joint={`${side}-hip`}>
  <path d="M-20 -12 Q0 -24 20 -12 L17 120 H-17Z" fill="var(--about-navy)"/>
  <g transform="translate(0 112)"><g data-joint={`${side}-knee`}>
   <path d="M-17 -8 H17 L16 126 H-16Z" fill="var(--about-navy)"/>
   <g data-layer={`${side}-shoe`} transform="translate(0 118)"><path d={`M-19 -8 H19 L${49+offset} 12 Q${65+offset} 30 45 31 H-22Z`} fill="var(--about-amber)"/></g>
  </g></g>
 </g></g>;
}
export function AboutCharacter(){return <svg className="about-rig" viewBox="0 0 600 900" aria-hidden="true" fill="var(--about-skin)" stroke="var(--about-navy)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
 <ellipse data-layer="ground-shadow" cx="302" cy="856" rx="105" ry="13" fill="var(--about-navy)" stroke="none" opacity=".18"/>
 <g data-layer="body-reveal">
  <Leg side="far" x={319} y={592} offset={8}/>
  <g data-layer="far-arm" transform="translate(323 413)"><g data-joint="far-shoulder"><g data-idle="wave">
   <path d="M0 0 Q65 60 99 9 L132 -91" fill="none" stroke="var(--about-navy)" strokeWidth="40"/>
   <path d="M0 0 Q65 60 99 9 L132 -91" fill="none" stroke="var(--about-skin)" strokeWidth="28"/>
   <g transform="translate(132 -91)"><path d="M-17 9 L-24 -24 Q-23 -36 -16 -24 L-7 -9 L-2 -44 Q2 -55 7 -42 L7 -10 L21 -32 Q30 -36 27 -22 L18 12 Q4 26 -17 9Z"/></g>
  </g></g></g>
  <Leg side="near" x={289} y={596}/>
  <g data-layer="torso"><g data-idle="breath">
   <path data-view="torso-front" d="M222 393 Q300 374 370 400 L376 599 Q300 621 220 599Z" fill="var(--about-cream)"/>
   <path data-view="torso-profile" d="M270 392 Q315 381 343 415 L355 594 Q320 613 267 598 L259 447 Q257 415 270 392Z" fill="var(--about-cream)"/>
   <path d="M280 351 V395 Q301 413 320 394 V351"/>
  </g></g>
  <g data-layer="near-arm" transform="translate(279 425)"><g data-joint="near-shoulder"><g data-idle="point">
   <path d="M0 0 Q-26 65 22 80 L101 61" fill="none" stroke="var(--about-navy)" strokeWidth="40"/>
   <path d="M0 0 Q-26 65 22 80 L101 61" fill="none" stroke="var(--about-skin)" strokeWidth="28"/>
   <g transform="translate(101 61)"><path d="M-12 -15 L22 -28 Q39 -30 31 -19 L12 -9 L42 -7 Q52 0 38 5 L9 13 Q-10 15 -12 0Z"/></g>
  </g></g></g>
 </g>
 <g transform="translate(300 363)"><g data-joint="neck"><g data-layer="head" transform="translate(-300 -363)"><g data-idle="head-tilt">
  <g data-view="front"><path d="M190 180 Q155 168 164 208 L188 218 M410 180 Q445 168 436 208 L412 218"/><path d="M186 112 H414 V273 Q412 347 344 357 H256 Q188 347 186 273Z"/>
   <g data-eye><ellipse cx="239" cy="218" rx="33" ry="38" fill="var(--about-cream)"/><circle data-pupil cx="239" cy="218" r="11" fill="var(--about-navy)" stroke="none"/></g>
   <g data-eye><ellipse cx="361" cy="218" rx="33" ry="38" fill="var(--about-cream)"/><circle data-pupil cx="361" cy="218" r="11" fill="var(--about-navy)" stroke="none"/></g>
   <path d="M218 166 Q238 155 258 165 M342 165 Q362 155 382 166 M299 221 Q280 253 300 254" fill="none"/><path data-layer="mouth-front" d="M279 289 H322 L310 310 H290Z" fill="var(--about-navy)"/>
  </g>
  <g data-view="three-quarter"><path d="M207 112 H395 V265 Q397 332 332 356 H266 Q210 344 207 279Z"/><g data-eye><ellipse cx="285" cy="220" rx="30" ry="37" fill="var(--about-cream)"/><circle data-pupil cx="285" cy="220" r="10" fill="var(--about-navy)"/></g><g data-eye><ellipse cx="371" cy="216" rx="19" ry="33" fill="var(--about-cream)"/><circle data-pupil cx="371" cy="216" r="9" fill="var(--about-navy)"/></g><path d="M363 228 L389 257 L365 263 M337 293 Q359 306 375 288" fill="none"/></g>
  <g data-view="profile"><path d="M232 112 H363 V203 L402 242 Q410 251 392 259 L372 263 V290 Q373 342 321 357 H274 Q230 349 230 286Z"/><path d="M235 220 Q206 206 210 240 Q212 263 238 257"/><g data-eye><ellipse cx="343" cy="215" rx="24" ry="34" fill="var(--about-cream)"/><circle data-pupil cx="347" cy="215" r="10" fill="var(--about-navy)" stroke="none"/></g><path d="M323 168 Q345 157 362 169 M346 289 Q362 299 374 284" fill="none"/></g>
  <g transform="translate(375 115)"><g data-joint="headband-hinge"><g data-layer="headband" transform="translate(-375 -115)"><g data-view="band-front"><path d="M184 110 H415 V132 L394 151 L374 132 L354 151 L334 132 L314 151 L294 132 L274 151 L254 132 L234 151 L214 132 L194 151 L184 132Z"/><path d="M184 97 Q184 84 198 84 H401 Q415 84 415 97 V111 H184Z" fill="var(--about-navy)"/></g><g data-view="band-profile"><path d="M224 110 H376 V132 L357 149 L338 132 L319 149 L300 132 L281 149 L262 132 L243 149 L224 132Z"/><path d="M224 97 Q224 84 238 84 H362 Q376 84 376 97 V111 H224Z" fill="var(--about-navy)"/></g></g></g></g>
 </g></g></g></g>
</svg>;}
