# About motion controls

The current implementation uses **one master pin** for Hero → headline → About. See [the QA changelog](scroll-story-qa.md) for the fixes and acceptance evidence.

- `components/ui/use-hero-journey.ts`: shared master, hero wipe, palette tiles, headline and About handoff at master time 2.9.
- `components/ui/about-motion.js`: About child timeline, `ABOUT_MOTION.scrollVh` / `mobileScrollVh`, `scrub`, beat A/B, iris, turn, local-joint walk and exit. It creates no ScrollTrigger.
- `components/ui/about-character.jsx`: joint skeleton and front / 3/4 / profile head views. Translate parents place the joints; only inner `data-joint` transforms rotate. Do not animate the parent translations.
- `components/ui/about-stage.jsx`: two-beat semantic copy and visuals.
- `components/ui/about-stage.css`: locked `--about-*` palette, responsive sizing, masks, 6vh safe areas, and static reduced-motion flow.

The camera owns whole-character travel; joints own local rotation; nested idle groups own breath, gaze and wave. Keep those owners separate. The badge exists once, outside the transformed app shell, and its exact center is measured for the iris.

Re-run `scripts/scroll-story-acceptance.mjs` and `scripts/scroll-story-colors.py` after changing joint origins, type sizes, masks, or palette values. The full screenshot script saves 40 positions at each requested viewport and also checks the reverse direction.
