import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    ignores: ['**/package.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
            '{projectRoot}/vitest.config.{js,ts,mjs,mts}',
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-this-alias': 'warn',
      '@typescript-eslint/no-inferrable-types': 'off',
    },
  },
];
