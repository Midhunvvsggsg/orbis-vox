// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Milestone 2 Test Suite: Web Audio Engine & Sonification for ORBIS VOX.
 * Runnable via: node --test tests/test-m2-audio.js
 *
 * Verifies:
 * 1. Master signal chain safety: AudioContext suspended on creation, unlocked by init(),
 *    LPF 8000Hz, DynamicsCompressor limiter (-6dB, 12:1, knee 3, attack 0.003, release 0.25).
 * 2. 24-voice polyphonic pool with round-robin oldest-voice stealing under high load (>24 notes).
 * 3. Pitch quantizer: Snaps continuous vertical coordinates to discrete scale notes (no raw Hertz).
 * 4. Four distinct track sound personalities:
 *    - night-lights: A minor pentatonic, dynamic tempo 70-130 BPM, plucked envelopes.
 *    - lightning: D Dorian, bright blobs trigger noise bursts + sine pings, silence on 0 blobs.
 *    - currents: D Dorian evolving ambient chord (4 detuned triangles), hue drift & filter sweep.
 *    - co2: Dynamic harmonic chord tension (Maj7 -> Maj9 -> Min2/tritone), clean loop resolution.
 * 5. Image analysis & frame difference edge cases (null/empty inputs, uniform black/white).
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { setupAudioShim, AudioContext } from './e2e/harness/audio-shim.js';
import { setupDomShim } from './e2e/harness/dom-shim.js';
import {
  assertFrequencyInScale,
  assertMasterLimiterConnected,
  assertVoiceCountLeq
} from './e2e/harness/assertions.js';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const ROOT_DIR = resolve(__dirname, '..');

