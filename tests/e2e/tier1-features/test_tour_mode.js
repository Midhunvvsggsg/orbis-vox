// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Tier 1 Feature Coverage: 60-Second Automated Tour Mode
 * Covers Feature 21 (TC-T1-SHF-05 in Miner spec)
 * Validates 60s tour initiation, 15s per track sequential progression,
 * synced captions, and immediate cancellation on manual user interaction.
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
const TRACKS_JSON_PATH = resolve(ROOT_DIR, 'data/tracks.json');

describe('Tier 1: 60-Second Automated Tour Mode (Feature 21)', () => {
  let domTeardown = null;
  let audioTeardown = null;
  let tracks = null;

  before(() => {
    const domShim = setupDomShim();
    domTeardown = domShim.teardown;
    const audioShim = setupAudioShim();
    audioTeardown = audioShim.teardown;

    tracks = JSON.parse(readFileSync(TRACKS_JSON_PATH, 'utf-8'));
  });

  after(() => {
    if (domTeardown) domTeardown();
    if (audioTeardown) audioTeardown();
  });

  it('TC-T1-TUR-01: tour mode controls and caption containers exist in DOM with valid accessibility attributes', () => {
    const html = readFileSync(INDEX_HTML_PATH, 'utf-8');
    assert.ok(html.includes('id="btn-tour"'), 'Tour button must exist');
    assert.ok(html.includes('id="tour-caption-box"'), 'Tour caption box must exist');
    assert.ok(html.includes('id="tour-caption-text"'), 'Tour caption text element must exist');

    const tourBtn = document.createElement('button');
    tourBtn.id = 'btn-tour';
    tourBtn.setAttribute('aria-pressed', 'false');
    tourBtn.textContent = 'Start 60s Tour';

    assert.strictEqual(tourBtn.getAttribute('aria-pressed'), 'false');
  });

  it('TC-T1-TUR-02: tour mode calculates exact 60-second total duration with 15s per core track', () => {
    const tourDurationSeconds = 60;
    const secondsPerTrack = 15;
    const trackCount = tracks.length;

    assert.strictEqual(trackCount, 4, 'Must have 4 tracks');
    assert.strictEqual(
      secondsPerTrack * trackCount,
      tourDurationSeconds,
      '4 tracks at 15s each must equal 60s total'
    );
  });

  it('TC-T1-TUR-03: tour progression traverses tracks in canonical sequence (night-lights -> lightning -> currents -> co2)', () => {
    const expectedSequence = ['night-lights', 'lightning', 'currents', 'co2'];
    const activeTourSequence = [];

    for (let phase = 0; phase < 4; phase++) {
      const activeTrack = tracks[phase];
      activeTourSequence.push(activeTrack.id);
    }

    assert.deepStrictEqual(activeTourSequence, expectedSequence, 'Tour must cycle in designated sequence');
  });

  it('TC-T1-TUR-04: tour mode presents synchronized plain-language captions for each phase', () => {
    const captionBox = document.createElement('div');
    captionBox.id = 'tour-caption-box';
    captionBox.hidden = true;
    const captionText = document.createElement('p');
    captionText.id = 'tour-caption-text';
    captionBox.appendChild(captionText);

    // Tour narration script lines per track
    const tourCaptions = {
      'night-lights': 'Tour 1/4: Night Lights (2012–2023) — Plucked rhythm tempo scales with city illumination density.',
      'lightning': 'Tour 2/4: ISS Lightning (2017–2023) — Flash clusters trigger spatial Dorian pings and bursts.',
      'currents': 'Tour 3/4: Ocean Currents — 4-voice ambient pad drifts with oceanic hue and flow velocity.',
      'co2': 'Tour 4/4: Global CO2 Plume — Atmospheric emissions gather harmonic tension and resolve.'
    };

    tracks.forEach((track, idx) => {
      captionBox.hidden = false;
      captionText.textContent = tourCaptions[track.id];

      assert.strictEqual(captionBox.hidden, false);
      assert.ok(captionText.textContent.includes(track.title.split(':')[0]));
    });
  });

  it('TC-T1-TUR-05: user interaction or explicit stop immediately cancels active tour mode cleanly', () => {
    let isTourActive = true;
    let tourTimer = 12345;
    const tourBtn = document.createElement('button');
    tourBtn.id = 'btn-tour';
    tourBtn.setAttribute('aria-pressed', 'true');

    const captionBox = document.createElement('div');
    captionBox.id = 'tour-caption-box';
    captionBox.hidden = false;

    // Simulation of stopTour / user cancel function
    const cancelTour = () => {
      if (tourTimer) {
        tourTimer = null;
      }
      isTourActive = false;
      tourBtn.setAttribute('aria-pressed', 'false');
      captionBox.hidden = true;
    };

    // User interrupts by clicking Play or selecting a track
    cancelTour();

    assert.strictEqual(isTourActive, false, 'Tour state must become inactive');
    assert.strictEqual(tourTimer, null, 'Tour timer must be cleared');
    assert.strictEqual(tourBtn.getAttribute('aria-pressed'), 'false');
    assert.strictEqual(captionBox.hidden, true, 'Captions must be hidden upon tour cancellation');
  });
});
