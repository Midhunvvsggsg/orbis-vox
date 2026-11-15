# Sonification spec

Principle: **listenable first, honest always.** Direct pixel-to-sound is noise. We quantize to musical scales, cap voice counts, and document every mapping.

## Honesty about the data
We sonify the *rendered colors* of NASA visualizations, not raw model values. Where a legend/colorbar exists, invert it to approximate values and label results as approximate. Each track has a visible "Mapping card" listing every rule.

## Shared engine
- One `AudioContext`. Master chain: gain -> gentle low-pass -> soft limiter (DynamicsCompressor) -> destination. Light convolution or feedback-delay reverb with a per-track send.
- Voices: oscillator + ADSR envelope + filter + stereo panner. Hard cap 24 simultaneous voices. Round-robin steal oldest.
- Sweep mode: a playhead moves left to right across the frame over `sweepSeconds` (default 14 s), looping. At each of 32 columns, sample 12 rows.
- Frame sequences: advance frames on a timeline; frame-to-frame difference gives a "change" signal.
- Quantize pitch to the track's scale. Never output unscaled frequencies.

## Base mapping (tracks override)
| Visual feature | Sound parameter |
|---|---|
| Vertical position (top to bottom) | Pitch (high to low), quantized to scale |
| Horizontal position | Time (sweep) and stereo pan (-1 to +1) |
| Luminance / intensity | Loudness and note probability (threshold ~0.15 to avoid hiss) |
| Hue (cool to warm) | Timbre: soft sine/triangle (cool) to brighter filtered saw (warm); filter cutoff rises with warmth |
| Saturation | Detune amount and reverb send |
| Frame-to-frame change | Filter motion and rhythmic density |

## Track personalities
1. **night-lights** (rhythm). A minor pentatonic. Plucked, short envelopes. Note probability follows lit-pixel density, so 2012 sounds sparse and 2023 denser. Tempo = 70 + 60 * litFraction BPM, clamped. A time slider scrubs the 2012 to 2023 frames; the pulse visibly and audibly thickens.
2. **lightning** (percussion). D Dorian. Per frame, find up to 8 bright blobs. Each blob triggers a noise burst through a band-pass plus a short sine ping. Pitch from blob y, pan from blob x, velocity from blob brightness. Silence between flashes is intentional.
3. **currents** (ambient pad). D Dorian. 4 detuned triangle voices forming a slow chord; chord root drifts with mean hue; flow speed (frame difference) sets LFO rate and filter sweep. Long attack and release. Feels like moving water.
4. **co2** (harmonic tension). Chord quality is a function of mean intensity: low = consonant major 7th; mid = add 9th and detune; high = add minor 2nd and tritone, tremolo rate up, filter brighter. The listener hears the planet get "tenser" as CO2 rises. Keep it musical: tension must always resolve when the loop restarts.
5. **aerosols** (stretch, multi-track). Split by hue band into instruments: dust (warm, low pad), smoke (dark, filtered noise), sea salt (blue, glassy bells), sulfate (light, high plucks). Each has a mute/solo toggle.
6. **forest** (stretch). Canopy-height color to pitch; density to rhythm; major pentatonic.

## Interaction modes
- **Play/Pause**, **Next/Previous record**, **Tour mode** (60 s auto-play of all core tracks, 15 s each, with spoken-style captions).
- **Explore mode**: pointer, touch or arrow keys move a probe over the image; the pixel under the probe plays a short tone using the base mapping and the live region announces a plain-language description (e.g. "upper left, very bright, warm").
- **Speed** and **sweep length** controls. **Volume** control. **Mute**.
- **Download soundscape (WAV)**: render the full sweep with `OfflineAudioContext`, encode PCM16 WAV, name it `orbis-vox-<track-id>.wav`.

## Mapping card format (shown per track and stored in data/tracks.json)
```
Source: <exact SVS/EIC title + URL>
What you are seeing: <2 to 3 plain sentences, written from the source page, not invented>
How it sounds: <each rule in one line>
Scale and tempo: <...>
Limits: <what the sonification does NOT tell you>
```
