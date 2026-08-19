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
export type BrowserAudioContextOscillatorOptions = {
  type?: OscillatorType;
  frequency?: number;
  detune?: number;
};
export type BrowserAudioContextToneOptions = BrowserAudioContextOscillatorOptions & {
  gain?: number;
  durationMs?: number;
};
export type BrowserAudioWaveformOptions = {
  samples?: number;
  channel?: number;
};
