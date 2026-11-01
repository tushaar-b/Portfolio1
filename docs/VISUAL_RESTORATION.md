# Hero and mind restoration audit

## Git findings (performed before edits)

`git log --all --oneline` contains only:

- `e52d112` initial commit
- `5be4f66` Ready for deployment
- `66a0006` Update portfolio: revise About Me, remove background shader and scroll line, update CGPA to 9.4 (HEAD)

The earliest commit has a different, light Bauhaus hero with cream `#F3EFE6`, black `#111111`, Outfit/Cormorant typography and no current mascot/mind screen. None of these commits contains `character-art.tsx`, `ascii-raster.ts`, `film-overlay.tsx`, `use-ascii-character.ts`, `use-hero-journey.ts` or `about-stage.css`. They were untracked before this task. Consequently, no matching original commit exists and no historical attribution of individual changes to these files is possible.

Inspected `git diff e52d112 HEAD -- src/style.css components/ui/demo.tsx` and the character/ASCII/film paths, plus working-tree differences against HEAD. Historical CSS changes remove the shader/scroll path and adjust unrelated details, stats, skills and section spacing. Those historical changes were left alone. The current navy/amber hero and icy mind design existed in uncommitted changes. Restoration therefore follows the user's exact fallback specification.

No original images were attached to the message available to this agent. Earlier repository captures `output/playwright/hero-0.png` and `output/playwright/fix-04-full-pink.png` were inspected as secondary references; they are not represented as the user's attachments. Side-by-side images are explicitly labeled accordingly. Exact matching to missing attachments cannot be certified.

## Visual differences found and restoration

| Area | Pre-task working-tree design | Restored value / behavior |
|---|---|---|
| Hero ground | midnight `#12172B` | `--bg-hero: #52497F` |
| Hero name/nav | `#F6F0E4` | `--cream: #F1EEE6` |
| Subtitle | `#C9D3EE` | `--periwinkle: #A89FE8` |
| Display face | Limelight, overridden desktop name size 8.8vw | Limelight 400, upright; desktop name 9.2vw (72–210px clamp) |
| Subtitle face | Italiana | retained Italiana |
| Navigation/labels | Bebas Neue | retained Bebas Neue |
| Character skin | inherited `#C9D3EE`; SVG fallback `#6a6396` | `--skin: #6A6396` consistently in SVG and serialized ASCII source |
| Character outlines/pupils | inherited navy | `--ink: #141414`; 8-unit skin outlines, round joins/caps |
| Body/arm | cream fallback `#F5EFE6` | solid `--ink: #141414`; no additional contrasting outline |
| Head opening | navy override; `#231C38` fallback | `--inner: #2E2A4F` |
| Opening glow | `#3D325A`, animated opacity up to .45 | flat inner fill; glow hidden (opacity 0) |
| Front rim shadow | opacity .35 | hidden (opacity 0), retain black rim geometry |
| Eyes | white | centralized `--white: #FFFFFF`; black pupils |
| Lid | existing cap + scalloped band, recolored by wrong inherited palette | same geometry; cap black, band purple; no replacement teeth geometry |
| Lid tilt | -3° followed by 0° | 0° throughout, per requested straight-up lift; same lift/clamp/timing |
| Portrait size | min(94svh,60vw) desktop | 60vw square; 220/600-unit head = 22vw; 22svh drop, dome offscreen |
| Title's layout box | .95×name size; blocked almost all upward lift after palette/layout changes | .7×name size on desktop, preserving rendered lettering; lifted cap clears title ink; mobile keeps 1.8×name size |
| Sky | 25 twinkling dots, six birds, three drifting clouds | retain dots and birds, remove three clouds; white bird strokes |
| Bottom ruler | styles existed, no element | restore ruler element with existing tick styling using periwinkle |
| Hero frame | removed by About stylesheet | 24px radius, 2px black inset outline; clears on existing scene inert state; outline does not change later-section geometry |
| ASCII dark glyphs | `[18,23,43]` | `--ascii-dark: #1a1530` |
| ASCII skin glyphs | `[201,211,238]` | `--ascii-skin: #B7AEEA` |
| ASCII rim | `#C9D3EE` | `--ascii-rim: #8E84C9` |
| ASCII light regions | `[246,240,228]` | white eyes `#FFFFFF` |
| ASCII grid | nominal 5×9, enlarged at desktop by a 10,000-cell budget | actual 5×9 at 1440×900 with 20,000-cell budget; existing large-screen cap retained |
| ASCII matching | shape-aware matching, 4 brightness batches per region | retained matcher and ±6% tint gains; same resolve/reverse clock, cached wave frames and eye tracking |
| Film strength | intensity .6, grain .10, haze .12, vignette .35 already defined | retained exact strengths; locked in one token file |
| Film color | cool haze / navy vignette; arrival haze/vignette disabled | cream haze, warm/plum corners; pink haze/plum radial corners on active mind screen |
| Film flicker | .02 token, empty particle layer animation disabled | restore subtle .02 projector flicker; honor reduced motion |
| Title/subtitle glow | inherited drop shadows and amber/cool aberration | remove palette-dependent glow/aberration; retain cream/periwinkle type |
| Mind ground | `--about-mist: #E4EAF6`, older `#C8B0CE` gradient overridden | `--pink: #E7B0DE`, original-style plum radial vignette in shared film layer |
| Mind main text / CTA | navy/plum overrides (`#1B2347`, `#231734`) | `--plum: #400849` |
| Eyebrow/accents/arrow | burnt `#C2610F`, label `#94470A`, old `#E85A1D` | `--accent: #FF5A0A` |
| Mind emphasis | `font-style: italic !important` | upright `normal !important`; same display family and weight 400 |
| Mind layout | pre-wrap splitter; nested span `display:block`; detached period | exactly two block lines, nowrap; inline words and real spaces; `mind.`/`build.` punctuation attached |
| Mind left edge | compounded 8vw padding + 8vw margin | 12vw padding, zero margin (7vw on mobile); desktop h2 clamp(40px,min(7vw,12vh),110px), line-height 1.12 retained |
| Mind entrance | y=24→0, opacity, .4s duration, .035s stagger; last word finished after About started | same properties/start/stagger, .28s duration so all seven words finish at 2.89, before About's existing 2.9 start |
| CTA underline | inherited thin underline | retained 1px plum underline, orange arrow |
| Docked badge | amber `#F4A640` and navy ring | orange `#FF5A0A` circle, plum `#400849` ring; existing size/dock/expansion trajectory retained |

