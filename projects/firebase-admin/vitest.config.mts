import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/projects/firebase-admin',
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    name: 'firebase-admin',
    watch: false,
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/projects/firebase-admin',
      provider: 'v8' as const,
    },
  },
}));
