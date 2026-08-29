import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/projects/browser',
  resolve: { tsconfigPaths: true },
  test: {
    name: 'browser',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.spec.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: { reportsDirectory: '../../coverage/projects/browser', provider: 'v8' as const },
  },
}));
