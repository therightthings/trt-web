import { TrtCommand } from '@trt-web/cli';

async function bootstrap(): Promise<void> {
  await TrtCommand.startCli({
    readmePath: '../README.md',
    packageJsonPath: '../package.json',
    name: 'trt-angular',
    docs: {
      outputPath: './dist/docs/angular',
      title: '@trt-web/angular',
    },
  });
}

void bootstrap();
