import type { BrowserCliUtility } from '../command/commands.type.js';
import { Highlighter } from '../highlighter/highlighter.js';
import type { CodeTheme, CodeThemeDetail } from '../highlighter/highlighter.type.js';
import { color } from '../utils/color.js';

export class CliFormatter {
  static printUtilities(utilities: BrowserCliUtility[]): void {
    if (utilities.length === 0) {
      console.log('No browser utilities found.');
      return;
    }

    const terminalWidth = process.stdout.columns ?? 80;
    const nameWidth = Math.max(
      'Utility'.length,
      ...utilities.map((utility) => utility.name.length),
    );
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

  static printUtilityInfo(
    utility: BrowserCliUtility,
    utilities: BrowserCliUtility[] = [],
    theme: CodeTheme | CodeThemeDetail | 'none' = 'vs-code-dark-modern',
  ): void {
    console.log(`${color(96, utility.name)}\n${utility.description}`);

    const examples = utility.examples.length
      ? utility.examples
      : utility.example
        ? [{ code: utility.example, language: utility.language }]
        : [];

    if (examples.length > 0) {
      console.log(`\n${color(93, 'Example:')}\n`);
      for (const [index, example] of examples.entries()) {
        if (index > 0) {
          console.log('');
        }
        if (example.title) {
          console.log(color(90, example.title));
        }
        this.printCodeBlock(example.code, example.language, utilities, theme);
      }
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

  private static printCodeBlock(
    code: string,
    language = 'ts',
    utilities: BrowserCliUtility[] = [],
    theme: CodeTheme | CodeThemeDetail | 'none' = 'vs-code-dark-modern',
  ): void {
    for (const line of code.split('\n')) {
      let highlightedLine = line;

      if (Highlighter.isLanguageSupported(language)) {
        highlightedLine = Highlighter.highlight(
          { content: line, language },
          { utilityNames: utilities.map((utility) => utility.name), theme },
        );
      }

      console.log(highlightedLine);
    }
  }
}
