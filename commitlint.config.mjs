import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

function listProjectScopes() {
  const projectsDir = path.join(currentDirectory, 'projects');
  const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
  const scopes = new Set([
    'ci',
    'config',
    'deps',
    'dev-infra',
    'docs',
    'infra',
    'release',
    'scripts',
    'test',
  ]);

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const projectJsonPath = path.join(projectsDir, entry.name, 'project.json');
    if (!fs.existsSync(projectJsonPath)) {
      continue;
    }

    try {
      const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8'));
      scopes.add(projectJson.name ?? entry.name);
    } catch {
      scopes.add(entry.name);
    }
  }

  return Array.from(scopes).sort();
}

export default {
  extends: ['@commitlint/config-angular'],
  ignores: [
    (commit) => commit.startsWith('Merge '),
    (commit) => commit.startsWith('chore(release):'),
  ],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'scope-enum': [2, 'always', listProjectScopes()],
    'header-max-length': [2, 'always', 100],
    'subject-empty': [2, 'never'],
    'subject-case': [2, 'always', ['lower-case']],
    'type-case': [2, 'always', ['lower-case']],
    'scope-case': [2, 'always', ['lower-case', 'kebab-case']],
    'breaking-change-exclamation-mark': [2, 'always'],
  },
};
