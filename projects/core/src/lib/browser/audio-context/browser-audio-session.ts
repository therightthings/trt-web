import { toError } from '../../utils';
import type {
  BrowserAudioContextAnalyserOptions,
  BrowserAudioWaveformOptions,
} from './browser-audio-context.type';

/**
 * Audio buffer playback and waveform helpers for one audio session.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode
 */
export class BrowserAudioSession {
  private analyser?: AnalyserNode;
  private bufferSource?: AudioBufferSourceNode;
  private playbackOffset = 0;
  private playbackStartedAt = 0;
  private playing = false;

  constructor(
    private readonly audioContext: AudioContext,
    private readonly buffer: AudioBuffer,
  ) {}

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

  play(): boolean {
    if (this.playing) {
      return false;
    }

    if (this.playbackOffset >= this.buffer.duration) {
      this.playbackOffset = 0;
    }

    const source = this.createBufferSource();
    const output = this.analyser ?? this.audioContext.destination;
    source.connect(output);
    if (this.analyser) {
      this.analyser.connect(this.audioContext.destination);
    }
    source.onended = () => this.handlePlaybackEnded(source);
    source.start(0, this.playbackOffset);
    this.playbackStartedAt = this.audioContext.currentTime - this.playbackOffset;
    this.playing = true;
    return true;
  }

  pause(): boolean {
    if (!this.playing || !this.bufferSource) {
      return false;
    }

    this.playbackOffset = Math.min(
      this.buffer.duration,
      Math.max(0, this.audioContext.currentTime - this.playbackStartedAt),
    );
    this.playing = false;
    this.stopNode(this.bufferSource, 'audio buffer source');
    this.bufferSource = undefined;
    return true;
  }

  resume(): boolean {
    return this.play();
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
    this.playing = false;
    this.stopNode(this.bufferSource, 'audio buffer source');
    this.bufferSource = undefined;
    this.playbackOffset = 0;
    this.playbackStartedAt = 0;
  }

  private createBufferSource(): AudioBufferSourceNode {
    const source = this.audioContext.createBufferSource();
    source.buffer = this.buffer;
    this.bufferSource = source;
    return source;
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

  private handlePlaybackEnded(source: AudioBufferSourceNode): void {
    if (this.bufferSource !== source) {
      return;
    }

    this.cleanupBufferSource(source);
    this.playing = false;
    this.playbackOffset = 0;
    this.playbackStartedAt = 0;
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
