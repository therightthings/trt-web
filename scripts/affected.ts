import path from 'node:path';

import { runCommand, runCommandsSequentially } from './exec.ts';
import { collectChangedFiles } from './git.ts';
import type { WorkspaceProject } from './workspace.ts';

const repoWideChangeFiles = new Set(['nx.json', 'tsconfig.base.json']);
const ignoredProjectExtensions = new Set([
  '.md',
  '.mdx',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.pdf',
  '.lock',
]);
const spellableExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.mts',
  '.cjs',
  '.cts',
  '.vue',
  '.html',
  '.yml',
  '.yaml',
  '.css',
  '.scss',
  '.less',
  '.md',
  '.mdx',
  '.txt',
]);

function isRelevantProjectFile(filePath: string): boolean {
  if (repoWideChangeFiles.has(filePath)) {
    return true;
  }

  if (!filePath.startsWith('projects/')) {
    return false;
  }

  const extension = path.posix.extname(filePath).toLowerCase();
  return !ignoredProjectExtensions.has(extension);
}

function getProjectFilePrefix(project: WorkspaceProject): string {
  return path.posix.join('projects', project.folder) + '/';
}

export function getAffectedProjects(
  projects: WorkspaceProject[],
  changedFiles: string[],
): WorkspaceProject[] {
  if (changedFiles.some((filePath) => repoWideChangeFiles.has(filePath))) {
    return projects;
  }

  return projects.filter((project) =>
    changedFiles.some(
      (filePath) =>
        filePath.startsWith(getProjectFilePrefix(project)) && isRelevantProjectFile(filePath),
    ),
  );
}

function isSpellableFile(filePath: string): boolean {
  const extension = path.posix.extname(filePath).toLowerCase();
  return spellableExtensions.has(extension);
}

export function getSpellFiles(changedFiles: string[]): string[] {
  return changedFiles.filter(isSpellableFile);
}

export async function runAffectedDeadcode(
  repoRoot: string,
  projects: WorkspaceProject[],
  options: { all?: boolean },
): Promise<number> {
  const changedFiles = options.all ? [] : collectChangedFiles(repoRoot);
  const targetProjects = options.all ? projects : getAffectedProjects(projects, changedFiles);

  if (targetProjects.length === 0) {
    console.log('No affected projects for dead code checks.');
    return 0;
  }

  const commands = targetProjects.map((project) => ({
    command: 'npx',
    args: [
      'knip',
      '--directory',
      path.join(repoRoot, 'projects', project.folder),
      '--no-progress',
      '--no-config-hints',
    ],
    cwd: repoRoot,
  }));

  return runCommandsSequentially(commands);
}

export async function runAffectedCircular(
  repoRoot: string,
  projects: WorkspaceProject[],
  options: { all?: boolean },
): Promise<number> {
  const changedFiles = options.all ? [] : collectChangedFiles(repoRoot);
  const targetProjects = options.all ? projects : getAffectedProjects(projects, changedFiles);

  if (targetProjects.length === 0) {
    console.log('No affected projects for circular dependency checks.');
    return 0;
  }

  const commands = targetProjects.map((project) => ({
    command: 'npx',
    args: [
      'madge',
      '--circular',
      '--basedir',
      repoRoot,
      '--ts-config',
      path.join(repoRoot, 'projects', project.folder, 'tsconfig.json'),
      '--extensions',
      'ts,tsx,js,jsx,mts,mjs,cts,cjs,vue',
      path.join(repoRoot, 'projects', project.folder, 'src'),
    ],
    cwd: repoRoot,
  }));

  return runCommandsSequentially(commands);
}

export async function runAffectedSpell(
  repoRoot: string,
  options: { all?: boolean },
): Promise<number> {
  if (options.all) {
    return runCommand('npx', ['cspell', 'lint', '.'], repoRoot);
  }

  const spellFiles = getSpellFiles(collectChangedFiles(repoRoot));

  if (spellFiles.length === 0) {
    console.log('No spellable changed files.');
    return 0;
  }

  return runCommand(
    'npx',
    ['cspell', 'lint', '--no-progress', '--no-summary', '--file', ...spellFiles],
    repoRoot,
  );
}
