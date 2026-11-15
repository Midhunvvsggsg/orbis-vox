# Architecture & Engineering Decisions

## DEC-001: Pure Static Vanilla Web Stack (No Backend, No Frameworks, No Build Step)
- **Context**: The NASA Space Apps Challenge 2026 "Earth Jukebox" entry requires a zero-friction, reliable web application that can be hosted on GitHub Pages or Netlify and run locally with `python3 -m http.server`.
- **Decision**: Build ORBIS VOX using standard HTML5, CSS3, and ES6 JavaScript modules with native browser APIs (Web Audio API, Canvas 2D API). No external build tools (Vite, Webpack, Babel), no heavy UI frameworks (React, Vue), and no backend server runtime.
- **Consequences**: Zero build configuration overhead, instant load times, 100% deterministic local and CDN execution, maximum longevity and testability.

## DEC-002: Dark "Record Shop" Visual Aesthetic
- **Context**: The challenge theme is "Earth Jukebox", inviting users to explore Earth visualization data as musical vinyl records or jukebox selections.
- **Decision**: Adopt a dark, moody record shop visual theme featuring deep obsidian tones (`#0c0d10`, `#14171f`), warm vinyl gold/amber and electric cyan accents, subtle groove textures, large bold typography, and tactile transport controls (Play, Tour, Explore).
- **Consequences**: Meets and exceeds WCAG 2.2 AA contrast requirements (> 4.5:1 for body text, > 3:1 for graphical UI elements), provides an immersive auditory-visual experience, and supports `prefers-reduced-motion` and `prefers-color-scheme`.

## DEC-003: Authentic NASA SVS Media Acquisition & Frame Extraction Pipeline
- **Context**: NASA data integrity rules mandate using genuine NASA Earth Information Center / Scientific Visualization Studio assets without fabrication, while keeping the total repository size strictly under 50 MB.
- **Decision**: Fetch authentic NASA SVS media (video/stills) directly from `https://svs.gsfc.nasa.gov/`. Extract 8 to 24 evenly spaced frames per core track using `ffmpeg`, downscaling to a maximum width of 1600px (`scale='min(1600,iw)':-1`), compressed with standard JPEG quality (q:v 3-5). Download official NASA colorbars/legends as `legend.jpg` where available.
- **Consequences**: Genuine NASA Earth observations and visualizations are preserved with full scientific fidelity, while total image payload stays around 10–20 MB, well within the 50 MB limit.

## DEC-004: Sonification Mapping Honesty and Transparency
- **Context**: Satellite visualizations undergo rendering, contrast enhancement, and color mapping before publication. Sonifying these images must remain scientifically honest.
- **Decision**: Explicitly disclose in every track's visible Mapping Card and metadata (`data/tracks.json`) that sonification is performed on the *rendered RGB pixel values* (luminance, hue, saturation, spatial distribution) and not raw calibrated sensor radiance (e.g. nanowatt/cm²·sr) or physical oceanographic model units.
- **Consequences**: Space Apps judges and low-vision users receive full transparency regarding what the sound represents and its physical limitations.

## DEC-005: Web Audio API Safety and Architecture
- **Context**: Autonomous or excessive audio synthesis can cause ear discomfort, acoustic shock, or browser autoplay blocking.
- **Decision**: Maintain a single master `AudioContext` that remains suspended until an explicit user gesture (Play button or Space key). Route all voices through a dedicated master low-pass filter and a `DynamicsCompressorNode` configured as a transparent safety limiter (threshold -6 dB, ratio 12:1). Cap simultaneous voices to 24 with oldest-voice round-robin voice stealing.
- **Consequences**: Prevents browser autoplay policy violations, eliminates digital clipping and harsh transients, and guarantees acoustic safety for all listeners.

## DEC-006: Client-Side Offline Audio Rendering for WAV Export
- **Context**: Users and judges must be able to export and download soundscapes offline without server dependencies.
- **Decision**: Implement `js/export-wav.js` using `OfflineAudioContext` to render a complete 14-second playback sweep, encode the audio buffers into standard 16-bit PCM WAV format client-side, and initiate download as `orbis-vox-<track-id>.wav`.
- **Consequences**: 100% client-side operation, zero backend required, portable audio deliverables.


