#!/usr/bin/env node

import { TrtCommand } from '@trt-web/cli';

async function bootstrap(): Promise<void> {
  await TrtCommand.startCli({
    readmePath: '../README.md',
    packageJsonPath: '../package.json',
    name: 'trt-browser',
    docs: {
      outputPath: './dist/docs/browser',
      title: '@trt-web/browser',
    },
  });
}

void bootstrap();
