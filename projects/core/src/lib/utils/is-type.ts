export type ValueType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'bigint'
  | 'symbol'
  | 'function'
  | 'object'
  | 'array'
  | 'null'
  | 'undefined';

function getFieldValue(source: unknown, field: PropertyKey): unknown {
  if (source === null || (typeof source !== 'object' && typeof source !== 'function')) {
    return undefined;
  }

  return source[field as keyof typeof source];
}

export function isType(type: ValueType, source: unknown, field?: PropertyKey): boolean {
  const value = field === undefined ? source : getFieldValue(source, field);

  if (type === 'array') {
    return Array.isArray(value);
  }

  if (type === 'null') {
    return value === null;
  }

  if (type === 'object') {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  return typeof value === type;
}
