# Hero composition and opening beat

The available Git history remains `e52d112`, `5be4f66`, `66a0006`. None contains the current character or hero journey. The named 12.50.36 PM and 1.55.24 PM screenshots are not attached to the conversation available to the agent, nor identifiable by those names in the repository. This update uses the supplied numeric anchors. Comparisons are labeled as the preceding implementation, not the missing originals.

## Changes

- `src/hero-visuals.css`: anchor portrait opening center with `--char-top-offset:54svh` and `--char-opening-ratio:.25`; the same 60vw portrait/head width remains. Position is tunable in one place and independent of viewport pixel height. Move the lid's foreground copy above tiles/name. Keep the approved hero/mind colors, typography, grain, ASCII and effect strengths. Restore two green status dots (`#A8D18D`) and keep the experiment toggle. Enable only the requested opening glow: existing skin token, 6px blur, opacity animated to .28. Portal begins in existing dark inner color; correct its layer order and centering, with pink below it.
- `components/ui/use-hero-journey.ts`: remove the title cap; straight vertical lid travel is .40×190 = 76 SVG units (109.44 screen pixels at 1440px width), no rotation or sideways movement, back.out(1.6). The composite SVG lid paths are unchanged. Both source and foreground lid use the same tween. Finish the existing ASCII-to-SVG resolution before the lid lifts, preserving its appearance at scroll zero.
- Same controller: measure opening in neutral layout coordinates rather than transformed screen rectangles. The camera pivot, portal and every tile's origin share those coordinates. Function-based values and `invalidateOnRefresh:true` remain. Refreshing during the blend must not alter the pivot or portal color.
- Same controller: all eleven tiles start at the opening center, scale .2 and opacity 0. Their existing colors, 88px desktop dimensions and .03s stagger remain; back.out(1.7). Five mirrored pairs are seeded at 30°, 45°, 60°, 70°, 80° on radii 1.6, 1.0, 1.6, 1.0, 1.6×head width. The odd eleventh tile occupies the centered canopy. A cached collision solver projects each mirrored pair to the nearest available slot, with 24px viewport margins, avoiding the name, face, hand and subtitles. It tries the 25–80° interval first and relaxes angle only when the viewport leaves no clear slot, prioritizing the explicit no-overlap constraint. Hover offsets now follow scroll time, making reverse deterministic rather than running a separate clock.
- Same controller: extend the hero-to-mind sequence to master time 7.2; About starts at 7.4. Dive runs 2.6–7.0 (4.4 units, 25.9% of the 17-unit full pinned timeline), portal 3.3–7.0. The zoom pivots at the actual dark opening, tiles leave past camera, and a dark circular portal grows continuously. Pink is already underneath, clipped to the same expanding circle. A small clip inset avoids an early pink antialiasing seam. Over the final 15% of expansion, portal color blends dark→pink and opacity 1→0. There is no one-frame portal opacity switch. Eyebrow starts at 5.8, headline at 5.85 and CTA at 6.05, all settled before full coverage. Chrome, including the ruler, fades during the dive.
- Same controller: shift existing later labels by the new hero duration, preserve the About child timeline and scale total pin length proportionally. Every later beat retains its preceding scroll distance and pace. No changes to `about-motion.js`, later section styling or badge expansion.
- `scripts/hero-composition-qa.mjs`: captures forward/reverse screenshots at 0, 20, 25, 30, 35, 40, 50, 60, 70, 80, 85, 90, 95 and 100% of the hero-to-mind segment at all three requested viewport sizes. It enters the later About sequence before returning, checks reverse equality and refresh stability, and asserts composition, lift, fan clearance, colors and completed headline visibility.
- `VISUAL_SPEC.md`: document the tunable anchor, permitted green status dots and requested opening glow/timeline.
- `docs/HERO_COMPOSITION_FIX.md`: this inventory and measured results.
- `output/playwright/composition/`: acceptance screenshots, numeric measurements and contact sheets/comparisons.
- `dist/index.html`, `dist/assets/index-3XftVwO5.css`, `dist/assets/index-DWcbDk3d.js`: regenerated production assets.

## Measured composition

| Viewport | Head width | Face/rim anchor | Closed lid top | Hand top | Chin |
|---|---:|---:|---:|---:|---:|
| 1440×900 | 316.8px (22%) | 54vh | 43.8vh | 56.7vh | 84.4vh |
| 1920×1080 | 422.4px (22%) | 54vh | 42.6vh | 57.0vh | 87.8vh |
| 1280×720 | 281.6px (22%) | 54vh | 42.6vh | 57.0vh | 87.8vh |

At 1440×900 the requested 54vh rim, 40–44vh lid and 88vh chin cannot all be achieved by translation alone at the preserved 22vw size. The current choice preserves the rim/lid anchors and unchanged proportions; the chin is consequently 84.4vh. This tradeoff was surfaced to the user. The hand clears the subtitle at every requested size, and the dome is cropped by the viewport.

## Acceptance

Percentages in these captures refer to the hero-to-mind segment, ending at the new `mind` label, rather than the entire pin which also contains later About content.

Run `node scripts/hero-composition-qa.mjs` and `npm run build`.

The browser checks assert:

- 22% head width, 54vh rim anchor, hand below subtitle, lid below name at rest and body cropped.
- At 20/25/30%, full .40×face-height upward lid travel and at least 100px clear separation between opening center and lifted lid bottom. At 1440px width the lid itself travels 109.44px.
- All eleven settled tiles visible at 35%, inside the viewport with 24px margins, without name/face/hand intersections.
- At 100%, pink background, headline and CTA opacity 1, portal opacity 0.
- Identical camera, lid, portal and headline state at matching forward/reverse samples, including a return after visiting About.
- Stable camera pivot and portal color after refreshing midway through the final blend.
- No horizontal overflow or browser page errors.

The CSS diff against the pre-task copy confirms that all approved palette, font, ASCII and film-strength declarations remain unchanged. Only the explicitly requested green dots, opening glow and dark→pink portal were added/changed.

Final validation: all three viewport runs passed every assertion with zero browser page errors; production build passed. The existing large-bundle advisory remains.
