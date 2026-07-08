import nx from '@nx/eslint-plugin';

export const firebaseAdminConfig = [
  ...nx.configs['flat/typescript'],
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
];

export default firebaseAdminConfig;
