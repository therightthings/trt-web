import { SORT_ORDER_KEY_CONFIG } from './generate-sort-order-key.type';

function getSimpleLexoRankIndex(char: string) {
  return SORT_ORDER_KEY_CONFIG.chars.indexOf(char);
}

function validateSimpleLexoRank(rank: string, fieldName: string) {
  if (!rank) {
    throw new Error(`${fieldName} must not be empty`);
  }

  for (const char of rank) {
    if (getSimpleLexoRankIndex(char) < 0) {
      throw new Error(`${fieldName} contains unsupported character: "${char}"`);
    }
  }
}

function decodeSimpleLexoRank(rank: string) {
  let result = 0n;

  for (const char of rank) {
    result = result * SORT_ORDER_KEY_CONFIG.base + BigInt(getSimpleLexoRankIndex(char));
  }

  return result;
}

function encodeSimpleLexoRank(value: bigint) {
  if (value < 0n || value > SORT_ORDER_KEY_CONFIG.maxValue) {
    throw new Error('Rank value is out of range');
  }

  let currentValue = value;
  let result = '';

  while (currentValue > 0n) {
    const remainder = Number(currentValue % SORT_ORDER_KEY_CONFIG.base);
    result = SORT_ORDER_KEY_CONFIG.chars[remainder] + result;
    currentValue /= SORT_ORDER_KEY_CONFIG.base;
  }

  return result.padStart(SORT_ORDER_KEY_CONFIG.length, SORT_ORDER_KEY_CONFIG.minChar);
}

function buildMiddleValue(previousValue: bigint, nextValue: bigint) {
  const middleValue = (previousValue + nextValue) / 2n;

  if (middleValue <= previousValue || middleValue >= nextValue) {
    throw new Error('No available rank between previous and next');
  }

  return middleValue;
}

/**
 * Generate a sortable fixed-width base62 rank without third-party dependencies.
 *
 * Important:
 * - All newly generated ranks use a fixed length to avoid prefix-related sort bugs.
 * - Existing legacy ranks should be recreated or migrated to this format before use.
 */
export function generateSortOrderKey(config?: { previous?: string; next?: string }) {
  const previous = config?.previous;
  const next = config?.next;

  if (previous) {
    validateSimpleLexoRank(previous, 'previous');
  }
  if (next) {
    validateSimpleLexoRank(next, 'next');
  }

  if (previous && next) {
    const previousValue = decodeSimpleLexoRank(previous);
    const nextValue = decodeSimpleLexoRank(next);

    if (previousValue >= nextValue) {
      throw new Error('Previous rank must be smaller than next rank');
    }

    return encodeSimpleLexoRank(buildMiddleValue(previousValue, nextValue));
  }

  if (previous) {
    const previousValue = decodeSimpleLexoRank(previous);

    if (previousValue >= SORT_ORDER_KEY_CONFIG.maxValue) {
      throw new Error('Cannot generate rank after the maximum rank');
    }

    return encodeSimpleLexoRank(
      buildMiddleValue(previousValue, SORT_ORDER_KEY_CONFIG.maxValue + 1n),
    );
  }

  if (next) {
    const nextValue = decodeSimpleLexoRank(next);

    if (nextValue <= 0n) {
      throw new Error('Cannot generate rank before the minimum rank');
    }

    return encodeSimpleLexoRank(buildMiddleValue(-1n, nextValue));
  }

  return encodeSimpleLexoRank(SORT_ORDER_KEY_CONFIG.maxValue / 2n);
}
