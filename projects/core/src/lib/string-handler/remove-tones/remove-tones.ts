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
  const { separator = ' ' } = config ?? {};

  return foldAccents(value)
    .replace(/[!@%^*()+=<>?/.,:;'\"&#\[\]~$_`{}\|\\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+/g, separator)
    .toLowerCase();
}
