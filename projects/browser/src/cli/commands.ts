import { Command } from 'commander';
import enquirer from 'enquirer';

import { printUtilities, printUtilityInfo } from './formatter.js';
import { browserUtilities } from './registry.js';

const browserPackageVersion = '1.0.0';

export async function runCli(args: string[]): Promise<void> {
  const program = new Command();

  program
    .name('trt-browser')
    .description('Explore @trt-web/browser utilities from the command line.')
    .version(browserPackageVersion, '-v, --version')
    .option('--list', 'list all browser utilities');

  program
    .command('list')
    .description('list and interactively select a browser utility')
    .action(async () => {
      await selectUtility();
    });

  program
    .command('search <term>')
    .description('search utilities by name or description')
    .action((term: string) => {
      const normalizedTerm = term.toLowerCase();
      printUtilities(
        browserUtilities.filter((utility) =>
          `${utility.name} ${utility.description}`.toLowerCase().includes(normalizedTerm),
        ),
      );
    });

  program
    .command('info <utility>')
    .description('show utility methods and README example')
    .action((name: string) => {
      const utility = browserUtilities.find(
        (item) => item.name.toLowerCase() === name.toLowerCase(),
      );
      if (!utility) {
        throw new Error(`Unknown browser utility: ${name}`);
      }

      printUtilityInfo(utility);
    });

  program.action(async (_options, command) => {
    if (command.opts().list) {
      await selectUtility();
    } else if (args.length === 0) {
      program.help();
    }
  });

  await program.parseAsync(['node', 'trt-browser', ...args]);
}

async function selectUtility(): Promise<void> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    printUtilities(browserUtilities);
    return;
  }

  while (true) {
    const result = await enquirer.prompt<{ selected: string }>({
      type: 'select',
      name: 'selected',
      message: 'Select a browser utility',
      choices: browserUtilities.map((utility) => ({
        name: utility.name,
        message: `${utility.name} - ${utility.description}`,
        value: utility.name,
      })),
    });

    const utility = browserUtilities.find((item) => item.name === result.selected);
    if (utility) {
      printUtilityInfo(utility);
    }

    const action = await waitForDetailAction();
    if (action === 'exit') {
      return;
    }
  }
}

async function waitForDetailAction(): Promise<'back' | 'exit'> {
  console.log('\nEsc: exit · ←: back to utility list');
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  return await new Promise<'back' | 'exit'>((resolve) => {
    const onData = (input: string): void => {
      if (input === '\u001b' || input === '\u0003') {
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
      process.stdin.off('data', onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
    };

    process.stdin.on('data', onData);
  });
}
