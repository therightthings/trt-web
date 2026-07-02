export type TimeUnit = 'millisecond' | 'second' | 'minute' | 'hour' | 'day';
export interface TimeConfig {
  value: number;
  unit?: TimeUnit;
}
