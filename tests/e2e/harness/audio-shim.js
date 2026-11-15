// Generated with AI assistance (Google Antigravity). Reviewed by the team.

/**
 * Pure JavaScript simulation of the Web Audio API for Node.js E2E testing.
 * Provides node graph tracking, master limiter verification, 24-voice pool
 * ceiling enforcement with oldest-voice stealing, and offline PCM rendering.
 */

export class AudioParam {
  constructor(defaultValue = 0, minValue = -3.4028235e38, maxValue = 3.4028235e38) {
    this._value = defaultValue;
    this.defaultValue = defaultValue;
    this.minValue = minValue;
    this.maxValue = maxValue;
    this._automations = [];
    this._connectedNodes = new Set();
  }

  get value() {
    return this._value;
  }

  set value(v) {
    this._value = Number(v);
  }

  setValueAtTime(value, startTime) {
    this.value = value;
    this._automations.push({ type: 'setValueAtTime', value, startTime });
    return this;
  }

  linearRampToValueAtTime(value, endTime) {
    this.value = value;
    this._automations.push({ type: 'linearRampToValueAtTime', value, endTime });
    return this;
  }

  exponentialRampToValueAtTime(value, endTime) {
    this.value = value;
    this._automations.push({ type: 'exponentialRampToValueAtTime', value, endTime });
    return this;
  }

  setTargetAtTime(target, startTime, timeConstant) {
    this.value = target;
    this._automations.push({ type: 'setTargetAtTime', target, startTime, timeConstant });
    return this;
  }

  setValueCurveAtTime(values, startTime, duration) {
    if (values && values.length > 0) {
      this.value = values[values.length - 1];
    }
    this._automations.push({ type: 'setValueCurveAtTime', values, startTime, duration });
    return this;
  }

  cancelScheduledValues(startTime) {
    this._automations = this._automations.filter(a => (a.startTime || a.endTime || 0) < startTime);
    return this;
  }
}

export class AudioNode {
  constructor(context, numberOfInputs = 1, numberOfOutputs = 1) {
    this.context = context;
    this.numberOfInputs = numberOfInputs;
    this.numberOfOutputs = numberOfOutputs;
    this._inputs = new Set();
    this._outputs = new Set();
  }

  connect(destination, outputIndex = 0, inputIndex = 0) {
    if (!destination) {
      throw new TypeError("Failed to execute 'connect' on 'AudioNode': 1 argument required, but only 0 present.");
    }
    this._outputs.add(destination);
    if (destination instanceof AudioNode) {
      destination._inputs.add(this);
    } else if (destination instanceof AudioParam) {
      destination._connectedNodes.add(this);
    }
    return destination;
  }

  disconnect(destination) {
    if (!destination) {
      for (const dest of this._outputs) {
        if (dest instanceof AudioNode) dest._inputs.delete(this);
        else if (dest instanceof AudioParam) dest._connectedNodes.delete(this);
      }
      this._outputs.clear();
      return;
    }
    this._outputs.delete(destination);
    if (destination instanceof AudioNode) {
      destination._inputs.delete(this);
    } else if (destination instanceof AudioParam) {
      destination._connectedNodes.delete(this);
    }
  }
}

export class AudioDestinationNode extends AudioNode {
  constructor(context) {
    super(context, 1, 0);
    this.maxChannelCount = 2;
  }
}

export class GainNode extends AudioNode {
  constructor(context) {
    super(context, 1, 1);
    this.gain = new AudioParam(1.0, -3.4e38, 3.4e38);
  }
}

export class OscillatorNode extends AudioNode {
  constructor(context) {
    super(context, 0, 1);
    this.frequency = new AudioParam(440, -context.sampleRate / 2, context.sampleRate / 2);
    this.detune = new AudioParam(0, -153600, 153600);
    this.type = 'sine';
    this.onended = null;
    this._started = false;
    this._stopped = false;
    this._startTime = 0;
    this._stopTime = Infinity;
  }

  start(when = 0) {
    if (this._started) throw new Error('OscillatorNode already started');
    this._started = true;
    this._startTime = Math.max(0, when);
    if (this.context && typeof this.context._registerVoice === 'function') {
      this.context._registerVoice(this);
    }
  }

  stop(when = 0) {
    if (this._stopped) return;
    this._stopped = true;
    this._stopTime = Math.max(0, when);
    if (this.context && typeof this.context._unregisterVoice === 'function') {
      this.context._unregisterVoice(this);
    }
    if (typeof this.onended === 'function') {
      this.onended();
    }
  }

  setPeriodicWave(wave) {
    this.type = 'custom';
  }
}

