export function mergeClassNames(...parts: Array<string | null | undefined | false>): string {
  const tokens = new Set<string>();

  for (const part of parts) {
    if (!part) {
      continue;
    }

    for (const token of part.split(/\s+/)) {
      const normalizedToken = token.trim();
      if (normalizedToken) {
        tokens.add(normalizedToken);
      }
    }
  }

  return Array.from(tokens).join(' ');
}
