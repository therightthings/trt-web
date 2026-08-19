import { toError } from '../../utils';
import type {
  BrowserAudioContextAnalyserOptions,
  BrowserAudioContextOscillatorOptions,
  BrowserAudioContextToneOptions,
  BrowserAudioWaveformOptions,
} from './browser-audio-context.type';

/**
 * Audio buffer playback and waveform helpers for one audio session.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
 */
export class BrowserAudioSession {
  private analyser?: AnalyserNode;
  private gainNode?: GainNode;
  private mediaStreamSource?: MediaStreamAudioSourceNode;
  private oscillator?: OscillatorNode;
  private bufferSource?: AudioBufferSourceNode;
  private toneTimeout?: number;

  constructor(
    private readonly audioContext: AudioContext,
    private readonly buffer: AudioBuffer,
  ) {}

  createGain(value = 1): GainNode {
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = value;
    this.gainNode = gainNode;
    return gainNode;
  }

  createAnalyser(options: BrowserAudioContextAnalyserOptions = {}): AnalyserNode {
    const analyser = this.audioContext.createAnalyser();
    if (options.fftSize) analyser.fftSize = options.fftSize;
    if (options.minDecibels !== undefined) analyser.minDecibels = options.minDecibels;
    if (options.maxDecibels !== undefined) analyser.maxDecibels = options.maxDecibels;
    if (options.smoothingTimeConstant !== undefined) {
      analyser.smoothingTimeConstant = options.smoothingTimeConstant;
    }
    this.analyser = analyser;
    return analyser;
  }

  createOscillator(options: BrowserAudioContextOscillatorOptions = {}): OscillatorNode {
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = options.type ?? 'sine';
    oscillator.frequency.value = options.frequency ?? 440;
    oscillator.detune.value = options.detune ?? 0;
    this.oscillator = oscillator;
    return oscillator;
  }

  createBufferSource(): AudioBufferSourceNode {
    const source = this.audioContext.createBufferSource();
    source.buffer = this.buffer;
    this.bufferSource = source;
    return source;
  }

  getWaveformData(options: BrowserAudioWaveformOptions = {}): Float32Array | undefined {
    const channel = options.channel ?? 0;
    const samples = Math.max(1, Math.floor(options.samples ?? 1000));

    if (channel < 0 || channel >= this.buffer.numberOfChannels) {
      return undefined;
    }

    const channelData = this.buffer.getChannelData(channel);
    const waveform = new Float32Array(samples);
    const bucketSize = channelData.length / samples;

    for (let index = 0; index < samples; index += 1) {
      const start = Math.floor(index * bucketSize);
      const end = Math.min(channelData.length, Math.ceil((index + 1) * bucketSize));
      let peak = 0;

      for (let offset = start; offset < end; offset += 1) {
        peak = Math.max(peak, Math.abs(channelData[offset]));
      }

      waveform[index] = peak;
    }

    return waveform;
  }

  play(): void {
    const source = this.createBufferSource();
    const output = this.analyser ?? this.audioContext.destination;
    source.connect(output);
    if (this.analyser) {
      this.analyser.connect(this.audioContext.destination);
    }
    source.onended = () => this.cleanupBufferSource(source);
    source.start();
  }

  async playTone(options: BrowserAudioContextToneOptions = {}): Promise<boolean> {
    this.stop();
    const gainNode = this.gainNode ?? this.createGain(options.gain ?? 0.1);
    gainNode.gain.value = options.gain ?? 0.1;
    const oscillator = this.createOscillator(options);
    oscillator.connect(gainNode);
    gainNode.connect(this.analyser ?? this.audioContext.destination);
    if (this.analyser) this.analyser.connect(this.audioContext.destination);
    oscillator.start();
    if (options.durationMs && options.durationMs > 0) {
      this.toneTimeout = window.setTimeout(() => this.stop(), options.durationMs);
    }
    return true;
  }

  connectMediaStream(stream: MediaStream): MediaStreamAudioSourceNode {
    this.disconnectMediaStream();
    const source = this.audioContext.createMediaStreamSource(stream);
    this.mediaStreamSource = source;
    return source;
  }

  connectAnalyserToDestination(): void {
    this.analyser?.connect(this.audioContext.destination);
  }

  getFrequencyData(): Uint8Array | undefined {
    if (!this.analyser) return undefined;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  getTimeDomainData(): Uint8Array | undefined {
    if (!this.analyser) return undefined;
    const data = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  stop(): void {
    if (this.toneTimeout !== undefined) {
      window.clearTimeout(this.toneTimeout);
      this.toneTimeout = undefined;
    }
    this.stopNode(this.oscillator, 'oscillator');
    this.stopNode(this.bufferSource, 'audio buffer source');
    this.oscillator = undefined;
    this.bufferSource = undefined;
    this.disconnectMediaStream();
  }

  disconnectMediaStream(): void {
    if (!this.mediaStreamSource) return;
    try {
      this.mediaStreamSource.disconnect();
    } catch (error) {
      console.error(toError(error, 'Could not disconnect media stream.'));
    }
    this.mediaStreamSource = undefined;
  }

  private cleanupBufferSource(source: AudioBufferSourceNode): void {
    if (this.bufferSource !== source) return;
    try {
      source.disconnect();
    } catch (error) {
      console.error(toError(error, 'Could not disconnect audio buffer source.'));
    }
    this.bufferSource = undefined;
  }

  private stopNode(node: AudioScheduledSourceNode | undefined, label: string): void {
    if (!node) return;
    try {
      node.stop();
    } catch (error) {
      console.error(toError(error, `Could not stop ${label}.`));
    }
    try {
      node.disconnect();
    } catch (error) {
      console.error(toError(error, `Could not disconnect ${label}.`));
    }
  }
}
