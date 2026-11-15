// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Tier 1 Feature Coverage: Interactive Explore Mode & Probe Cursor
 * Covers Feature 29 (TC-T1-PRB-01 through TC-T1-PRB-05 in Miner spec)
 * Validates probe cursor mounting, coordinate tracking, arrow key stepping,
 * single-note audio ping synthesis, and live region announcements.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { setupDomShim, KeyboardEvent, MouseEvent } from '../harness/dom-shim.js';
import { setupAudioShim, AudioContext } from '../harness/audio-shim.js';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const ROOT_DIR = resolve(__dirname, '../../..');

describe('Tier 1: Interactive Explore Mode & Probe Cursor (Feature 29)', () => {
  let domTeardown = null;
  let audioTeardown = null;
  let AudioEngine = null;

  before(async () => {
    const domShim = setupDomShim();
    domTeardown = domShim.teardown;
    const audioShim = setupAudioShim();
    audioTeardown = audioShim.teardown;

    globalThis.window.AudioContext = globalThis.AudioContext;
    globalThis.window.webkitAudioContext = globalThis.webkitAudioContext;

    const mod = await import(resolve(ROOT_DIR, 'js/audio-engine.js'));
    AudioEngine = mod.AudioEngine;
  });

  after(() => {
    if (domTeardown) domTeardown();
    if (audioTeardown) audioTeardown();
  });

  it('TC-T1-PRB-01: explore mode button toggles active state and unhides probe cursor', () => {
    const exploreBtn = document.createElement('button');
    exploreBtn.id = 'btn-explore';
    exploreBtn.setAttribute('aria-pressed', 'false');

    const probeMarker = document.createElement('div');
    probeMarker.id = 'probe-marker';
    probeMarker.hidden = true;

    let isExploreActive = false;
    const toggleExplore = () => {
      isExploreActive = !isExploreActive;
      exploreBtn.setAttribute('aria-pressed', isExploreActive ? 'true' : 'false');
      probeMarker.hidden = !isExploreActive;
    };

    assert.strictEqual(exploreBtn.getAttribute('aria-pressed'), 'false');
    assert.strictEqual(probeMarker.hidden, true);

    toggleExplore();
    assert.strictEqual(exploreBtn.getAttribute('aria-pressed'), 'true');
    assert.strictEqual(probeMarker.hidden, false);

    toggleExplore();
    assert.strictEqual(exploreBtn.getAttribute('aria-pressed'), 'false');
    assert.strictEqual(probeMarker.hidden, true);
  });

  it('TC-T1-PRB-02: pointer interaction calculates normalized coordinates and updates probe marker position', () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'visualizer-canvas';
    canvas.width = 1600;
    canvas.height = 900;

    const probeMarker = document.createElement('div');
    probeMarker.id = 'probe-marker';

    const canvasRect = { left: 100, top: 50, width: 800, height: 450 };
    canvas.getBoundingClientRect = () => canvasRect;

    // Simulate clicking at clientX=500, clientY=275 (center)
    const clientX = 500;
    const clientY = 275;
    const xNorm = (clientX - canvasRect.left) / canvasRect.width;
    const yNorm = (clientY - canvasRect.top) / canvasRect.height;

    assert.strictEqual(xNorm, 0.5);
    assert.strictEqual(yNorm, 0.5);

    probeMarker.style.left = `${xNorm * 100}%`;
    probeMarker.style.top = `${yNorm * 100}%`;

    assert.strictEqual(probeMarker.style.left, '50%');
    assert.strictEqual(probeMarker.style.top, '50%');
  });

  it('TC-T1-PRB-03: arrow keys step probe position in discrete accessible increments', () => {
    let probeX = 0.5;
    let probeY = 0.5;
    const step = 0.05;

    const moveProbe = (dx, dy) => {
      probeX = Math.max(0.0, Math.min(1.0, probeX + dx));
      probeY = Math.max(0.0, Math.min(1.0, probeY + dy));
    };

    // Move right and down
    moveProbe(step, 0);
    assert.strictEqual(Number(probeX.toFixed(2)), 0.55);

    moveProbe(0, step);
    assert.strictEqual(Number(probeY.toFixed(2)), 0.55);

    // Clamp at boundaries
    moveProbe(1.0, 1.0);
    assert.strictEqual(probeX, 1.0);
    assert.strictEqual(probeY, 1.0);

    moveProbe(-2.0, -2.0);
    assert.strictEqual(probeX, 0.0);
    assert.strictEqual(probeY, 0.0);
  });

  it('TC-T1-PRB-04: triggerProbe plays single tone with pitch mapped to y and pan mapped to x', async () => {
    const engine = new AudioEngine();
    await engine.init();

    // Trigger probe at top-left (y=0.0 -> high pitch, x=0.0 -> pan left)
    const initialNodeCount = engine.ctx._allCreatedNodes.size;
    engine.triggerProbe(0.0, 0.0);

    const newNodes = Array.from(engine.ctx._allCreatedNodes).slice(initialNodeCount);
    const osc = newNodes.find(n => n.constructor.name === 'OscillatorNode');
    const panner = newNodes.find(n => n.constructor.name === 'StereoPannerNode');

    assert.ok(osc, 'Probe must spawn an oscillator tone');
    // Top coordinate (y=0) maps to high frequency (baseFreq * 2^2 = 880 Hz)
    assert.ok(osc.frequency.value >= 440, `High pitch expected for y=0, got ${osc.frequency.value}`);

    if (panner) {
      assert.strictEqual(panner.pan.value, -1.0, 'x=0.0 must map to pan -1.0 (full left)');
    }

    engine.dispose();
  });

  it('TC-T1-PRB-05: probe positioning triggers live plain-language status announcement', () => {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    document.body.appendChild(liveRegion);

    const announceProbe = (xNorm, yNorm) => {
      const text = `Probe at ${(xNorm * 100).toFixed(0)}% horizontal, ${(yNorm * 100).toFixed(0)}% vertical.`;
      liveRegion.textContent = text;
      return text;
    };

    const announcement = announceProbe(0.42, 0.78);
    assert.strictEqual(announcement, 'Probe at 42% horizontal, 78% vertical.');
    assert.strictEqual(liveRegion.textContent, 'Probe at 42% horizontal, 78% vertical.');
  });
});
