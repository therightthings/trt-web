const specialCharacterMap: Record<string, string> = {
  ß: 'ss',
  æ: 'ae',
  Æ: 'AE',
  œ: 'oe',
  Œ: 'OE',
  ø: 'o',
  Ø: 'O',
  ł: 'l',
  Ł: 'L',
  đ: 'd',
  Đ: 'D',
  ð: 'd',
  Ð: 'D',
  þ: 'th',
  Þ: 'Th',
  '\u0131': 'i',
  '\u0130': 'I',
};

export interface RemoveTonesConfig {
  separator?: string;
  removeNonLatinAscii?: boolean;
}

function foldAccents(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{M}+/gu, '')
    .split('')
    .map((char) => specialCharacterMap[char] ?? char)
    .join('');
}

export function removeTones(value: string, config?: RemoveTonesConfig): string {
  const { separator = ' ', removeNonLatinAscii = true } = config ?? {};

  let normalized = foldAccents(value).replace(/[!@%^*()+=<>?/.,:;'\"&#\[\]~$_`{}\|\\-]/g, ' ');

  if (removeNonLatinAscii) {
    normalized = normalized.replace(/[^\x00-\x7F]/g, ' ');
  }

  normalized = normalized.replace(/\s+/g, ' ').trim();

  if (!normalized) return '';

  normalized = normalized.replace(/\s+/g, separator).toLowerCase();

  return normalized;
}
