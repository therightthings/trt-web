import nx from '@nx/eslint-plugin';

export const reactDemoConfig = [
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
];

export default reactDemoConfig;
