const useColor = Boolean(process.stdout.isTTY && !process.env['NO_COLOR']);

function color(code: number, value: string): string {
  if (!useColor) {
    return value;
  }

  return `\u001b[${code}m${value}\u001b[0m`;
}

export function highlightTypeScript(source: string, utilityNames: readonly string[]): string {
  if (!source || utilityNames.length === 0) {
    return source;
  }

  const names = utilityNames.map(escapeRegExp).join('|');
  const keywords =
    'as|async|await|const|else|false|function|if|import|let|new|null|of|return|throw|true|typeof|undefined|while';
  const tokenPattern = new RegExp(
    `("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|\\x60(?:\\\\.|[^\\x60\\\\])*\\x60)|\\b(${names})\\b|\\b(${keywords})\\b|\\b(\\d+(?:\\.\\d+)?)\\b|\\b([A-Za-z_$][\\w$]*)(?=\\s*\\()`,
    'g',
  );

  return source.replace(
    tokenPattern,
    (
      token: string,
      stringLiteral?: string,
      utilityName?: string,
      keyword?: string,
      numberLiteral?: string,
      identifier?: string,
    ) => {
      if (stringLiteral) {
        return color(32, token);
      }

      if (utilityName) {
        return color(96, token);
      }

      if (keyword) {
        return color(95, token);
      }

      if (numberLiteral) {
        return color(93, token);
      }

      if (identifier) {
        return color(93, token);
      }

      return token;
    },
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
