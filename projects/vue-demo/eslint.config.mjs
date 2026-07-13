import tsParser from '@typescript-eslint/parser';
import vue from 'eslint-plugin-vue';

export const vueDemoConfig = [
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
  },
  {
    files: ['**/*.d.ts'],
    languageOptions: {
      parser: tsParser,
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
];

export default vueDemoConfig;
