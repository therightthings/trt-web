export function color(code: number | readonly [number, number, number], value: string): string {
  if (!process.stdout.isTTY || process.env['NO_COLOR']) {
    return value;
  }

  const sequence = Array.isArray(code) ? `38;2;${code.join(';')}` : `${code}`;
  return `\u001b[${sequence}m${value}\u001b[0m`;
}
