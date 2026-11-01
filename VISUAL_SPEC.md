# Hero and mind screen: locked visual specification

Do not change these colors, fonts, character fills or effect strengths without an explicit request.

The single source of restored tokens is `src/hero-visuals.css`:

| Token | Exact value |
|---|---|
| `--bg-hero` | `#52497F` |
| `--skin` | `#6A6396` |
| `--ink` | `#141414` |
| `--inner` | `#2E2A4F` |
| `--cream` | `#F1EEE6` |
| `--pink` | `#E7B0DE` |
| `--plum` | `#400849` |
| `--accent` | `#FF5A0A` |
| `--periwinkle` | `#A89FE8` |
| `--white` | `#FFFFFF` |
| `--ascii-dark` | `#1a1530` |
| `--ascii-rim` | `#8E84C9` |
| `--ascii-skin` | `#B7AEEA` |

Display: Limelight, weight 400, upright; hero subtitle: Italiana; labels/navigation: Bebas Neue. No replacement fonts. Hero name 9.2vw on desktop. Head approximately 22vw; body dome bleeds below the viewport. Small white birds and twinkling dots; no clouds.

Character: flat purple skin, black body/arm/pupils, white eyes, dark inner opening; 8-unit black outlines with round joins on skin parts, no additional body/arm outline. The single lid group contains a black cap and purple scalloped hair band. Preserve straight-up lift.

Film: intensity 0.6, grain 0.10, haze 0.12, warm/plum corner vignette 0.35, flicker 0.02. Keep fine animated grain and reduced-motion behavior. ASCII uses shape-aware tinted glyph matching, nominal 5×9px cells, dense dark ink, purple skin glyphs, lighter purple silhouette rim and white eyes.

Mind: pink background, plum radial corner vignette and film grain; left edge 12vw. Exact two nowrap lines, normal inline spaces and attached punctuation:

```
A curious mind.
A world to build.
```

Only `curious` and `build.` are orange; main words/CTA plum; eyebrow and down arrow orange; CTA thin underline. Words animate opacity and y=24→0 only. Badge circle orange, ring plum. Preserve scrub, pin, lid, tiles and reverse mechanics. The head-only dive specification below replaces the old separate portal. Do not alter badge expansion or subsequent sections.


## Composition and opening controls (explicitly requested follow-up)

`--char-top-offset: 54svh` anchors the opening center; `--char-opening-ratio: .25` locates it in the 600-unit portrait. Portrait size, fills, fonts, ASCII and film strengths stay locked. A fixed-width SVG has aspect-ratio-dependent chin height: at 1440×900 it is 84.4vh; at 1920×1080 and 1280×720 it is 87.8vh. Do not stretch the art to change this.

The lid lifts straight up by 40% of the face height (76 SVG units), without the former title cap. The opening's requested subtle glow uses the existing skin token, 6px blur, opacity 0.28 only during the opening beat. Both status dots use `--status-green: #A8D18D`; the experiment toggle remains.

The hero-to-mind segment ends at master time 8.9; About starts at 9.1. Dive spans 2.6–7.4 (at least 25% of the full pin). The actual opening group expands vertically from ry=26 to ry=110 during its last 40%; the face/body leave below. Six thin, fill-free rings are clipped to that same SVG opening, using an inner/cream tint at up to .25 stroke opacity, and move with the scroll clock. The opening covers every viewport corner before the stage and its fill change together from inner to pink over .712 timeline units. Text stays hidden throughout that color change and enters only afterward. No separate portal element, filled disc, CSS circle clip or transition overlay is allowed. Preserve the single reversible scrub owner.
