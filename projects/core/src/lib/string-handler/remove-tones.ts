export function removeTones(value: string, separator: string = '_'): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[!@%^*()+=<>?/.,:;'\"&#\[\]~$_`{}\|\\-]/g, ' ')
    .replace(/\s+/g, separator);
}
