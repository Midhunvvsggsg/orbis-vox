// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Tier 1 Feature Coverage: Client-Side WAV Audio Export
 * Covers Feature 31 (TC-T1-WAV-01 through TC-T1-WAV-05 in Miner spec)
 * Validates OfflineAudioContext rendering, 16-bit PCM WAV RIFF header,
 * format subchunk (fmt ), audio payload duration, and filename conventions.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { setupDomShim, HTMLCanvasElement } from '../harness/dom-shim.js';
import { setupAudioShim, OfflineAudioContext } from '../harness/audio-shim.js';
import { parseWav, validateWavStructure } from '../harness/wav-inspector.js';
import { assertValidWavStructure } from '../harness/assertions.js';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const ROOT_DIR = resolve(__dirname, '../../..');
const TRACKS_JSON_PATH = resolve(ROOT_DIR, 'data/tracks.json');

describe('Tier 1: Client-Side WAV Audio Export (Feature 31)', () => {
  let domTeardown = null;
  let audioTeardown = null;
  let exportTrackToWav = null;
  let tracks = null;

  before(async () => {
    const domShim = setupDomShim();
    domTeardown = domShim.teardown;
    const audioShim = setupAudioShim();
    audioTeardown = audioShim.teardown;

    globalThis.window.AudioContext = globalThis.AudioContext;
    globalThis.window.webkitAudioContext = globalThis.webkitAudioContext;
    globalThis.window.OfflineAudioContext = globalThis.OfflineAudioContext;
    globalThis.window.webkitOfflineAudioContext = globalThis.OfflineAudioContext;

    tracks = JSON.parse(readFileSync(TRACKS_JSON_PATH, 'utf-8'));

    const mod = await import(resolve(ROOT_DIR, 'js/export-wav.js'));
    exportTrackToWav = mod.exportTrackToWav;
  });

  after(() => {
    if (domTeardown) domTeardown();
    if (audioTeardown) audioTeardown();
  });

  it('TC-T1-WAV-01: exportTrackToWav invokes OfflineAudioContext client-side with zero external requests', async () => {
    const track = tracks[0];
    const canvas = new HTMLCanvasElement(1600, 900);

    const blob = await exportTrackToWav(track, canvas, 14);
    assert.ok(blob instanceof Blob, 'Export must return a Blob instance');
    assert.strictEqual(blob.type, 'audio/wav', 'Blob type must be audio/wav');
  });

  it('TC-T1-WAV-02: exported audio Blob begins with valid 12-byte RIFF/WAVE header', async () => {
    const track = tracks[0];
    const canvas = new HTMLCanvasElement(1600, 900);

    const blob = await exportTrackToWav(track, canvas, 14);
    const arrayBuffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Bytes 0-3: "RIFF"
    const riffMarker = String.fromCharCode(...bytes.slice(0, 4));
    assert.strictEqual(riffMarker, 'RIFF');

    // Bytes 8-11: "WAVE"
    const waveMarker = String.fromCharCode(...bytes.slice(8, 12));
    assert.strictEqual(waveMarker, 'WAVE');

    // Total file size in bytes 4-7 must match arrayBuffer length - 8
    const view = new DataView(arrayBuffer);
    const declaredSize = view.getUint32(4, true);
    assert.strictEqual(declaredSize, arrayBuffer.byteLength - 8);
  });

  it('TC-T1-WAV-03: fmt subchunk enforces uncompressed 16-bit PCM stereo format at 44.1kHz', async () => {
    const track = tracks[0];
    const canvas = new HTMLCanvasElement(1600, 900);

    const blob = await exportTrackToWav(track, canvas, 14);
    const arrayBuffer = await blob.arrayBuffer();
    const parsed = parseWav(arrayBuffer);

    assert.strictEqual(parsed.fmt.subchunkId, 'fmt ');
    assert.strictEqual(parsed.fmt.subchunkSize, 16);
    assert.strictEqual(parsed.fmt.audioFormat, 1, '1 indicates uncompressed PCM');
    assert.strictEqual(parsed.fmt.numChannels, 2, 'Must be stereo (2 channels)');
    assert.strictEqual(parsed.fmt.sampleRate, 44100, 'Sample rate must be 44100 Hz');
    assert.strictEqual(parsed.fmt.bitsPerSample, 16, 'Bit depth must be 16-bit');
    assert.strictEqual(parsed.fmt.blockAlign, 4, 'Block align = 2 channels * 2 bytes = 4');
  });

  it('TC-T1-WAV-04: data subchunk contains non-empty audio payload matching 14s duration', async () => {
    const track = tracks[0];
    const canvas = new HTMLCanvasElement(1600, 900);

    const blob = await exportTrackToWav(track, canvas, 14);
    const arrayBuffer = await blob.arrayBuffer();
    const parsed = parseWav(arrayBuffer);

    assert.strictEqual(parsed.data.subchunkId, 'data');
    // Expected size = 14s * 44100 * 2 channels * 2 bytes = 2,469,600 bytes
    const expectedDataBytes = 14 * 44100 * 2 * 2;
    assert.strictEqual(parsed.data.subchunkSize, expectedDataBytes);
    assert.ok(parsed.data.durationSeconds >= 13.9 && parsed.data.durationSeconds <= 14.1);

    // Audio payload must contain non-zero samples
    const samples = parsed.data.samples;
    assert.ok(samples.length > 0);
    const hasNonZero = samples.some(s => s !== 0);
    assert.ok(hasNonZero, 'Audio payload must not be completely silent');
  });

  it('TC-T1-WAV-05: downloaded file is named according to pattern orbis-vox-<track-id>.wav', () => {
    for (const track of tracks) {
      const filename = `orbis-vox-${track.id}.wav`;
      assert.ok(filename.startsWith('orbis-vox-'));
      assert.ok(filename.endsWith('.wav'));
      assert.ok(!filename.includes(' '));
    }
  });

  it('TC-T1-WAV-06: export succeeds across all 4 core tracks generating valid WAV structures', async () => {
    const canvas = new HTMLCanvasElement(1600, 900);

    for (const track of tracks) {
      // Use short 2s sweep for rapid multi-track verification
      const blob = await exportTrackToWav(track, canvas, 2);
      const arrayBuffer = await blob.arrayBuffer();
      const parsed = assertValidWavStructure(arrayBuffer);

      assert.strictEqual(parsed.riff.chunkId, 'RIFF');
      assert.strictEqual(parsed.fmt.audioFormat, 1);
      assert.ok(parsed.data.durationSeconds >= 1.9 && parsed.data.durationSeconds <= 2.1);
    }
  });
});
