import nx from '@nx/eslint-plugin';
import { defineConfig } from 'eslint/config';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

import { angularConfig } from './projects/angular/eslint.config.mjs';
import { coreConfig } from './projects/core/eslint.config.mjs';
import { firebaseAdminConfig } from './projects/firebase-admin/eslint.config.mjs';
import { reactConfig } from './projects/react/eslint.config.mjs';
import { vueConfig } from './projects/vue/eslint.config.mjs';

export default defineConfig([
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/.angular',
      '**/.angular/**',
      '**/eslint.config.*',
      '**/package.json',
      '**/vitest.config.*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
      '**/*.vue',
    ],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
      '**/*.vue',
    ],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    basePath: 'projects/angular',
    files: ['**/*.{ts,html}'],
    extends: [angularConfig],
  },
  {
    basePath: 'projects/core',
    files: ['**/*.{json,ts}'],
    extends: [coreConfig],
  },
  {
    basePath: 'projects/firebase-admin',
    files: ['**/*.ts'],
    extends: [firebaseAdminConfig],
  },
  {
    basePath: 'projects/react',
    files: ['**/*.{ts,tsx,js,jsx}'],
    extends: [reactConfig],
  },
  {
    basePath: 'projects/vue',
    files: ['**/*.vue'],
    extends: [vueConfig],
  },
]);
