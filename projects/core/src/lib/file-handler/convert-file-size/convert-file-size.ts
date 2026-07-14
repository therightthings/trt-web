import { roundToDecimals } from '../../utils';
import { FILE_SIZE_UNIT_FACTORS, FileSizeUnit } from './convert-file-size.type';

export function convertFileSize(
  value: number,
  unit: `${FileSizeUnit}:${FileSizeUnit}`,
  config?: {
    decimalPlaces?: number;
  },
): number {
  if (!Number.isFinite(value)) {
    throw new Error('value must be a finite number');
  }

  const { decimalPlaces = 2 } = config ?? {};

  if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0) {
    throw new Error('decimalPlaces must be a non-negative integer');
  }

  const [sourceUnit, targetUnit] = unit.split(':') as [FileSizeUnit, FileSizeUnit];
  const sourceFactor = FILE_SIZE_UNIT_FACTORS[sourceUnit];
  const targetFactor = FILE_SIZE_UNIT_FACTORS[targetUnit];
  const convertedValue = (value * sourceFactor) / targetFactor;

  return roundToDecimals(convertedValue, decimalPlaces);
}
