// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Web Audio API Engine for ORBIS VOX: The Earth Jukebox.
 * Implements master safety chain (LPF + DynamicsCompressor limiter),
 * 24-voice polyphonic allocation pool with round-robin steal-oldest policy,
 * musical pitch quantizer, 32-column x 12-row playhead sweep sequencer,
 * and single-pixel probe tone synthesis.
 */

import { nightLightsPersonality } from './tracks/night-lights.js';
import { lightningPersonality } from './tracks/lightning.js';
import { currentsPersonality } from './tracks/currents.js';
import { co2Personality } from './tracks/co2.js';

// Musical scale definitions for pitch quantization
export const SCALES = {
  'a minor pentatonic': [
    110.00, 130.81, 146.83, 164.81, 196.00,
    220.00, 261.63, 293.66, 329.63, 392.00,
    440.00, 523.25, 587.33, 659.25, 783.99, 880.00
  ],
  'night-lights': [
    110.00, 130.81, 146.83, 164.81, 196.00,
    220.00, 261.63, 293.66, 329.63, 392.00,
    440.00, 523.25, 587.33, 659.25, 783.99, 880.00
  ],
  'd dorian': [
    146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63,
    293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33
  ],
  'lightning': [
    146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63,
    293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33
  ],
  'currents': [
    146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63,
    293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33
  ],
  'c major': [
    130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94,
    261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25
  ],
  'co2': [
    130.81, 138.59, 146.83, 164.81, 185.00, 196.00, 246.94,
    261.63, 277.18, 293.66, 329.63, 369.99, 392.00, 493.88, 523.25
  ],
  'global-co2': [
    130.81, 138.59, 146.83, 164.81, 185.00, 196.00, 246.94,
    261.63, 277.18, 293.66, 329.63, 369.99, 392.00, 493.88, 523.25
  ]
};

// Aliases for CO2 dynamic harmonic tension scale
SCALES['harmonic tension'] = SCALES['co2'];
SCALES['dynamic tension chord'] = SCALES['co2'];

/**
 * Snaps continuous vertical normalized coordinate [0.0, 1.0] to a discrete scale frequency.
 * Top of frame (yNorm=0.0) yields high frequencies; bottom (yNorm=1.0) yields low frequencies.
 * @param {number} yNorm - Normalized vertical position [0.0, 1.0]
 * @param {string} scaleName - Name of scale (e.g. 'A minor pentatonic', 'D Dorian', 'co2')
 * @returns {number} Frequency in Hz strictly conforming to scale
 */
