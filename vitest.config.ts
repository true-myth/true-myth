import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    alias: {
      'true-myth': path.resolve(__dirname, './src'),
    },
    include: ['test/*.test.ts'],
    coverage: {
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
