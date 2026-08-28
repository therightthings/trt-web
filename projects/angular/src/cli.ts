import { TrtCommand } from '@trt-web/cli';

void TrtCommand.startCli({
  readmePath: '../README.md',
  packageJsonPath: '../package.json',
  name: 'trt-angular',
  docs: {
    outputPath: './dist/docs/angular',
    title: '@trt-web/angular',
  },
});
