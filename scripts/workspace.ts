import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { stdin as input, stdout as output } from 'node:process';

import enquirer from 'enquirer';

export type WorkspaceProject = {
  name: string;
  folder: string;
  private: boolean;
  publishable: boolean;
  hasPackageJson: boolean;
  hasServeTarget: boolean;
  hasLintTarget: boolean;
  testable: boolean;
};

type ServeTarget = { type: 'project'; project: WorkspaceProject };
type BuildTarget = { type: 'all' } | { type: 'project'; project: WorkspaceProject };
type LintTarget = { type: 'all' } | { type: 'project'; project: WorkspaceProject };
type PackageTarget = { type: 'all' } | { type: 'project'; project: WorkspaceProject };
type TestTarget =
  | { type: 'all'; projects: WorkspaceProject[] }
  | { type: 'project'; project: WorkspaceProject };
type DeadcodeTarget = { type: 'all' } | { type: 'project'; project: WorkspaceProject };

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
      const projectRaw = await readFile(projectJsonPath, 'utf8');
      let hasPackageJson = false;
      let packageJson: { private?: boolean } | undefined;

      try {
        packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8')) as {
          private?: boolean;
        };
        hasPackageJson = true;
      } catch {
        packageJson = undefined;
      }

      const projectJson = JSON.parse(projectRaw);
      const hasServeTarget =
        Boolean(projectJson.targets?.serve) ||
        Boolean(projectJson.targets?.preview) ||
        (projectJson.projectType === 'application' &&
          (await hasViteConfig(path.join(projectsDir, entry.name))));
      const privateProject = packageJson?.private ?? projectJson.projectType === 'application';

      projects.push({
        name: projectJson.name ?? entry.name,
        folder: entry.name,
        private: privateProject,
        publishable: !privateProject,
        hasPackageJson,
        hasServeTarget,
        hasLintTarget: Boolean(projectJson.targets?.lint),
        testable: Boolean(projectJson.targets?.test),
      });
    } catch {
      // Skip folders that are not Nx projects with package metadata.
    }
  }

  return projects.sort((a, b) => a.name.localeCompare(b.name));
}

async function hasViteConfig(projectDir: string): Promise<boolean> {
  const viteConfigs = ['vite.config.ts', 'vite.config.mts', 'vite.config.js', 'vite.config.mjs'];

  for (const configFile of viteConfigs) {
    try {
      await access(path.join(projectDir, configFile));
      return true;
    } catch {
      // Try next candidate.
    }
  }

  return false;
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
  disablePrivatePackages = true,
}: {
  projects: WorkspaceProject[];
  title: string;
  includeAll?: boolean;
  publishableOnly?: boolean;
  testableOnly?: boolean;
  disablePrivatePackages?: boolean;
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
      disabled: disablePrivatePackages && !project.publishable ? 'private package' : false,
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
    title: 'Select a project to build:',
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

export async function resolveServeTarget(
  projects: WorkspaceProject[],
  projectArg: string | undefined,
): Promise<ServeTarget> {
  const serveableProjects = projects.filter((project) => project.hasServeTarget);

  if (serveableProjects.length === 0) {
    throw new Error('No projects have a serve target.');
  }

  const explicit = projectArg?.trim();
  if (explicit) {
    const project = findProject(serveableProjects, explicit);
    if (!project) {
      throw new Error(`No project with a serve target was found: ${explicit}`);
    }
    return { type: 'project', project };
  }

  if (!input.isTTY || !output.isTTY) {
    throw new Error('No project specified and no interactive terminal is available.');
  }

  const selected = await chooseProject({
    projects: serveableProjects,
    title: 'Select a project to serve:',
    includeAll: false,
    disablePrivatePackages: false,
  });

  const project = findProject(serveableProjects, selected);
  if (!project) {
    throw new Error(`No project with a serve target was found: ${selected}`);
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
    title: 'Select a project to check package:',
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
    title: 'Select a project to lint:',
    includeAll: true,
    disablePrivatePackages: false,
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

export async function resolveTestTarget(
  projects: WorkspaceProject[],
  projectArg: string | undefined,
  options: { project?: string; all?: boolean },
  includeE2E = false,
): Promise<TestTarget> {
  const testableProjects = projects.filter(
    (project) => project.testable && (includeE2E ? isE2EProject(project) : !isE2EProject(project)),
  );

  if (testableProjects.length === 0) {
    throw new Error(
      includeE2E ? 'No e2e projects have a test target.' : 'No projects have a test target.',
    );
  }

  if (options.all) {
    return { type: 'all', projects: testableProjects };
  }

  const explicit = options.project ?? projectArg;
  if (explicit) {
    const project = findProject(testableProjects, explicit);
    if (!project) {
      throw new Error(
        includeE2E
          ? `No e2e project with a test target was found: ${explicit}`
          : `No project with a test target was found: ${explicit}`,
      );
    }
    return { type: 'project', project };
  }

  if (!input.isTTY || !output.isTTY) {
    return { type: 'all', projects: testableProjects };
  }

  const selected = await chooseProject({
    projects: testableProjects,
    title: includeE2E ? 'Select an e2e project to test:' : 'Select a project to test:',
    includeAll: true,
    testableOnly: true,
    disablePrivatePackages: false,
  });

  if (selected === 'all') {
    return { type: 'all', projects: testableProjects };
  }

  const project = findProject(testableProjects, selected);
  if (!project) {
    throw new Error(
      includeE2E
        ? `No e2e project with a test target was found: ${selected}`
        : `No project with a test target was found: ${selected}`,
    );
  }

  return { type: 'project', project };
}

function isE2EProject(project: WorkspaceProject): boolean {
  return project.name.endsWith('-e2e') || project.folder.endsWith('-e2e');
}

export async function resolveDeadcodeTarget(
  projects: WorkspaceProject[],
  projectArg: string | undefined,
  options: { project?: string; all?: boolean },
): Promise<DeadcodeTarget> {
  const deadcodeProjects = projects.filter((project) => project.hasPackageJson);

  if (deadcodeProjects.length === 0) {
    throw new Error('No projects have a package.json for dead code checks.');
  }

  if (options.all) {
    return { type: 'all' };
  }

  const explicit = options.project ?? projectArg;
  if (explicit) {
    const project = findProject(deadcodeProjects, explicit);
    if (!project) {
      throw new Error(`No project with a package.json was found: ${explicit}`);
    }
    return { type: 'project', project };
  }

  if (!input.isTTY || !output.isTTY) {
    return { type: 'all' };
  }

  const selected = await chooseProject({
    projects: deadcodeProjects,
    title: 'Select a project to check dead code:',
    includeAll: true,
    disablePrivatePackages: false,
  });

  if (selected === 'all') {
    return { type: 'all' };
  }

  const project = findProject(deadcodeProjects, selected);
  if (!project) {
    throw new Error(`No project with a package.json was found: ${selected}`);
  }

  return { type: 'project', project };
}
