# Scroll-story QA changelog

The reference viewport is **1470 × 769**. The other acceptance sizes are **1920 × 1080** and **390 × 844**.

| Fix | Change | Files |
| --- | --- | --- |
| Global / seam | One Lenis, one physical pinned viewport and one master. Removed the duplicate headline and local badge, the negative 100vh overlap, and the second About pin. Initialization waits for fonts and the ASCII source before refreshing. | `src/main.jsx`, `index.html`, `use-hero-journey.ts`, `about-stage.jsx` |
| 1. Hero handoff | Midnight-to-Mist uses a directional clip wipe with a Sun edge. Nav and the complete bust disappear before it starts. Palette tiles stay below the title; the headband rotates on its attached hinge. | `use-hero-journey.ts`, `about-stage.css`, `ascii-raster.ts` |
| 2. Headline | Only whole `curious` and `build` words travel. Large text uses Burnt Amber; small labels use #94470A. One badge remains fixed bottom-right, with no flight through the copy. | `about-motion.js`, `about-stage.css`, `avatar-badge.tsx` |
| 3. Flood / pull-back | The iris measures the actual badge center. The complete head scales in, blinks and glances, then continuously pulls back. The body shares its skeleton rather than translating away from the neck. Turn includes a 3/4 view and bottoms out at scaleX 0.65. | `about-motion.js`, `about-character.jsx` |
| 4. Rig | Narrow profile torso and headband, offset legs, right-pointing shoes, far arm behind the torso and near arm above it. Local translate parents contain rotating hip, knee, shoulder, neck and headband joints. Four-step exit moves the whole camera. | `about-character.jsx`, `about-motion.js` |
| 5. Stage | A rounded inset clip replaces the self-intersecting vector morph. Five equal Cream strips, Mist left / Cream right, outlined arch, grounded shadow, rays confined behind the actor. | `about-stage.css`, `about-stage.jsx`, `about-motion.js` |
| 6. About layout | Two bounded beats replace the vertical pan. A: eyebrow, padded quote masks and one 42-word human paragraph. B: legible medallions, stickers and ticket. Bubble bowl clips its letter drops; its vector tail is measured to the profile mouth. Caption attaches below the ground line. | `about-stage.jsx`, `about-stage.css`, `about-motion.js` |
| 7. Journey | Entire heading/card section is Midnight; heading is Cream and no longer waits for a typewriter. Cards use Cream / Periwinkle, Navy outlines, hard offset shadows and the display face. Fixed avatar crop includes the full hand and has a content-safe corner. | `demo.tsx`, `flip-cards.tsx`, `about-stage.css`, `avatar-badge.tsx` |
| Performance | Bounded ASCII matching to 10,000 cells, cached only the waving hand instead of sixteen full portraits, and reused settled gaze frames. Deferred the offscreen footer model and paused its render loop and offscreen physics through IntersectionObserver. Trajectory reads are batched before playback. | `use-ascii-character.ts`, `src/main.jsx`, `tech-stack.tsx`, `about-motion.js` |
| Diagnostics | `?debug=1` shows scroll Y and the live master progress. QA helpers settle the scrubbed master at exact sample positions. | `journey-debug.ts`, `scripts/scroll-story-*.mjs` |

## Screenshot evidence

Open `output/playwright/scroll-story/index.html` for the before/after review index. Each requested viewport has 40 evenly spaced **full-page scroll** positions before and after. The after run also captures the same 40 positions in reverse: **120 before + 240 after = 360 screenshots**. Contact sheets collect every frame, not just selected attractive poses.

`before/report.json` reproduces 11 duplicate-headline frames and 2 duplicate-badge frames. The final `after/report.json`, `acceptance.json`, and `colors.json` contain the measured results.

## Reproduce

The saved `before` set is the original draft. For a future QA pass, capture `before` before editing; rerunning that command now would capture the changed source. Keep `npm run dev` running, then:

```sh
node scripts/scroll-story-qa.mjs before
node scripts/scroll-story-qa.mjs after
node scripts/scroll-story-acceptance.mjs
python3 scripts/scroll-story-colors.py
python3 scripts/scroll-story-contact-sheets.py before
python3 scripts/scroll-story-contact-sheets.py after
```

For a stable production capture: `npm run build`, `npm run preview -- --host 127.0.0.1 --port 5175`, then prefix the Node commands with `QA_URL=http://127.0.0.1:5175`. The final captures use this preview to avoid dev hot reloads while files are written. The runner uses installed Playwright or its existing npm cache; `PLAYWRIGHT_MODULE` can point to another installed Playwright `index.js`.

## Acceptance details

- The geometry check seeks 101 positions per viewport and asserts one pin / headline / badge, no viewport overflow, a rig scale above .35, zero translation at local rotating joints, and no independent body translation.
- Both About beats' visible child bounds must remain between 6vh and 94vh. The initial hero name must fit horizontally at every size.
- Reverse seeking compares joint transforms, masks and panel opacity at the same master time.
- The timeline audit measures uncovered motion intervals and primary label intervals. Wheel speed is user-controlled, so these durations are **master timeline seconds**, not a guarantee about elapsed wall-clock scrolling speed.
- Reduced motion has zero pins and both story beats visible in document flow.
- Source palette checks cover all authored CSS and the Hero → About → Journey components. Contrast is calculated from the explicit foreground/background pairs: labels on Mist **5.50:1**, body on Cream **13.43:1**, large Burnt Amber on Mist **3.47:1**. Large values are deliberately distinguished from small labels.
- Full-page screenshots also include the later Tech Stack, Projects and footer sections. Their logos, project imagery and video are outside this UI palette audit.

## Decisions and deviations

1. **One shared pin instead of separate section pins.** The duplicate physical headline and overlapping pin spacers caused the seam. Sharing a master removes the cause and makes reversing deterministic. Total scroll length is controlled by `ABOUT_MOTION` (840vh desktop, 720vh phone) across the complete Hero → headline → About story.
2. **Rounded clip instead of MorphSVG.** This brief permits a clip-path arch. Matching inset/radius geometry cannot turn into a diamond or cross itself, and it stays within transform/opacity/clip-path rendering.
3. **Body enters through the camera pull-back, not an independent translation.** Independently moving the torso away from its neck was incompatible with the no-detached-parts requirement.
4. **Phone keeps the two beats within one viewport.** Stacking a compact stage over the two alternative content beats meets the latest all-viewports fit requirement. Reduced motion shows both in natural flow.
5. **Close-up is width-limited on phones.** A 90vh head would be wider than 390px. The complete head fits within 90vw instead of being cropped at the ears or headband.
6. **#94470A is an intentional allowed addition.** It is explicitly requested for small labels, even though it is outside the eight main swatches.

The persistent avatar and initial hero are deliberate portrait crops; the avatar hand is inside its circle. The About skeleton and speech text are never intentionally cropped. Existing production build bundle-size advice remains; no dependency or feature was added for this QA pass.
