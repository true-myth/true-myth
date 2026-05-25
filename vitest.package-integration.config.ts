import { defineConfig } from 'vitest/config';

import { BaseConfig } from './vitest.config.js';

const PackageIntegrationTest = defineConfig({
  ...BaseConfig,
  test: {
    include: ['test/integration/eslint-plugin-package.test.ts'],
    exclude: [],
  },
});

export default PackageIntegrationTest;
