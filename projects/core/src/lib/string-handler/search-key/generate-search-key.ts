import { removeTones } from '../remove-tones/remove-tones';

type BuildSearchKeysOptions = {
  minPrefixLength?: number;
  maxPrefixLength?: number;
  includePhrasePrefixes?: boolean;
  includeAcronym?: boolean;
};

export function generateSearchKeys(value: string, options?: BuildSearchKeysOptions): string[] {
  const {
    minPrefixLength = 2,
    maxPrefixLength = 20,
    includePhrasePrefixes = true,
    includeAcronym = true,
  } = options ?? {};

  const safeMinPrefixLength = Math.max(1, minPrefixLength);
  const safeMaxPrefixLength = Math.max(safeMinPrefixLength, maxPrefixLength);

  const normalized = removeTones(value);

  if (!normalized) return [];

  const words = normalized.split(' ').filter(Boolean);
  const keys = new Set<string>();

  keys.add(normalized);

  for (const word of words) {
    keys.add(word);

    const maxLength = Math.min(word.length, safeMaxPrefixLength);

    for (let i = safeMinPrefixLength; i <= maxLength; i++) {
      keys.add(word.slice(0, i));
    }
  }

  if (includePhrasePrefixes) {
    for (let start = 0; start < words.length; start++) {
      let phrase = '';

      for (let end = start; end < words.length; end++) {
        phrase = phrase ? `${phrase} ${words[end]}` : words[end];

        keys.add(phrase);

        const maxLength = Math.min(phrase.length, safeMaxPrefixLength);

        for (let i = safeMinPrefixLength; i <= maxLength; i++) {
          keys.add(phrase.slice(0, i));
        }
      }
    }
  }

  if (includeAcronym && words.length > 1) {
    keys.add(words.map((word) => word[0]).join(''));
  }

  return Array.from(keys).sort();
}
