import enquirer from 'enquirer';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import { runCommand } from './exec.ts';

export type WorkspaceProject = {
  name: string;
  folder: string;
  private: boolean;
  publishable: boolean;
  hasLintTarget: boolean;
  testable: boolean;
};

type BuildTarget = { type: 'all' } | { type: 'project'; project: WorkspaceProject };
type LintTarget = { type: 'all' } | { type: 'project'; project: WorkspaceProject };
type PackageTarget = { type: 'all' } | { type: 'project'; project: WorkspaceProject };
type TestTarget = { type: 'all' } | { type: 'project'; project: WorkspaceProject };

type SelectPromptResult = {
  selected: string;
};

export async function listProjects(projectsDir: string): Promise<WorkspaceProject[]> {
  const entries = await readdir(projectsDir, { withFileTypes: true });
  const projects: WorkspaceProject[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const projectJsonPath = path.join(projectsDir, entry.name, 'project.json');
    const packageJsonPath = path.join(projectsDir, entry.name, 'package.json');

    try {
      const [projectRaw, packageRaw] = await Promise.all([
        readFile(projectJsonPath, 'utf8'),
        readFile(packageJsonPath, 'utf8'),
      ]);

      const projectJson = JSON.parse(projectRaw);
      const packageJson = JSON.parse(packageRaw);

      projects.push({
        name: projectJson.name ?? entry.name,
        folder: entry.name,
        private: Boolean(packageJson.private),
        publishable: !packageJson.private,
        hasLintTarget: Boolean(projectJson.targets?.lint),
        testable: Boolean(projectJson.targets?.test),
      });
    } catch {
      // Skip folders that are not Nx projects with package metadata.
    }
  }

  return projects.sort((a, b) => a.name.localeCompare(b.name));
}

export function findProject(
  projects: WorkspaceProject[],
  value: string,
): WorkspaceProject | undefined {
  const normalized = value.trim().toLowerCase();
  return projects.find(
    (project) =>
      project.name.toLowerCase() === normalized ||
      project.folder.toLowerCase() === normalized ||
      `@trt-web/${project.name.toLowerCase()}` === normalized,
  );
}

export async function chooseProject({
  projects,
  title,
  includeAll = false,
  publishableOnly = false,
  testableOnly = false,
}: {
  projects: WorkspaceProject[];
  title: string;
  includeAll?: boolean;
  publishableOnly?: boolean;
  testableOnly?: boolean;
}): Promise<string> {
  const choices = [];

  for (const project of projects) {
    if (publishableOnly && !project.publishable) {
      continue;
    }

    if (testableOnly && !project.testable) {
      continue;
    }

    choices.push({
      name: project.name,
      message: project.private ? `${project.name} [private]` : project.name,
      value: project.name,
      disabled: project.publishable ? false : 'private package',
    });
  }

  if (includeAll) {
    choices.push({
      name: 'all',
      message: 'all',
      value: 'all',
    });
  }

  const result = await enquirer.prompt<SelectPromptResult>({
    type: 'select',
    name: 'selected',
    message: title,
    choices,
  });

  return result.selected;
}

export async function resolveBuildTarget(
  projects: WorkspaceProject[],
  projectArg: string | undefined,
  options: { project?: string; all?: boolean },
): Promise<BuildTarget> {
  if (options.all) {
    return { type: 'all' };
  }

  const explicit = options.project ?? projectArg;
  if (explicit) {
    const project = findProject(projects, explicit);
    if (!project) {
      throw new Error(`Project not found: ${explicit}`);
    }
    return { type: 'project', project };
  }

  if (!input.isTTY || !output.isTTY) {
    return { type: 'all' };
  }

  const selected = await chooseProject({
    projects,
    title: 'Chon project can build:',
    includeAll: true,
  });

  if (selected === 'all') {
    return { type: 'all' };
  }

  const project = findProject(projects, selected);
  if (!project) {
    throw new Error(`Project not found: ${selected}`);
  }

  return { type: 'project', project };
}

