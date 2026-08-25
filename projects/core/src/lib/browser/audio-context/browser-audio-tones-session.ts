import type {
  BrowserAudioContextAnalyserOptions,
  BrowserAudioToneSessionOptions,
  BrowserAudioToneSessionState,
} from './browser-audio-context.type';

export class BrowserAudioTonesSession {
  private analyser?: AnalyserNode;
  private readonly oscillators: OscillatorNode[] = [];
  private readonly gains: GainNode[] = [];
  private completionTimer?: number;
  private completion?: () => void;
  private currentState: BrowserAudioToneSessionState = 'idle';

  constructor(
    private readonly audioContext: AudioContext,
    private readonly options: BrowserAudioToneSessionOptions,
    private readonly onStopped?: () => void,
  ) {}

  get state(): BrowserAudioToneSessionState {
    return this.currentState;
  }

  async play(): Promise<boolean> {
    if (this.currentState === 'playing') {
      this.stop();
    }

    if (this.options.tones.length === 0) {
      return false;
    }

    const startTime = this.audioContext.currentTime;
    let offsetMs = 0;

    try {
      this.options.tones.forEach((tone, index) => {
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const startAt = startTime + offsetMs / 1000;
        const endAt = startAt + tone.durationMs / 1000;

        oscillator.type = tone.type ?? 'sine';
        oscillator.frequency.value = tone.frequency ?? 440;
        oscillator.detune.value = tone.detune ?? 0;
        gain.gain.value = tone.gain ?? 0.1;
        oscillator.connect(gain);
        this.connectGain(gain);
        oscillator.start(startAt);
        oscillator.stop(endAt);
        oscillator.onended = () => {
          this.disconnectNode(oscillator);
          if (index === this.options.tones.length - 1) {
            this.finish();
          }
        };

        this.oscillators.push(oscillator);
        this.gains.push(gain);
        offsetMs += tone.durationMs + (tone.gapMs ?? 0);
      });

      this.currentState = 'playing';
      this.completionTimer = window.setTimeout(() => this.finish(), offsetMs);
      return true;
    } catch {
      this.stop();
      return false;
    }
  }

  stop(): void {
    if (this.completionTimer !== undefined) {
      window.clearTimeout(this.completionTimer);
      this.completionTimer = undefined;
    }

    this.oscillators.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch {
        // The oscillator may already have ended.
      }
      this.disconnectNode(oscillator);
    });
    this.gains.forEach((gain) => this.disconnectNode(gain));
    this.oscillators.length = 0;
    this.gains.length = 0;
    this.currentState = 'stopped';
    this.onStopped?.();
  }

  createAnalyser(options: BrowserAudioContextAnalyserOptions = {}): AnalyserNode | undefined {
    try {
      const analyser = this.audioContext.createAnalyser();
      if (options.fftSize) analyser.fftSize = options.fftSize;
      if (options.minDecibels !== undefined) analyser.minDecibels = options.minDecibels;
      if (options.maxDecibels !== undefined) analyser.maxDecibels = options.maxDecibels;
      if (options.smoothingTimeConstant !== undefined) {
        analyser.smoothingTimeConstant = options.smoothingTimeConstant;
      }

      this.analyser?.disconnect();
      this.analyser = analyser;
      analyser.connect(this.audioContext.destination);
      this.gains.forEach((gain) => {
        gain.disconnect();
        gain.connect(analyser);
      });
      return analyser;
    } catch {
      return undefined;
    }
  }

  getAnalyser(): AnalyserNode | undefined {
    return this.analyser;
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

  waitForCompletion(): Promise<void> {
    if (this.currentState !== 'playing') {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.completion = resolve;
    });
  }

  private connectGain(gain: GainNode): void {
    if (this.analyser) {
      gain.connect(this.analyser);
      return;
    }

    gain.connect(this.audioContext.destination);
  }

  private finish(): void {
    if (this.currentState !== 'playing') return;
    this.completionTimer = undefined;
    this.currentState = 'stopped';
    this.gains.forEach((gain) => this.disconnectNode(gain));
    this.gains.length = 0;
    this.oscillators.length = 0;
    this.completion?.();
    this.completion = undefined;
    this.onStopped?.();
  }

  private disconnectNode(node: AudioNode): void {
    try {
      node.disconnect();
    } catch {
      // The node may already be disconnected.
    }
  }
}
