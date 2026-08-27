import { Command } from 'commander';
import enquirer from 'enquirer';

import { printUtilities, printUtilityInfo } from './formatter.js';
import { browserUtilities, readBrowserPackageVersion } from './registry.js';

const browserPackageVersion = readBrowserPackageVersion();

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
    .command('info <utility>')
    .description('show utility methods and README example')
    .action((name: string) => {
      const utility = browserUtilities.find(
        (item) => item.name.toLowerCase() === name.toLowerCase(),
      );
      if (!utility) {
        console.error(`Unknown browser utility: ${name}`);
        process.exitCode = 1;
        return;
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
      completed = true;
      process.stdin.off('data', onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
    };

    process.stdin.on('data', onData);
  });
}
