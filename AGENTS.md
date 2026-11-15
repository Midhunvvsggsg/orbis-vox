# ORBIS VOX: The Earth Jukebox

> Always-on project context. Antigravity CLI loads this file from the folder where `agy` was started.
> Detailed specs live in `docs/`. Read them before writing code.

## What we are building
A static, no-backend web app. The user picks a NASA Earth Information Center (EIC) visualization (a "record"), sees the frames, and hears a soundscape generated live in the browser from those frames. It must be usable by blind and low-vision users. It is our entry to the NASA Space Apps Challenge 2026, challenge "Earth Jukebox".

Tagline: **Hear the planet.**

## Hard rules (breaking any of these can disqualify the project)
1. Use REAL NASA frames from the resources listed in `docs/DATA_SOURCES.md`. Never invent, fake, or "simulate" NASA data. If a download fails, stop and tell me which file I must place in `assets/frames/<track-id>/`. A clearly labelled placeholder is allowed only for local testing and must never ship.
2. All text in the UI, docs and code comments is in English.
3. No images, video or audio of any person under 18. Prefer no people at all.
4. Do not add NASA logos, meatball, worm, flags or mission patches anywhere. Plain-text credit only. Footer must say the project is not affiliated with or endorsed by NASA.
5. Do not generate images, video or audio with AI models. Audio is produced by our own code (Web Audio API) from pixel data.
6. Every code file starts with this header comment: `Generated with AI assistance (Google Antigravity). Reviewed by the team.` README must state the same.
7. Every external resource (data, library, font, image, code snippet) is logged in `docs/REFERENCES.md` as you add it. Prefer zero third-party runtime dependencies. No CDN fonts or scripts unless logged.
8. Demo limits: video of 30 seconds or less, or at most 7 slides including title. Nothing in the repo may suggest otherwise.

## Stack
- Vanilla HTML, CSS and ES modules. No build step. No framework. No backend.
- Web Audio API for synthesis. `OfflineAudioContext` for WAV export.
- Canvas 2D for pixel reads. Frames are same-origin files in `assets/frames/`.
- Must run with `python3 -m http.server` and deploy as-is to GitHub Pages or Netlify.

## Layout
```
index.html
css/styles.css
js/app.js              UI, track picker, state
js/audio-engine.js     synth voices, scheduler, master chain
js/image-analysis.js   pixel sampling, color, brightness, blobs, frame diff
js/tracks/*.js         one mapping module per track (see docs/SONIFICATION_SPEC.md)
js/a11y.js             descriptions, live regions, keyboard map
js/export-wav.js       offline render + WAV encoder
data/tracks.json       metadata per track: title, source URL, credit, description, mapping card
assets/frames/<id>/    compressed JPG frames, max 1600 px wide
docs/                  specs and submission drafts
```

## Code standards
- Small modules, named exports, JSDoc on public functions.
- No `alert()`. No console errors on load. Handle `AudioContext` autoplay rules (resume on first user gesture).
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.
- Keep total repo size under 50 MB. Compress frames.

## Working agreements
- Do not ask me many questions. Make a reasonable choice, record it in `docs/DECISIONS.md` (one line each), and continue.
- Ship a vertical slice first (one track, end to end, deployed), then widen. Follow `docs/BUILD_PLAN.md`.
- After each phase: run the app, listen, check the console, and tick the checklist in `docs/BUILD_PLAN.md`.
- Never delete files without telling me. Never commit secrets.

## Definition of done
All boxes in `docs/BUILD_PLAN.md` "Release gates" are ticked and `docs/DEMO_AND_SUBMISSION.md` is filled in with final text.
