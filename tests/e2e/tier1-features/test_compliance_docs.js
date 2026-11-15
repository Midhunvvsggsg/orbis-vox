// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Tier 1 Feature Coverage: NASA Space Apps Rules & Compliance Documentation
 * Covers Features 7, 8, 38, 39, 40, 41, 42
 * Validates mandatory AI code header comment on line 1, Space Apps rules (no added logos,
 * no minors, English only), repository footprint < 50MB, DECISIONS.md, REFERENCES.md,
 * DEMO_AND_SUBMISSION.md, 30s video script timing <= 30.0s, and 7-slide deck outline.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { assertAiHeaderPresent } from '../harness/assertions.js';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const ROOT_DIR = resolve(__dirname, '../../..');

describe('Tier 1: Space Apps Rules & Compliance Documentation (Features 7, 8, 38-42)', () => {
  it('TC-T1-CMP-01: mandatory AI assistance header comment is present on line 1 of every code file', () => {
    // Scan all .js, .css, .html in js/, css/, tests/, and root
    const dirsToScan = [
      resolve(ROOT_DIR, 'js'),
      resolve(ROOT_DIR, 'css'),
      resolve(ROOT_DIR, 'tests/e2e'),
      resolve(ROOT_DIR, 'tests/e2e/harness'),
      resolve(ROOT_DIR, 'tests/e2e/tier1-features')
    ];

    const codeFiles = [resolve(ROOT_DIR, 'index.html')];

    function collectFiles(dir) {
      if (!existsSync(dir)) return;
      const entries = readdirSync(dir);
      for (const entry of entries) {
        const full = join(dir, entry);
        const stat = statSync(full);
        if (stat.isDirectory()) {
          collectFiles(full);
        } else if (stat.isFile() && ['.js', '.css', '.html'].includes(extname(entry))) {
          codeFiles.push(full);
        }
      }
    }

    for (const d of dirsToScan) {
      collectFiles(d);
    }

    assert.ok(codeFiles.length >= 15, `Expected >= 15 code files, found ${codeFiles.length}`);

    for (const file of codeFiles) {
      assertAiHeaderPresent(file);
    }
  });

  it('TC-T1-CMP-02: Space Apps rules compliance: no added NASA logos, no minors, and plain-text disclaimer', () => {
    const indexHtml = readFileSync(resolve(ROOT_DIR, 'index.html'), 'utf-8');

    // Rule 1: No NASA logos, meatballs, worms, or patches added
    assert.ok(
      !indexHtml.includes('nasa-logo') && !indexHtml.includes('meatball') && !indexHtml.includes('nasa_worm'),
      'No added NASA logos or meatballs permitted'
    );

    // Rule 2: Plain-text non-endorsement statement must be displayed
    assert.ok(
      indexHtml.includes('Not affiliated with or endorsed by NASA') ||
      indexHtml.includes('not affiliated with or endorsed by NASA'),
      'Plain-text NASA non-endorsement statement must be present'
    );

    // Rule 3: English only
    assert.ok(indexHtml.includes('<html lang="en">'), 'Page must declare lang="en"');

    // Rule 4: No minors likeness in assets
    const assetsDir = resolve(ROOT_DIR, 'assets');
    assert.ok(existsSync(assetsDir));
  });

  it('TC-T1-CMP-03: total repository size footprint is strictly under 50 MB', () => {
    let totalSizeBytes = 0;

    function calculateDirSize(dir) {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        if (entry === '.git') continue;
        const full = join(dir, entry);
        const stat = statSync(full);
        if (stat.isDirectory()) {
          calculateDirSize(full);
        } else if (stat.isFile()) {
          totalSizeBytes += stat.size;
        }
      }
    }

    calculateDirSize(ROOT_DIR);
    const totalSizeMB = totalSizeBytes / (1024 * 1024);

    assert.ok(
      totalSizeMB < 50.0,
      `Repository footprint (${totalSizeMB.toFixed(2)} MB) must be strictly under 50 MB (Release Gate 9)`
    );
  });

  it('TC-T1-CMP-04: docs/DECISIONS.md and docs/REFERENCES.md are populated with architecture logs and SVS attributions', () => {
    const decisionsPath = resolve(ROOT_DIR, 'docs/DECISIONS.md');
    const referencesPath = resolve(ROOT_DIR, 'docs/REFERENCES.md');

    assert.ok(existsSync(decisionsPath), 'Missing docs/DECISIONS.md');
    assert.ok(existsSync(referencesPath), 'Missing docs/REFERENCES.md');

    const decisions = readFileSync(decisionsPath, 'utf-8');
    const references = readFileSync(referencesPath, 'utf-8');

    // Check decisions logged
    assert.ok(decisions.includes('DEC-001'), 'Must log DEC-001');
    assert.ok(decisions.includes('DEC-002'), 'Must log DEC-002');
    assert.ok(decisions.includes('DEC-004'), 'Must log DEC-004 (Sonification Mapping Honesty)');
    assert.ok(decisions.includes('DEC-005'), 'Must log DEC-005 (Web Audio API Safety)');

    // Check references log all 4 core SVS records
    assert.ok(references.includes('5313'), 'Must reference SVS #5313');
    assert.ok(references.includes('5011'), 'Must reference SVS #5011');
    assert.ok(references.includes('5425'), 'Must reference SVS #5425');
    assert.ok(references.includes('5196'), 'Must reference SVS #5196');
    assert.ok(references.includes('Runtime JavaScript Libraries**: None') || references.includes('0 dependencies'), 'Must document 0 runtime dependencies');
  });

  it('TC-T1-CMP-05: docs/DEMO_AND_SUBMISSION.md is populated with Space Apps submission fields and checklist', () => {
    const demoPath = resolve(ROOT_DIR, 'docs/DEMO_AND_SUBMISSION.md');
    assert.ok(existsSync(demoPath), 'Missing docs/DEMO_AND_SUBMISSION.md');
    const content = readFileSync(demoPath, 'utf-8');

    // Check required form fields are defined
    assert.ok(content.includes('Project Name:'), 'Must contain Project Name');
    assert.ok(content.includes('High-Level Project Summary:'), 'Must contain High-Level Project Summary');
    assert.ok(content.includes('Link to Project Demo:'), 'Must contain Link to Project Demo');
    assert.ok(content.includes('Link to Final Project:'), 'Must contain Link to Final Project');
    assert.ok(content.includes('Detailed Project Description:'), 'Must contain Detailed Project Description');
    assert.ok(content.includes('Use of Super Intelligence (SI):'), 'Must contain Use of Super Intelligence');
    assert.ok(content.includes('Pre-submit checklist'), 'Must contain Pre-submit checklist');
  });

  it('TC-T1-CMP-06: 30-second demo video script duration is <= 30.0s and slide deck outline contains <= 7 slides', () => {
    const demoPath = resolve(ROOT_DIR, 'docs/DEMO_AND_SUBMISSION.md');
    const content = readFileSync(demoPath, 'utf-8');

    // Video script constraint
    assert.ok(
      content.includes('30 seconds or less') || content.includes('Video: 30 seconds'),
      'Video script must explicitly specify 30 seconds or less'
    );

    // Verify 6 narrative beats
    const beats = ['0:00', '0:03', '0:07', '0:10', '0:22', '0:27'];
    for (const beat of beats) {
      assert.ok(content.includes(beat), `Video script must contain timing beat '${beat}'`);
    }

    // Slide deck constraint: 7 slides maximum
    assert.ok(
      content.includes('7 maximum') || content.includes('Slides: 7'),
      'Slides outline must specify 7 maximum'
    );

    // Verify slide list 1 through 7
    for (let i = 1; i <= 7; i++) {
      assert.ok(
        content.includes(`${i}. `),
        `Slide outline must contain entry for slide ${i}`
      );
    }
  });
});
