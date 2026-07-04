const SORT_ORDER_KEY_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const SORT_ORDER_KEY_CONFIG = {
  chars: SORT_ORDER_KEY_CHARS,
  base: BigInt(SORT_ORDER_KEY_CHARS.length),
  length: 64,
  minChar: SORT_ORDER_KEY_CHARS[0],
  maxValue: BigInt(SORT_ORDER_KEY_CHARS.length) ** 64n - 1n,
} as const;
