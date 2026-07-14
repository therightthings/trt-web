import { checkCircularReferences } from './check-circular-references';

export function stringify(value: unknown): string {
  checkCircularReferences(value);

  return JSON.stringify(value);
}
