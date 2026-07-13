import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/projects/vue-demo',
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [vue()],
  test: {
    name: 'vue-demo',
    watch: false,
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    include: ['{src,tests}/**/*.spec.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/projects/vue-demo',
      provider: 'v8' as const,
    },
  },
}));
