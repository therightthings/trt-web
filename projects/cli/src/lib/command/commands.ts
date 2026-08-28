import { Command } from 'commander';
import enquirer from 'enquirer';

import { DocGenerator } from '../doc-generator/doc-generator.js';
import type { DocGeneratorConfig } from '../doc-generator/doc-generator.type.js';
import { CliFormatter } from '../formatter/formatter.js';
import type { CodeTheme, CodeThemeDetail } from '../highlighter/highlighter.type.js';
import { color } from '../utils/color.js';
import { ParsedReadmeNode, parseReadme } from '../utils/parse-readme.js';
import { readFile } from '../utils/read-file.js';
import { BrowserCliGroup, BrowserCliMethod, BrowserCliUtility } from './commands.type.js';

const EXIT_CLI = 'exit-cli';

const promptKeys = {
  pageup: 'pageUp',
  pagedown: 'pageDown',
  home: 'home',
  end: 'end',
  cancel: 'cancel',
  delete: 'deleteForward',
  down: 'down',
  enter: 'submit',
  return: 'submit',
  escape: 'cancel',
  left: 'left',
  right: 'right',
  tab: 'next',
  up: 'up',
  q: 'exitCli',
};

export type CliConfig = {
  readmePath: string;
  packageJsonPath: string;
  name?: string;
  codeTheme?: CodeTheme | CodeThemeDetail | 'none';
  docs?: Omit<DocGeneratorConfig, 'readmePath'>;
};

export class TrtCommand {
  static async startCli(config: CliConfig): Promise<void> {
    const readme = readFile(config.readmePath);
    const packageJson = JSON.parse(readFile(config.packageJsonPath)) as {
      version?: string;
      description?: string;
    };
    const groups = this.mapReadmeToGroups(readme);
    const utilities = groups.flatMap((group) => group.utilities);
    const program = new Command();

    program.configureHelp({
      formatHelp: (command) => {
        const options = command.options.map((option) => [option.flags, option.description]);
        const commands = command.commands.map((child) => {
          const term = child.name() === 'info' ? 'info <utility>' : child.name();
          return [term, child.description()];
        });
        const optionWidth = Math.max(0, ...options.map(([term]) => term.length));
        const commandWidth = Math.max(0, ...commands.map(([term]) => term.length));
        const lines = [
          color(96, `Usage: ${command.name()} [options] [command]`),
          '',
          command.description(),
          '',
          color(93, 'Options:'),
          ...options.map(
            ([term, description]) => `  ${color(97, term.padEnd(optionWidth))}  ${description}`,
          ),
          '',
          color(93, 'Commands:'),
          ...commands.map(
            ([term, description]) => `  ${color(96, term.padEnd(commandWidth))}  ${description}`,
          ),
        ];

        return `${lines.join('\n')}\n`;
      },
    });

    program
      .name(config.name ?? 'trt-cli')
      .description(packageJson.description ?? 'Explore utilities from the command line.')
      .version(`${packageJson.version ?? '0.0.0'} (${utilities.length} utilities)`, '-v, --version')
      .option('--list', 'list all browser utilities');

    program
      .command('list')
      .description('list and interactively select a browser utility')
      .action(async () => {
        await this.selectGroups(groups, config.codeTheme);
      });

    program
      .command('info <utility>')
      .description('show utility methods and README example')
      .action((name: string) => {
        const utility = utilities.find((item) => item.name.toLowerCase() === name.toLowerCase());
        if (!utility) {
          console.error(`Unknown browser utility: ${name}`);
          process.exitCode = 1;
          return;
        }

        CliFormatter.printUtilityInfo(utility, utilities, config.codeTheme);
      });

    program
      .command('docs')
      .description('build a static HTML documentation site from README')
      .action(() => {
        if (!config.docs) {
          console.error('Documentation output is not configured.');
          process.exitCode = 1;
          return;
        }

        DocGenerator.generate({
          readmePath: config.readmePath,
          ...config.docs,
        });
      });

    program.action(async (_options, command) => {
      if (command.opts().list) {
        await this.selectGroups(groups, config.codeTheme);
      } else if (process.argv.slice(2).length === 0) {
        program.help();
      }
    });

    await program.parseAsync(['node', config.name ?? 'trt-cli', ...process.argv.slice(2)]);
  }

  private static mapReadmeToGroups(readme: string): BrowserCliGroup[] {
    const roots = parseReadme(readme);
    const groups: BrowserCliGroup[] = [];
    for (const root of roots) {
      const directUtilities = root.children.filter((node) => this.isUtilityNode(node));
      if (directUtilities.length > 0) {
        groups.push({
          name: root.title,
          description: root.content,
          utilities: directUtilities.map((node) => this.mapUtility(node)),
        });
        continue;
      }

      for (const groupNode of root.children) {
        const utilityNodes = groupNode.children.filter((node) => this.isUtilityNode(node));
        if (utilityNodes.length > 0) {
          groups.push({
            name: groupNode.title,
            description: groupNode.content,
            utilities: utilityNodes.map((node) => this.mapUtility(node)),
          });
        }
      }
    }
    return groups;
  }

