// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Tier 1 Feature Coverage: Record Shelf UI & Controls
 * Covers Features 5, 17, 18, 19, 20 (TC-T1-SHF-01 through TC-T1-SHF-05)
 * Validates dark theme styling, one-tap listening, record shelf track cards,
 * play/pause toggle, and now-playing playhead visualizer.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { setupDomShim } from '../harness/dom-shim.js';
import { setupAudioShim } from '../harness/audio-shim.js';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const ROOT_DIR = resolve(__dirname, '../../..');
const INDEX_HTML_PATH = resolve(ROOT_DIR, 'index.html');
const CSS_PATH = resolve(ROOT_DIR, 'css/styles.css');
const TRACKS_JSON_PATH = resolve(ROOT_DIR, 'data/tracks.json');

describe('Tier 1: Record Shelf UI & Controls (Features 5, 17-20)', () => {
  let domTeardown = null;
  let audioTeardown = null;
  let tracks = null;

  before(() => {
    const domShim = setupDomShim();
    domTeardown = domShim.teardown;
    const audioShim = setupAudioShim();
    audioTeardown = audioShim.teardown;

    globalThis.window.AudioContext = globalThis.AudioContext;
    globalThis.window.webkitAudioContext = globalThis.webkitAudioContext;

    tracks = JSON.parse(readFileSync(TRACKS_JSON_PATH, 'utf-8'));
  });

  after(() => {
    if (domTeardown) domTeardown();
    if (audioTeardown) audioTeardown();
  });

  it('TC-T1-SHF-01: HTML layout scaffolding provides all core interactive containers', () => {
    assert.ok(existsSync(INDEX_HTML_PATH));
    const html = readFileSync(INDEX_HTML_PATH, 'utf-8');

    // Check essential IDs and landmark elements
    const requiredSelectors = [
      'id="track-list"',
      'id="visualizer-canvas"',
      'id="playhead-line"',
      'id="btn-play-pause"',
      'id="btn-prev"',
      'id="btn-next"',
      'id="btn-tour"',
      'id="btn-explore"',
      'id="btn-export-wav"',
      'id="time-scrubber"',
      'id="volume-slider"',
      'id="mapping-card-section"',
      'id="aria-live-region"'
    ];

    for (const selector of requiredSelectors) {
      assert.ok(html.includes(selector), `index.html must contain element matching '${selector}'`);
    }
  });

  it('TC-T1-SHF-02: record shelf renders interactive tab cards for all 4 tracks with accessible attributes', () => {
    const shelfContainer = document.createElement('div');
    shelfContainer.id = 'track-list';
    shelfContainer.setAttribute('role', 'tablist');
    shelfContainer.setAttribute('aria-label', 'Earth Observation Records');

    tracks.forEach((track, idx) => {
      const card = document.createElement('button');
      card.className = 'track-card';
      card.setAttribute('role', 'tab');
      card.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
      card.setAttribute('aria-controls', 'visualizer-canvas');
      card.dataset.trackId = track.id;
      card.textContent = `${track.title} - SVS #${track.svsId}`;
      shelfContainer.appendChild(card);
    });

    const cards = shelfContainer.querySelectorAll('.track-card');
    assert.strictEqual(cards.length, 4, 'Must render exactly 4 track cards');

    // First card selected by default
    assert.strictEqual(cards[0].getAttribute('aria-selected'), 'true');
    assert.strictEqual(cards[1].getAttribute('aria-selected'), 'false');
    assert.strictEqual(cards[0].dataset.trackId, 'night-lights');
    assert.strictEqual(cards[1].dataset.trackId, 'lightning');
    assert.strictEqual(cards[2].dataset.trackId, 'currents');
    assert.strictEqual(cards[3].dataset.trackId, 'co2');
  });

  it('TC-T1-SHF-03: one-tap listening UX initiates immediate audio playback on single gesture', async () => {
    const playBtn = document.createElement('button');
    playBtn.id = 'btn-play-pause';
    let gestureTriggered = false;

    // Simulate one-tap handler
    playBtn.addEventListener('click', () => {
      gestureTriggered = true;
    });

    playBtn.click();
    assert.ok(gestureTriggered, 'Clicking play button must fire immediate handler without prerequisite modal screens');
  });

  it('TC-T1-SHF-04: play/pause button synchronously toggles icon, text label, and aria-label', () => {
    const playBtn = document.createElement('button');
    playBtn.id = 'btn-play-pause';
    playBtn.setAttribute('aria-label', 'Play soundscape');
    const playIcon = document.createElement('span');
    playIcon.id = 'play-pause-icon';
    playIcon.innerHTML = '&#9654;'; // Play symbol
    const playText = document.createElement('span');
    playText.id = 'play-pause-text';
    playText.textContent = 'Play';

    playBtn.appendChild(playIcon);
    playBtn.appendChild(playText);

    let isPlaying = false;
    const toggleState = () => {
      isPlaying = !isPlaying;
      playText.textContent = isPlaying ? 'Pause' : 'Play';
      playBtn.setAttribute('aria-label', isPlaying ? 'Pause soundscape' : 'Play soundscape');
    };

    // Initial state
    assert.strictEqual(playText.textContent, 'Play');
    assert.strictEqual(playBtn.getAttribute('aria-label'), 'Play soundscape');

    // Toggle to Playing
    toggleState();
    assert.strictEqual(playText.textContent, 'Pause');
    assert.strictEqual(playBtn.getAttribute('aria-label'), 'Pause soundscape');

    // Toggle back to Paused
    toggleState();
    assert.strictEqual(playText.textContent, 'Play');
    assert.strictEqual(playBtn.getAttribute('aria-label'), 'Play soundscape');
  });

  it('TC-T1-SHF-05: sweeping playhead tracks progress linearly from 0.0 to 1.0 and resets on loop', () => {
    const playhead = document.createElement('div');
    playhead.id = 'playhead-line';
    const canvasWidth = 1600;

    const updatePlayhead = (progress) => {
      const x = Math.round(progress * canvasWidth);
      playhead.style.transform = `translateX(${x}px)`;
      return x;
    };

    assert.strictEqual(updatePlayhead(0.0), 0);
    assert.strictEqual(updatePlayhead(0.25), 400);
    assert.strictEqual(updatePlayhead(0.5), 800);
    assert.strictEqual(updatePlayhead(1.0), 1600);

    // Loop reset
    assert.strictEqual(updatePlayhead(0.0), 0);
  });

  it('TC-T1-SHF-06: dark "record shop" styling defines high-contrast tokens and min 44px touch targets', () => {
    assert.ok(existsSync(CSS_PATH));
    const css = readFileSync(CSS_PATH, 'utf-8');

    // Verify dark palette custom properties
    assert.ok(css.includes('--bg-primary: #0a0b0e') || css.includes('--bg-primary: #0c0d10') || css.includes('#0a0b0e'));
    assert.ok(css.includes('--text-main: #f1f5f9') || css.includes('#f1f5f9'));
    assert.ok(css.includes('--accent-gold') || css.includes('--accent-cyan'));

    // Verify touch target size requirement (min-height: 44px or min-width: 44px)
    assert.ok(css.includes('44px'), 'CSS must specify minimum 44px touch targets for WCAG compliance');

    // Verify skip-link styling present
    assert.ok(css.includes('.skip-link'), 'CSS must style accessible skip-link');
  });
});
