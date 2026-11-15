# Build plan (time-boxed; submission is tonight)

If time is shorter than planned, cut from the bottom of the stretch list. NEVER skip Phase 4 (public deploy) or Phase 6 (submission text).

## Phase 0: setup (10 min)
- [ ] Read AGENTS.md and every file in docs/. Create `docs/DECISIONS.md` and `docs/REFERENCES.md`.
- [ ] Scaffold the layout from AGENTS.md. Start local server on port 8080.

## Phase 1: vertical slice (40 min)
- [ ] Acquire real frames for `night-lights` and the legend (see DATA_SOURCES.md rules).
- [ ] `image-analysis.js` and `audio-engine.js` working. Play/pause works. Sweep plays.
- [ ] Minimal page shows frame, description, mapping card.
- [ ] Listen. It must sound musical, not like noise. Tune before moving on.

## Phase 2: full jukebox (40 min)
- [ ] Acquire frames for `lightning`, `currents`, `co2`.
- [ ] One mapping module per track, each with a distinct sound personality.
- [ ] Jukebox UI: record cards (title, one-line description, source credit), next/previous, now-playing panel.
- [ ] Tour mode (15 s per core track).

## Phase 3: accessibility and exploration (30 min)
- [ ] Everything in docs/ACCESSIBILITY.md "Must have".
- [ ] Explore mode with probe and live-region descriptions.
- [ ] WAV export per track.

## Phase 4: public deploy (20 min)  [REQUIRED]
- [ ] Initialise git, commit, push to GitHub, enable Pages (or deploy to Netlify). If I need to do a step manually, give me the exact commands.
- [ ] Open the public URL in a private window. Audio works after a click. No login needed.

## Phase 5: polish (20 min)
- [ ] Visual identity: dark "record shop" look, large type, strong contrast, tasteful motion that respects reduced-motion.
- [ ] About page: why we built it, how to listen, credits, "Not affiliated with or endorsed by NASA", AI-assistance statement.
- [ ] README with run instructions, mapping summary, credits, AI statement.

## Phase 6: submission kit (30 min)  [REQUIRED]
- [ ] Fill in docs/DEMO_AND_SUBMISSION.md with final text for every form field.
- [ ] Complete docs/REFERENCES.md.
- [ ] Write a 30-second video script and a 7-slide outline.

## Stretch (only after all gates pass)
- [ ] aerosols multi-track
- [ ] forest
- [ ] sst, airq, river

## Release gates (all must be ticked)
- [ ] Public URL works in a private window, no login.
- [ ] Every track uses real NASA frames with source and credit shown.
- [ ] At least 4 distinct tracks, each audibly different.
- [ ] No console errors. No audio before a user gesture.
- [ ] Keyboard-only run-through passes. Lighthouse accessibility 95 or higher.
- [ ] No NASA logos added. No images of minors. English only.
- [ ] REFERENCES.md lists every external resource, including any library or font.
- [ ] Code headers and README carry the AI-assistance statement.
- [ ] Repo under 50 MB.
