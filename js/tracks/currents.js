// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Track Sound Personality: Ocean Currents (Ambient Pad)
 * SVS #5425 — Perpetual Ocean 2: Western Boundary Currents
 * Scale: D Dorian (D, F, A, C)
 * 4 detuned triangle voices forming a slow oceanic chord; chord root drifts with mean hue;
 * flow speed (frame diff) modulates filter cutoff, sweep, and movement.
 */

export const currentsPersonality = {
  id: 'currents',
  name: 'Ocean Currents: Western Boundary',
  scale: 'D Dorian',
  baseFrequencies: [146.83, 174.61, 220.0, 261.63], // D3, F3, A3, C4
  scaleNotes: [146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00],

  /**
   * Modulates evolving ambient pad chord based on mean hue and frame difference.
   * Spawns exactly 4 detuned triangle voices with filter sweep modulated by flow velocity.
   *
   * @param {AudioContext} ctx
   * @param {AudioNode} destinationNode
   * @param {number} [meanHue=200] - [0.0, 360.0]
   * @param {number} [frameDiff=0.1] - [0.0, 1.0] flow velocity
   */
  modulatePad(ctx, destinationNode, meanHue = 200, frameDiff = 0.1) {
    if (!ctx || !destinationNode) return;
    const now = ctx.currentTime;
    // Semitone drift centered around 180 degrees hue (-6 to +6 semitones)
    const clampedHue = Math.max(0, Math.min(360, Number.isFinite(Number(meanHue)) ? Number(meanHue) : 200));
    const clampedDiff = Math.max(0.0, Math.min(1.0, Number.isFinite(Number(frameDiff)) ? Number(frameDiff) : 0.1));
    const hueOffset = ((clampedHue - 180) / 180) * 12;

    currentsPersonality.baseFrequencies.forEach((baseFreq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter ? ctx.createBiquadFilter() : null;
      const detuneCents = (i - 1.5) * 8; // subtle oceanic chorusing

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq * Math.pow(2, hueOffset / 12), now);
      osc.detune.setValueAtTime(detuneCents, now);

      // Long ambient attack and release
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      let lastNode = gain;
      osc.connect(gain);

      // Filter cutoff and sweep modulated by frame difference (flow velocity)
      if (filter) {
        filter.type = 'lowpass';
        const baseCutoff = 400 + clampedDiff * 1600;
        filter.frequency.setValueAtTime(baseCutoff, now);
        filter.frequency.linearRampToValueAtTime(baseCutoff * 1.6, now + 1.4);
        filter.frequency.linearRampToValueAtTime(baseCutoff, now + 3.2);
        gain.connect(filter);
        lastNode = filter;
      }

      lastNode.connect(destinationNode);

      osc.start(now);
      osc.stop(now + 3.3);
    });
  }
};
