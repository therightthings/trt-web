import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/projects/angular',
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    name: 'angular',
    watch: false,
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/projects/angular',
      provider: 'v8' as const,
    },
  },
}));
