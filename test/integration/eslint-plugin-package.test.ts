import * as childProcess from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as url from 'node:url';

import { describe, expect, test } from 'vitest';

const testDirectory = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.join(testDirectory, '..', '..');

describe('published ESLint plugin package', () => {
  test('imports emitted JavaScript and declarations through package exports', () => {
    childProcess.execFileSync('pnpm', ['build'], { cwd: projectRoot });

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'true-myth-package-'));
    const packageDirectory = path.join(tmpDir, 'node_modules', 'true-myth');

    fs.mkdirSync(packageDirectory, { recursive: true });
    fs.cpSync(path.join(projectRoot, 'dist'), path.join(packageDirectory, 'dist'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(packageDirectory, 'package.json'),
      fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8')
    );

    linkDependency(tmpDir, 'typescript');
    linkDependency(tmpDir, 'eslint');
    linkDependency(tmpDir, '@eslint');
    linkDependency(tmpDir, '@types');
    linkDependency(tmpDir, '@typescript-eslint');

    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ type: 'module' }, null, 2)
    );
    fs.writeFileSync(
      path.join(tmpDir, 'package-consumer.mjs'),
      `
        import { Maybe, Result, Task, Unit, maybe, result, standardSchema, task, toolbelt } from 'true-myth';
        import trueMythPlugin from 'true-myth/eslint-plugin';
        import MaybeDefault, { just } from 'true-myth/maybe';
        import ResultDefault, { ok } from 'true-myth/result';
        import { parserFor } from 'true-myth/standard-schema';
        import TaskDefault, { resolve } from 'true-myth/task';
        import { unwrap } from 'true-myth/test-support';
        import { fromMaybe } from 'true-myth/toolbelt';
        import UnitDefault from 'true-myth/unit';

        if (!trueMythPlugin.rules?.['must-use']) {
          throw new Error('Expected the packed plugin to expose must-use.');
        }

        if (
          Maybe !== MaybeDefault ||
          Result !== ResultDefault ||
          Task !== TaskDefault ||
          Unit !== UnitDefault ||
          just(1).unwrapOr(0) !== 1 ||
          ok(1).unwrapOr(0) !== 1 ||
          unwrap(just(1)) !== 1 ||
          fromMaybe('missing', just(1)).unwrapOr(0) !== 1 ||
          maybe.just(1).unwrapOr(0) !== 1 ||
          result.ok(1).unwrapOr(0) !== 1 ||
          toolbelt.fromMaybe('missing', just(1)).unwrapOr(0) !== 1 ||
          standardSchema.parserFor !== parserFor ||
          task.resolve !== resolve
        ) {
          throw new Error('Expected public true-myth exports to resolve from the packed package.');
        }

        await resolve(1);
        parserFor({ '~standard': { version: 1, vendor: 'test', validate: (value) => ({ value }) } });
      `
    );
    fs.writeFileSync(
      path.join(tmpDir, 'package-consumer.ts'),
      `
        import { Maybe, Result, Task, Unit, maybe, result, standardSchema, task, toolbelt } from 'true-myth';
        import trueMythPlugin from 'true-myth/eslint-plugin';
        import MaybeDefault, { just } from 'true-myth/maybe';
        import ResultDefault, { ok } from 'true-myth/result';
        import { parserFor } from 'true-myth/standard-schema';
        import TaskDefault, { resolve } from 'true-myth/task';
        import { unwrap } from 'true-myth/test-support';
        import { fromMaybe } from 'true-myth/toolbelt';
        import UnitDefault from 'true-myth/unit';

        const mustUse = trueMythPlugin.rules?.['must-use'];
        const value: number = just(1).unwrapOr(0) + ok(1).unwrapOr(0);
        const constructors: [typeof MaybeDefault, typeof ResultDefault, typeof TaskDefault, typeof UnitDefault] = [
          Maybe,
          Result,
          Task,
          Unit,
        ];
        const namespaces = [
          maybe.just(1),
          result.ok(1),
          task.resolve(1),
          toolbelt.fromMaybe('missing', just(1)),
          standardSchema.parserFor,
        ];
        const helpers = [
          unwrap(just(1)),
          fromMaybe('missing', just(1)).unwrapOr(0),
          parserFor,
          resolve,
        ];

        if (!mustUse || value !== 2 || constructors.length !== 4 || namespaces.length !== 5 || helpers.length !== 4) {
          throw new Error('unreachable');
        }
      `
    );
    fs.writeFileSync(
      path.join(tmpDir, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            exactOptionalPropertyTypes: true,
            lib: ['es2022'],
            module: 'Node16',
            moduleResolution: 'Node16',
            noEmit: true,
            strict: true,
            target: 'es2022',
            types: ['node'],
          },
          include: ['package-consumer.ts'],
        },
        null,
        2
      )
    );

    childProcess.execFileSync('node', ['package-consumer.mjs'], { cwd: tmpDir });
    childProcess.execFileSync(
      'node',
      [path.join(projectRoot, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', '.'],
      {
        cwd: tmpDir,
      }
    );

    expect(true).toBe(true);
  }, 30_000);
});

function linkDependency(tmpDir: string, depName: string): void {
  fs.symlinkSync(
    path.join(projectRoot, 'node_modules', depName),
    path.join(tmpDir, 'node_modules', depName),
    'dir'
  );
}
