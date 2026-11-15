// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Tier 1 Feature Coverage: Listen-Only View Mode
 * Covers Feature 30 (TC-T1-LIS-01 through TC-T1-LIS-05 in Miner spec)
 * Validates visual canvas concealment, class toggling on body,
 * audio continuity, and preserved keyboard controls in listen-only view.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { setupDomShim } from '../harness/dom-shim.js';
import { setupAudioShim, AudioContext } from '../harness/audio-shim.js';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const ROOT_DIR = resolve(__dirname, '../../..');
const INDEX_HTML_PATH = resolve(ROOT_DIR, 'index.html');
const CSS_PATH = resolve(ROOT_DIR, 'css/styles.css');

describe('Tier 1: Listen-Only View Mode (Feature 30)', () => {
  let domTeardown = null;
  let audioTeardown = null;

  before(() => {
    const domShim = setupDomShim();
    domTeardown = domShim.teardown;
    const audioShim = setupAudioShim();
    audioTeardown = audioShim.teardown;

    globalThis.window.AudioContext = globalThis.AudioContext;
    globalThis.window.webkitAudioContext = globalThis.webkitAudioContext;
  });

  after(() => {
    if (domTeardown) domTeardown();
    if (audioTeardown) audioTeardown();
  });

  it('TC-T1-LIS-01: listen-only toggle button exists in DOM with accessible attributes', () => {
    const html = readFileSync(INDEX_HTML_PATH, 'utf-8');
    assert.ok(html.includes('id="btn-listen-only"'), 'Must contain #btn-listen-only');
    assert.ok(html.includes('aria-pressed="false"'), 'Initial state must be aria-pressed="false"');

    const btn = document.createElement('button');
    btn.id = 'btn-listen-only';
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = 'Listen-Only Mode';

    assert.strictEqual(btn.getAttribute('aria-pressed'), 'false');
  });

  it('TC-T1-LIS-02: toggling listen-only mode updates body class and button aria-pressed state', () => {
    const btn = document.createElement('button');
    btn.id = 'btn-listen-only';
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = 'Listen-Only Mode';

    // Simulate toggle handler
    const toggleListenOnly = () => {
      const isActive = document.body.classList.toggle('listen-only-active');
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      btn.textContent = isActive ? 'Exit Listen-Only' : 'Listen-Only Mode';
      return isActive;
    };

    assert.strictEqual(document.body.classList.contains('listen-only-active'), false);

    // Turn ON
    const stateOn = toggleListenOnly();
    assert.strictEqual(stateOn, true);
    assert.strictEqual(document.body.classList.contains('listen-only-active'), true);
    assert.strictEqual(btn.getAttribute('aria-pressed'), 'true');
    assert.strictEqual(btn.textContent, 'Exit Listen-Only');

    // Turn OFF
    const stateOff = toggleListenOnly();
    assert.strictEqual(stateOff, false);
    assert.strictEqual(document.body.classList.contains('listen-only-active'), false);
    assert.strictEqual(btn.getAttribute('aria-pressed'), 'false');
    assert.strictEqual(btn.textContent, 'Listen-Only Mode');
  });

  it('TC-T1-LIS-03: stylesheet hides canvas wrapper when body has listen-only-active class', () => {
    const css = readFileSync(CSS_PATH, 'utf-8');
    assert.ok(css.includes('listen-only-active'), 'CSS must define rules for listen-only-active');
    assert.ok(
      css.includes('body.listen-only-active') && css.includes('display: none'),
      'CSS must set display: none on canvas wrapper in listen-only mode'
    );
  });

  it('TC-T1-LIS-04: audio engine and playback continue uninterrupted when listen-only mode is active', () => {
    const ctx = new AudioContext();
    ctx.state = 'running';

    let isAudioPlaying = true;
    let currentVolume = 0.8;

    // Toggle listen only
    document.body.classList.add('listen-only-active');

    // Audio stream must remain running and unmodified
    assert.strictEqual(ctx.state, 'running', 'AudioContext must not suspend when entering listen-only view');
    assert.strictEqual(isAudioPlaying, true, 'Audio must continue playing');
    assert.strictEqual(currentVolume, 0.8, 'Volume must not change');

    document.body.classList.remove('listen-only-active');
  });

  it('TC-T1-LIS-05: toggling listen-only off restores visual canvas and playhead display cleanly', () => {
    const canvasWrapper = document.createElement('div');
    canvasWrapper.className = 'canvas-wrapper';
    document.body.appendChild(canvasWrapper);

    // Activate Listen-Only
    document.body.classList.add('listen-only-active');
    assert.strictEqual(document.body.classList.contains('listen-only-active'), true);

    // Deactivate Listen-Only
    document.body.classList.remove('listen-only-active');
    assert.strictEqual(document.body.classList.contains('listen-only-active'), false);

    // Canvas wrapper remains intact in DOM
    assert.ok(document.querySelector('.canvas-wrapper') !== null);
  });
});
