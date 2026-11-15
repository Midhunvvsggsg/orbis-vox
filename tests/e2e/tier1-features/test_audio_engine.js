// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Tier 1 Feature Coverage: Web Audio Engine & Master Signal Chain
 * Covers Features 9, 10, 11, 12 (TC-T1-AUT-01 through TC-T1-AUT-03, TC-T1-AUD-01 through TC-T1-AUD-04)
 * Validates AudioContext lifecycle, master limiter routing, 24-voice pool ceiling,
 * and 32-column sweep sequencer progression.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { setupAudioShim } from '../harness/audio-shim.js';
import { setupDomShim } from '../harness/dom-shim.js';
import {
  assertMasterLimiterConnected,
  assertVoiceCountLeq
} from '../harness/assertions.js';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const ROOT_DIR = resolve(__dirname, '../../..');

describe('Tier 1: Web Audio Engine & Master Signal Chain (Features 9-12)', () => {
  let domTeardown = null;
  let audioTeardown = null;
  let AudioEngine = null;

  before(async () => {
    const domShim = setupDomShim();
    domTeardown = domShim.teardown;
    const audioShim = setupAudioShim();
    audioTeardown = audioShim.teardown;

    // Attach Web Audio constructors to window shim
    globalThis.window.AudioContext = globalThis.AudioContext;
    globalThis.window.webkitAudioContext = globalThis.webkitAudioContext;
    globalThis.window.OfflineAudioContext = globalThis.OfflineAudioContext;

    // Dynamically import AudioEngine with mocked Web Audio environment
    const mod = await import(resolve(ROOT_DIR, 'js/audio-engine.js'));
    AudioEngine = mod.AudioEngine;
  });

  after(() => {
    if (domTeardown) domTeardown();
    if (audioTeardown) audioTeardown();
  });

  it('TC-T1-AUT-01: AudioContext starts uninitialized/suspended and unlocks to running upon init()', async () => {
    const engine = new AudioEngine();
    assert.strictEqual(engine.ctx, null, 'AudioContext must not be instantiated before user gesture');
    assert.strictEqual(engine.isPlaying, false, 'Playback must not be active on construct');

    await engine.init();

    assert.ok(engine.ctx !== null, 'AudioContext must be created after init()');
    assert.strictEqual(engine.ctx.state, 'running', 'AudioContext must be in running state after init()');

    engine.dispose();
  });

  it('TC-T1-AUD-01: master signal chain routes through low-pass filter, limiter, and master gain to destination', async () => {
    const engine = new AudioEngine();
    await engine.init();

    assert.ok(engine.masterFilter, 'Master filter must exist');
    assert.ok(engine.limiter, 'Limiter DynamicsCompressorNode must exist');
    assert.ok(engine.masterGain, 'Master gain node must exist');

    assert.strictEqual(engine.masterFilter.type, 'lowpass', 'Master filter must be lowpass');
    assert.strictEqual(engine.masterFilter.frequency.value, 8000, 'Master filter cutoff should be ~8000 Hz');

    // Verify master limiter is connected upstream of destination
    assertMasterLimiterConnected(engine.ctx);

    // Verify exact downstream chain connections
    assert.ok(engine.masterFilter._outputs.has(engine.limiter), 'masterFilter must connect to limiter');
    assert.ok(engine.limiter._outputs.has(engine.masterGain), 'limiter must connect to masterGain');
    assert.ok(engine.masterGain._outputs.has(engine.ctx.destination), 'masterGain must connect to destination');

    engine.dispose();
  });

  it('TC-T1-AUD-02: limiter parameters conform to transparent acoustic safety standards', async () => {
    const engine = new AudioEngine();
    await engine.init();

    const limiter = engine.limiter;
    assert.ok(limiter.threshold.value <= -3, `Limiter threshold (${limiter.threshold.value}) must be <= -3 dB`);
    assert.ok(limiter.ratio.value >= 12, `Limiter ratio (${limiter.ratio.value}) must be >= 12:1 for hard ceiling`);
    assert.ok(limiter.attack.value <= 0.005, `Limiter attack (${limiter.attack.value}s) must be <= 5ms to catch fast transients`);

    engine.dispose();
  });

  it('TC-T1-AUD-03: voice allocation ceiling is hard-capped at 24 voices with oldest-voice stealing', async () => {
    const engine = new AudioEngine();
    await engine.init();

    const dummyTrack = {
      id: 'night-lights',
      title: 'Night Lights',
      soundSpec: { personality: 'night-lights' }
    };
    engine.setTrack(dummyTrack);

    // Trigger multiple probe pings to spawn voice oscillators
    for (let i = 0; i < 30; i++) {
      engine.triggerProbe(i / 30, (30 - i) / 30);
    }

    // Verify context voice ceiling does not exceed 24
    assertVoiceCountLeq(engine.ctx, 24);
    assert.ok(engine.stolenVoiceCount >= 6, `Must record at least 6 stolen voices, got ${engine.stolenVoiceCount}`);
    assert.ok(engine.ctx.hasOldestVoiceBeenStolen(), 'Context must register voice stealing');
    assert.strictEqual(engine.activeVoices.length, 24, 'Active voice pool must remain capped at 24');

    engine.dispose();
  });

  it('TC-T1-AUD-04: sweep sequencer progresses over 14 seconds across 32 columns and emits onTick events', async () => {
    const engine = new AudioEngine();
    await engine.init();

    const dummyTrack = {
      id: 'night-lights',
      title: 'Night Lights',
      soundSpec: { personality: 'night-lights' }
    };
    engine.setTrack(dummyTrack);

    assert.strictEqual(engine.progress, 0.0);
    assert.strictEqual(engine.sweepDuration, 14.0);

    const receivedTicks = [];
    engine.onTick((tick) => {
      receivedTicks.push(tick);
    });

    // Test active play timer progression
    engine.play();
    assert.strictEqual(engine.isPlaying, true, 'Engine must report isPlaying true');
    await new Promise((r) => setTimeout(r, 120));
    assert.ok(engine.progress > 0, 'Progress must advance during active playback');
    assert.ok(receivedTicks.length > 0, 'Active playback must emit tick events');
    engine.pause();
    assert.strictEqual(engine.isPlaying, false, 'Engine must report isPlaying false after pause');

    // Test seek and tick emission across columns
    receivedTicks.length = 0;
    engine.seek(0.5);
    assert.strictEqual(engine.progress, 0.5);
    assert.ok(receivedTicks.length >= 1, 'Tick must be emitted on seek');

    const lastTick = receivedTicks[receivedTicks.length - 1];
    assert.strictEqual(lastTick.progress, 0.5);
    assert.strictEqual(lastTick.column, 16, 'Column at 0.5 progress must be 16 (out of 32)');
    assert.strictEqual(lastTick.currentTime, 7.0, 'Time at 0.5 progress must be 7.0s');

    engine.dispose();
  });

  it('TC-T1-AUD-05: volume, mute toggle, seeking, and disposal operate reliably', async () => {
    const engine = new AudioEngine();
    await engine.init();

    // Volume setting
    engine.setVolume(0.65);
    assert.strictEqual(engine.volume, 0.65);
    assert.strictEqual(engine.masterGain.gain.value, 0.65);

    // Mute toggle
    engine.setMute(true);
    assert.strictEqual(engine.isMuted, true);
    assert.strictEqual(engine.masterGain.gain.value, 0.0);

    // Unmute restores prior volume
    engine.setMute(false);
    assert.strictEqual(engine.isMuted, false);
    assert.strictEqual(engine.masterGain.gain.value, 0.65);

    // Seek bounds clamping
    engine.seek(-0.2);
    assert.strictEqual(engine.progress, 0.0);
    engine.seek(1.5);
    assert.strictEqual(engine.progress, 1.0);

    // Disposal
    engine.dispose();
    assert.strictEqual(engine.ctx, null);
    assert.strictEqual(engine.isPlaying, false);
  });
});
