import { TrtCommand } from '@trt-web/cli';

void TrtCommand.startCli({
  readmePath: '../README.md',
  packageJsonPath: '../package.json',
  name: 'trt-firebase-admin',
  docs: {
    outputPath: './dist/docs/firebase-admin',
    title: '@trt-web/firebase-admin',
  },
});
