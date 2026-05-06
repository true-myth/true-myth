import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export const BaseConfig = defineConfig({
  resolve: {
    alias: [
      {
        find: /^true-myth$/,
        replacement: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      },
      {
        find: /^true-myth\/(.+)$/,
        replacement: fileURLToPath(new URL('./src/$1.ts', import.meta.url)),
      },
    ],
  },
});

export default defineConfig({
  ...BaseConfig,
  test: {
    include: ['test/**/*.test.ts'],
    exclude: ['test/integration'],
    coverage: {
      enabled: true,
      reporter: ['text'],
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts'],
      thresholds: {
        branches: 100,
        functions: 100,
        statements: 100,
        lines: 100,
      },
    },
  },
});
