// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Binary buffer parser and validator for 16-bit PCM WAV files.
 * Validates RIFF/WAVE headers, fmt chunk parameters, data chunk sizing,
 * calculates RMS amplitude, detects silence, and validates against digital clipping.
 */

import { Buffer } from 'node:buffer';

/**
 * Converts various buffer types (ArrayBuffer, Uint8Array, Buffer) to a Node Buffer.
 */
function toBuffer(input) {
  if (Buffer.isBuffer(input)) return input;
  if (input instanceof Uint8Array) return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  if (input instanceof ArrayBuffer) return Buffer.from(input);
  throw new TypeError('Expected Buffer, Uint8Array, or ArrayBuffer');
}

/**
 * Parses and validates a 16-bit PCM WAV binary buffer.
 * @param {Buffer|Uint8Array|ArrayBuffer} rawBuffer
 * @returns {object} Parsed WAV data and acoustic metrics
 */
export function parseWav(rawBuffer) {
  const buf = toBuffer(rawBuffer);

  if (buf.length < 44) {
    throw new Error(`Invalid WAV: Buffer too small (${buf.length} bytes, minimum 44 bytes required)`);
  }

  // 1. Validate RIFF Header
  const chunkId = buf.toString('ascii', 0, 4);
  if (chunkId !== 'RIFF') {
    throw new Error(`Invalid WAV: Expected ChunkID 'RIFF', found '${chunkId}'`);
  }

  const chunkSize = buf.readUInt32LE(4);
  const format = buf.toString('ascii', 8, 12);
  if (format !== 'WAVE') {
    throw new Error(`Invalid WAV: Expected format 'WAVE', found '${format}'`);
  }

  // 2. Iterate Subchunks ('fmt ', 'data', etc.)
  let offset = 12;
  let fmt = null;
  let dataChunk = null;

  while (offset + 8 <= buf.length) {
    const subchunkId = buf.toString('ascii', offset, offset + 4);
    const subchunkSize = buf.readUInt32LE(offset + 4);
    const chunkDataStart = offset + 8;

    if (subchunkId === 'fmt ') {
      const audioFormat = buf.readUInt16LE(chunkDataStart);
      const numChannels = buf.readUInt16LE(chunkDataStart + 2);
      const sampleRate = buf.readUInt32LE(chunkDataStart + 4);
      const byteRate = buf.readUInt32LE(chunkDataStart + 8);
      const blockAlign = buf.readUInt16LE(chunkDataStart + 12);
      const bitsPerSample = buf.readUInt16LE(chunkDataStart + 14);

      // Validate fmt calculations
      const expectedByteRate = (sampleRate * numChannels * bitsPerSample) / 8;
      const expectedBlockAlign = (numChannels * bitsPerSample) / 8;

      if (audioFormat !== 1) {
        throw new Error(`Invalid WAV: Expected PCM format (1), got ${audioFormat}`);
      }
      if (bitsPerSample !== 16) {
        throw new Error(`Invalid WAV: Expected 16 bits per sample, got ${bitsPerSample}`);
      }
      if (byteRate !== expectedByteRate) {
        throw new Error(`Invalid WAV: ByteRate mismatch. Expected ${expectedByteRate}, got ${byteRate}`);
      }
      if (blockAlign !== expectedBlockAlign) {
        throw new Error(`Invalid WAV: BlockAlign mismatch. Expected ${expectedBlockAlign}, got ${blockAlign}`);
      }

      fmt = {
        subchunkId,
        subchunkSize,
        audioFormat,
        numChannels,
        sampleRate,
        byteRate,
        blockAlign,
        bitsPerSample
      };
    } else if (subchunkId === 'data') {
      const dataEnd = Math.min(buf.length, chunkDataStart + subchunkSize);
      const sampleDataBuffer = buf.subarray(chunkDataStart, dataEnd);

      dataChunk = {
        subchunkId,
        subchunkSize,
        sampleDataBuffer
      };
    }

    offset = chunkDataStart + subchunkSize;
    // Word alignment: if subchunkSize is odd, advance 1 padding byte
    if (subchunkSize % 2 !== 0) {
      offset += 1;
    }
  }

  if (!fmt) {
    throw new Error("Invalid WAV: Missing 'fmt ' chunk");
  }
  if (!dataChunk) {
    throw new Error("Invalid WAV: Missing 'data' chunk");
  }

  // 3. Parse and inspect 16-bit PCM samples
  const bytesPerSample = fmt.bitsPerSample / 8;
  const totalSamples = Math.floor(dataChunk.sampleDataBuffer.length / bytesPerSample);
  const samplesPerChannel = Math.floor(totalSamples / fmt.numChannels);

  const samples = new Int16Array(totalSamples);
  let minSample = 0;
  let maxSample = 0;
  let clippingCount = 0;
  let sumSquares = 0;

  for (let i = 0; i < totalSamples; i++) {
    const val = dataChunk.sampleDataBuffer.readInt16LE(i * 2);
    samples[i] = val;

    if (val < minSample) minSample = val;
    if (val > maxSample) maxSample = val;

    // Digital clipping check (hitting extreme signed 16-bit rail)
    if (val === -32768 || val === 32767) {
      clippingCount++;
    }

    const norm = val / 32768.0;
    sumSquares += norm * norm;
  }

  const rms = totalSamples > 0 ? Math.sqrt(sumSquares / totalSamples) : 0;
  const peakNorm = Math.max(Math.abs(minSample), Math.abs(maxSample)) / 32768.0;
  const isSilent = rms < 0.001;
  const durationSeconds = samplesPerChannel / fmt.sampleRate;

  return {
    riff: { chunkId, chunkSize, format },
    fmt,
    data: {
      subchunkId: dataChunk.subchunkId,
      subchunkSize: dataChunk.subchunkSize,
      totalSamples,
      samplesPerChannel,
      durationSeconds,
      samples
    },
    metrics: {
      rms,
      peakNorm,
      minSample,
      maxSample,
      clippingCount,
      hasClipping: clippingCount > 0,
      isSilent
    }
  };
}

