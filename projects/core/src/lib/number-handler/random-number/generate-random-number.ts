export interface GenerateRandomNumberConfig {
  decimal?: boolean;
  decimalPlaces?: number;
}

export function generateRandomNumber(
  min: number,
  max: number,
  config?: GenerateRandomNumberConfig,
): number {
  let { decimal = false, decimalPlaces = 2 } = config ?? {};

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new Error('min and max must be finite numbers');
  }

  if (decimalPlaces < 0 || !Number.isInteger(decimalPlaces)) {
    throw new Error('decimalPlaces must be a non-negative integer');
  }

  if (!decimal && (!Number.isInteger(min) || !Number.isInteger(max))) {
    throw new Error('min and max must be integers');
  }

  if (max < min) {
    [min, max] = [max, min];
  }

  if (decimal) {
    const raw = Math.random() * (max - min) + min;
    return Number(raw.toFixed(decimalPlaces));
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}
