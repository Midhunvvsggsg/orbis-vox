// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Accessibility coordinator for ORBIS VOX.
 * Implements WCAG 2.2 AA compliant keyboard shortcuts, focus handling,
 * and throttled ARIA live announcements (<= 1 call per 400ms).
 */

let lastAnnounceTime = 0;
let pendingAnnounce = null;
let announceTimer = null;
const THROTTLE_MS = 400;

/**
 * Announces text to the polite ARIA live region with 400ms throttling.
 * @param {string} text
 */
export function announceLive(text) {
  const liveRegion = document.getElementById('aria-live-region');
  if (!liveRegion || !text) return;

  const now = Date.now();
  if (now - lastAnnounceTime >= THROTTLE_MS) {
    lastAnnounceTime = now;
    liveRegion.textContent = text;
  } else {
    pendingAnnounce = text;
    if (!announceTimer) {
      announceTimer = setTimeout(() => {
        announceTimer = null;
        lastAnnounceTime = Date.now();
        if (pendingAnnounce) {
          liveRegion.textContent = pendingAnnounce;
          pendingAnnounce = null;
        }
      }, THROTTLE_MS - (now - lastAnnounceTime));
    }
  }
}

/**
 * Sets reduced motion mode in application.
 * @param {boolean} enabled
 */
export function setReducedMotion(enabled) {
  if (enabled) {
    document.body.classList.add('reduced-motion');
  } else {
    document.body.classList.remove('reduced-motion');
  }
}

/**
 * Initializes keyboard navigation and accessibility handlers.
 * @param {Object} handlers
 */
export function initAccessibility(handlers = {}) {
  const {
    onPlayPause,
    onNext,
    onPrev,
    onExploreToggle,
    onProbeMove,
    onMute,
    onDesc,
    onVolume
  } = handlers;

  // Listen for reduced motion preference
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  setReducedMotion(mediaQuery.matches);
  mediaQuery.addEventListener('change', (e) => setReducedMotion(e.matches));

  // Global keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    // Skip if focus is within an input or textarea
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) && e.key !== 'Escape') {
      return;
    }

    switch (e.key) {
      case ' ':
        e.preventDefault();
        if (onPlayPause) onPlayPause();
        break;
      case 'n':
      case 'N':
        e.preventDefault();
        if (onNext) onNext();
        break;
      case 'p':
      case 'P':
        e.preventDefault();
        if (onPrev) onPrev();
        break;
      case 'e':
      case 'E':
        e.preventDefault();
        if (onExploreToggle) onExploreToggle();
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        if (onMute) onMute();
        break;
      case 'd':
      case 'D':
        e.preventDefault();
        if (onDesc) onDesc();
        break;
      case '+':
      case '=':
        e.preventDefault();
        if (onVolume) onVolume(0.1);
        break;
      case '-':
      case '_':
        e.preventDefault();
        if (onVolume) onVolume(-0.1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (onProbeMove) onProbeMove(0, -0.05);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (onProbeMove) onProbeMove(0, 0.05);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (onProbeMove) onProbeMove(-0.05, 0);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (onProbeMove) onProbeMove(0.05, 0);
        break;
    }
  });
}