/**
 * Validates WAV structure and asserts constraints against expected options.
 */
export function validateWavStructure(buffer, options = {}) {
  const result = parseWav(buffer);
  const { expectedChannels, expectedSampleRate, maxClipping = 0, disallowSilence = false } = options;

  if (expectedChannels !== undefined && result.fmt.numChannels !== expectedChannels) {
    throw new Error(`WAV Channel mismatch: expected ${expectedChannels}, got ${result.fmt.numChannels}`);
  }
  if (expectedSampleRate !== undefined && result.fmt.sampleRate !== expectedSampleRate) {
    throw new Error(`WAV SampleRate mismatch: expected ${expectedSampleRate}, got ${result.fmt.sampleRate}`);
  }
  if (result.metrics.clippingCount > maxClipping) {
    throw new Error(`WAV Clipping detected: ${result.metrics.clippingCount} clipped samples found`);
  }
  if (disallowSilence && result.metrics.isSilent) {
    throw new Error(`WAV contains only silence (RMS: ${result.metrics.rms.toFixed(6)})`);
  }

  return result;
}

/**
 * Helper to generate a valid test 16-bit PCM WAV buffer.
 */
export function createTestWavBuffer({
  numChannels = 2,
  sampleRate = 44100,
  durationSeconds = 0.5,
  frequency = 440,
  amplitude = 0.5
} = {}) {
  const bytesPerSample = 2;
  const totalFrames = Math.floor(sampleRate * durationSeconds);
  const dataSize = totalFrames * numChannels * bytesPerSample;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buf = Buffer.alloc(totalSize);

  // RIFF
  buf.write('RIFF', 0);
  buf.writeUInt32LE(totalSize - 8, 4);
  buf.write('WAVE', 8);

  // fmt
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE((sampleRate * numChannels * 16) / 8, 28);
  buf.writeUInt16LE((numChannels * 16) / 8, 32);
  buf.writeUInt16LE(16, 34);

  // data
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < totalFrames; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t) * amplitude;
    const intSample = Math.max(-32768, Math.min(32767, Math.round(sample * 32767)));

    for (let c = 0; c < numChannels; c++) {
      buf.writeInt16LE(intSample, offset);
      offset += 2;
    }
  }

  return buf;
}