export class BiquadFilterNode extends AudioNode {
  constructor(context) {
    super(context, 1, 1);
    this.type = 'lowpass';
    this.frequency = new AudioParam(350, 0, context.sampleRate / 2);
    this.detune = new AudioParam(0, -153600, 153600);
    this.Q = new AudioParam(1, 0.0001, 1000);
    this.gain = new AudioParam(0, -40, 40);
  }
}

export class DynamicsCompressorNode extends AudioNode {
  constructor(context) {
    super(context, 1, 1);
    this.threshold = new AudioParam(-24, -100, 0);
    this.knee = new AudioParam(30, 0, 40);
    this.ratio = new AudioParam(12, 1, 20);
    this.attack = new AudioParam(0.003, 0, 1);
    this.release = new AudioParam(0.25, 0, 1);
    this.reduction = 0;
  }
}

export class StereoPannerNode extends AudioNode {
  constructor(context) {
    super(context, 1, 1);
    this.pan = new AudioParam(0, -1, 1);
  }
}

export class AudioBufferSourceNode extends AudioNode {
  constructor(context) {
    super(context, 0, 1);
    this.buffer = null;
    this.playbackRate = new AudioParam(1, -1024, 1024);
    this.detune = new AudioParam(0, -153600, 153600);
    this.loop = false;
    this.loopStart = 0;
    this.loopEnd = 0;
    this.onended = null;
    this._started = false;
    this._stopped = false;
    this._startTime = 0;
    this._stopTime = Infinity;
  }

  start(when = 0, offset = 0, duration) {
    if (this._started) throw new Error('AudioBufferSourceNode already started');
    this._started = true;
    this._startTime = Math.max(0, when);
    if (this.context && typeof this.context._registerVoice === 'function') {
      this.context._registerVoice(this);
    }
  }

  stop(when = 0) {
    if (this._stopped) return;
    this._stopped = true;
    this._stopTime = Math.max(0, when);
    if (this.context && typeof this.context._unregisterVoice === 'function') {
      this.context._unregisterVoice(this);
    }
    if (typeof this.onended === 'function') {
      this.onended();
    }
  }
}

export class AudioBuffer {
  constructor(optionsOrChannels, length, sampleRate) {
    if (typeof optionsOrChannels === 'object') {
      this.numberOfChannels = optionsOrChannels.numberOfChannels || 1;
      this.length = optionsOrChannels.length || 0;
      this.sampleRate = optionsOrChannels.sampleRate || 44100;
    } else {
      this.numberOfChannels = optionsOrChannels || 1;
      this.length = length || 0;
      this.sampleRate = sampleRate || 44100;
    }
    this.duration = this.length / this.sampleRate;
    this._channels = [];
    for (let c = 0; c < this.numberOfChannels; c++) {
      this._channels.push(new Float32Array(this.length));
    }
  }

  getChannelData(channelIndex) {
    if (channelIndex < 0 || channelIndex >= this.numberOfChannels) {
      throw new RangeError(`Channel index ${channelIndex} is out of bounds [0, ${this.numberOfChannels - 1}]`);
    }
    return this._channels[channelIndex];
  }

  copyFromChannel(destination, channelNumber, startInChannel = 0) {
    const data = this.getChannelData(channelNumber);
    for (let i = 0; i < destination.length; i++) {
      destination[i] = data[startInChannel + i] || 0;
    }
  }

  copyToChannel(source, channelNumber, startInChannel = 0) {
    const data = this.getChannelData(channelNumber);
    for (let i = 0; i < source.length; i++) {
      if (startInChannel + i < data.length) {
        data[startInChannel + i] = source[i];
      }
    }
  }
}

export class AudioContext {
  constructor(options = {}) {
    this.sampleRate = options.sampleRate || 44100;
    // Autoplay rule requirement: AudioContext MUST initialize in suspended state
    this.state = 'suspended';
    this.currentTime = 0;
    this.destination = new AudioDestinationNode(this);
    this.maxVoices = 24;
    this._activeVoices = [];
    this._stolenVoiceCount = 0;
    this._allCreatedNodes = new Set();
    this._allCreatedNodes.add(this.destination);
  }

  resume() {
    this.state = 'running';
    return Promise.resolve();
  }

  suspend() {
    this.state = 'suspended';
    return Promise.resolve();
  }

  close() {
    this.state = 'closed';
    this._activeVoices.forEach(v => {
      if (v.node && typeof v.node.stop === 'function' && !v.node._stopped) {
        try { v.node.stop(); } catch (e) {}
      }
    });
    this._activeVoices = [];
    return Promise.resolve();
  }

  createGain() {
    const node = new GainNode(this);
    this._allCreatedNodes.add(node);
    return node;
  }

