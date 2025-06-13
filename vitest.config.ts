import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ['test/*.test.ts'],
    typecheck: {
      enabled: true,
      include: ['test/*.test.ts'],
    },
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
