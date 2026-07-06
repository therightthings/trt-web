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
        // more...
      ],
    ],
    'scope-enum': [
      2,
      'always',
      ['angular', 'react', 'vue', 'core', 'firebase-admin', 'ci', 'deps'],
    ],
    'header-max-length': [2, 'always', 100],
    'subject-empty': [2, 'never'],
    'subject-case': [2, 'always', ['lower-case']],
    'type-case': [2, 'always', ['lower-case']],
    'scope-case': [2, 'always', ['lower-case', 'kebab-case']],
    'breaking-change-exclamation-mark': [2, 'always'],
  },
};