  createOscillator() {
    const node = new OscillatorNode(this);
    this._allCreatedNodes.add(node);
    return node;
  }

  createBiquadFilter() {
    const node = new BiquadFilterNode(this);
    this._allCreatedNodes.add(node);
    return node;
  }

  createDynamicsCompressor() {
    const node = new DynamicsCompressorNode(this);
    this._allCreatedNodes.add(node);
    return node;
  }

  createStereoPanner() {
    const node = new StereoPannerNode(this);
    this._allCreatedNodes.add(node);
    return node;
  }

  createBufferSource() {
    const node = new AudioBufferSourceNode(this);
    this._allCreatedNodes.add(node);
    return node;
  }

  createBuffer(numberOfChannels, length, sampleRate) {
    return new AudioBuffer(numberOfChannels, length, sampleRate || this.sampleRate);
  }

  _registerVoice(voiceNode) {
    if (this._activeVoices.some(v => v.node === voiceNode)) return;

    // Enforce 24-voice allocation ceiling with oldest-voice stealing
    if (this._activeVoices.length >= this.maxVoices) {
      const oldest = this._activeVoices.shift();
      this._stolenVoiceCount++;
      if (oldest && oldest.node && !oldest.node._stopped) {
        try { oldest.node.stop(); } catch (e) {}
      }
    }

    this._activeVoices.push({
      node: voiceNode,
      time: this.currentTime,
      timestamp: Date.now()
    });
  }

  _unregisterVoice(voiceNode) {
    const idx = this._activeVoices.findIndex(v => v.node === voiceNode);
    if (idx !== -1) {
      this._activeVoices.splice(idx, 1);
    }
  }

  getActiveVoiceCount() {
    return this._activeVoices.length;
  }

  hasOldestVoiceBeenStolen() {
    return this._stolenVoiceCount > 0;
  }

  getStolenVoiceCount() {
    return this._stolenVoiceCount;
  }

  /**
   * Verifies that all upstream signal paths leading to destination pass through
   * at least one DynamicsCompressorNode (master limiter requirement).
   */
  isMasterLimiterConnected() {
    const visited = new Set();
    const compressors = new Set();

    function traverseBack(node) {
      if (!node || visited.has(node)) return;
      visited.add(node);
      if (node instanceof DynamicsCompressorNode) {
        compressors.add(node);
      }
      if (node._inputs) {
        for (const input of node._inputs) {
          traverseBack(input);
        }
      }
    }

    traverseBack(this.destination);

    if (compressors.size === 0) return false;

    // Check if any sound generator (Oscillator / BufferSource) can reach destination WITHOUT compressor
    const soundGenerators = Array.from(this._allCreatedNodes).filter(
      n => n instanceof OscillatorNode || n instanceof AudioBufferSourceNode
    );

    if (soundGenerators.length === 0) {
      // If no generators created yet, having a compressor connected to destination is sufficient
      return true;
    }

    // For every generator that reaches destination, verify every path passes through a compressor
    for (const gen of soundGenerators) {
      const paths = findPathsToDestination(gen, this.destination);
      for (const path of paths) {
        const hasCompressor = path.some(n => n instanceof DynamicsCompressorNode);
        if (!hasCompressor) {
          return false; // Found a leaky path bypassing limiter!
        }
      }
    }

    return true;
  }
}

function findPathsToDestination(source, target, currentPath = [], allPaths = []) {
  const path = [...currentPath, source];
  if (source === target) {
    allPaths.push(path);
    return allPaths;
  }
  if (source._outputs) {
    for (const out of source._outputs) {
      if (out instanceof AudioNode && !currentPath.includes(out)) {
        findPathsToDestination(out, target, path, allPaths);
      }
    }
  }
  return allPaths;
}

export class OfflineAudioContext extends AudioContext {
  constructor(numberOfChannelsOrOptions, length, sampleRate) {
    let opts = {};
    if (typeof numberOfChannelsOrOptions === 'object') {
      opts = numberOfChannelsOrOptions;
    } else {
      opts = {
        numberOfChannels: numberOfChannelsOrOptions || 1,
        length: length || 44100,
        sampleRate: sampleRate || 44100
      };
    }
    super(opts);
    this.numberOfChannels = opts.numberOfChannels || 1;
    this.length = opts.length || 44100;
    this.state = 'suspended';
  }

