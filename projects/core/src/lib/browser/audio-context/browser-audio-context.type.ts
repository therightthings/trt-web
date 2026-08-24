export type BrowserAudioContextWindow = Window & {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};
export type BrowserAudioContextAnalyserOptions = {
  fftSize?: number;
  minDecibels?: number;
  maxDecibels?: number;
  smoothingTimeConstant?: number;
};
export type BrowserAudioContextToneConfig = {
  type?: OscillatorType;
  frequency?: number;
  detune?: number;
  gain?: number;
  durationMs: number;
  gapMs?: number;
};

export type BrowserAudioContextToneSequenceOptions = {
  tones: BrowserAudioContextToneConfig[];
};
export type BrowserAudioWaveformOptions = {
  samples?: number;
  channel?: number;
};
