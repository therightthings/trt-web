#!/usr/bin/env node

import { TrtCommand } from '@trt-web/cli';

async function bootstrap(): Promise<void> {
  await TrtCommand.startCli({
    readmePath: '../README.md',
    packageJsonPath: '../package.json',
    name: 'trt-core',
    docs: {
      outputPath: './dist/docs/core',
      title: '@trt-web/core',
    },
  });
}

void bootstrap();