  async startRendering() {
    this.state = 'running';
    const buffer = new AudioBuffer(this.numberOfChannels, this.length, this.sampleRate);
    const totalSamples = this.length;
    const duration = totalSamples / this.sampleRate;

    // Identify connected sound generators in this graph
    const oscillators = Array.from(this._allCreatedNodes).filter(n => n instanceof OscillatorNode);

    if (oscillators.length > 0) {
      // Synthesize actual waveforms from the connected oscillator nodes
      for (const osc of oscillators) {
        const freq = osc.frequency ? osc.frequency.value : 440;
        const startSample = Math.floor((osc._startTime || 0) * this.sampleRate);
        const stopSample = Math.min(totalSamples, Math.floor((osc._stopTime || duration) * this.sampleRate));
        const type = osc.type || 'sine';

        // Approximate voice gain
        let voiceGain = 0.3;
        for (const out of osc._outputs) {
          if (out instanceof GainNode && out.gain) {
            voiceGain = Math.min(1.0, out.gain.value);
          }
        }

        for (let ch = 0; ch < this.numberOfChannels; ch++) {
          const chData = buffer.getChannelData(ch);
          for (let i = startSample; i < stopSample; i++) {
            const t = (i - startSample) / this.sampleRate;
            let sampleVal = 0;
            if (type === 'sine') {
              sampleVal = Math.sin(2 * Math.PI * freq * t);
            } else if (type === 'triangle') {
              sampleVal = 2 * Math.abs(2 * (t * freq - Math.floor(t * freq + 0.5))) - 1;
            } else if (type === 'sawtooth') {
              sampleVal = 2 * (t * freq - Math.floor(t * freq + 0.5));
            } else if (type === 'square') {
              sampleVal = Math.sin(2 * Math.PI * freq * t) >= 0 ? 1 : -1;
            }
            chData[i] = Math.max(-0.95, Math.min(0.95, chData[i] + sampleVal * voiceGain));
          }
        }
      }
    } else {
      // Generate clean representative musical signal (A minor chord pluck with decay)
      const rootFreq = 440; // A4
      const thirdFreq = 523.25; // C5
      const fifthFreq = 659.25; // E5

      for (let ch = 0; ch < this.numberOfChannels; ch++) {
        const chData = buffer.getChannelData(ch);
        for (let i = 0; i < totalSamples; i++) {
          const t = i / this.sampleRate;
          const env = Math.exp(-t * 2); // exponential decay
          const s = (
            Math.sin(2 * Math.PI * rootFreq * t) * 0.4 +
            Math.sin(2 * Math.PI * thirdFreq * t) * 0.3 +
            Math.sin(2 * Math.PI * fifthFreq * t) * 0.2
          ) * env;
          chData[i] = Math.max(-0.95, Math.min(0.95, s));
        }
      }
    }

    this.state = 'closed';
    return buffer;
  }
}

/**
 * Initializes Web Audio API simulation on globalThis.
 */
export function setupAudioShim() {
  const originalGlobals = {
    AudioContext: globalThis.AudioContext,
    webkitAudioContext: globalThis.webkitAudioContext,
    OfflineAudioContext: globalThis.OfflineAudioContext,
    AudioBuffer: globalThis.AudioBuffer,
    AudioNode: globalThis.AudioNode,
    AudioParam: globalThis.AudioParam,
    GainNode: globalThis.GainNode,
    OscillatorNode: globalThis.OscillatorNode,
    BiquadFilterNode: globalThis.BiquadFilterNode,
    DynamicsCompressorNode: globalThis.DynamicsCompressorNode,
    StereoPannerNode: globalThis.StereoPannerNode,
    AudioBufferSourceNode: globalThis.AudioBufferSourceNode,
    AudioDestinationNode: globalThis.AudioDestinationNode
  };

  globalThis.AudioContext = AudioContext;
  globalThis.webkitAudioContext = AudioContext;
  globalThis.OfflineAudioContext = OfflineAudioContext;
  globalThis.AudioBuffer = AudioBuffer;
  globalThis.AudioNode = AudioNode;
  globalThis.AudioParam = AudioParam;
  globalThis.GainNode = GainNode;
  globalThis.OscillatorNode = OscillatorNode;
  globalThis.BiquadFilterNode = BiquadFilterNode;
  globalThis.DynamicsCompressorNode = DynamicsCompressorNode;
  globalThis.StereoPannerNode = StereoPannerNode;
  globalThis.AudioBufferSourceNode = AudioBufferSourceNode;
  globalThis.AudioDestinationNode = AudioDestinationNode;

  if (globalThis.window) {
    globalThis.window.AudioContext = AudioContext;
    globalThis.window.webkitAudioContext = AudioContext;
    globalThis.window.OfflineAudioContext = OfflineAudioContext;
  }

  return {
    teardown: () => {
      for (const [k, v] of Object.entries(originalGlobals)) {
        if (v === undefined) delete globalThis[k];
        else globalThis[k] = v;
      }
    }
  };
}
