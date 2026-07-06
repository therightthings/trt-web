import tsParser from '@typescript-eslint/parser';
import vuePlugin from 'eslint-plugin-vue';

import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  ...vuePlugin.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
  },
];
