const fs = require('node:fs');
const path = require('node:path');

function listProjectScopes() {
  const projectsDir = path.join(__dirname, 'projects');
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

module.exports = {
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
