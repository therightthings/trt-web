import path from 'node:path';
import url from 'node:url';

import { Command } from 'commander';

import { runAffectedCircular, runAffectedDeadcode, runAffectedSpell } from './affected.ts';
import { runCommand, runNx } from './exec.ts';
import {
  listProjects,
  resolveBuildTarget,
  resolveLintTarget,
  resolvePackageTarget,
  resolveServeTarget,
  resolveTestTarget,
} from './workspace.ts';

const repoRoot = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const projectsDir = path.join(repoRoot, 'projects');

async function runAction(task: () => Promise<number> | number) {
  try {
    const status = await task();
    process.exit(status);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function runBuild(
  projectArg: string | undefined,
  options: { project?: string; all?: boolean },
) {
  const projects = await listProjects(projectsDir);
  const target = await resolveBuildTarget(projects, projectArg, options);

  if (target.type === 'all') {
    return runNx(repoRoot, ['run-many', '-t', 'build']);
  }

  return runNx(repoRoot, ['build', target.project.name]);
}

async function runLint(
  projectArg: string | undefined,
  options: { project?: string; all?: boolean },
) {
  const projects = await listProjects(projectsDir);
  const target = await resolveLintTarget(projects, projectArg, options);

  if (target.type === 'all') {
    return runNx(repoRoot, ['run-many', '-t', 'lint']);
  }

  return runNx(repoRoot, ['lint', target.project.name]);
}

async function runServe(projectArg: string | undefined) {
  const projects = await listProjects(projectsDir);
  const target = await resolveServeTarget(projects, projectArg);

  return runNx(repoRoot, ['serve', target.project.name]);
}

async function runCheckPackage(
  projectArg: string | undefined,
  options: { project?: string; all?: boolean },
) {
  const projects = await listProjects(projectsDir);
  const target = await resolvePackageTarget(projects, projectArg, options);

  const packProject = async (projectName: string) => {
    const project = projects.find((item) => item.name === projectName);
    if (!project) {
      throw new Error(`Project not found: ${projectName}`);
    }

    const buildStatus = await runNx(repoRoot, ['build', project.name]);
    if (buildStatus !== 0) {
      return buildStatus;
    }

    return runCommand('npm', ['pack', '--dry-run'], path.join(repoRoot, 'dist', project.folder));
  };

  if (target.type === 'all') {
    const buildStatus = await runNx(repoRoot, ['run-many', '-t', 'build']);
    if (buildStatus !== 0) {
      return buildStatus;
    }

    for (const project of projects) {
      const packStatus = await runCommand(
        'npm',
        ['pack', '--dry-run'],
        path.join(repoRoot, 'dist', project.folder),
      );
      if (packStatus !== 0) {
        return packStatus;
      }
    }

    return 0;
  }

  return packProject(target.project.name);
}

async function runTest(
  projectArg: string | undefined,
  options: { project?: string; all?: boolean },
) {
  const projects = await listProjects(projectsDir);
  const target = await resolveTestTarget(projects, projectArg, options);

  if (target.type === 'all') {
    return runNx(repoRoot, ['run-many', '-t', 'test']);
  }

  return runNx(repoRoot, ['test', target.project.name]);
}

async function runDeadcode(options: { all?: boolean }) {
  const projects = await listProjects(projectsDir);
  return runAffectedDeadcode(repoRoot, projects, options);
}

async function runCircular(options: { all?: boolean }) {
  const projects = await listProjects(projectsDir);
  return runAffectedCircular(repoRoot, projects, options);
}

async function runSpell(options: { all?: boolean }) {
  return runAffectedSpell(repoRoot, options);
}

const program = new Command();

program
  .name('trt-web')
  .description(
    'Interactive helpers for building, serving, linting, packaging, and testing workspace projects.',
  )
  .showHelpAfterError()
  .helpCommand(true);

program
  .command('build [project]')
  .description('Build one project or prompt for selection.')
  .option('-p, --project <project>', 'build a specific project')
  .option('-a, --all', 'build all projects')
  .action((projectArg: string | undefined, options: { project?: string; all?: boolean }) =>
    runAction(() => runBuild(projectArg, options)),
  );

program
  .command('lint [project]')
  .description('Run lint on one project or prompt for selection.')
  .option('-p, --project <project>', 'lint a specific project')
  .option('-a, --all', 'lint all projects that have a lint target')
  .action((projectArg: string | undefined, options: { project?: string; all?: boolean }) =>
    runAction(() => runLint(projectArg, options)),
  );

program
  .command('serve [project]')
  .description('Run the dev server for one project or prompt for selection.')
  .option('-p, --project <project>', 'serve a specific project')
  .action((projectArg: string | undefined, options: { project?: string }) =>
    runAction(() => runServe(options.project ?? projectArg)),
  );

program
  .command('test [project]')
  .description('Run tests for one project or prompt for selection.')
  .option('-p, --project <project>', 'test a specific project')
  .option('-a, --all', 'test all projects that have a test target')
  .action((projectArg: string | undefined, options: { project?: string; all?: boolean }) =>
    runAction(() => runTest(projectArg, options)),
  );

program
  .command('check:deadcode')
  .description('Run knip only for projects affected by changed files.')
  .option('-a, --all', 'check dead code in all workspace projects')
  .action((options: { all?: boolean }) => runAction(() => runDeadcode(options)));

program
  .command('check:circular')
  .description('Check circular dependencies only for affected projects.')
  .option('-a, --all', 'check circular dependencies in all workspace projects')
  .action((options: { all?: boolean }) => runAction(() => runCircular(options)));

program
  .command('check:spell')
  .description('Spell-check only changed text files.')
  .option('-a, --all', 'spell-check all workspace files')
  .action((options: { all?: boolean }) => runAction(() => runSpell(options)));

program
  .command('check:package [project]')
  .description('Build and dry-run pack one project or prompt for selection.')
  .option('-p, --project <project>', 'check a specific project')
  .option('-a, --all', 'check all projects')
  .action((projectArg: string | undefined, options: { project?: string; all?: boolean }) =>
    runAction(() => runCheckPackage(projectArg, options)),
  );

await program.parseAsync(process.argv);
