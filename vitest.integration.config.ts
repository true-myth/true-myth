import { defineConfig } from 'vitest/config';

import { BaseConfig } from './vitest.config.js';

const IntegrationTest = defineConfig({
  ...BaseConfig,
  test: {
    typecheck: {
      tsconfig: './ts/integration-test.tsconfig.json',
      enabled: true,
      include: ['test/integration/*.test.ts'],
    },
    include: ['test/integration/*.test.ts'],
    exclude: []
  }
});

export default IntegrationTest;
