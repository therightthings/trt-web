import { readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';

export function readFile(
  filePath: string,
  config?: {
    encoding?: BufferEncoding;
  },
) {
  const { encoding = 'utf8' } = config ?? {};
  const entryPath = process.argv[1] ? realpathSync(process.argv[1]) : process.cwd();
  const entryDirectory = path.dirname(path.resolve(entryPath));
  return readFileSync(path.resolve(entryDirectory, filePath), encoding);
}
