import { roundToDecimals } from '../../utils';

export interface FormatViewCountConfig {
  decimalPlaces?: number;
  uppercase?: boolean;
}

export function formatViewCount(value: number, config?: FormatViewCountConfig): string {
  const { uppercase = false } = config ?? {};
  let decimalPlaces = config?.decimalPlaces ?? 1;

  if (decimalPlaces < 0) {
    decimalPlaces = 1;
  }

  if (value < 1000) {
    return value.toString();
  }

  let suffixes: string[] = ['', 'k', 'm', 'b', 't'];
  if (uppercase) {
    suffixes = suffixes.map((s) => s.toUpperCase());
  }

  let suffixIndex: number = 0;
  let shortValue: number = value;

  while (shortValue >= 1000 && suffixIndex < suffixes.length - 1) {
    shortValue /= 1000;
    suffixIndex++;
  }

  shortValue = roundToDecimals(shortValue, decimalPlaces);

  while (shortValue >= 1000 && suffixIndex < suffixes.length - 1) {
    shortValue /= 1000;
    suffixIndex++;
    shortValue = roundToDecimals(shortValue, decimalPlaces);
  }

  return `${shortValue}${suffixes[suffixIndex]}`;
}
