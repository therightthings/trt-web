import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': 'off',
      '@angular-eslint/component-selector': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_$',
          varsIgnorePattern: '^_$',
          caughtErrorsIgnorePattern: '^_$',
        },
      ],
      '@angular-eslint/no-input-rename': 'off',
      '@angular-eslint/no-output-on-prefix': 'off',
    },
  },
  {
    files: ['**/*.html'],
    rules: {},
  },
];
