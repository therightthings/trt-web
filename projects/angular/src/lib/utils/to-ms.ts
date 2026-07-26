import { TimeConfig } from './time-config.type';

export function toMs(config: TimeConfig | number): number {
  if (typeof config === 'number') {
    return config;
  }

  const { value, unit } = config;
  const map: Record<string, number> = {
    millisecond: 1,
    second: 1000,
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
  };

  return value * (map[unit] || 1000);
}
