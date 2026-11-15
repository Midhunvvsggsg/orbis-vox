You are the lead engineer for ORBIS VOX, my entry to the NASA Space Apps Challenge 2026 "Earth Jukebox" challenge. Submission closes tonight, so ship a working, publicly hosted v1 early, then improve it.

STEP 1: READ FIRST
Read AGENTS.md and every file in docs/ (CHALLENGE_BRIEF, RULES_AND_JUDGING, DATA_SOURCES, SONIFICATION_SPEC, ACCESSIBILITY, BUILD_PLAN, DEMO_AND_SUBMISSION). They are the source of truth. Summarise your plan in 10 lines, then start building without waiting for approval.

STEP 2: BUILD
Create a static web app (vanilla JS, Web Audio API, no backend) that turns real NASA Earth Information Center visualization frames into live, musical soundscapes. The user picks a "record" (visualization), sees the frames, and hears sound generated from those pixels. Follow docs/BUILD_PLAN.md phase by phase.

Core records: night-lights, lightning, currents, co2. Each needs a distinct sound personality as defined in docs/SONIFICATION_SPEC.md. Stretch records only after all release gates pass.

Quality bar for winning:
- Sounds musical: scales, capped voices, limiter, reverb. Test by running it and listening to the logic, then tune.
- Accessible first: keyboard-operable, screen-reader friendly, descriptive text for every frame, an Explore mode with a probe, a Listen-only view, and WAV download per track.
- Honest: every track has a Mapping card (source, what you see, how it sounds, limits). We sonify rendered colors, not raw values; say so.
- Memorable presentation: dark "record shop" identity, one-tap listening, a 60-second Tour mode for judges.

STEP 3: REAL DATA ONLY
Fetch real frames from the NASA EIC/SVS pages named in docs/DATA_SOURCES.md. Record each exact URL and credit. If you cannot download something, STOP and tell me the exact file and page so I can place it in assets/frames/<track-id>/. Never fabricate NASA data.

STEP 4: COMPLIANCE (disqualification risk)
Follow the hard rules in AGENTS.md: English only, no under-18 likeness, no NASA logos added, no AI-generated media, AI-assistance header in every code file, every external resource logged in docs/REFERENCES.md.

STEP 5: DEPLOY AND VERIFY
Deploy to GitHub Pages or Netlify (give me exact commands for any step I must do). Verify the public URL in a private window. Run the release gates in docs/BUILD_PLAN.md and report pass/fail for each.

STEP 6: SUBMISSION KIT
Fill in docs/DEMO_AND_SUBMISSION.md with final text for every form field, a 30-second video script and a 7-slide outline. Keep the SI statement truthful.

Do not ask me questions unless a download or deploy step is blocked. Log decisions in docs/DECISIONS.md. Begin now.
