/**
  The True Myth ESLint plugin provides two rules:

  - `mustUse`: requires explicitly handling or ignore `Result` or `Task`
    instances, because not doing so is usually a mistake.
  - `mustAwaitTask`: requires awaiting every `Task` to avoid unhandled async.

  See [the guide](/eslint-plugin/) for details.

  @module
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';

import type { Plugin } from '@eslint/core';
import type { Config } from 'eslint/config';

import { mustAwaitTask } from './must-await-task.js';
import { mustUse } from './must-use.js';

interface TrueMythPlugin extends Plugin {
  configs: {
    readonly recommended: Config;
  };
}

const plugin: TrueMythPlugin = {
  meta: {
    name: 'true-myth',
    namespace: 'true-myth',
    version: versionFromPackageJson(),
  },
  rules: {
    'must-await-task': mustAwaitTask,
    'must-use': mustUse,
  },
  configs: {
    // Uses a getter so it can be lazy and reference itself in `plugins`.
    get recommended(): Config {
      return {
        name: 'true-myth/recommended',
        plugins: {
          'true-myth': plugin,
        },
        rules: {
          'true-myth/must-await-task': 'error',
          'true-myth/must-use': 'error',
        },
      };
    },
  },
};

export { mustAwaitTask, mustUse };
export type { MustUseType } from './true-myth-support.js';
export default plugin;

function versionFromPackageJson(): string {
  const pathToPackageJson = path.join('..', '..', 'package.json');
  const packageJsonURL = new URL(pathToPackageJson, import.meta.url);
  const packageJson: unknown = JSON.parse(readFileSync(packageJsonURL, 'utf8'));

  // We don't need code coverage for the failure cases of True Myth's own
  // `package.json` not being an object...
  /* v8 ignore if */
  if (!isRecord(packageJson)) {
    throw new Error('Could not parse package.json as an object');
  }

  // ...or its not having a version string in it.
  /* v8 ignore if */
  if (typeof packageJson.version !== 'string') {
    throw new Error('Expected package.json to include a string version.');
  }

  return packageJson.version;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
