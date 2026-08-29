import { TrtCommand } from '@trt-web/cli';

await TrtCommand.startCli({
  readmePath: '../README.md',
  packageJsonPath: '../package.json',
  name: 'trt-core',
  docs: {
    outputPath: './dist/docs/core',
    title: '@trt-web/core',
  },
});