export async function resolvePackageTarget(
  projects: WorkspaceProject[],
  projectArg: string | undefined,
  options: { project?: string; all?: boolean },
): Promise<PackageTarget> {
  if (options.all) {
    return { type: 'all' };
  }

  const explicit = options.project ?? projectArg;
  if (explicit) {
    const project = findProject(projects, explicit);
    if (!project) {
      throw new Error(`Project not found: ${explicit}`);
    }
    return { type: 'project', project };
  }

  if (!input.isTTY || !output.isTTY) {
    return { type: 'all' };
  }

  const selected = await chooseProject({
    projects,
    title: 'Chon project can check package:',
    includeAll: true,
  });

  if (selected === 'all') {
    return { type: 'all' };
  }

  const project = findProject(projects, selected);
  if (!project) {
    throw new Error(`Project not found: ${selected}`);
  }

  return { type: 'project', project };
}

export async function resolveLintTarget(
  projects: WorkspaceProject[],
  projectArg: string | undefined,
  options: { project?: string; all?: boolean },
): Promise<LintTarget> {
  const projectsWithLintTarget = projects.filter((project) => project.hasLintTarget);

  if (projectsWithLintTarget.length === 0) {
    throw new Error('No projects have a lint target.');
  }

  if (options.all) {
    return { type: 'all' };
  }

  const explicit = options.project ?? projectArg;
  if (explicit) {
    const project = findProject(projectsWithLintTarget, explicit);
    if (!project) {
      throw new Error(`No project with a lint target was found: ${explicit}`);
    }
    return { type: 'project', project };
  }

  if (!input.isTTY || !output.isTTY) {
    return { type: 'all' };
  }

  const selected = await chooseProject({
    projects: projectsWithLintTarget,
    title: 'Chon project can lint:',
    includeAll: true,
  });

  if (selected === 'all') {
    return { type: 'all' };
  }

  const project = findProject(projectsWithLintTarget, selected);
  if (!project) {
    throw new Error(`No project with a lint target was found: ${selected}`);
  }

  return { type: 'project', project };
}

export async function resolveReleaseTarget(
  projects: WorkspaceProject[],
  projectArg: string | undefined,
  options: { project?: string },
): Promise<WorkspaceProject> {
  const explicit = options.project ?? projectArg;
  if (explicit) {
    const project = findProject(projects, explicit);
    if (!project) {
      throw new Error(`Project not found: ${explicit}`);
    }
    return project;
  }

  if (!input.isTTY || !output.isTTY) {
    throw new Error('Release script requires an interactive TTY or an explicit project.');
  }

  const selected = await chooseProject({
    projects,
    title: 'Chon project can release:',
    publishableOnly: false,
  });

  const project = findProject(projects, selected);
  if (!project) {
    throw new Error(`Project not found: ${selected}`);
  }

  return project;
}

export async function resolveTestTarget(
  projects: WorkspaceProject[],
  projectArg: string | undefined,
  options: { project?: string; all?: boolean },
): Promise<TestTarget> {
  const testableProjects = projects.filter((project) => project.testable);

  if (testableProjects.length === 0) {
    throw new Error('No projects have a test target.');
  }

  if (options.all) {
    return { type: 'all' };
  }

  const explicit = options.project ?? projectArg;
  if (explicit) {
    const project = findProject(testableProjects, explicit);
    if (!project) {
      throw new Error(`No project with a test target was found: ${explicit}`);
    }
    return { type: 'project', project };
  }

  if (!input.isTTY || !output.isTTY) {
    return { type: 'all' };
  }

  const selected = await chooseProject({
    projects: testableProjects,
    title: 'Chon project can test:',
    includeAll: true,
    testableOnly: true,
  });

  if (selected === 'all') {
    return { type: 'all' };
  }

  const project = findProject(testableProjects, selected);
  if (!project) {
    throw new Error(`No project with a test target was found: ${selected}`);
  }

  return { type: 'project', project };
}

export async function publishProject(repoRoot: string, project: WorkspaceProject): Promise<number> {
  const distPackageJsonPath = path.join(repoRoot, 'dist', project.folder, 'package.json');
  const raw = await readFile(distPackageJsonPath, 'utf8');
  const packageJson = JSON.parse(raw);

  if (packageJson.private) {
    throw new Error(`Project ${project.name} is marked private, so it will not be published.`);
  }

  if (packageJson.scripts?.prepublishOnly) {
    throw new Error(
      [
        `Project ${project.name} has a prepublishOnly guard in dist/${project.folder}/package.json.`,
        'This package is currently not publishable as-is.',
      ].join('\n'),
    );
  }

  return runCommand('npm', ['publish'], path.join(repoRoot, 'dist', project.folder));
}
