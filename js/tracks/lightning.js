// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Track Sound Personality: Lightning (Percussion)
 * SVS #5011 — Lightning Events Detected from the ISS 2017-2023
 * Scale: D Dorian (D, E, F, G, A, B, C)
 * Triggered by detected bright blobs: band-pass filtered noise bursts + short sine pings.
 * Intentional silence between lightning flashes (zero blobs -> zero nodes).
 */

export const lightningPersonality = {
  id: 'lightning',
  name: 'ISS Lightning: 2017–2023',
  scale: 'D Dorian',
  scaleNotes: [146.83, 164.81, 174.61, 196.0, 220.0, 246.94, 261.63, 293.66, 329.63, 349.23, 392.0, 440.0],

  /**
   * Triggers percussion events for detected lightning flash blobs.
   * Capped at up to 8 blobs; zero blobs produces intentional silence.
   * @param {AudioContext} ctx
   * @param {AudioNode} destinationNode
   * @param {Array} brightBlobs - Array of { x, y, brightness }
   */
  triggerBlobs(ctx, destinationNode, brightBlobs = []) {
    if (!ctx || !destinationNode || !brightBlobs || brightBlobs.length === 0) return;
    const now = ctx.currentTime;
    const blobsToTrigger = brightBlobs.slice(0, 8);

    blobsToTrigger.forEach((blob, idx) => {
      const stagger = idx * 0.025;
      const startTime = now + stagger;
      const noteIdx = Math.floor((1 - (blob.y || 0)) * lightningPersonality.scaleNotes.length);
      const freq = lightningPersonality.scaleNotes[
        Math.max(0, Math.min(lightningPersonality.scaleNotes.length - 1, noteIdx))
      ];

      // 1. Tonal sine ping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter ? ctx.createBiquadFilter() : null;
      const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      const velocity = Math.min(0.3, (blob.brightness || 0.5) * 0.35);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(velocity, startTime + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.12);

      let lastNode = gain;
      osc.connect(gain);

      if (filter) {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, startTime);
        filter.Q.setValueAtTime(3.0, startTime);
        gain.connect(filter);
        lastNode = filter;
      }

      if (panner) {
        const panX = Math.max(-1.0, Math.min(1.0, (((blob.x !== undefined && blob.x !== null ? blob.x : 0.5) * 2.0) - 1.0)));
        panner.pan.setValueAtTime(panX, startTime);
        lastNode.connect(panner);
        panner.connect(destinationNode);
      } else {
        lastNode.connect(destinationNode);
      }

      osc.start(startTime);
      osc.stop(startTime + 0.13);

      // 2. Short noise burst via buffer source if createBuffer is available
      if (typeof ctx.createBuffer === 'function' && typeof ctx.createBufferSource === 'function') {
        try {
          const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * 0.04));
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const channelData = noiseBuffer.getChannelData(0);
          for (let s = 0; s < bufferSize; s++) {
            channelData[s] = (Math.random() * 2 - 1) * Math.exp(-s / (bufferSize * 0.3));
          }

          const noiseSource = ctx.createBufferSource();
          noiseSource.buffer = noiseBuffer;

          const noiseGain = ctx.createGain();
          const noiseVel = Math.min(0.15, (blob.brightness || 0.5) * 0.15);
          noiseGain.gain.setValueAtTime(noiseVel, startTime);
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.04);

          const noiseFilter = ctx.createBiquadFilter ? ctx.createBiquadFilter() : null;
          let noiseOut = noiseGain;
          noiseSource.connect(noiseGain);

          if (noiseFilter) {
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(freq * 1.5, startTime);
            noiseFilter.Q.setValueAtTime(2.0, startTime);
            noiseGain.connect(noiseFilter);
            noiseOut = noiseFilter;
          }

          if (panner) {
            const noisePanner = ctx.createStereoPanner();
            const panX = Math.max(-1.0, Math.min(1.0, (((blob.x !== undefined && blob.x !== null ? blob.x : 0.5) * 2.0) - 1.0)));
            noisePanner.pan.setValueAtTime(panX, startTime);
            noiseOut.connect(noisePanner);
            noisePanner.connect(destinationNode);
          } else {
            noiseOut.connect(destinationNode);
          }

          noiseSource.start(startTime);
          noiseSource.stop(startTime + 0.045);
        } catch (e) {
          // Fallback gracefully if buffer creation fails
        }
      }
    });
  }
};