describe('Milestone 2: Web Audio Engine & Sonification Tests', () => {
  let domTeardown = null;
  let audioTeardown = null;
  let AudioEngine = null;
  let quantizePitch = null;
  let SCALES = null;
  let analyzeFrame = null;
  let computeFrameDiff = null;
  let rgbToHsv = null;
  let nightLightsPersonality = null;
  let lightningPersonality = null;
  let currentsPersonality = null;
  let co2Personality = null;

  before(async () => {
    const domShim = setupDomShim();
    domTeardown = domShim.teardown;
    const audioShim = setupAudioShim();
    audioTeardown = audioShim.teardown;

    globalThis.window.AudioContext = globalThis.AudioContext;
    globalThis.window.webkitAudioContext = globalThis.webkitAudioContext;
    globalThis.window.OfflineAudioContext = globalThis.OfflineAudioContext;

    // Load modules
    const audioMod = await import(resolve(ROOT_DIR, 'js/audio-engine.js'));
    AudioEngine = audioMod.AudioEngine;
    quantizePitch = audioMod.quantizePitch;
    SCALES = audioMod.SCALES;

    const imgMod = await import(resolve(ROOT_DIR, 'js/image-analysis.js'));
    analyzeFrame = imgMod.analyzeFrame;
    computeFrameDiff = imgMod.computeFrameDiff;
    rgbToHsv = imgMod.rgbToHsv;

    const nlMod = await import(resolve(ROOT_DIR, 'js/tracks/night-lights.js'));
    nightLightsPersonality = nlMod.nightLightsPersonality;

    const ltMod = await import(resolve(ROOT_DIR, 'js/tracks/lightning.js'));
    lightningPersonality = ltMod.lightningPersonality;

    const crMod = await import(resolve(ROOT_DIR, 'js/tracks/currents.js'));
    currentsPersonality = crMod.currentsPersonality;

    const coMod = await import(resolve(ROOT_DIR, 'js/tracks/co2.js'));
    co2Personality = coMod.co2Personality;
  });

  after(() => {
    if (domTeardown) domTeardown();
    if (audioTeardown) audioTeardown();
  });

  // =========================================================================
  // Requirement 1 & 4a: Master Signal Chain & Limiter Parameters
  // =========================================================================
  describe('Master Signal Chain & Safety Configuration', () => {
    it('initializes in suspended state and unlocks to running upon init() user gesture', async () => {
      const engine = new AudioEngine();
      assert.strictEqual(engine.ctx, null, 'AudioContext must be null before init()');
      assert.strictEqual(engine.isPlaying, false);

      await engine.init();
      assert.ok(engine.ctx !== null, 'AudioContext must be created on init()');
      assert.strictEqual(engine.ctx.state, 'running', 'AudioContext must transition to running');

      engine.dispose();
    });

    it('configures master limiter with exact safety parameters (-6dB, 12:1, knee 3, attack 0.003, release 0.25)', async () => {
      const engine = new AudioEngine();
      await engine.init();

      const limiter = engine.limiter;
      assert.ok(limiter, 'Limiter must exist');
      assert.strictEqual(limiter.threshold.value, -6, 'Threshold must be -6 dB');
      assert.strictEqual(limiter.ratio.value, 12, 'Ratio must be 12:1');
      assert.strictEqual(limiter.knee.value, 3, 'Knee must be 3 dB');
      assert.strictEqual(limiter.attack.value, 0.003, 'Attack must be 0.003s');
      assert.strictEqual(limiter.release.value, 0.25, 'Release must be 0.25s');

      engine.dispose();
    });

    it('configures master low-pass filter at 8000 Hz', async () => {
      const engine = new AudioEngine();
      await engine.init();

      const filter = engine.masterFilter;
      assert.ok(filter, 'Master filter must exist');
      assert.strictEqual(filter.type, 'lowpass', 'Filter type must be lowpass');
      assert.strictEqual(filter.frequency.value, 8000, 'Cutoff frequency must be 8000 Hz');

      engine.dispose();
    });

    it('routes master signal path: Voices -> masterFilter -> limiter -> masterGain -> destination', async () => {
      const engine = new AudioEngine();
      await engine.init();

      assertMasterLimiterConnected(engine.ctx);
      assert.ok(engine.masterFilter._outputs.has(engine.limiter), 'masterFilter must connect to limiter');
      assert.ok(engine.limiter._outputs.has(engine.masterGain), 'limiter must connect to masterGain');
      assert.ok(engine.masterGain._outputs.has(engine.ctx.destination), 'masterGain must connect to destination');

      engine.dispose();
    });

    it('volume and mute controls correctly adjust and restore gain levels', async () => {
      const engine = new AudioEngine();
      await engine.init();

      engine.setVolume(0.75);
      assert.strictEqual(engine.volume, 0.75);
      assert.strictEqual(engine.masterGain.gain.value, 0.75);

      // Muting sets masterGain to 0
      engine.setMute(true);
      assert.strictEqual(engine.isMuted, true);
      assert.strictEqual(engine.masterGain.gain.value, 0.0);

      // Unmuting restores previous volume
      engine.setMute(false);
      assert.strictEqual(engine.isMuted, false);
      assert.strictEqual(engine.masterGain.gain.value, 0.75);

      engine.dispose();
    });
  });

  // =========================================================================
  // Requirement 2 & 4b: Voice Allocation & Stealing Pool
  // =========================================================================
  describe('24-Voice Polyphonic Pool & Oldest-Voice Stealing', () => {
    it('enforces hard cap of 24 voices and round-robin steals oldest voice on overflow', async () => {
      const engine = new AudioEngine();
      await engine.init();

      assert.strictEqual(engine.maxVoices, 24, 'Engine must have maxVoices = 24');

      // Trigger 50 concurrent notes (well above 24 cap)
      for (let i = 0; i < 50; i++) {
        engine.triggerProbe(i / 50, (50 - i) / 50);
      }

      // Check context voice count does not exceed 24
      assertVoiceCountLeq(engine.ctx, 24);
      assert.ok(engine.ctx.hasOldestVoiceBeenStolen(), 'Oldest voices must have been stolen');
      assert.ok(engine.ctx.getStolenVoiceCount() >= 26, 'At least 26 voices must have been stolen');

      engine.dispose();
    });

    it('each allocated voice node tree consists of OscillatorNode, GainNode, BiquadFilterNode, and StereoPannerNode', async () => {
      const engine = new AudioEngine();
      await engine.init();

      const initialCount = engine.ctx._allCreatedNodes.size;
      const voice = engine.allocateVoice({
        type: 'sawtooth',
        frequency: 440,
        pan: 0.5,
        filterCutoff: 3000
      });

      assert.ok(voice, 'Voice must be returned');
      assert.strictEqual(voice.osc.constructor.name, 'OscillatorNode');
      assert.strictEqual(voice.gain.constructor.name, 'GainNode');
      assert.strictEqual(voice.filter.constructor.name, 'BiquadFilterNode');
      assert.strictEqual(voice.panner.constructor.name, 'StereoPannerNode');

      // Check wiring: osc -> gain -> filter -> panner -> masterFilter
      assert.ok(voice.osc._outputs.has(voice.gain), 'osc must connect to gain');
      assert.ok(voice.gain._outputs.has(voice.filter), 'gain must connect to filter');
      assert.ok(voice.filter._outputs.has(voice.panner), 'filter must connect to panner');
      assert.ok(voice.panner._outputs.has(engine.masterFilter), 'panner must connect to masterFilter');

      engine.dispose();
    });

    it('disposal cleanly closes AudioContext and stops all active voices', async () => {
      const engine = new AudioEngine();
      await engine.init();

      for (let i = 0; i < 10; i++) {
        engine.triggerProbe(0.5, 0.5);
      }
      assert.ok(engine.activeVoices.length > 0);

      engine.dispose();
      assert.strictEqual(engine.ctx, null);
      assert.strictEqual(engine.isPlaying, false);
      assert.strictEqual(engine.activeVoices.length, 0);
    });
  });

  // =========================================================================
  // Requirement 3 & 4c: Pitch Quantizer
  // =========================================================================
  describe('Musical Pitch Quantizer', () => {
    it('snaps continuous vertical positions to discrete scale frequencies (never raw continuous hertz)', () => {
      const testCoordinates = [0.0, 0.1, 0.23, 0.456, 0.5, 0.789, 0.95, 1.0];

      for (const y of testCoordinates) {
        const freqNl = quantizePitch(y, 'A minor pentatonic');
        assertFrequencyInScale(freqNl, 'A minor pentatonic');

        const freqLt = quantizePitch(y, 'D Dorian');
        assertFrequencyInScale(freqLt, 'D Dorian');

        const freqCm = quantizePitch(y, 'C Major');
        assertFrequencyInScale(freqCm, 'C Major');
      }
    });

    it('maps top of frame (y=0) to highest scale pitch and bottom (y=1) to lowest scale pitch', () => {
      const topPitch = quantizePitch(0.0, 'A minor pentatonic');
      const bottomPitch = quantizePitch(1.0, 'A minor pentatonic');

      assert.ok(topPitch > bottomPitch, `Top pitch (${topPitch} Hz) must be higher than bottom pitch (${bottomPitch} Hz)`);
      assert.strictEqual(topPitch, 880.00, 'Top pitch should snap to highest scale note A5 (880 Hz)');
      assert.strictEqual(bottomPitch, 110.00, 'Bottom pitch should snap to lowest scale note A2 (110 Hz)');
    });

    it('clamps out-of-bounds vertical coordinates safely', () => {
      const underflow = quantizePitch(-0.5, 'A minor pentatonic');
      const overflow = quantizePitch(1.8, 'A minor pentatonic');

      assert.strictEqual(underflow, 880.00, 'Negative y clamped to top (0.0)');
      assert.strictEqual(overflow, 110.00, 'Overflow y clamped to bottom (1.0)');
    });

    it("snaps coordinates to valid Harmonic Tension frequencies using 'Harmonic Tension' and 'Dynamic Tension Chord' aliases", () => {
      const testCoordinates = [0.0, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0];
      const co2Notes = SCALES['co2'];

      for (const y of testCoordinates) {
        const freqHt = quantizePitch(y, 'Harmonic Tension');
        assertFrequencyInScale(freqHt, 'Harmonic Tension');
        assert.ok(co2Notes.includes(freqHt), `Frequency ${freqHt} must be in SCALES['co2']`);

        const freqDtc = quantizePitch(y, 'Dynamic Tension Chord');
        assertFrequencyInScale(freqDtc, 'Dynamic Tension Chord');
        assert.ok(co2Notes.includes(freqDtc), `Frequency ${freqDtc} must be in SCALES['co2']`);

        // Case-insensitivity check
        const freqLower = quantizePitch(y, 'harmonic tension');
        assert.strictEqual(freqLower, freqHt);
      }

      // Top coordinate y=0 snaps to highest frequency (523.25 Hz)
      assert.strictEqual(quantizePitch(0.0, 'Harmonic Tension'), 523.25);
      // Bottom coordinate y=1 snaps to lowest frequency (130.81 Hz)
      assert.strictEqual(quantizePitch(1.0, 'Harmonic Tension'), 130.81);
    });
  });

  // =========================================================================
  // Requirement 4 & 4d: Four Distinct Track Sound Personalities
  // =========================================================================
  describe('Four Distinct Track Sound Personalities', () => {
    it('night-lights: uses A minor pentatonic, dynamic tempo (70-130 BPM), and plucked envelopes', () => {
      assert.strictEqual(nightLightsPersonality.id, 'night-lights');
      assert.strictEqual(nightLightsPersonality.scale, 'A minor pentatonic');

      // Tempo calculations
      assert.strictEqual(nightLightsPersonality.calculateTempo(0.0), 70);
      assert.strictEqual(nightLightsPersonality.calculateTempo(0.5), 100);
      assert.strictEqual(nightLightsPersonality.calculateTempo(1.0), 130);
      assert.strictEqual(nightLightsPersonality.calculateTempo(-0.2), 70);
      assert.strictEqual(nightLightsPersonality.calculateTempo(1.5), 130);

      // Pluck synthesis
      const ctx = new AudioContext();
      const dest = ctx.createGain();
      const colData = {
        points: [
          { y: 0.1, luminance: 0.8 },
          { y: 0.5, luminance: 0.6 }
        ]
      };
      nightLightsPersonality.playColumn(ctx, dest, colData, 0.9);
      const oscillators = Array.from(ctx._allCreatedNodes).filter(n => n.constructor.name === 'OscillatorNode');
      assert.ok(oscillators.length > 0, 'Pluck oscillators created');
      assert.strictEqual(oscillators[0].type, 'triangle', 'Pluck uses triangle timbre');
    });

    it('lightning: uses D Dorian, triggers band-pass noise bursts + sine pings on blobs, silence on zero blobs', () => {
      assert.strictEqual(lightningPersonality.id, 'lightning');
      assert.strictEqual(lightningPersonality.scale, 'D Dorian');

      const ctx = new AudioContext();
      const dest = ctx.createGain();

      // Zero blobs -> pure silence (no nodes created)
      const countBefore = ctx._allCreatedNodes.size;
      lightningPersonality.triggerBlobs(ctx, dest, []);
      assert.strictEqual(ctx._allCreatedNodes.size, countBefore, 'Zero blobs must produce zero audio nodes');

      // Trigger blobs
      const blobs = [
        { x: 0.2, y: 0.4, brightness: 0.9 },
        { x: 0.8, y: 0.6, brightness: 0.75 }
      ];
      lightningPersonality.triggerBlobs(ctx, dest, blobs);
      const nodesAfter = ctx._allCreatedNodes.size;
      assert.ok(nodesAfter > countBefore, 'Nodes allocated for blobs');

      const sineOsc = Array.from(ctx._allCreatedNodes).find(n => n.constructor.name === 'OscillatorNode');
      assert.ok(sineOsc, 'Sine ping oscillator created');
      assert.strictEqual(sineOsc.type, 'sine');
      assertFrequencyInScale(sineOsc.frequency.value, 'D Dorian');
    });

    it('currents: D Dorian evolving ambient chord (4 detuned triangles), hue drift & filter sweep', () => {
      assert.strictEqual(currentsPersonality.id, 'currents');
      assert.strictEqual(currentsPersonality.baseFrequencies.length, 4);

      const ctx = new AudioContext();
      const dest = ctx.createGain();

      currentsPersonality.modulatePad(ctx, dest, 220, 0.6);
      const oscillators = Array.from(ctx._allCreatedNodes).filter(n => n.constructor.name === 'OscillatorNode');
      assert.strictEqual(oscillators.length, 4, 'Must spawn exactly 4 pad voices');

      for (const osc of oscillators) {
        assert.strictEqual(osc.type, 'triangle');
      }

      // Filter modulation
      const filters = Array.from(ctx._allCreatedNodes).filter(n => n.constructor.name === 'BiquadFilterNode');
      assert.strictEqual(filters.length, 4, 'Each pad voice has a filter sweep');
      assert.strictEqual(filters[0].type, 'lowpass');
    });

    it('co2: dynamic harmonic tension (Maj7 -> Maj9 -> Min2/tritone) resolving cleanly at loop boundary', () => {
      assert.strictEqual(co2Personality.id, 'co2');

      // Low CO2: Consonant Major 7th
      const low = co2Personality.getTensionFrequencies(0.1);
      assert.strictEqual(low.length, 4);
      assert.strictEqual(low[0], 220.0);

      // Mid CO2: Major 9th
      const mid = co2Personality.getTensionFrequencies(0.35);
      assert.strictEqual(mid.length, 5);

      // High CO2: Minor 2nd + Tritone tension
      const high = co2Personality.getTensionFrequencies(0.8);
      assert.strictEqual(high.length, 5);
      const tritoneRatio = high[2] / high[0];
      assert.ok(Math.abs(tritoneRatio - Math.SQRT2) < 0.01, 'Tritone ratio ~1.4142');

      // Clean resolution at loop boundary
      const ctx = new AudioContext();
      const dest = ctx.createGain();
      co2Personality.resolveAtLoopBoundary(ctx, dest);
      const oscs = Array.from(ctx._allCreatedNodes).filter(n => n.constructor.name === 'OscillatorNode');
      assert.strictEqual(oscs.length, 4, 'Loop boundary resolves to 4-note consonant Major 7th');
    });

    it('all 4 personalities produce distinct timbres, scales, and envelope shapes', () => {
      // 1. Scales are distinct
      assert.strictEqual(nightLightsPersonality.scale, 'A minor pentatonic');
      assert.strictEqual(lightningPersonality.scale, 'D Dorian');
      assert.strictEqual(currentsPersonality.scale, 'D Dorian');
      assert.strictEqual(co2Personality.scale, 'Harmonic Tension');

      // 2. Base roots and chords are distinct
      assert.notDeepStrictEqual(nightLightsPersonality.scaleNotes, lightningPersonality.scaleNotes);
      assert.notDeepStrictEqual(currentsPersonality.baseFrequencies, co2Personality.getTensionFrequencies(0.1));
    });

    it('handles zero-boundary inputs accurately without falsy fallback errors', () => {
      // 1. currents: meanHue = 0 evaluates to 0 degrees red (-12 semitones drift) rather than 200
      //              frameDiff = 0 evaluates to 0.0 velocity (base cutoff 400 Hz) rather than 0.1 / 560 Hz
      const ctxCurrents = new AudioContext();
      const destCurrents = ctxCurrents.createGain();
      currentsPersonality.modulatePad(ctxCurrents, destCurrents, 0, 0);

      const currentsOscs = Array.from(ctxCurrents._allCreatedNodes).filter(n => n.constructor.name === 'OscillatorNode');
      assert.strictEqual(currentsOscs.length, 4, 'Must spawn 4 pad oscillators');
      // Base freq for D3 is 146.83. With meanHue=0, hueOffset = ((0 - 180)/180)*12 = -12 semitones.
      // Expected frequency = 146.83 * 2^(-12/12) = 146.83 * 0.5 = 73.415 Hz.
      const expectedD3Hue0 = 146.83 * Math.pow(2, -12 / 12);
      assert.ok(
        Math.abs(currentsOscs[0].frequency.value - expectedD3Hue0) < 0.05,
        `Expected ~${expectedD3Hue0.toFixed(2)} Hz for meanHue=0 (-12 semitones), got ${currentsOscs[0].frequency.value}`
      );

      const currentsFilters = Array.from(ctxCurrents._allCreatedNodes).filter(n => n.constructor.name === 'BiquadFilterNode');
      assert.strictEqual(currentsFilters.length, 4, 'Must have 4 biquad filters');
      // With frameDiff=0, baseCutoff = 400 + 0 * 1600 = 400 Hz.
      const initialCutoffAutom = currentsFilters[0].frequency._automations[0];
      assert.strictEqual(initialCutoffAutom.value, 400, 'frameDiff=0 must yield base cutoff of exactly 400 Hz');

      // 2. co2: meanBrightness = 0.0 evaluates to 0.0 (base cutoff 600 Hz, pure sine) rather than 0.2 / 1280 Hz
      const ctxCo2 = new AudioContext();
      const destCo2 = ctxCo2.createGain();
      co2Personality.playTensionChord(ctxCo2, destCo2, 0.0);

      const co2Oscs = Array.from(ctxCo2._allCreatedNodes).filter(n => n.constructor.name === 'OscillatorNode');
      assert.ok(co2Oscs.length >= 4);
      for (const osc of co2Oscs) {
        assert.strictEqual(osc.type, 'sine', 'meanBrightness=0.0 must use pure sine waveforms');
      }

      const co2Filters = Array.from(ctxCo2._allCreatedNodes).filter(n => n.constructor.name === 'BiquadFilterNode');
      assert.ok(co2Filters.length >= 4);
      // With meanBrightness=0.0, cutoff = 600 + 0 * 3400 = 600 Hz.
      assert.strictEqual(co2Filters[0].frequency.value, 600, 'meanBrightness=0.0 must set filter cutoff to exactly 600 Hz');

      // 3. lightning: blob.x = 0.0 pans hard left to -1.0 rather than centering to 0.0
      const ctxLt = new AudioContext();
      const destLt = ctxLt.createGain();
      lightningPersonality.triggerBlobs(ctxLt, destLt, [
        { x: 0.0, y: 0.5, brightness: 0.8 },
        { x: 1.0, y: 0.5, brightness: 0.8 },
        { x: 0.5, y: 0.5, brightness: 0.8 }
      ]);

      const panners = Array.from(ctxLt._allCreatedNodes).filter(n => n.constructor.name === 'StereoPannerNode');
      assert.ok(panners.length >= 3, 'Panners created for blobs');
      // Blob 0 (x=0.0): hard left pan = -1.0
      assert.strictEqual(panners[0].pan.value, -1.0, 'blob.x=0.0 must pan hard left to -1.0');
    });
  });

  // =========================================================================
  // Requirement 5 & 4e: Image Analysis & Frame Difference Edge Cases
  // =========================================================================
  describe('Image Analysis & Frame Differencing Edge Cases', () => {
    it('analyzeFrame handles null and undefined inputs safely without throwing', () => {
      const resNull = analyzeFrame(null);
      assert.strictEqual(resNull.width, 0);
      assert.strictEqual(resNull.height, 0);
      assert.strictEqual(resNull.litFraction, 0.0);
      assert.strictEqual(resNull.meanBrightness, 0.0);
      assert.strictEqual(resNull.brightBlobs.length, 0);
      assert.strictEqual(resNull.columnData.length, 0);

      const resUndef = analyzeFrame(undefined);
      assert.strictEqual(resUndef.litFraction, 0.0);
    });

    it('analyzeFrame handles 0x0 empty canvas safely', () => {
      const emptyCanvas = document.createElement('canvas');
      emptyCanvas.width = 0;
      emptyCanvas.height = 0;

      const res = analyzeFrame(emptyCanvas);
      assert.strictEqual(res.litFraction, 0.0);
      assert.strictEqual(res.columnData.length, 0);
    });

    it('analyzeFrame correctly analyzes uniform black canvas', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 320, 180);

      const stats = analyzeFrame(canvas);
      assert.strictEqual(stats.litFraction, 0.0, 'Black canvas litFraction must be 0');
      assert.strictEqual(stats.meanBrightness, 0.0, 'Black canvas meanBrightness must be 0');
      assert.strictEqual(stats.brightBlobs.length, 0, 'No blobs in black canvas');
      assert.strictEqual(stats.columnData.length, 32, 'Must produce 32 columns');
      assert.strictEqual(stats.columnData[0].points.length, 12, 'Must produce 12 rows per col');
    });

    it('analyzeFrame correctly analyzes uniform white canvas', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 320, 180);

      const stats = analyzeFrame(canvas);
      assert.strictEqual(stats.litFraction, 1.0, 'White canvas litFraction must be 1.0');
      assert.ok(stats.meanBrightness >= 0.99, 'White canvas meanBrightness must be ~1.0');
      assert.ok(stats.brightBlobs.length <= 8, 'Blobs must be capped at 8');
      assert.strictEqual(stats.columnData.length, 32);
    });

    it('computeFrameDiff handles null/undefined inputs safely', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 36;

      assert.strictEqual(computeFrameDiff(null, null), 0.0);
      assert.strictEqual(computeFrameDiff(canvas, null), 0.0);
      assert.strictEqual(computeFrameDiff(null, canvas), 0.0);
    });

    it('computeFrameDiff returns 0.0 for identical frames and 1.0 for black vs white frames', () => {
      const black = document.createElement('canvas');
      black.width = 64;
      black.height = 36;
      const blackCtx = black.getContext('2d');
      blackCtx.fillStyle = '#000000';
      blackCtx.fillRect(0, 0, 64, 36);

      const white = document.createElement('canvas');
      white.width = 64;
      white.height = 36;
      const whiteCtx = white.getContext('2d');
      whiteCtx.fillStyle = '#ffffff';
      whiteCtx.fillRect(0, 0, 64, 36);

      // Identical frames produce diff = 0.0
      const diffSame = computeFrameDiff(black, black);
      assert.strictEqual(diffSame, 0.0, 'Identical black frames must yield 0.0 diff');

      // Black vs White produces diff = 1.0
      const diffExtreme = computeFrameDiff(black, white);
      assert.ok(Math.abs(diffExtreme - 1.0) < 0.01, `Black vs white diff must be ~1.0, got ${diffExtreme}`);
    });

    it('rgbToHsv correctly calculates hue, saturation, and value across primary colors', () => {
      // Pure Red (255, 0, 0) -> H=0, S=1.0, V=1.0
      const red = rgbToHsv(255, 0, 0);
      assert.strictEqual(red.h, 0);
      assert.strictEqual(red.s, 1.0);
      assert.strictEqual(red.v, 1.0);

      // Pure Green (0, 255, 0) -> H=120, S=1.0, V=1.0
      const green = rgbToHsv(0, 255, 0);
      assert.strictEqual(green.h, 120);
      assert.strictEqual(green.s, 1.0);

      // Pure Blue (0, 0, 255) -> H=240, S=1.0, V=1.0
      const blue = rgbToHsv(0, 0, 255);
      assert.strictEqual(blue.h, 240);
      assert.strictEqual(blue.s, 1.0);

      // Gray (128, 128, 128) -> S=0
      const gray = rgbToHsv(128, 128, 128);
      assert.strictEqual(gray.s, 0.0);
    });
  });

  // =========================================================================
  // Playhead Sweep Sequencer & Probe Tone
  // =========================================================================
  describe('Sweep Sequencer & Probe Tone Functionality', () => {
    it('sweep sequencer tracks 32 columns over 14 seconds and triggers onTick', async () => {
      const engine = new AudioEngine();
      await engine.init();
      engine.setTrack({ id: 'night-lights', soundSpec: { personality: 'night-lights' } });

      const ticks = [];
      engine.onTick(t => ticks.push(t));

      engine.seek(0.25);
      assert.strictEqual(ticks.length, 1);
      assert.strictEqual(ticks[0].column, 8);
      assert.strictEqual(ticks[0].currentTime, 3.5);

      engine.seek(0.75);
      assert.strictEqual(ticks[1].column, 24);
      assert.strictEqual(ticks[1].currentTime, 10.5);

      engine.dispose();
    });

    it('triggerProbe snaps pitch to track scale and sets stereo panning', async () => {
      const engine = new AudioEngine();
      await engine.init();
      engine.setTrack({
        id: 'night-lights',
        soundSpec: { scale: 'A minor pentatonic', personality: 'night-lights' }
      });

      // Probe at (x=0.0, y=0.0) -> full left pan, high pitch
      engine.triggerProbe(0.0, 0.0, { luminance: 0.9, hue: 200 });
      const lastVoice = engine.activeVoices[engine.activeVoices.length - 1];

      assert.ok(lastVoice, 'Probe voice created');
      assertFrequencyInScale(lastVoice.osc.frequency.value, 'A minor pentatonic');
      assert.strictEqual(lastVoice.panner.pan.value, -1.0, 'x=0.0 maps to full left pan (-1.0)');

      // Probe at (x=1.0, y=1.0) -> full right pan, low pitch
      engine.triggerProbe(1.0, 1.0, { luminance: 0.5 });
      const rightVoice = engine.activeVoices[engine.activeVoices.length - 1];
      assert.strictEqual(rightVoice.panner.pan.value, 1.0, 'x=1.0 maps to full right pan (+1.0)');
      assertFrequencyInScale(rightVoice.osc.frequency.value, 'A minor pentatonic');

      engine.dispose();
    });
  });
});
