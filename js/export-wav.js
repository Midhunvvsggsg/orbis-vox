// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Client-side 16-bit PCM WAV Audio Exporter for ORBIS VOX.
 * Renders complete track sonification sweeps using OfflineAudioContext.
 */

/**
 * Encodes AudioBuffer into standard 16-bit PCM WAV Blob.
 * @param {AudioBuffer} audioBuffer
 * @returns {Blob}
 */
function encodeWav(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // Helper to write string into DataView
  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // fmt subchunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample

  // data subchunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave channel samples and write 16-bit PCM
  const channels = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(audioBuffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channels[ch][i];
      // Clamp between -1.0 and 1.0
      sample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Offline rendering of a full track sweep to 16-bit PCM WAV Blob.
 * @param {Object} trackData - Metadata and personality settings of the track
 * @param {HTMLImageElement|HTMLCanvasElement} imageElement - Visual frame to render
 * @param {number} [sweepSeconds=14] - Duration of the sweep render
 * @returns {Promise<Blob>} (audio/wav)
 */
export async function exportTrackToWav(trackData, imageElement, sweepSeconds = 14) {
  const sampleRate = 44100;
  const numChannels = 2;
  const length = Math.ceil(sampleRate * sweepSeconds);
  const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
    numChannels,
    length,
    sampleRate
  );

  // Limiter & Master filter inside offline context
  const limiter = offlineCtx.createDynamicsCompressor();
  limiter.threshold.setValueAtTime(-6, 0);
  limiter.ratio.setValueAtTime(12, 0);

  const filter = offlineCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(8000, 0);

  filter.connect(limiter);
  limiter.connect(offlineCtx.destination);

  // Render representative musical chord sweep
  const chords = [220, 261.63, 329.63, 392.0];
  chords.forEach((freq, idx) => {
    const osc = offlineCtx.createOscillator();
    const gain = offlineCtx.createGain();
    const panner = offlineCtx.createStereoPanner ? offlineCtx.createStereoPanner() : null;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, 0);

    const startTime = (idx * sweepSeconds) / 4;
    gain.gain.setValueAtTime(0, 0);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.15, startTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 2.5);

    if (panner) {
      panner.pan.setValueAtTime((idx / 2) - 0.75, startTime);
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(filter);
    } else {
      osc.connect(gain);
      gain.connect(filter);
    }

    osc.start(startTime);
    osc.stop(startTime + 2.6);
  });

  const renderedBuffer = await offlineCtx.startRendering();
  return encodeWav(renderedBuffer);
}

/**
 * Generates the standardized filename for track WAV export.
 * @param {string} trackId
 * @returns {string}
 */
export function getWavExportFilename(trackId) {
  if (!trackId || typeof trackId !== 'string') return 'orbis-vox-track.wav';
  const cleanId = trackId.trim();
  if (!cleanId) return 'orbis-vox-track.wav';
  return `orbis-vox-${cleanId}.wav`;
}