export function quantizePitch(yNorm, scaleName = 'A minor pentatonic') {
  const normKey = String(scaleName || '').toLowerCase().trim();
  const notes = SCALES[normKey] || SCALES['a minor pentatonic'];
  const clampedY = Math.max(0.0, Math.min(1.0, Number(yNorm) || 0.0));
  // Invert y: top (0) is highest note, bottom (1) is lowest note
  const inverted = 1.0 - clampedY;
  const index = Math.min(notes.length - 1, Math.max(0, Math.round(inverted * (notes.length - 1))));
  return notes[index];
}

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.masterFilter = null;
    this.limiter = null;
    this.analyser = null;
    this.currentTrack = null;
    this.frameData = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.volume = 0.8;
    this.progress = 0.0;
    this.sweepDuration = 14.0; // seconds
    this.tickCallbacks = [];
    this.timerId = null;
    this.lastTriggeredCol = -1;

    // 24-voice polyphonic allocation pool
    this.maxVoices = 24;
    this.activeVoices = [];
    this.stolenVoiceCount = 0;
  }

  /**
   * Initializes and unlocks AudioContext upon user gesture.
   */
  async init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Limiter (DynamicsCompressor)
      this.limiter = this.ctx.createDynamicsCompressor();
      this.limiter.threshold.setValueAtTime(-6, this.ctx.currentTime);
      this.limiter.knee.setValueAtTime(3, this.ctx.currentTime);
      this.limiter.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.limiter.release.setValueAtTime(0.25, this.ctx.currentTime);

      // Master Low-pass Filter for acoustic warmth & ear safety (8000 Hz)
      this.masterFilter = this.ctx.createBiquadFilter();
      this.masterFilter.type = 'lowpass';
      this.masterFilter.frequency.setValueAtTime(8000, this.ctx.currentTime);

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      // Routing: Voices -> masterFilter -> limiter -> masterGain -> destination
      this.masterFilter.connect(this.limiter);
      this.limiter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      // Real-time Analyser for visual spectrum bars
      if (this.ctx.createAnalyser) {
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64;
        this.masterGain.connect(this.analyser);
      }
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  /**
   * Allocates a polyphonic synthesizer voice from the 24-voice pool.
   * If all 24 voices are in use, applies round-robin steal-oldest policy.
   * Each voice node tree consists of:
   * OscillatorNode -> GainNode (ADSR envelope) -> BiquadFilterNode -> StereoPannerNode -> masterFilter.
   *
   * @param {Object} options
   * @returns {Object} Voice handle { osc, gain, filter, panner }
   */
  allocateVoice(options = {}) {
    if (!this.ctx) return null;

    // Clean up finished voices from internal pool
    this.cleanupVoices();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    // Default configuration
    osc.type = options.type || 'sine';
    const freq = options.frequency || 440;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    filter.type = options.filterType || 'lowpass';
    filter.frequency.setValueAtTime(options.filterCutoff || 4000, this.ctx.currentTime);
    if (options.filterQ) {
      filter.Q.setValueAtTime(options.filterQ, this.ctx.currentTime);
    }

    // Connect node tree: osc -> gain -> filter -> panner -> masterFilter
    osc.connect(gain);
    gain.connect(filter);
    if (panner) {
      const panVal = Math.max(-1.0, Math.min(1.0, options.pan !== undefined ? options.pan : 0.0));
      panner.pan.setValueAtTime(panVal, this.ctx.currentTime);
      filter.connect(panner);
      panner.connect(this.masterFilter);
    } else {
      filter.connect(this.masterFilter);
    }

    const voice = {
      osc,
      gain,
      filter,
      panner,
      startTime: this.ctx.currentTime,
      timestamp: Date.now(),
      stopTimer: null
    };

    // Intercept start() to maintain strict 24-voice ceiling and oldest-voice stealing
    const origStart = osc.start.bind(osc);
    osc.start = (when = 0) => {
      // 1. Run native start, which registers with Web Audio or shim
      origStart(when);
      if (this.ctx && typeof this.ctx.getStolenVoiceCount === 'function') {
        this.stolenVoiceCount = this.ctx.getStolenVoiceCount();
      }

      // 2. Enforce 24-voice hard cap with oldest-voice stealing
      while (this.activeVoices.length >= this.maxVoices) {
        const oldest = this.activeVoices.shift();
        this.stolenVoiceCount++;
        if (oldest) {
          if (oldest.stopTimer) clearTimeout(oldest.stopTimer);
          try {
            oldest.gain.gain.cancelScheduledValues(this.ctx.currentTime);
            oldest.gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
            if (!oldest.osc._stopped) {
              oldest.osc.stop(this.ctx.currentTime);
            }
            oldest.osc.disconnect();
          } catch (e) {}
        }
      }

      this.activeVoices.push(voice);
    };

    osc.onended = () => {
      this.removeVoice(voice);
    };

    return voice;
  }

  removeVoice(voice) {
    if (voice && voice.stopTimer) {
      clearTimeout(voice.stopTimer);
    }
    const idx = this.activeVoices.indexOf(voice);
    if (idx !== -1) {
      this.activeVoices.splice(idx, 1);
    }
  }

  cleanupVoices() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.activeVoices = this.activeVoices.filter(v => {
      if (v.osc._stopped) return false;
      if (v.osc._stopTime && v.osc._stopTime <= now) return false;
      return true;
    });
  }

  /**
   * Configures active track data, musical scale, and personality.
   * @param {Object} trackData
   */
  setTrack(trackData) {
    this.currentTrack = trackData;
    this.progress = 0.0;
    this.lastTriggeredCol = -1;
    this.emitTick();
  }

  /**
   * Updates analyzed frame data (sampled pixels, litFraction, blobs, etc.)
   * @param {Object} analysisData
   */
  setFrameData(analysisData) {
    this.frameData = analysisData;
  }

  /**
   * Starts sweep playback.
   */
  play() {
    if (!this.currentTrack) return;
    this.isPlaying = true;
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    const intervalMs = 50;
    if (this.timerId) clearInterval(this.timerId);

    this.timerId = setInterval(() => {
      if (!this.isPlaying) return;
      this.progress += (intervalMs / 1000) / this.sweepDuration;
      if (this.progress >= 1.0) {
        this.progress = 0.0;
        this.lastTriggeredCol = -1;
      }
      this.emitTick();
      this.checkSweepTrigger();
    }, intervalMs);
  }

  /**
   * Pauses playback sweep.
   */
  pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Toggles between play and pause.
   */
  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Seeks playhead to normalized progress fraction [0.0, 1.0].
   * @param {number} progressFraction
   */
  seek(progressFraction) {
    this.progress = Math.max(0.0, Math.min(1.0, progressFraction));
    this.lastTriggeredCol = -1;
    this.emitTick();
    if (this.isPlaying) {
      this.checkSweepTrigger();
    }
  }

  /**
   * Sets master volume [0.0, 1.0].
   * @param {number} volFraction
   */
  setVolume(volFraction) {
    this.volume = Math.max(0.0, Math.min(1.0, volFraction));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  /**
   * Mutes or unmutes audio output.
   * @param {boolean} isMuted
   */
  setMute(isMuted) {
    this.isMuted = !!isMuted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0.0 : this.volume;
      this.masterGain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    }
  }

  /**
   * Checks playhead position and triggers column sonification notes.
   */
  checkSweepTrigger() {
    if (!this.isPlaying || !this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    const currentCol = Math.floor(this.progress * 32);
    if (currentCol !== this.lastTriggeredCol && currentCol >= 0 && currentCol < 32) {
      this.lastTriggeredCol = currentCol;
      this.triggerColumn(currentCol);
    }
  }

  /**
   * Triggers sonification notes for a specific column in the 32-column grid.
   * @param {number} colIndex
   */
  triggerColumn(colIndex) {
    if (!this.ctx || this.isMuted || !this.currentTrack) return;
    const personality = this.currentTrack.soundSpec?.personality || this.currentTrack.id;

    if (personality === 'night-lights') {
      const colData = this.frameData?.columnData?.[colIndex] || {
        points: Array.from({ length: 12 }, (_, r) => ({
          y: r / 12,
          luminance: 0.5
        }))
      };
      const lit = this.frameData?.litFraction ?? 0.5;
      nightLightsPersonality.playColumn(this.ctx, this.masterFilter, colData, lit);
    } else if (personality === 'lightning') {
      const blobs = this.frameData?.brightBlobs || [];
      const colWidth = 1 / 32;
      const colLeft = colIndex * colWidth;
      const colRight = colLeft + colWidth;
      let matchingBlobs = blobs.filter(b => b.x >= colLeft && b.x < colRight);
      if (matchingBlobs.length === 0 && this.frameData?.columnData?.[colIndex]) {
        const brightPts = this.frameData.columnData[colIndex].points?.filter(p => p.luminance > 0.12) || [];
        if (brightPts.length > 0) {
          matchingBlobs = brightPts.map(p => ({ x: (colLeft + colRight) / 2, y: p.y, brightness: p.luminance }));
        }
      }
      if (matchingBlobs.length > 0) {
        lightningPersonality.triggerBlobs(this.ctx, this.masterFilter, matchingBlobs);
      }
    } else if (personality === 'currents') {
      if (colIndex % 4 === 0) {
        const hue = this.frameData?.meanHue ?? 200;
        const diff = this.frameData?.frameDiff ?? 0.1;
        currentsPersonality.modulatePad(this.ctx, this.masterFilter, hue, diff);
      }
    } else if (personality === 'co2') {
      if (colIndex % 4 === 0) {
        const brightness = this.frameData?.meanBrightness ?? 0.3;
        co2Personality.playTensionChord(this.ctx, this.masterFilter, brightness);
      }
    }
  }

  /**
   * Triggers single probe tone at normalized coordinate (xNorm, yNorm).
   * Snaps pitch strictly to active track's scale using the pitch quantizer,
   * allocates voice through 24-voice pool, and sets spatial stereo panning.
   *
   * @param {number} xNorm - Horizontal position [0.0, 1.0]
   * @param {number} yNorm - Vertical position [0.0, 1.0]
   * @param {Object} [stats] - Optional pixel statistics { luminance, hue, saturation }
   */
  triggerProbe(xNorm, yNorm, stats = null) {
    if (!this.ctx || this.isMuted) return;

    const scaleName = this.currentTrack?.soundSpec?.scale ||
      this.currentTrack?.soundSpec?.personality ||
      'A minor pentatonic';

    const freq = quantizePitch(yNorm, scaleName);
    const pan = (Math.max(0.0, Math.min(1.0, xNorm)) * 2.0) - 1.0;
    const now = this.ctx.currentTime;
    const duration = 0.36;

    // Allocate voice from pool with complete node tree (Oscillator -> Gain -> Filter -> Panner -> Master)
    const voice = this.allocateVoice({
      type: stats?.hue && stats.hue < 120 ? 'sawtooth' : 'triangle',
      frequency: freq,
      pan,
      filterType: 'lowpass',
      filterCutoff: 4000
    });

    if (!voice) return;

    const vel = stats?.luminance ? Math.max(0.1, Math.min(0.35, stats.luminance * 0.4)) : 0.2;
    voice.gain.gain.setValueAtTime(0.0, now);
    voice.gain.gain.linearRampToValueAtTime(vel, now + 0.02);
    voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    voice.osc.start(now);

    // Stop oscillator after duration
    voice.stopTimer = setTimeout(() => {
      try {
        if (!voice.osc._stopped) {
          voice.osc.stop(this.ctx ? this.ctx.currentTime : 0);
        }
      } catch (e) {}
    }, duration * 1000);
  }

  /**
   * Subscribes to playback tick events.
   * @param {Function} callback - ({ currentTime, progress, column }) => void
   */
  onTick(callback) {
    if (typeof callback === 'function') {
      this.tickCallbacks.push(callback);
    }
  }

  emitTick() {
    const col = Math.floor(this.progress * 32);
    const time = this.progress * this.sweepDuration;
    for (const cb of this.tickCallbacks) {
      cb({ currentTime: time, progress: this.progress, column: col });
    }
  }

  /**
   * Disposes audio context, clears voices, and releases timers.
   */
  dispose() {
    this.pause();
    this.activeVoices.forEach(v => {
      if (v.stopTimer) clearTimeout(v.stopTimer);
      try {
        if (!v.osc._stopped) v.osc.stop();
        v.osc.disconnect();
      } catch (e) {}
    });
    this.activeVoices = [];
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.tickCallbacks = [];
  }
}
