import { checkCircularReferences } from '../../utils';

function buildValueKey(value: unknown, symbolIds = new Map<symbol, number>()): string {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'string') return `string:${value}`;
  if (typeof value === 'number') return `number:${Number.isNaN(value) ? 'NaN' : value}`;
  if (typeof value === 'boolean') return `boolean:${value}`;
  if (typeof value === 'bigint') return `bigint:${value.toString()}`;
  if (typeof value === 'undefined') return 'undefined';
  if (typeof value === 'symbol') {
    const symbolId = symbolIds.get(value);

    if (symbolId) {
      return `symbol:${symbolId}`;
    }

    const nextSymbolId = symbolIds.size + 1;
    symbolIds.set(value, nextSymbolId);

    return `symbol:${nextSymbolId}`;
  }

  if (typeof value === 'function') {
    throw new Error(`Unsupported value type: ${typeof value}`);
  }

  if (value instanceof Date) {
    return `date:${value.toISOString()}`;
  }

  if (value instanceof RegExp) {
    return `regexp:${value.toString()}`;
  }

  if (Array.isArray(value)) {
    return `array:[${value.map((item) => buildValueKey(item, symbolIds)).join(',')}]`;
  }

  if (value instanceof Map) {
    const entries = Array.from(value.entries())
      .map(
        ([key, entryValue]) =>
          [buildValueKey(key, symbolIds), buildValueKey(entryValue, symbolIds)] as const,
      )
      .sort(
        ([aKey, aValue], [bKey, bValue]) =>
          aKey.localeCompare(bKey) || aValue.localeCompare(bValue),
      );

    return `map:{${entries.map(([key, entryValue]) => `${key}=>${entryValue}`).join(',')}}`;
  }

  if (value instanceof Set) {
    const entries = Array.from(value.values())
      .map((entry) => buildValueKey(entry, symbolIds))
      .sort((a, b) => a.localeCompare(b));

    return `set:{${entries.join(',')}}`;
  }

  if (typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;

    const keys = Object.keys(objectValue).sort();
    return `object:{${keys.map((key) => `${key}:${buildValueKey(objectValue[key], symbolIds)}`).join(',')}}`;
  }

  return String(value);
}

export function removeDuplicateObjects<T>(array: T[], filterFn?: (item: T) => string): T[] {
  checkCircularReferences(array);

  const symbolIds = new Map<symbol, number>();
  const map = new Map<string, T>();

  for (const item of array) {
    const key = filterFn ? filterFn(item) : buildValueKey(item, symbolIds);

    if (!map.has(key)) {
      map.set(key, item);
    }
  }

  return [...map.values()];
}