## DEC-007: 24-Voice Polyphonic Synthesizer Pool & Oldest-Voice Stealing
- **Context**: Sonifying 32 columns x 12 rows of complex satellite imagery can potentially trigger hundreds of simultaneous oscillators if unconstrained, exhausting CPU resources and distorting output.
- **Decision**: Implement an explicit 24-voice polyphonic allocation pool in `AudioEngine`. Every allocated voice consists of a dedicated `OscillatorNode`, `GainNode` (ADSR envelope), `BiquadFilterNode`, and `StereoPannerNode`. When the 25th voice is requested, the engine steals the oldest active voice in round-robin fashion, immediately cancelling scheduled gain automations, zeroing output gain, stopping the oscillator, and recycling the node graph without leaking.
- **Consequences**: Guarantees bounded resource utilization, prevents audio thread glitching or crashes under high-density frames, and provides transparent polyphonic voice management across both browser and headless environments.

## DEC-008: Musical Pitch Quantization & Distinct Sound Personalities
- **Context**: Direct mapping of continuous pixel coordinates to arbitrary continuous Hertz creates noisy, dissonant, and unlistenable tones.
- **Decision**: Implement a discrete pitch quantizer in `AudioEngine` that strictly snaps vertical normalized coordinates [0.0, 1.0] to predefined scale notes (e.g. A minor pentatonic, D Dorian, Harmonic Tension), guaranteeing no raw unscaled frequencies are ever emitted. Develop distinct sound personalities for the four core NASA visualization records:
  1. `night-lights`: A minor pentatonic plucked rhythm with dynamic tempo scaling (70-130 BPM).
  2. `lightning`: D Dorian percussive bursts combining band-pass noise with tonal sine pings on bright blobs, with intentional silence between flashes.
  3. `currents`: D Dorian evolving ambient chord (4 detuned triangle waves) with root drifting on mean hue and filter cutoff sweeping with frame difference flow speed.
  4. `co2`: Dynamic harmonic chord tension scaling from consonant Major 7th at low concentrations up to Minor 2nd and Tritone dissonance at high concentrations, resolving cleanly at the loop boundary.
- **Consequences**: Ensures every sonification is musically coherent and accessible to human ears, maintains genuine data correspondence with visual features, and preserves distinct auditory identities across tracks.

## DEC-009: Robust Boundary Falsy Value Handling & Scale Alias Alignment
- **Context**: In JavaScript, numeric zero (`0` or `0.0`) is a valid physical/domain measurement for angular hue (0° = pure red / -12 semitones drift), frame difference (0.0 = static imagery / 0 velocity flow), mean brightness (0.0 = minimum concentration / 600 Hz baseline cutoff), and normalized horizontal coordinate (0.0 = extreme left canvas edge). Using the logical OR operator (`||`) for default assignment coerced legitimate zero inputs to arbitrary positive defaults (e.g. `meanHue = 0 || 200` became 200, `frameDiff = 0 || 0.1` became 0.1, `meanBrightness = 0 || 0.2` became 0.2, and `blob.x = 0 || 0.5` became 0.5). Additionally, CO2 track metadata defines its scale as "Harmonic Tension" / "Dynamic Tension Chord", requiring explicit alias mapping in the audio engine and assertion pitch classes.
- **Decision**:
  1. Replace falsy `||` default fallbacks with strict numeric checks: `Number.isFinite(Number(v)) ? Number(v) : fallback` for continuous scalars (`meanHue`, `frameDiff`, `meanBrightness`) and explicit nullish checks `(blob.x !== undefined && blob.x !== null ? blob.x : 0.5)` for spatial stereo panning.
  2. Register `'harmonic tension'` and `'dynamic tension chord'` in `SCALES` (`js/audio-engine.js`) aliased to `SCALES['co2']`, and add them to `SCALE_PITCH_CLASSES` in `tests/e2e/harness/assertions.js`.
  3. Expand unit test suite (`tests/test-m2-audio.js`) to assert mathematical correctness on zero-boundary inputs (0 hue -> -12 semitones, 0 diff -> 400 Hz cutoff, 0 brightness -> 600 Hz cutoff & sine wave, 0 blob.x -> -1.0 hard left pan) and verify quantization under both scale aliases.
- **Consequences**: Guarantees physically faithful sonification on zero-boundary frames (pure red hues, static loops, zero brightness, and hard-left spatial events) without unwanted fallback artifacts, and ensures complete scale alignment across UI metadata, synthesis engine, and testing harnesses.
