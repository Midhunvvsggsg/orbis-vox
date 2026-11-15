// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Track Sound Personality: Night Lights (Rhythm)
 * SVS #5313 / #5276 — Change in Night Lights 2012-2023
 * Scale: A minor pentatonic (A, C, D, E, G)
 * Short plucked envelopes with tempo scaling to lit-pixel density (70-130 BPM).
 */

export const nightLightsPersonality = {
  id: 'night-lights',
  name: 'Night Lights: 2012–2023',
  scale: 'A minor pentatonic',
  scaleNotes: [220, 261.63, 293.66, 329.63, 392.0, 440, 523.25, 587.33, 659.25, 783.99],
  baseTempo: 80,

  /**
   * Computes dynamic tempo based on lit fraction.
   * Tempo = 70 + 60 * litFraction BPM, clamped to [70, 130].
   * @param {number} litFraction
   * @returns {number}
   */
  calculateTempo(litFraction) {
    const clamped = Math.max(0, Math.min(1, Number(litFraction) || 0));
    const rawTempo = 70 + 60 * clamped;
    return Math.round(Math.max(70, Math.min(130, rawTempo)));
  },

  /**
   * Synthesizes plucked notes for the active sweep column.
   * Pluck envelope: quick 5ms attack, fast exponential decay (180ms).
   *
   * @param {AudioContext} ctx
   * @param {AudioNode} destinationNode
   * @param {Object} columnData
   * @param {number} [litFraction=0.5]
   */
  playColumn(ctx, destinationNode, columnData, litFraction = 0.5) {
    if (!ctx || !destinationNode || !columnData) return;
    const now = ctx.currentTime;
    const points = columnData.points || [];
    const lit = Math.max(0.0, Math.min(1.0, Number(litFraction) || 0.0));

    points.forEach((pt, idx) => {
      // Note probability scaled to luminance and litFraction
      const probThreshold = Math.max(0.35, lit * 1.5);
      if (pt.luminance > 0.04 && Math.random() <= probThreshold) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter ? ctx.createBiquadFilter() : null;
        const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        const noteIdx = Math.floor((1 - (pt.y || 0)) * nightLightsPersonality.scaleNotes.length);
        const freq = nightLightsPersonality.scaleNotes[
          Math.max(0, Math.min(nightLightsPersonality.scaleNotes.length - 1, noteIdx))
        ];

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        // Pluck envelope: quick attack, clear audible pluck decay
        const velocity = Math.min(0.4, Math.max(0.12, (pt.luminance || 0.5) * 0.8));
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(velocity, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

        let lastNode = gain;
        osc.connect(gain);

        if (filter) {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(3200, now);
          gain.connect(filter);
          lastNode = filter;
        }

        if (panner && pt.x !== undefined) {
          panner.pan.setValueAtTime((pt.x * 2.0) - 1.0, now);
          lastNode.connect(panner);
          panner.connect(destinationNode);
        } else {
          lastNode.connect(destinationNode);
        }

        osc.start(now);
        osc.stop(now + 0.28);
      }
    });
  }
};
