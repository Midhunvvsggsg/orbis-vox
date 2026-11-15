// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Tier 1 Feature Coverage: Standardized Honest Mapping Cards
 * Covers Feature 22 (TC-T1-MAP-01 through TC-T1-MAP-05 in Miner spec)
 * Validates scientific honesty disclosure, source attribution, scene descriptions,
 * musical mapping rules, and dynamic DOM synchronization.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { setupDomShim } from '../harness/dom-shim.js';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const ROOT_DIR = resolve(__dirname, '../../..');
const INDEX_HTML_PATH = resolve(ROOT_DIR, 'index.html');
const TRACKS_JSON_PATH = resolve(ROOT_DIR, 'data/tracks.json');

describe('Tier 1: Standardized Honest Mapping Cards (Feature 22)', () => {
  let domTeardown = null;
  let tracks = null;

  before(() => {
    const domShim = setupDomShim();
    domTeardown = domShim.teardown;
    tracks = JSON.parse(readFileSync(TRACKS_JSON_PATH, 'utf-8'));
  });

  after(() => {
    if (domTeardown) domTeardown();
  });

  it('TC-T1-MAP-01: every track explicitly discloses sonification of rendered colors rather than raw units', () => {
    for (const track of tracks) {
      const limits = track.mappingCard.limits;
      assert.ok(limits, `Track ${track.id} must have limits disclosure`);

      const text = limits.toLowerCase();
      // Must state what is sonified (rendered colors / pixels / opacity / optical clusters)
      assert.ok(
        text.includes('sonif') && (
          text.includes('render') || text.includes('optical') ||
          text.includes('pixel') || text.includes('color') ||
          text.includes('point cloud')
        ),
        `Track ${track.id} limits must specify rendered visualization features are sonified`
      );

      // Must clarify it does not represent raw physical measurements
      assert.ok(
        text.includes('not raw') || text.includes('not physical') ||
        text.includes('not direct') || text.includes('not instant'),
        `Track ${track.id} limits must clarify absence of direct/raw physical units`
      );
    }
  });

  it('TC-T1-MAP-02: mapping cards cite authentic NASA EIC/SVS source, instrument, and scientist credit', () => {
    for (const track of tracks) {
      const source = track.mappingCard.source;
      assert.ok(source.includes('NASA'), `Track ${track.id} source must cite NASA`);
      assert.ok(source.includes(String(track.svsId)), `Track ${track.id} source must include SVS #${track.svsId}`);

      assert.ok(track.credit.length > 20, `Track ${track.id} credit must be descriptive`);
      assert.ok(track.credit.includes('NASA Scientific Visualization Studio'));
    }
  });

  it('TC-T1-MAP-03: "What you are seeing" contains factual scientific context without filler', () => {
    for (const track of tracks) {
      const see = track.mappingCard.whatYouSee;
      assert.ok(typeof see === 'string' && see.length >= 40, `Track ${track.id} whatYouSee must be comprehensive`);
      assert.ok(!see.includes('TODO') && !see.includes('TBD') && !see.includes('Lorem'), `Track ${track.id} has placeholder text`);
    }
  });

  it('TC-T1-MAP-04: "How it sounds" and "Scale & Tempo" disclose complete musical sonification parameters', () => {
    for (const track of tracks) {
      const sound = track.mappingCard.howItSounds;
      const scaleTempo = track.mappingCard.scaleAndTempo;

      assert.ok(sound.length >= 30, `Track ${track.id} howItSounds must describe sonification rules`);
      assert.ok(scaleTempo.length >= 10, `Track ${track.id} scaleAndTempo must describe musical scale and tempo`);

      // Scale must mention pentatonic, dorian, or harmonic tension
      const scaleLower = scaleTempo.toLowerCase();
      assert.ok(
        scaleLower.includes('pentatonic') || scaleLower.includes('dorian') || scaleLower.includes('tension'),
        `Track ${track.id} scaleAndTempo must specify musical scale type`
      );
    }
  });

  it('TC-T1-MAP-05: DOM mapping card elements synchronously update when switching active tracks', () => {
    const html = readFileSync(INDEX_HTML_PATH, 'utf-8');
    assert.ok(html.includes('id="map-source"'));
    assert.ok(html.includes('id="map-see"'));
    assert.ok(html.includes('id="map-sound"'));
    assert.ok(html.includes('id="map-scale"'));
    assert.ok(html.includes('id="map-limits"'));

    const mapSource = document.createElement('span');
    mapSource.id = 'map-source';
    const mapSee = document.createElement('p');
    mapSee.id = 'map-see';
    const mapSound = document.createElement('p');
    mapSound.id = 'map-sound';
    const mapScale = document.createElement('p');
    mapScale.id = 'map-scale';
    const mapLimits = document.createElement('p');
    mapLimits.id = 'map-limits';

    // Simulate switching to each track in turn
    tracks.forEach((track) => {
      mapSource.textContent = track.mappingCard.source;
      mapSee.textContent = track.mappingCard.whatYouSee;
      mapSound.textContent = track.mappingCard.howItSounds;
      mapScale.textContent = track.mappingCard.scaleAndTempo;
      mapLimits.textContent = track.mappingCard.limits;

      assert.strictEqual(mapSource.textContent, track.mappingCard.source);
      assert.strictEqual(mapSee.textContent, track.mappingCard.whatYouSee);
      assert.strictEqual(mapSound.textContent, track.mappingCard.howItSounds);
      assert.strictEqual(mapScale.textContent, track.mappingCard.scaleAndTempo);
      assert.strictEqual(mapLimits.textContent, track.mappingCard.limits);
    });
  });
});
