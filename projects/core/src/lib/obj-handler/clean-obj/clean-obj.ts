import { checkCircularReferences } from '../../utils';

function cleanValue(value: unknown): unknown {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    const cleaned = value.map((item) => cleanValue(item)).filter((item) => item !== undefined);

    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (
    value instanceof Date ||
    value instanceof RegExp ||
    value instanceof Map ||
    value instanceof Set
  ) {
    return value;
  }

  const result = Object.create(Object.getPrototypeOf(value));

  for (const [key, nestedValue] of Object.entries(value)) {
    const cleanedValue = cleanValue(nestedValue);

    if (cleanedValue !== undefined) {
      result[key] = cleanedValue;
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

export function cleanObj<T extends object>(obj: Partial<T>): Partial<T> {
  checkCircularReferences(obj);

  const cleaned = cleanValue(obj);

  if (cleaned && typeof cleaned === 'object') {
    return cleaned as Partial<T>;
  }

  return {};
}
