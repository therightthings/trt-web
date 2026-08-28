import { TrtCommand } from '@trt-web/cli';

await TrtCommand.startCli({
  readmePath: '../README.md',
  packageJsonPath: '../package.json',
  name: 'trt-browser',
  docs: {
    outputPath: './dist/docs',
    title: '@trt-web/browser',
  },
});
