import nx from '@nx/eslint-plugin';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { defineConfig } from 'eslint/config';

import { angularDemoConfig } from './projects/angular-demo/eslint.config.mjs';
import { angularConfig } from './projects/angular/eslint.config.mjs';
import { browserConfig } from './projects/browser/eslint.config.mjs';
import { coreConfig } from './projects/core/eslint.config.mjs';
import { firebaseAdminConfig } from './projects/firebase-admin/eslint.config.mjs';
import { reactDemoConfig } from './projects/react-demo/eslint.config.mjs';
import { reactConfig } from './projects/react/eslint.config.mjs';
import { vueDemoConfig } from './projects/vue-demo/eslint.config.mjs';
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
    files: ['commitlint.config.mjs', 'prettier.config.mjs'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
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
    basePath: 'projects/angular-demo',
    files: ['**/*.{ts,html}'],
    extends: [angularDemoConfig],
  },
  {
    basePath: 'projects/core',
    files: ['**/*.{json,ts}'],
    extends: [coreConfig],
  },
  {
    basePath: 'projects/browser',
    files: ['**/*.{json,ts}'],
    extends: [browserConfig],
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
    basePath: 'projects/react-demo',
    files: ['**/*.{ts,tsx,js,jsx}'],
    extends: [reactDemoConfig],
  },
  {
    basePath: 'projects/vue',
    files: ['**/*.vue'],
    extends: [vueConfig],
  },
  {
    basePath: 'projects/vue-demo',
    files: ['**/*.{ts,tsx,js,jsx,vue}'],
    extends: [vueDemoConfig],
  },
]);
