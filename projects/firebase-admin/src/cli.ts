#!/usr/bin/env node

import { TrtCommand } from '@trt-web/cli';

async function bootstrap(): Promise<void> {
  await TrtCommand.startCli({
    readmePath: '../README.md',
    packageJsonPath: '../package.json',
    name: 'trt-firebase-admin',
    docs: {
      outputPath: './dist/docs/firebase-admin',
      title: '@trt-web/firebase-admin',
    },
  });
}

void bootstrap();