All restored exact colors, display-family tokens and film strengths are defined in `src/hero-visuals.css`. The old global page background variable was renamed `--bg-page` with all its references updated, preserving later sections' existing background while reserving `--bg-hero` for the requested purple. Tile face colors and all later section palettes are untouched.

## Files changed by this task

- `src/hero-visuals.css` — new locked palette and scoped restoration styles, film and badge styling.
- `src/style.css` — remove final navy/amber override block and obsolete local arrival/badge palette declarations; rename existing global background variable without changing its value.
- `src/main.jsx` — import restoration CSS, remove cloud creation, use white token for birds.
- `index.html` — restore ruler and semantic two-line headline with attached punctuation.
- `components/ui/character-art.tsx` — source fills use centralized tokens; flat opening and white eyes, black body/arm.
- `components/ui/waving-character.tsx` — outer SVG colors also use the shared tokens.
- `components/ui/use-ascii-character.ts` — copy computed tokens into serialized SVG snapshots; pupil token; restore nominal desktop grid density.
- `components/ui/ascii-raster.ts` — read tinted glyph palette from CSS tokens, including silhouette rim and overlap ink.
- `components/ui/use-hero-journey.ts` — nowrap line wrapper, upright lid, headline entrance finish; no changes to pin, scrub, lift calculation, tiles, dive, portal, reverse or later child timeline.
- `VISUAL_SPEC.md` — requested short guardrail.
- `docs/VISUAL_RESTORATION.md` — this audit and complete restoration inventory.
- `scripts/restore-visual-qa.mjs` — reproducible browser acceptance capture/check script using the repo's existing Playwright runtime.
- `output/playwright/restoration/*` — 1440×900 initial/returned hero, final/returned mind, six forward sequence captures, JSON measurements and labeled side-by-side comparisons.
- `dist/index.html`, `dist/assets/index-BVh9S_0c.css`, `dist/assets/index-Cp1njSlP.js` — regenerated production build; hashed bundle filenames change. Existing unrelated working-tree edits were not reverted.

`components/ui/film-overlay.tsx`, `components/ui/about-stage.css`, `components/ui/about-motion.js`, the badge-expansion logic and later sections were not edited.

## Acceptance evidence

Run `node scripts/restore-visual-qa.mjs`. It captures at 1440×900 and seeks the existing single scrub timeline through hero, lid, tile burst, dive, portal and completed mind, then seeks into About and back through every earlier beat.

- Build: `npm run build` passes (existing large-chunk advisory remains).
- Browser: zero page errors, no horizontal overflow in sampled states.
- Colors measured in browser: hero rgb(82,73,127), skin rgb(106,99,150), body and arm rgb(20,20,20), mind rgb(231,176,222), accents rgb(255,90,10), badge ring rgb(64,8,73).
- Head: 316.8px = 22% of 1440px. Dome continues below viewport.
- Sky: six white birds, no cloud elements.
- Lid matrix: no rotation or x translation; negative y lift; reverse returns to the same geometry.
- Tiles: all eleven visible during burst; portal covers view and yields to mind.
- Mind: exactly `A curious mind.` / `A world to build.`, nowrap, normal font style, every word at the same y within each completed line.
- Reverse: hero frame pixel-identical under frozen idle capture; mind layout and colors stable (mascot raster antialiasing can differ by a pixel).
- Visual QA: opened and inspected final hero, mind and burst captures. Side-by-side comparisons use earlier repository captures, not unavailable attachments; no claim of pixel identity to the missing originals.
