import { createHash } from 'node:crypto';

export function hashData(data: unknown) {
  if (!data) {
    return '';
  }

  const str = JSON.stringify(data, Object.keys(data as object).sort());
  return createHash('sha256').update(str).digest('hex');
}
