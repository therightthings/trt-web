import path from 'node:path';

import { defineConfig } from 'vite';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/projects/core-demo',
  resolve: {
    alias: {
      '@trt-web/core': path.resolve(import.meta.dirname, '../../dist/core/src/public-api.js'),
    },
  },
  server: {
    port: 4300,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  build: {
    outDir: '../../dist/projects/core-demo',
    emptyOutDir: true,
  },
});
