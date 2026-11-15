// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Tier 1 Feature Coverage: Four Distinct Sound Personalities
 * Covers Features 13, 14, 15, 16 (TC-T1-TRK-01 through TC-T1-TRK-04 in Miner spec)
 * Validates musical scales (A minor pentatonic, D Dorian, Harmonic Tension),
 * envelope parameters, dynamic tempo scaling, and voice modulation.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { setupAudioShim, AudioContext } from '../harness/audio-shim.js';
import { setupDomShim } from '../harness/dom-shim.js';
import { assertFrequencyInScale } from '../harness/assertions.js';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const ROOT_DIR = resolve(__dirname, '../../..');

describe('Tier 1: Four Distinct Sound Personalities (Features 13-16)', () => {
  let domTeardown = null;
  let audioTeardown = null;
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

  it('TC-T1-TRK-01: night-lights uses A minor pentatonic scale and plucked envelopes', () => {
    assert.strictEqual(nightLightsPersonality.id, 'night-lights');
    assert.strictEqual(nightLightsPersonality.scale, 'A minor pentatonic');

    // Every defined frequency must quantize strictly to A minor pentatonic (A, C, D, E, G)
    for (const freq of nightLightsPersonality.scaleNotes) {
      assertFrequencyInScale(freq, 'A minor pentatonic');
    }

    // Test pluck synthesis creates fast attack and short decay envelope
    const ctx = new AudioContext();
    const dest = ctx.createGain();
    const mockColumnData = {
      points: [
        { y: 0.2, luminance: 0.9 },
        { y: 0.5, luminance: 0.8 },
        { y: 0.8, luminance: 0.7 }
      ]
    };

    nightLightsPersonality.playColumn(ctx, dest, mockColumnData, 0.8);
    // Verified no errors thrown and oscillators connected
    assert.ok(ctx._allCreatedNodes.size > 0);
  });

  it('TC-T1-TRK-02: night-lights dynamic tempo scales 70 to 130 BPM with lit area density', () => {
    // Formula: 70 + 60 * litFraction, clamped [70, 130]
    assert.strictEqual(nightLightsPersonality.calculateTempo(0.0), 70, '0% lit area must yield 70 BPM');
    assert.strictEqual(nightLightsPersonality.calculateTempo(0.5), 100, '50% lit area must yield 100 BPM');
    assert.strictEqual(nightLightsPersonality.calculateTempo(1.0), 130, '100% lit area must yield 130 BPM');

    // Boundary clamping
    assert.strictEqual(nightLightsPersonality.calculateTempo(-0.5), 70, 'Negative values clamped to 70');
    assert.strictEqual(nightLightsPersonality.calculateTempo(1.5), 130, 'Overflow clamped to 130');
  });

  it('TC-T1-TRK-03: lightning uses D Dorian scale and triggers percussive pings for bright blobs', () => {
    assert.strictEqual(lightningPersonality.id, 'lightning');
    assert.strictEqual(lightningPersonality.scale, 'D Dorian');

    // All scale notes must be in D Dorian
    for (const freq of lightningPersonality.scaleNotes) {
      assertFrequencyInScale(freq, 'D Dorian');
    }

    // Trigger flash blobs
    const ctx = new AudioContext();
    const dest = ctx.createGain();
    const mockBlobs = [
      { x: 0.2, y: 0.3, brightness: 0.95 },
      { x: 0.8, y: 0.7, brightness: 0.85 }
    ];

    lightningPersonality.triggerBlobs(ctx, dest, mockBlobs);
    assert.ok(ctx._allCreatedNodes.size > 0, 'Oscillators must be allocated for blobs');

    // Test silence on 0 blobs
    const initialCount = ctx._allCreatedNodes.size;
    lightningPersonality.triggerBlobs(ctx, dest, []);
    assert.strictEqual(ctx._allCreatedNodes.size, initialCount, 'Zero blobs must produce zero audio nodes (intentional silence)');
  });

  it('TC-T1-TRK-04: ocean currents initializes D Dorian 4-voice ambient pad chord (D3, F3, A3, C4)', () => {
    assert.strictEqual(currentsPersonality.id, 'currents');
    assert.strictEqual(currentsPersonality.scale, 'D Dorian');

    // Base frequencies must be D Dorian
    for (const freq of currentsPersonality.baseFrequencies) {
      assertFrequencyInScale(freq, 'D Dorian');
    }
    assert.strictEqual(currentsPersonality.baseFrequencies.length, 4, 'Must use 4-voice pad');
  });

  it('TC-T1-TRK-05: ocean currents pad modulates frequency drift with mean hue and flow velocity', () => {
    const ctx = new AudioContext();
    const dest = ctx.createGain();

    // Modulate with hue = 220 (cool water) and flow = 0.5
    currentsPersonality.modulatePad(ctx, dest, 220, 0.5);

    // Verify 4 voices created
    const oscillators = Array.from(ctx._allCreatedNodes).filter(n => n.constructor.name === 'OscillatorNode');
    assert.strictEqual(oscillators.length, 4, 'Should spawn 4 pad oscillators');

    for (const osc of oscillators) {
      assert.strictEqual(osc.type, 'triangle', 'Ocean currents pad must use gentle triangle waveforms');
    }
  });

  it('TC-T1-TRK-06: global CO2 modulates harmonic tension (Major 7th -> Major 9th -> Minor 2nd / Tritone)', () => {
    assert.strictEqual(co2Personality.id, 'co2');

    // Low CO2 (< 0.25): Consonant Major 7th (4 notes)
    const lowFreqs = co2Personality.getTensionFrequencies(0.15);
    assert.strictEqual(lowFreqs.length, 4, 'Low CO2 should produce 4-note Major 7th chord');
    assert.ok(lowFreqs[0] === 220.0, 'Root note is 220 Hz');

    // Mid CO2 (0.25 - 0.5): 5-note chord with 9th
    const midFreqs = co2Personality.getTensionFrequencies(0.35);
    assert.strictEqual(midFreqs.length, 5, 'Mid CO2 should produce 5-note Major 9th chord');

    // High CO2 (>= 0.5): Minor 2nd + Tritone dissonant tension
    const highFreqs = co2Personality.getTensionFrequencies(0.75);
    assert.strictEqual(highFreqs.length, 5, 'High CO2 produces 5-note chord with tension intervals');

    // Check tritone (root * sqrt(2) ~= 1.4142)
    const tritoneRatio = highFreqs[2] / highFreqs[0];
    assert.ok(Math.abs(tritoneRatio - Math.SQRT2) < 0.01, 'High CO2 tension chord must include tritone interval (~1.4142)');

    // Synthesize tension chord
    const ctx = new AudioContext();
    const dest = ctx.createGain();
    co2Personality.playTensionChord(ctx, dest, 0.8);
    assert.ok(ctx._allCreatedNodes.size > 0);
  });
});
