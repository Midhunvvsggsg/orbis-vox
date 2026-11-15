// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Smoke test suite for E2E Mock Harness and Infrastructure.
 * Validates dom-shim, audio-shim, wav-inspector, and domain assertion utilities.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  setupDomShim,
  Event,
  KeyboardEvent,
  MouseEvent,
  TouchEvent,
  HTMLCanvasElement,
  HTMLImageElement
} from './harness/dom-shim.js';

import {
  setupAudioShim,
  AudioContext,
  OfflineAudioContext,
  DynamicsCompressorNode,
  GainNode,
  OscillatorNode
} from './harness/audio-shim.js';

import {
  parseWav,
  validateWavStructure,
  createTestWavBuffer
} from './harness/wav-inspector.js';

import {
  assertFrequencyInScale,
  assertVoiceCountLeq,
  assertMasterLimiterConnected,
  assertValidWavStructure,
  assertAriaThrottled,
  assertAiHeaderPresent
} from './harness/assertions.js';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');

describe('Milestone E1: Mock Harness & Test Infrastructure Smoke Tests', () => {
  let domTeardown = null;
  let audioTeardown = null;

  before(() => {
    const dom = setupDomShim();
    domTeardown = dom.teardown;
    const audio = setupAudioShim();
    audioTeardown = audio.teardown;
  });

  after(() => {
    if (domTeardown) domTeardown();
    if (audioTeardown) audioTeardown();
  });

  describe('1. DOM & Canvas 2D Shim Verification', () => {
    it('creates semantic HTML5 landmarks and elements', () => {
      const doc = document;
      const header = doc.createElement('header');
      const h1 = doc.createElement('h1');
      h1.textContent = 'ORBIS VOX';
      header.appendChild(h1);

      const nav = doc.createElement('nav');
      const main = doc.createElement('main');
      const footer = doc.createElement('footer');

      doc.body.appendChild(header);
      doc.body.appendChild(nav);
      doc.body.appendChild(main);
      doc.body.appendChild(footer);

      assert.strictEqual(doc.querySelector('header h1').textContent, 'ORBIS VOX');
      assert.ok(doc.querySelector('main') !== null);
      assert.ok(doc.querySelector('footer') !== null);
      assert.ok(doc.querySelector('nav') !== null);
    });

    it('manages attributes, classes, and dataset accurately', () => {
      const btn = document.createElement('button');
      btn.setAttribute('id', 'play-btn');
      btn.setAttribute('aria-label', 'Play sonification');
      btn.classList.add('record-btn', 'active');
      btn.dataset.trackId = 'night-lights';

      assert.strictEqual(btn.id, 'play-btn');
      assert.strictEqual(btn.ariaLabel, 'Play sonification');
      assert.ok(btn.classList.contains('record-btn'));
      assert.ok(btn.classList.contains('active'));
      assert.strictEqual(btn.dataset.trackId, 'night-lights');

      btn.classList.toggle('active');
      assert.strictEqual(btn.classList.contains('active'), false);
    });

    it('dispatches and bubbles Mouse, Keyboard, and Touch events', () => {
      const container = document.createElement('div');
      const btn = document.createElement('button');
      container.appendChild(btn);
      document.body.appendChild(container);

      let clickReceived = false;
      let keyReceived = null;
      let touchReceived = false;

      container.addEventListener('click', () => {
        clickReceived = true;
      });

      btn.addEventListener('keydown', (ev) => {
        keyReceived = ev.key;
      });

      btn.addEventListener('touchstart', () => {
        touchReceived = true;
      });

      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      assert.strictEqual(clickReceived, true, 'Click event should bubble to container');

      btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space', bubbles: true }));
      assert.strictEqual(keyReceived, 'Space');

      btn.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
      assert.strictEqual(touchReceived, true);
    });

    it('Canvas 2D context draws and generates realistic pixel data', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      // Clear with black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 64, 64);

      // Paint a bright white square in center
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(16, 16, 32, 32);

      const imgData = ctx.getImageData(0, 0, 64, 64);
      assert.strictEqual(imgData.width, 64);
      assert.strictEqual(imgData.height, 64);
      assert.strictEqual(imgData.data.length, 64 * 64 * 4);

      // Corner pixel (0,0) must be black: RGBA(0, 0, 0, 255)
      const cornerIdx = 0;
      assert.strictEqual(imgData.data[cornerIdx], 0);
      assert.strictEqual(imgData.data[cornerIdx + 1], 0);
      assert.strictEqual(imgData.data[cornerIdx + 2], 0);

      // Center pixel (32, 32) must be white: RGBA(255, 255, 255, 255)
      const centerIdx = (32 * 64 + 32) * 4;
      assert.strictEqual(imgData.data[centerIdx], 255);
      assert.strictEqual(imgData.data[centerIdx + 1], 255);
      assert.strictEqual(imgData.data[centerIdx + 2], 255);
    });

    it('HTMLImageElement produces authentic pixel buffers for analyzers', () => {
      const img = new Image();
      img.width = 320;
      img.height = 180;
      assert.ok(img._pixelData instanceof Uint8ClampedArray);
      assert.strictEqual(img._pixelData.length, 320 * 180 * 4);

      // Draw onto canvas
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 320, 180);

      const sampled = ctx.getImageData(0, 0, 320, 180);
      assert.strictEqual(sampled.data.length, 320 * 180 * 4);
    });
  });

  describe('2. Web Audio API Shim Verification', () => {
    it('initializes in suspended state and transitions to running via resume', async () => {
      const ctx = new AudioContext();
      assert.strictEqual(ctx.state, 'suspended', 'AudioContext must begin in suspended state (autoplay rule)');

      await ctx.resume();
      assert.strictEqual(ctx.state, 'running', 'AudioContext must transition to running after resume');

      await ctx.suspend();
      assert.strictEqual(ctx.state, 'suspended', 'AudioContext can return to suspended');
    });

    it('verifies master limiter routing to AudioContext.destination', () => {
      const ctx = new AudioContext();

      // Case A: Sound routed directly to destination (limiter bypassed)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      assert.strictEqual(ctx.isMasterLimiterConnected(), false, 'Direct routing without limiter must be detected as invalid');

      // Case B: Route through DynamicsCompressor limiter
      gain.disconnect();
      const limiter = ctx.createDynamicsCompressor();
      gain.connect(limiter);
      limiter.connect(ctx.destination);
      assert.strictEqual(ctx.isMasterLimiterConnected(), true, 'Routing through DynamicsCompressor must pass limiter check');
      assertMasterLimiterConnected(ctx);
    });

    it('enforces 24-voice allocation ceiling and oldest-voice stealing', () => {
      const ctx = new AudioContext();
      assert.strictEqual(ctx.getActiveVoiceCount(), 0);

      const oscillators = [];
      // Allocate 24 voices
      for (let i = 0; i < 24; i++) {
        const osc = ctx.createOscillator();
        osc.frequency.value = 220 + i * 10;
        osc.start(0);
        oscillators.push(osc);
      }

      assert.strictEqual(ctx.getActiveVoiceCount(), 24);
      assertVoiceCountLeq(ctx, 24);

      // Allocate 25th voice -> voice ceiling triggers oldest-voice stealing
      const osc25 = ctx.createOscillator();
      osc25.frequency.value = 880;
      osc25.start(0);

      assert.strictEqual(ctx.getActiveVoiceCount(), 24, 'Active voice count must not exceed 24');
      assert.strictEqual(ctx.hasOldestVoiceBeenStolen(), true, 'Oldest voice should be marked as stolen');
      assert.strictEqual(oscillators[0]._stopped, true, 'First allocated oscillator must be stopped');
    });

    it('OfflineAudioContext renders authentic 16-bit PCM AudioBuffer data', async () => {
      const offlineCtx = new OfflineAudioContext(2, 4410, 44100); // 0.1s duration
      const osc = offlineCtx.createOscillator();
      osc.frequency.value = 440;
      const gain = offlineCtx.createGain();
      gain.gain.value = 0.5;
      osc.connect(gain);
      gain.connect(offlineCtx.destination);
      osc.start(0);
      osc.stop(0.1);

      const renderedBuffer = await offlineCtx.startRendering();
      assert.strictEqual(renderedBuffer.numberOfChannels, 2);
      assert.strictEqual(renderedBuffer.length, 4410);

      const left = renderedBuffer.getChannelData(0);
      let nonZeroCount = 0;
      for (let i = 0; i < left.length; i++) {
        if (Math.abs(left[i]) > 0.0001) nonZeroCount++;
        assert.ok(left[i] >= -1.0 && left[i] <= 1.0, 'Audio samples must stay in [-1, 1]');
      }
      assert.ok(nonZeroCount > 1000, 'Rendered buffer must contain non-zero synthesized audio');
    });
  });

  describe('3. WAV Inspector Binary Parser Verification', () => {
    it('parses and validates a canonical 16-bit PCM WAV buffer', () => {
      const wavBuf = createTestWavBuffer({
        numChannels: 2,
        sampleRate: 44100,
        durationSeconds: 0.1,
        frequency: 440,
        amplitude: 0.5
      });

      const parsed = parseWav(wavBuf);
      assert.strictEqual(parsed.riff.chunkId, 'RIFF');
      assert.strictEqual(parsed.riff.format, 'WAVE');
      assert.strictEqual(parsed.fmt.audioFormat, 1);
      assert.strictEqual(parsed.fmt.numChannels, 2);
      assert.strictEqual(parsed.fmt.sampleRate, 44100);
      assert.strictEqual(parsed.fmt.bitsPerSample, 16);
      assert.ok(parsed.metrics.rms > 0.1, 'Generated test wave must have audible RMS');
      assert.strictEqual(parsed.metrics.hasClipping, false, 'No clipping should be detected');
      assert.strictEqual(parsed.metrics.isSilent, false);

      const validated = validateWavStructure(wavBuf, { expectedChannels: 2, expectedSampleRate: 44100 });
      assert.ok(validated);
    });

    it('detects invalid RIFF headers defensively', () => {
      const badBuf = Buffer.alloc(50);
      badBuf.write('FAIL', 0);
      assert.throws(() => parseWav(badBuf), /Expected ChunkID 'RIFF'/);
    });
  });

  describe('4. Domain Assertion Utilities Verification', () => {
    it('assertFrequencyInScale validates notes in musical scale and rejects out-of-scale tones', () => {
      // A minor pentatonic: A (440 Hz), C (523.25 Hz), D (587.33 Hz), E (659.25 Hz), G (783.99 Hz)
      assert.doesNotThrow(() => assertFrequencyInScale(440, 'a minor pentatonic'));
      assert.doesNotThrow(() => assertFrequencyInScale(523.25, 'a minor pentatonic'));
      assert.doesNotThrow(() => assertFrequencyInScale(220, 'night-lights'));

      // A#4 (466.16 Hz) is NOT in A minor pentatonic
      assert.throws(() => assertFrequencyInScale(466.16, 'a minor pentatonic'));

      // D Dorian: D, E, F, G, A, B, C
      assert.doesNotThrow(() => assertFrequencyInScale(293.66, 'd dorian')); // D4
      assert.doesNotThrow(() => assertFrequencyInScale(349.23, 'lightning')); // F4
    });

    it('assertVoiceCountLeq enforces voice allocation limits', () => {
      const mockCtx = { getActiveVoiceCount: () => 12 };
      assert.doesNotThrow(() => assertVoiceCountLeq(mockCtx, 24));

      const mockOverfilled = { getActiveVoiceCount: () => 30 };
      assert.throws(() => assertVoiceCountLeq(mockOverfilled, 24));
    });

    it('assertValidWavStructure accepts valid buffers and rejects malformed buffers', () => {
      const validBuf = createTestWavBuffer({ durationSeconds: 0.05 });
      assert.doesNotThrow(() => assertValidWavStructure(validBuf));

      const corruptBuf = Buffer.from('not a wav file');
      assert.throws(() => assertValidWavStructure(corruptBuf));
    });

    it('assertAriaThrottled enforces >= 400ms interval spacing', () => {
      const validTimestamps = [1000, 1450, 1900, 2350];
      assert.doesNotThrow(() => assertAriaThrottled(validTimestamps, 400));

      const rapidBurstTimestamps = [1000, 1100, 1200];
      assert.throws(() => assertAriaThrottled(rapidBurstTimestamps, 400));
    });

    it('assertAiHeaderPresent confirms line 1 header in project code files', () => {
      const runnerPath = resolve(__dirname, 'runner.js');
      const shimPath = resolve(__dirname, 'harness/dom-shim.js');
      assert.doesNotThrow(() => assertAiHeaderPresent(runnerPath));
      assert.doesNotThrow(() => assertAiHeaderPresent(shimPath));
    });
  });
});
