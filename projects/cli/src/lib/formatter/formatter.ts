import { CodeHighlighter } from '../code-highlighter/code-highlighter.js';
import type { CodeTheme, CodeThemeDetail } from '../code-highlighter/code-highlighter.type.js';
import type { BrowserCliUtility } from '../command/types.js';
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

    if (utility.example) {
      console.log(`\n${color(93, 'Example:')}\n`);
      this.printCodeBlock(utility.example, utility.language, utilities, theme);
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
      const highlightedLine =
        language === 'ts' || language === 'js'
          ? CodeHighlighter.highlight(
              { content: line, language },
              { utilityNames: utilities.map((utility) => utility.name), theme },
            )
          : line;
      console.log(highlightedLine);
    }
  }
}
