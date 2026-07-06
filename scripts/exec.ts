import { spawnSync } from 'node:child_process';

export function runCommand(command: string, args: string[], cwd: string): number {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

export function runNx(repoRoot: string, args: string[]): number {
  return runCommand('npx', ['nx', ...args], repoRoot);
}

export function runCommandsSequentially(
  commands: Array<{ command: string; args: string[]; cwd: string }>,
): number {
  for (const { command, args, cwd } of commands) {
    const status = runCommand(command, args, cwd);
    if (status !== 0) {
      return status;
    }
  }

  return 0;
}
