import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export const BaseConfig = defineConfig({
  plugins: [tsconfigPaths()],
});

export default defineConfig({
  ...BaseConfig,
  test: {
    typecheck: {
      tsconfig: './ts/test.tsconfig.json',
      enabled: true,
      include: ['test/*.test.ts'],
    },
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
  }
});
