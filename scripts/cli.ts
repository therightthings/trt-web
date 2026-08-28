import path from 'node:path';
import url from 'node:url';

import { Command } from 'commander';

import { runAffectedCircular, runAffectedSpell, runDeadcodeForProjects } from './affected.ts';
import { runCommand, runNx } from './exec.ts';
import {
  chooseProject,
  listProjects,
  resolveBuildTarget,
  resolveDeadcodeTarget,
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

async function runBuildCli(projectArg: string | undefined) {
  const cliBuildStatus = await runNx(repoRoot, ['run', 'cli:build', '--skip-nx-cache']);
  if (cliBuildStatus !== 0) {
    return cliBuildStatus;
  }

  const linkStatus = await runCommand('yarn', ['link'], path.join(repoRoot, 'dist', 'cli'));
  if (linkStatus !== 0) {
    return linkStatus;
  }

  const workspaceLinkStatus = await runCommand('yarn', ['link', '@trt-web/cli'], repoRoot);
  if (workspaceLinkStatus !== 0) {
    return workspaceLinkStatus;
  }

  const projects = (await listProjects(projectsDir)).filter((project) => project.hasCli);
  if (projects.length === 0) {
    throw new Error('No projects with CLI support were found.');
  }

  const selected = projectArg
    ? projects.find((project) => project.name === projectArg || project.folder === projectArg)
    : undefined;
  let project = selected;
  if (!project && projects.length === 1) {
    project = projects[0];
  }
  if (!project && (!process.stdin.isTTY || !process.stdout.isTTY)) {
    project = projects[0];
  }
  if (!project) {
    const selectedName = await chooseProject({
      projects,
      title: 'Select a CLI project to build:',
      disablePrivatePackages: false,
    });
    project = projects.find((item) => item.name === selectedName);
  }

  if (!project) {
    throw new Error(`CLI project not found: ${projectArg}`);
  }

  return runNx(repoRoot, ['run', `${project.name}:cli`, '--skip-nx-cache']);
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
  const target = await resolveTestTarget(projects, projectArg, options, false);

  if (target.type === 'all') {
    return runNx(repoRoot, [
      'run-many',
      '-t',
      'test',
      '--projects',
      target.projects.map((project) => project.name).join(','),
    ]);
  }

  return runNx(repoRoot, ['test', target.project.name]);
}

async function runTestE2E(
  projectArg: string | undefined,
  options: { project?: string; all?: boolean },
) {
  const projects = await listProjects(projectsDir);
  const target = await resolveTestTarget(projects, projectArg, options, true);

  if (target.type === 'all') {
    return runNx(repoRoot, [
      'run-many',
      '-t',
      'test',
      '--projects',
      target.projects.map((project) => project.name).join(','),
    ]);
  }

  return runNx(repoRoot, ['test', target.project.name]);
}

async function runDeadcode(
  projectArg: string | undefined,
  options: { project?: string; all?: boolean },
) {
  const projects = await listProjects(projectsDir);
  const target = await resolveDeadcodeTarget(projects, projectArg, options);
  const deadcodeProjects = projects.filter((project) => project.hasPackageJson);

  if (target.type === 'all') {
    return runDeadcodeForProjects(repoRoot, deadcodeProjects);
  }

  return runDeadcodeForProjects(repoRoot, [target.project]);
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
  .command('build:cli [project]')
  .description('Build a project with CLI support without using the Nx cache.')
  .action((projectArg: string | undefined) => runAction(() => runBuildCli(projectArg)));

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
  .description('Run non-e2e tests for one project or prompt for selection.')
  .option('-p, --project <project>', 'test a specific project')
  .option('-a, --all', 'test all non-e2e projects that have a test target')
  .action((projectArg: string | undefined, options: { project?: string; all?: boolean }) =>
    runAction(() => runTest(projectArg, options)),
  );

program
  .command('test-e2e [project]')
  .description('Run e2e tests for one project or prompt for selection.')
  .option('-p, --project <project>', 'test a specific e2e project')
  .option('-a, --all', 'test all e2e projects that have a test target')
  .action((projectArg: string | undefined, options: { project?: string; all?: boolean }) =>
    runAction(() => runTestE2E(projectArg, options)),
  );

program
  .command('check:deadcode [project]')
  .description('Run knip on one project or prompt for selection.')
  .option('-p, --project <project>', 'check dead code for a specific project')
  .option('-a, --all', 'check dead code in all workspace projects')
  .action((projectArg: string | undefined, options: { project?: string; all?: boolean }) =>
    runAction(() => runDeadcode(projectArg, options)),
  );

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
