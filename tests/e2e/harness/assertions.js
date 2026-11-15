// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Domain-specific assertions for ORBIS VOX E2E test suite.
 * Enforces musical pitch quantization, limiter routing, voice ceilings,
 * WAV binary validity, ARIA live throttling, and AI header compliance.
 */

import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { validateWavStructure } from './wav-inspector.js';

// Pitch class map: C=0, C#=1, D=2, D#=3, E=4, F=5, F#=6, G=7, G#=8, A=9, A#=10, B=11
const SCALE_PITCH_CLASSES = {
  'a minor pentatonic': [9, 0, 2, 4, 7], // A, C, D, E, G
  'a-minor-pentatonic': [9, 0, 2, 4, 7],
  'night-lights': [9, 0, 2, 4, 7],

  'd dorian': [2, 4, 5, 7, 9, 11, 0], // D, E, F, G, A, B, C
  'd-dorian': [2, 4, 5, 7, 9, 11, 0],
  'lightning': [2, 4, 5, 7, 9, 11, 0],
  'currents': [2, 4, 5, 7, 9, 11, 0],

  'c major': [0, 2, 4, 5, 7, 9, 11],
  'c-major': [0, 2, 4, 5, 7, 9, 11],

  // CO2 uses dynamic chords: Maj7/Maj9 + dissonant tension tones (minor 2nd / tritone)
  'co2': [0, 1, 2, 4, 6, 7, 11],
  'global-co2': [0, 1, 2, 4, 6, 7, 11],
  'harmonic tension': [0, 1, 2, 4, 6, 7, 11],
  'dynamic tension chord': [0, 1, 2, 4, 6, 7, 11]
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Asserts that a frequency (in Hz) quantizes to a note within the specified scale.
 */
export function assertFrequencyInScale(freq, scaleName) {
  const normScale = String(scaleName).toLowerCase().trim();
  const allowedClasses = SCALE_PITCH_CLASSES[normScale];

  if (!allowedClasses) {
    throw new Error(`Unknown scale '${scaleName}'. Supported: ${Object.keys(SCALE_PITCH_CLASSES).join(', ')}`);
  }

  if (typeof freq !== 'number' || freq <= 0 || !Number.isFinite(freq)) {
    assert.fail(`Invalid frequency value: ${freq}`);
  }

  // Calculate nearest MIDI note: A4 (440 Hz) = MIDI 69
  const midiExact = 12 * Math.log2(freq / 440) + 69;
  const midiNearest = Math.round(midiExact);
  const pitchClass = ((midiNearest % 12) + 12) % 12;

  // Expected frequency of the nearest note
  const expectedFreq = 440 * Math.pow(2, (midiNearest - 69) / 12);
  const freqDeviation = Math.abs(freq - expectedFreq);

  // Check pitch class membership
  const inScale = allowedClasses.includes(pitchClass);
  const noteName = NOTE_NAMES[pitchClass];

  assert.ok(
    inScale,
    `Frequency ${freq.toFixed(2)} Hz resolves to note ${noteName} (pitch class ${pitchClass}), which is not in scale '${scaleName}'`
  );

  // Frequency must be well-tuned (within 2 Hz or 5% of ideal note pitch)
  const tolerance = Math.max(2.0, expectedFreq * 0.05);
  assert.ok(
    freqDeviation <= tolerance,
    `Frequency ${freq.toFixed(2)} Hz deviates too far from tuned note ${noteName} (${expectedFreq.toFixed(2)} Hz)`
  );
}

/**
 * Asserts that an AudioContext has no more than maxVoices active voices allocated.
 */
export function assertVoiceCountLeq(context, maxVoices = 24) {
  assert.ok(context, 'context must be provided');
  const count = typeof context.getActiveVoiceCount === 'function'
    ? context.getActiveVoiceCount()
    : (context._activeVoices ? context._activeVoices.length : 0);

  assert.ok(
    count <= maxVoices,
    `Voice count ceiling exceeded: active voices = ${count}, maximum allowed = ${maxVoices}`
  );
}

/**
 * Asserts that the audio context has a DynamicsCompressorNode limiter connected upstream of destination.
 */
export function assertMasterLimiterConnected(context) {
  assert.ok(context, 'context must be provided');
  const isConnected = typeof context.isMasterLimiterConnected === 'function'
    ? context.isMasterLimiterConnected()
    : false;

  assert.ok(
    isConnected,
    'Master limiter assertion failed: signal path to AudioContext.destination must pass through a DynamicsCompressorNode'
  );
}

/**
 * Asserts that a buffer represents a structurally valid 16-bit PCM WAV.
 */
export function assertValidWavStructure(buffer, options = {}) {
  try {
    const parsed = validateWavStructure(buffer, options);
    assert.strictEqual(parsed.riff.chunkId, 'RIFF');
    assert.strictEqual(parsed.riff.format, 'WAVE');
    assert.strictEqual(parsed.fmt.audioFormat, 1, 'Audio format must be 1 (PCM)');
    assert.strictEqual(parsed.fmt.bitsPerSample, 16, 'Bits per sample must be 16');
    assert.ok(parsed.data.samples.length > 0, 'WAV must contain audio samples');
    return parsed;
  } catch (err) {
    assert.fail(`Invalid WAV structure: ${err.message}`);
  }
}

/**
 * Asserts that ARIA live announcements are throttled to >= minIntervalMs.
 */
export function assertAriaThrottled(eventTimestamps, minIntervalMs = 400) {
  assert.ok(Array.isArray(eventTimestamps), 'eventTimestamps must be an array');
  if (eventTimestamps.length <= 1) return;

  const jitterTolerance = 5; // Allow 5ms timer jitter
  for (let i = 0; i < eventTimestamps.length - 1; i++) {
    const delta = eventTimestamps[i + 1] - eventTimestamps[i];
    assert.ok(
      delta >= minIntervalMs - jitterTolerance,
      `ARIA live announcement throttled violation: consecutive events spaced by ${delta}ms, less than required ${minIntervalMs}ms`
    );
  }
}

/**
 * Asserts that the mandatory AI assistance comment header is present on line 1.
 */
export function assertAiHeaderPresent(filePath) {
  assert.ok(existsSync(filePath), `File does not exist: ${filePath}`);
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  const line1 = (lines[0] || '').trim();

  const requiredText = 'Generated with AI assistance (Google Antigravity). Reviewed by the team.';
  assert.ok(
    line1.includes(requiredText),
    `Mandatory AI assistance header missing in ${filePath}. Line 1 was: "${line1}"`
  );
}
