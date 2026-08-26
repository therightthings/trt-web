// Run: npx vitest run projects/core/src/lib/browser/audio-context/browser-audio-context.spec.ts
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BrowserAudioContext } from './browser-audio-context';

const createAudioContext = () => {
  const oscillator = {
    type: 'sine',
    frequency: { value: 440 },
    detune: { value: 0 },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn(),
  };
  const gain = {
    gain: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
  const analyser = {
    fftSize: 2048,
    frequencyBinCount: 1024,
    connect: vi.fn(),
    disconnect: vi.fn(),
    getByteTimeDomainData: vi.fn(),
    getByteFrequencyData: vi.fn(),
  };
  const bufferSource = {
    buffer: undefined,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    disconnect: vi.fn(),
    onended: null,
  };
  const context = {
    state: 'running',
    currentTime: 0,
    destination: {},
    createOscillator: vi.fn(() => oscillator),
    createGain: vi.fn(() => gain),
    createAnalyser: vi.fn(() => analyser),
    createBufferSource: vi.fn(() => bufferSource),
    resume: vi.fn(async () => undefined),
    suspend: vi.fn(async () => undefined),
    close: vi.fn(async () => undefined),
  };

  class AudioContextConstructor {
    constructor() {
      return context;
    }
  }

  return { context, oscillator, gain, bufferSource, AudioContextConstructor };
};

const stubBrowserShell = (AudioContextConstructor?: typeof AudioContext) => {
  vi.stubGlobal('document', {});
  vi.stubGlobal('window', {
    AudioContext: AudioContextConstructor,
    clearTimeout,
    setTimeout,
  });
};

afterEach(async () => {
  await BrowserAudioContext.getInstance().close();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('BrowserAudioContext', () => {
  const audioContext = BrowserAudioContext.getInstance();

  it('reports unsupported when AudioContext is unavailable', () => {
    stubBrowserShell();

    expect(BrowserAudioContext.isSupported()).toBe(false);
    expect(audioContext.getState()).toBeUndefined();
  });

  it('creates and reuses an AudioContext', async () => {
    const { context, AudioContextConstructor } = createAudioContext();
    stubBrowserShell(AudioContextConstructor as unknown as typeof AudioContext);

    await expect(audioContext.ready()).resolves.toBe(context);
    await expect(audioContext.ready()).resolves.toBe(context);
  });

  it('creates, plays and stops an audio session', async () => {
    const { context, bufferSource, AudioContextConstructor } = createAudioContext();
    stubBrowserShell(AudioContextConstructor as unknown as typeof AudioContext);

    await audioContext.ready();
    const session = audioContext.createAudioSession({} as AudioBuffer);
    session?.play();

    session?.stop();
    expect(context.createBufferSource).toHaveBeenCalledOnce();
    expect(bufferSource.start).toHaveBeenCalledOnce();
    expect(bufferSource.stop).toHaveBeenCalledOnce();
    expect(bufferSource.disconnect).toHaveBeenCalledOnce();
  });

  it('pauses and resumes an audio session from the current offset', async () => {
    const { context, bufferSource, AudioContextConstructor } = createAudioContext();
    const buffer = { duration: 10 } as AudioBuffer;
    stubBrowserShell(AudioContextConstructor as unknown as typeof AudioContext);

    await audioContext.ready();
    const session = audioContext.createAudioSession(buffer);

    expect(session?.play()).toBe(true);
    context.currentTime = 3;
    expect(session?.pause()).toBe(true);
    expect(bufferSource.stop).toHaveBeenCalledOnce();

    expect(session?.resume()).toBe(true);
    expect(bufferSource.start).toHaveBeenLastCalledWith(0, 3);

    session?.stop();
    expect(session?.resume()).toBe(true);
    expect(bufferSource.start).toHaveBeenLastCalledWith(0, 0);
  });

  it('plays a tone sequence', async () => {
    const { context, oscillator, gain, AudioContextConstructor } = createAudioContext();
    stubBrowserShell(AudioContextConstructor as unknown as typeof AudioContext);

    await audioContext.ready();
    await expect(
      audioContext.playTone({
        tones: [
          { frequency: 523, type: 'sine', gain: 0.08, durationMs: 0, gapMs: 0 },
          { frequency: 659, type: 'sine', gain: 0.08, durationMs: 0 },
        ],
      }),
    ).resolves.toBe(true);

    expect(context.createOscillator).toHaveBeenCalledTimes(2);
    expect(context.createGain).toHaveBeenCalledTimes(2);
    expect(oscillator.start).toHaveBeenCalledTimes(2);
    expect(oscillator.stop).toHaveBeenCalledTimes(2);
    expect(gain.connect).toHaveBeenCalledTimes(2);
  });

  it('creates an independent tone session with analyser data', async () => {
    const { context, oscillator, gain, AudioContextConstructor } = createAudioContext();
    stubBrowserShell(AudioContextConstructor as unknown as typeof AudioContext);

    await audioContext.ready();
    const session = audioContext.createToneSession({
      tones: [{ frequency: 523, durationMs: 100 }],
    });

    expect(session?.state).toBe('idle');
    expect(session?.createAnalyser({ fftSize: 256 })).toBeDefined();
    expect(session?.getFrequencyData()).toHaveLength(1024);
    expect(session?.getTimeDomainData()).toHaveLength(256);
    await expect(session?.play()).resolves.toBe(true);
    expect(session?.state).toBe('playing');

    session?.stop();
    expect(session?.state).toBe('stopped');
    expect(oscillator.stop).toHaveBeenCalled();
    expect(gain.disconnect).toHaveBeenCalled();
    expect(context.createAnalyser).toHaveBeenCalledOnce();
  });

  it('suspends, resumes and closes the context', async () => {
    const { context, AudioContextConstructor } = createAudioContext();
    stubBrowserShell(AudioContextConstructor as unknown as typeof AudioContext);
    await audioContext.ready();

    await expect(audioContext.suspend()).resolves.toBe(true);
    await expect(audioContext.resume()).resolves.toBe(true);
    await audioContext.close();

    expect(context.suspend).toHaveBeenCalledOnce();
    expect(context.resume).toHaveBeenCalledOnce();
    expect(context.close).toHaveBeenCalledOnce();
    expect(audioContext.getState()).toBeUndefined();
  });
});
