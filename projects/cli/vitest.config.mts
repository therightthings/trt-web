import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/projects/cli',
  resolve: { tsconfigPaths: true },
  test: {
    name: 'cli',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['{src,tests}/**/*.spec.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: { reportsDirectory: '../../coverage/projects/cli', provider: 'v8' as const },
  },
}));
