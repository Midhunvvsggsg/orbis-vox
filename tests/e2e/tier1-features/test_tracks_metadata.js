// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Tier 1 Feature Coverage: NASA Core Tracks & Metadata Catalog
 * Covers Features 1, 2, 3, 4, 6 (TC-T1-TRK-01 through TC-T1-TRK-06)
 * Validates data/tracks.json authentic NASA SVS catalog, schemas, credits, and mapping specs.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const ROOT_DIR = resolve(__dirname, '../../..');
const TRACKS_JSON_PATH = resolve(ROOT_DIR, 'data/tracks.json');

describe('Tier 1: NASA Core Tracks & Metadata Catalog (Features 1-4, 6)', () => {
  it('TC-T1-TRK-01: data/tracks.json exists and parses as array of 4 core tracks', () => {
    assert.ok(existsSync(TRACKS_JSON_PATH), `Missing data/tracks.json at ${TRACKS_JSON_PATH}`);
    const raw = readFileSync(TRACKS_JSON_PATH, 'utf-8');
    const tracks = JSON.parse(raw);

    assert.ok(Array.isArray(tracks), 'tracks.json must contain a JSON array');
    assert.strictEqual(tracks.length, 4, 'Must contain exactly 4 core tracks');

    const expectedIds = ['night-lights', 'lightning', 'currents', 'co2'];
    const actualIds = tracks.map(t => t.id);
    assert.deepStrictEqual(actualIds, expectedIds, `Track IDs must match core set: ${expectedIds.join(', ')}`);
  });

  it('TC-T1-TRK-02: each track contains all required schema keys and valid frames array', () => {
    const raw = readFileSync(TRACKS_JSON_PATH, 'utf-8');
    const tracks = JSON.parse(raw);

    const requiredKeys = [
      'id', 'title', 'subtitle', 'category', 'svsId',
      'sourceUrl', 'credit', 'frames', 'soundSpec', 'mappingCard'
    ];

    for (const track of tracks) {
      for (const key of requiredKeys) {
        assert.ok(
          key in track && track[key] !== undefined && track[key] !== null,
          `Track '${track.id}' missing required key '${key}'`
        );
      }

      assert.ok(Array.isArray(track.frames), `Track '${track.id}' frames must be an array`);
      assert.ok(track.frames.length >= 8, `Track '${track.id}' must have >= 8 frames, found ${track.frames.length}`);

      for (const framePath of track.frames) {
        assert.strictEqual(typeof framePath, 'string');
        assert.ok(framePath.startsWith('assets/frames/'), `Frame path '${framePath}' must be in assets/frames/`);
        assert.ok(existsSync(resolve(ROOT_DIR, framePath)), `Frame file must exist on disk at ${framePath}`);
      }

      if (track.legend) {
        assert.strictEqual(typeof track.legend, 'string');
        assert.ok(existsSync(resolve(ROOT_DIR, track.legend)), `Legend file must exist on disk at ${track.legend}`);
      }
    }
  });

  it('TC-T1-TRK-03: SVS identifiers match official NASA Scientific Visualization Studio catalog', () => {
    const raw = readFileSync(TRACKS_JSON_PATH, 'utf-8');
    const tracks = JSON.parse(raw);

    const expectedSvsIds = {
      'night-lights': 5313,
      'lightning': 5011,
      'currents': 5425,
      'co2': 5196
    };

    for (const track of tracks) {
      const expectedId = expectedSvsIds[track.id];
      assert.strictEqual(
        track.svsId,
        expectedId,
        `Track '${track.id}' svsId must be ${expectedId}, received ${track.svsId}`
      );
    }
  });

  it('TC-T1-TRK-04: source URLs point to official NASA SVS pages and credits name NASA SVS', () => {
    const raw = readFileSync(TRACKS_JSON_PATH, 'utf-8');
    const tracks = JSON.parse(raw);

    for (const track of tracks) {
      assert.ok(
        track.sourceUrl.startsWith('https://svs.gsfc.nasa.gov/'),
        `Track '${track.id}' sourceUrl '${track.sourceUrl}' must be an official https://svs.gsfc.nasa.gov/ URL`
      );
      assert.ok(
        track.sourceUrl.includes(String(track.svsId)),
        `Track '${track.id}' sourceUrl must contain SVS ID ${track.svsId}`
      );

      assert.ok(
        track.credit.includes('NASA') && track.credit.includes('Scientific Visualization Studio'),
        `Track '${track.id}' credit must attribute NASA Scientific Visualization Studio`
      );

      // Verify credit has real personnel (visualizers or scientists)
      assert.ok(
        track.credit.includes('Visualizer') || track.credit.includes('Scientist'),
        `Track '${track.id}' credit must list visualizers or scientists`
      );
    }
  });

  it('TC-T1-TRK-05: soundSpec defines valid musical scales, tempos, and personalities', () => {
    const raw = readFileSync(TRACKS_JSON_PATH, 'utf-8');
    const tracks = JSON.parse(raw);

    const expectedSpecs = {
      'night-lights': { personality: 'night-lights', scale: 'A minor pentatonic', minTempo: 70, maxTempo: 130 },
      'lightning': { personality: 'lightning', scale: 'D Dorian', minTempo: 60, maxTempo: 120 },
      'currents': { personality: 'currents', scale: 'D Dorian', minTempo: 60, maxTempo: 100 },
      'co2': { personality: 'co2', scale: 'Dynamic Tension Chord', minTempo: 60, maxTempo: 100 }
    };

    for (const track of tracks) {
      const spec = track.soundSpec;
      const expected = expectedSpecs[track.id];
      assert.ok(spec, `Missing soundSpec for track ${track.id}`);
      assert.strictEqual(spec.personality, expected.personality);
      assert.strictEqual(spec.scale, expected.scale);
      assert.ok(
        typeof spec.baseTempo === 'number' && spec.baseTempo >= expected.minTempo && spec.baseTempo <= expected.maxTempo,
        `Base tempo for ${track.id} must be between ${expected.minTempo} and ${expected.maxTempo}`
      );
    }
  });

  it('TC-T1-TRK-06: mappingCard provides 5 mandatory fields and explicit rendered colors disclaimer', () => {
    const raw = readFileSync(TRACKS_JSON_PATH, 'utf-8');
    const tracks = JSON.parse(raw);

    const mandatoryFields = ['source', 'whatYouSee', 'howItSounds', 'scaleAndTempo', 'limits'];

    for (const track of tracks) {
      const card = track.mappingCard;
      assert.ok(card, `Track '${track.id}' missing mappingCard`);

      for (const field of mandatoryFields) {
        assert.ok(
          typeof card[field] === 'string' && card[field].trim().length > 10,
          `Track '${track.id}' mappingCard.${field} must be a non-empty descriptive string`
        );
      }

      // Honesty Principle: limits field must disclose what visualization feature is sonified vs real physical measurements
      const limitsLower = card.limits.toLowerCase();
      assert.ok(
        limitsLower.includes('sonif') && (
          limitsLower.includes('render') || limitsLower.includes('optical') ||
          limitsLower.includes('pixel') || limitsLower.includes('color') ||
          limitsLower.includes('tracer') || limitsLower.includes('opacity')
        ),
        `Track '${track.id}' limits must disclose visualization proxy/color feature being sonified`
      );
      assert.ok(
        limitsLower.includes('not raw') || limitsLower.includes('not physical') ||
        limitsLower.includes('not direct') || limitsLower.includes('not instant'),
        `Track '${track.id}' limits must explicitly clarify it is not raw sensor/physical data`
      );
    }
  });
});
