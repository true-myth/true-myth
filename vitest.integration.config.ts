import { defineConfig } from 'vitest/config';

import { BaseConfig } from './vitest.config.js';

const IntegrationTest = defineConfig({
  ...BaseConfig,
  test: {
    include: ['test/integration/*.test.ts'],
    exclude: [],
  },
});

export default IntegrationTest;
