/// <reference types='vitest' />
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/projects/vue-demo',
  server: {
    port: 8080,
    host: 'localhost',
  },
  preview: {
    port: 8080,
    host: 'localhost',
  },
  plugins: [vue()],
  build: {
    outDir: '../../dist/projects/vue-demo',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    name: 'vue-demo',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/projects/vue-demo',
      provider: 'v8' as const,
    },
  },
}));