  private static mapUtility(node: ParsedReadmeNode): BrowserCliUtility {
    const methodsNode = node.children.find((child) => child.title.toLowerCase() === 'methods');
    const examplesNode = node.children.find((child) => child.title.toLowerCase() === 'examples');
    const methods: BrowserCliMethod[] = methodsNode
      ? methodsNode.content
          .split(/\r?\n/)
          .map((line) => line.match(/^\s*- `([^`]+)`: (.+)$/))
          .filter((match): match is RegExpMatchArray => match !== null)
          .map((match) => ({
            name: match[1].replace(/\(.*$/, ''),
            signature: match[1],
            description: match[2],
          }))
      : [];
    const example = examplesNode?.codeBlocks[0];

    return {
      name: node.title,
      description: node.content,
      methods,
      example: example?.code,
      language: example?.language,
    };
  }

  private static isUtilityNode(node: ParsedReadmeNode): boolean {
    return node.children.some((child) => {
      return child.title.toLowerCase() === 'methods' || child.title.toLowerCase() === 'examples';
    });
  }

  private static async selectUtility(
    utilities: BrowserCliUtility[],
    theme?: CodeTheme | CodeThemeDetail | 'none',
    allowBackToGroup = false,
  ): Promise<'back' | 'exit'> {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      CliFormatter.printUtilities(utilities);
      return 'exit';
    }

    while (true) {
      let backRequested = false;
      const prompt = {
        type: 'select',
        name: 'selected',
        message: 'Select a browser utility',
        choices: utilities.map((utility) => ({
          name: utility.name,
          message: `${color(96, utility.name)}${color(90, ':')} ${color(90, utility.description)}`,
          value: utility.name,
        })),
        actions: {
          keys: {
            ...promptKeys,
            left: allowBackToGroup ? 'back' : 'left',
          },
        },
        async back(this: { cancel: (error: Error) => Promise<void> }): Promise<void> {
          backRequested = true;
          await this.cancel(new Error('back'));
        },
        async exitCli(this: { cancel: (error: Error) => Promise<void> }): Promise<void> {
          await this.cancel(new Error(EXIT_CLI));
        },
      };

      let result: { selected: string };
      try {
        result = await enquirer.prompt<{ selected: string }>(prompt);
      } catch {
        if (backRequested) {
          return 'back';
        }
        return 'exit';
      }

      const utility = utilities.find((item) => item.name === result.selected);
      if (utility) {
        CliFormatter.printUtilityInfo(utility, utilities, theme);
      }

      const action = await this.waitForDetailAction();
      if (action === 'exit') {
        return 'exit';
      }
    }
  }

  private static async selectGroups(
    groups: BrowserCliGroup[],
    theme?: CodeTheme | CodeThemeDetail | 'none',
  ): Promise<void> {
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      CliFormatter.printUtilities(groups.flatMap((group) => group.utilities));
      return;
    }

    if (groups.length === 1 && groups[0].name.startsWith('@')) {
      await this.selectUtility(groups[0].utilities, theme);
      return;
    }

    while (true) {
      let result: { selected: string };
      try {
        const prompt = {
          type: 'select',
          name: 'selected',
          message: 'Select a utility group',
          choices: groups.map((group) => ({
            name: group.name,
            message: `${color(96, group.name)}${color(90, ':')} ${color(90, group.description)}`,
            value: group.name,
          })),
          actions: {
            keys: {
              ...promptKeys,
              left: 'exitCli',
            },
          },
          async exitCli(this: { cancel: (error: Error) => Promise<void> }): Promise<void> {
            await this.cancel(new Error(EXIT_CLI));
          },
        };
        result = await enquirer.prompt<{ selected: string }>(prompt);
      } catch {
        return;
      }
      const group = groups.find((item) => item.name === result.selected);
      if (group) {
        const action = await this.selectUtility(group.utilities, theme, true);
        if (action === 'exit') {
          return;
        }
      }
    }
  }

  private static async waitForDetailAction(): Promise<'back' | 'exit'> {
    console.log(
      `\n${color(93, 'Controls:')}\n` +
        `- ${color(96, 'Esc')} or ${color(96, 'q')}: ${color(90, 'exit')}\n` +
        `- ${color(96, 'Arrow-Left')}: ${color(90, 'back to utility list')}`,
    );
    if (!process.stdin.isTTY) {
      return 'exit';
    }

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    return await new Promise<'back' | 'exit'>((resolve) => {
      let completed = false;
      const onData = (input: string): void => {
        if (completed) {
          return;
        }
        if (input === '\u001b' || input === '\u0003' || input.toLowerCase() === 'q') {
          cleanup();
          resolve('exit');
          return;
        }

        if (input === '\u001b[D' || input === '\u001bOD') {
          cleanup();
          resolve('back');
        }
      };

      const cleanup = (): void => {
        completed = true;
        process.stdin.off('data', onData);
        process.stdin.setRawMode(false);
        process.stdin.pause();
      };

      process.stdin.on('data', onData);
    });
  }
}
