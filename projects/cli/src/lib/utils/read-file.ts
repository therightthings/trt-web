import { readFileSync } from 'node:fs';
import path from 'node:path';

export function readFile(
  filePath: string,
  config?: {
    encoding?: BufferEncoding;
  },
) {
  const { encoding = 'utf8' } = config ?? {};
  const entryDirectory = path.dirname(path.resolve(process.argv[1] ?? process.cwd()));
  return readFileSync(path.resolve(entryDirectory, filePath), encoding);
}
