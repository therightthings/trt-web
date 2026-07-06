import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

function normalizeRepoPath(filePath: string): string {
  return filePath.split(path.sep).join(path.posix.sep);
}

function runGitCommand(repoRoot: string, args: string[]): string[] {
  const result = spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || `git ${args.join(' ')} failed.`);
  }

  return result.stdout.split(/\r?\n/).filter(Boolean);
}

export function collectChangedFiles(repoRoot: string): string[] {
  const changedFiles = new Set<string>();
  const commandArgs = [
    ['diff', '--name-only', '--diff-filter=ACMR'],
    ['diff', '--name-only', '--cached', '--diff-filter=ACMR'],
    ['ls-files', '--others', '--exclude-standard'],
  ];

  for (const args of commandArgs) {
    for (const filePath of runGitCommand(repoRoot, args)) {
      const normalized = normalizeRepoPath(filePath);
      if (existsSync(path.join(repoRoot, normalized))) {
        changedFiles.add(normalized);
      }
    }
  }

  return [...changedFiles].sort();
}
