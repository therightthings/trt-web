import { browserUtilities } from './registry.js';
import { highlightTypeScript } from './syntax-highlighter.js';
import type { BrowserCliUtility } from './types.js';

const useColor = Boolean(process.stdout.isTTY && !process.env['NO_COLOR']);

function color(code: number, value: string): string {
  if (!useColor) {
    return value;
  }

  return `\u001b[${code}m${value}\u001b[0m`;
}

export function printUtilities(utilities: BrowserCliUtility[]): void {
  if (utilities.length === 0) {
    console.log('No browser utilities found.');
    return;
  }

  const terminalWidth = process.stdout.columns ?? 80;
  const nameWidth = Math.max('Utility'.length, ...utilities.map((utility) => utility.name.length));
  const maxDescriptionWidth = Math.max(
    'Description'.length,
    ...utilities.map((utility) => utility.description.length),
  );
  const tableDescriptionWidth = Math.min(
    maxDescriptionWidth,
    Math.max(20, terminalWidth - nameWidth - 7),
  );

  if (terminalWidth < nameWidth + 30) {
    for (const utility of utilities) {
      console.log(utility.name);
    }
    return;
  }

  const descriptionWidth = tableDescriptionWidth;
  const separator = `+${'-'.repeat(nameWidth + 2)}+${'-'.repeat(descriptionWidth + 2)}+`;

  console.log(separator);
  console.log(`| ${'Utility'.padEnd(nameWidth)} | ${'Description'.padEnd(descriptionWidth)} |`);
  console.log(separator);

  for (const utility of utilities) {
    console.log(
      `| ${utility.name.padEnd(nameWidth)} | ${utility.description.padEnd(descriptionWidth)} |`,
    );
  }

  console.log(separator);
}

export function printUtilityInfo(utility: BrowserCliUtility): void {
  console.log(`${color(96, utility.name)}\n${utility.description}`);

  if (utility.example) {
    console.log(`\n${color(93, 'Example:')}\n`);
    printCodeBlock(utility.example);
  }

  if (utility.methods.length > 0) {
    console.log(`\n${color(93, 'Methods:')}`);
  }
  for (const method of utility.methods) {
    console.log(`  ${color(32, '•')} ${color(97, method.signature)}`);
    if (method.description !== 'Public utility method.') {
      console.log(`    ${color(90, method.description)}`);
    }
  }
}

function printCodeBlock(code: string): void {
  for (const line of code.split('\n')) {
    console.log(formatCodeLine(line));
  }
}

function formatCodeLine(line: string): string {
  const commentIndex = findCommentIndex(line);
  if (commentIndex < 0) {
    return highlightTypeScript(
      line,
      browserUtilities.map((utility) => utility.name),
    );
  }

  return `${highlightTypeScript(
    line.slice(0, commentIndex),
    browserUtilities.map((utility) => utility.name),
  )}${color(90, line.slice(commentIndex))}`;
}

function findCommentIndex(line: string): number {
  let quote: '"' | "'" | '`' | undefined;
  let escaped = false;

  for (let index = 0; index < line.length - 1; index += 1) {
    const character = line[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === '\\' && quote) {
      escaped = true;
      continue;
    }
    if (quote) {
      if (character === quote) quote = undefined;
      continue;
    }
    if (character === '"' || character === "'" || character === '`') {
      quote = character;
      continue;
    }
    if (character === '/' && line[index + 1] === '/') return index;
  }

  return -1;
}
