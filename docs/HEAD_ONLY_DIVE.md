# Head-only dive: portal removal

## Removed

- The `.portal` element from `index.html` and every active `.portal` CSS rule in `src/style.css` / `src/hero-visuals.css`.
- All portal center/radius calculations, circular CSS clipping, scale, opacity and color tweens from `use-hero-journey.ts`.
- The unused `.journey-depth` element and its base CSS rule.

The later About section's badge/iris animation is outside this transition and remains unchanged.

## Changed

- `components/ui/character-art.tsx`: keep the existing opening ellipse, lid and character paths; add transform groups around the interior, front rim, face surface and ears. Add six fill-free SVG ellipses inside the real opening, clipped to its own ellipse. Their tint is 75% existing inner color / 25% existing cream; stroke opacity is at most .25. The group is hidden at rest and marked as a journey decoration, so the existing ASCII snapshot code excludes it without renderer changes. Badge geometry and colors remain the same.
- `components/ui/use-hero-journey.ts`: zoom the existing `#zoom-layer` around the neutral, function-based opening center. Over the last 40% of the zoom, stretch the actual opening/rim groups from 26 to 110 vertical-radius units, producing a circular interior, while face/body parts move downward. Nothing independent is placed over the character. The rim is outside the viewport before the color transition.
- Same controller: six thin rings travel radially under the same scrub clock until the color change begins. Non-scaling SVG strokes and inverse camera-scale compensation keep lines thin. Forward and reverse use the same phase, geometry and opacity, with no autonomous animation.
- Same controller: after full dark coverage, animate the **stage background** and opening fill from the existing inner color to existing pink together. A shared `--dive-interior` variable keeps their colors identical. Fade rings during that segment. The pink section stays hidden, and all its text stays at opacity zero. Once the background is completely pink, reveal the pink section fully opaque, then animate only its text opacity/y. There is no pink-section opacity crossfade over a dark layer.
- `src/hero-visuals.css`: remove portal rules and initialize the dive fill to the existing inner token. Other palette, composition, typography, ASCII and film rules are unchanged.
- `index.html`, `src/style.css`: delete unused transition elements/rules described above; no hero/pink content or styling changes.
- `scripts/head-dive-qa.mjs`: new forward/reverse capture and acceptance suite, including comparison against previous hero/lid/tile measurements, coverage, opaque fill, hidden-text sequencing, ring motion, refresh and resize recovery.
- `scripts/hero-composition-qa.mjs`: keep the existing command as an entry point to the current acceptance suite.
- `VISUAL_SPEC.md`: replace obsolete portal instructions with this head-only transition specification.
- `docs/HEAD_ONLY_DIVE.md`: this change inventory.
- `output/playwright/head-dive/`: screenshots and measurements at all three desktop viewport sizes, plus contact sheets.
- `dist/index.html`, `dist/assets/index-CDVhMKPB.css`, `dist/assets/index-DxNaZPHp.js`: regenerated production build.

No edits to `ascii-raster.ts`, `use-ascii-character.ts`, film overlay code, tile creation/targets/colors/size/stagger, lid paths/lift/timing, About motion or pink-screen typography/palette.

## Sequence

Times are in the existing single scroll timeline. Capture percentages refer to the hero-to-mind portion; later About content still uses the same pin and retains its previous pace.

| Segment | Master time |
|---|---|
| Existing lid and tile burst | unchanged |
| Opening-centered zoom | 2.6–7.4 |
| Opening becomes round; face/body leave below | 5.48–7.4 |
| Rings move continuously | 2.6–7.4 |
| Tiles fly outward and disappear | unchanged; gone by 4.35, within first 60% of dive |
| Stage and opening color inner→pink; rings fade, text hidden | 7.4–8.112 |
| Eyebrow, headline words and CTA enter on fully pink background | 8.132 onward |
| Completed pink headline | 8.9 |
| Existing About sequence begins | 9.1 |

Dive duration is 4.8 / 18.7 = **25.67% of the entire pinned scroll range**. Background transition duration is .712 = **8% of the hero-to-mind segment**.

## Acceptance

Commands:

```
node scripts/head-dive-qa.mjs
npm run build
```

The browser suite captures both directions at 40, 50, 60, 70, 80 and 90%, plus initial/final and extra samples around the color/text handoff, at 1440×900, 1920×1080 and 1280×720.

Checks include:

- No portal DOM element and no CSS circle clip on the pink section.
- Resting character geometry, colors, lid state, and settled tile positions match the preceding implementation's measurements exactly.
- Opening remains opaque `rgb(46,42,79)` until the color change.
- Inverse-transformed viewport corners all lie strictly inside the opening's inner rim during the color change. At the 70% and 80% captures, the maximum normalized corner values are below 1 at every tested viewport, proving the rim is outside the screen.
- Six clipped, unfilled rings have different radii at 70% and 80%, showing ongoing movement instead of static flat frames.
- Pink section visibility stays hidden, and words remain at zero opacity throughout the background color change. Its section opacity is always 1; text enters after the background is fully `rgb(231,176,222)`.
- Camera, lid, interior, rings, stage and headline state match at corresponding forward/reverse samples, including a return after visiting About.
- Refresh during the color change keeps pivot, stage color and opening color stable.
- Resizing during the dive and returning to the original viewport recovers the exact original ASCII canvas PNG checksum.
- No page errors or horizontal overflow.

Screenshots were opened for visual inspection, in addition to numeric checks, to verify dark fill, visible thin rings, full coverage and crisp text on pink.

Final results: all three viewport suites passed, including refresh/reverse and exact ASCII PNG recovery after resize. Production build and whitespace checks passed; only the existing large-bundle advisory remains.
