// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Track Sound Personality: Global CO2 (Harmonic Tension)
 * SVS #5196 — DYAMOND Global Carbon Dioxide Plumes
 * Dynamic harmonic chord tension mapped to mean atmospheric CO2 concentration / brightness:
 * Low: Consonant Major 7th (warm, stable)
 * Mid: Major 9th with subtle detuning (gathering density)
 * High: Minor 2nd / Tritone dissonance with brighter filter (maximum tension).
 * Resolves cleanly to consonant Major 7th at loop boundary.
 */

export const co2Personality = {
  id: 'co2',
  name: 'Global CO2 Plume: 2020',
  scale: 'Harmonic Tension',
  baseRoot: 220.0, // A3

  /**
   * Generates chord notes with tension scaling to mean brightness.
   * Low (< 0.25): 4-note Consonant Major 7th [Root, M3, P5, M7]
   * Mid (0.25 - 0.5): 5-note chord with added 9th [Root, M3, P5, M7, M9]
   * High (>= 0.5): 5-note dissonant chord [Root, m2, Tritone, M7, m9]
   *
   * @param {number} meanBrightness - [0.0, 1.0]
   * @returns {Array<number>} Frequencies in Hz
   */
  getTensionFrequencies(meanBrightness) {
    const root = co2Personality.baseRoot;
    const brightness = Math.max(0.0, Math.min(1.0, Number(meanBrightness) || 0.0));

    if (brightness < 0.25) {
      // Consonant Major 7th: Root, Major 3rd (2^(4/12)), 5th (2^(7/12)), Major 7th (2^(11/12))
      return [root, root * 1.2599, root * 1.4983, root * 1.8877];
    } else if (brightness < 0.5) {
      // Adding 9th (2^(14/12))
      return [root, root * 1.2599, root * 1.4983, root * 1.8877, root * 2.2449];
    } else {
      // Minor 2nd (2^(1/12)) + Tritone (sqrt(2)) harmonic tension
      return [root, root * 1.0595, root * 1.4142, root * 1.8877, root * 2.1189];
    }
  },

  /**
   * Synthesizes chord with tension-based filter cutoff and timbre.
   * High tension uses brighter waveforms (sawtooth) and higher filter cutoff;
   * low tension uses pure sines with low-pass warmth.
   *
   * @param {AudioContext} ctx
   * @param {AudioNode} destinationNode
   * @param {number} [meanBrightness=0.2]
   */
  playTensionChord(ctx, destinationNode, meanBrightness = 0.2) {
    if (!ctx || !destinationNode) return;
    const now = ctx.currentTime;
    const brightness = Math.max(0.0, Math.min(1.0, Number.isFinite(Number(meanBrightness)) ? Number(meanBrightness) : 0.2));
    const freqs = co2Personality.getTensionFrequencies(brightness);

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter ? ctx.createBiquadFilter() : null;

      osc.type = brightness > 0.4 ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06 / Math.sqrt(freqs.length), now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

      let lastNode = gain;
      osc.connect(gain);

      if (filter) {
        filter.type = 'lowpass';
        // Brighter filter cutoff as tension increases
        const cutoff = 600 + brightness * 3400;
        filter.frequency.setValueAtTime(cutoff, now);
        gain.connect(filter);
        lastNode = filter;
      }

      lastNode.connect(destinationNode);

      osc.start(now);
      osc.stop(now + 2.9);
    });
  },

  /**
   * Cleanly resolves tension to the consonant Major 7th chord at loop boundary.
   * @param {AudioContext} ctx
   * @param {AudioNode} destinationNode
   */
  resolveAtLoopBoundary(ctx, destinationNode) {
    co2Personality.playTensionChord(ctx, destinationNode, 0.1);
  }
};
