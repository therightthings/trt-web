import nx from '@nx/eslint-plugin';
import tseslint from 'typescript-eslint';

export const reactDemoConfig = [
  ...nx.configs['flat/react-base'],
  ...nx.configs['flat/react-jsx'],
  {
    files: ['**/*.{ts,tsx,cts,mts,js,jsx,cjs,mjs}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {},
  },
];

export default reactDemoConfig;
