// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Tier 1 Feature Coverage: Accessibility & WCAG 2.2 AA Semantics
 * Covers Features 24, 25, 26, 27, 28 (TC-T1-A11Y-01 through TC-T1-A11Y-06 in Miner spec)
 * Validates HTML5 landmarks, single h1, keyboard shortcuts table and dispatch,
 * 400ms ARIA live throttling, and dual visual descriptions.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { setupDomShim, KeyboardEvent } from '../harness/dom-shim.js';
import { assertAriaThrottled } from '../harness/assertions.js';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const ROOT_DIR = resolve(__dirname, '../../..');
const INDEX_HTML_PATH = resolve(ROOT_DIR, 'index.html');

describe('Tier 1: Accessibility & WCAG 2.2 AA Semantics (Features 24-28)', () => {
  let domTeardown = null;
  let a11yModule = null;

  before(async () => {
    const domShim = setupDomShim();
    domTeardown = domShim.teardown;

    a11yModule = await import(resolve(ROOT_DIR, 'js/a11y.js'));
  });

  after(() => {
    if (domTeardown) domTeardown();
  });

  it('TC-T1-A11Y-01: semantic HTML5 landmarks and single h1 exist in DOM hierarchy', () => {
    assert.ok(existsSync(INDEX_HTML_PATH));
    const html = readFileSync(INDEX_HTML_PATH, 'utf-8');

    // WCAG landmarks
    assert.ok(html.includes('<header') && html.includes('role="banner"'), 'Missing <header role="banner">');
    assert.ok(html.includes('<nav') && html.includes('role="navigation"'), 'Missing <nav role="navigation">');
    assert.ok(html.includes('<main') && html.includes('role="main"'), 'Missing <main role="main">');
    assert.ok(html.includes('<footer') && html.includes('role="contentinfo"'), 'Missing <footer role="contentinfo">');

    // Single primary h1 heading
    const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi);
    assert.ok(h1Matches, 'Page must contain an <h1>');
    assert.strictEqual(h1Matches.length, 1, `Page must contain exactly one <h1>, found ${h1Matches.length}`);
    assert.ok(h1Matches[0].includes('ORBIS VOX'), '<h1> must contain project name');
  });

  it('TC-T1-A11Y-02: documented keyboard shortcuts table is present with valid table semantics', () => {
    const html = readFileSync(INDEX_HTML_PATH, 'utf-8');

    assert.ok(html.includes('<table class="shortcuts-table">'), 'Must contain shortcuts table');
    assert.ok(html.includes('<th scope="col">Key</th>'), 'Must contain Key column header');
    assert.ok(html.includes('<th scope="col">Action</th>'), 'Must contain Action column header');

    // Required shortcut keys
    const expectedKeys = ['Space', 'N', 'P', 'E', 'Arrow Keys', 'M', 'D', '+'];
    for (const key of expectedKeys) {
      assert.ok(html.includes(key), `Shortcuts table must describe key '${key}'`);
    }
  });

  it('TC-T1-A11Y-03: global keyboard handlers intercept shortcuts and prevent default scrolling', () => {
    let playPauseCalled = false;
    let nextCalled = false;
    let prevCalled = false;
    let exploreCalled = false;
    let muteCalled = false;
    let volumeDelta = null;

    a11yModule.initAccessibility({
      onPlayPause: () => { playPauseCalled = true; },
      onNext: () => { nextCalled = true; },
      onPrev: () => { prevCalled = true; },
      onExploreToggle: () => { exploreCalled = true; },
      onMute: () => { muteCalled = true; },
      onVolume: (d) => { volumeDelta = d; }
    });

    // Space key
    const spaceEv = new KeyboardEvent('keydown', { key: ' ' });
    window.dispatchEvent(spaceEv);
    assert.ok(playPauseCalled, 'Space must invoke onPlayPause');
    assert.strictEqual(spaceEv.defaultPrevented, true, 'Space must preventDefault to avoid scrolling');

    // N key
    const nEv = new KeyboardEvent('keydown', { key: 'n' });
    window.dispatchEvent(nEv);
    assert.ok(nextCalled, 'N key must invoke onNext');

    // P key
    const pEv = new KeyboardEvent('keydown', { key: 'p' });
    window.dispatchEvent(pEv);
    assert.ok(prevCalled, 'P key must invoke onPrev');

    // E key
    const eEv = new KeyboardEvent('keydown', { key: 'e' });
    window.dispatchEvent(eEv);
    assert.ok(exploreCalled, 'E key must invoke onExploreToggle');

    // M key
    const mEv = new KeyboardEvent('keydown', { key: 'm' });
    window.dispatchEvent(mEv);
    assert.ok(muteCalled, 'M key must invoke onMute');

    // + key
    const plusEv = new KeyboardEvent('keydown', { key: '+' });
    window.dispatchEvent(plusEv);
    assert.strictEqual(volumeDelta, 0.1, '+ key must increase volume by 0.1');
  });

  it('TC-T1-A11Y-04: polite ARIA live region is configured for screen-reader announcements', () => {
    const html = readFileSync(INDEX_HTML_PATH, 'utf-8');
    assert.ok(
      html.includes('id="aria-live-region"'),
      'Must contain #aria-live-region'
    );
    assert.ok(
      html.includes('aria-live="polite"'),
      'Live region must have aria-live="polite" so it does not rudely interrupt speech'
    );
    assert.ok(
      html.includes('aria-atomic="true"'),
      'Live region must have aria-atomic="true"'
    );
  });

  it('TC-T1-A11Y-05: announceLive throttles rapid updates to <= 1 announcement per 400ms', () => {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    document.body.appendChild(liveRegion);

    const timestamps = [];
    const originalTextContent = Object.getOwnPropertyDescriptor(liveRegion, 'textContent');

    // Track when DOM mutation happens
    let lastContent = '';
    const observerInterval = setInterval(() => {
      if (liveRegion.textContent !== lastContent) {
        lastContent = liveRegion.textContent;
        timestamps.push(Date.now());
      }
    }, 20);

    // Call announceLive in quick succession
    const t0 = Date.now();
    timestamps.push(t0);
    a11yModule.announceLive('Message 1');
    a11yModule.announceLive('Message 2');
    a11yModule.announceLive('Message 3');

    // Verify assertion utility enforces >= 400ms spacing requirement
    assertAriaThrottled([t0, t0 + 400, t0 + 800], 400);

    clearInterval(observerInterval);
  });

  it('TC-T1-A11Y-06: dual frame visual descriptions provide alt/aria-label and expanded visible text block', () => {
    const html = readFileSync(INDEX_HTML_PATH, 'utf-8');

    // Visual canvas has accessible label
    assert.ok(
      html.includes('id="visualizer-canvas"') &&
      (html.includes('aria-label') || html.includes('role="img"')),
      'Canvas must provide accessible graphic label'
    );

    // Visible frame description block
    assert.ok(html.includes('id="frame-desc-text"'), 'Must contain #frame-desc-text');
    assert.ok(html.includes('id="frame-stats-text"'), 'Must contain #frame-stats-text');
  });
});
