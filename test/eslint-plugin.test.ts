import parser from '@typescript-eslint/parser';
import { RuleTester } from 'eslint';
import { defineConfig } from 'eslint/config';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, test } from 'vitest';

import Maybe from 'true-myth/maybe';

import { Resolver, mustUseTypesFrom } from '../src/eslint-plugin/true-myth-support.js';
import trueMythPlugin, { mustAwaitTask, mustUse } from 'true-myth/eslint-plugin';

// RuleTester defaults to global test functions; this repo imports Vitest APIs.
RuleTester.describe = describe;
RuleTester.it = it;

const testDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(testDirectory, '..');
const ruleTesterFixture = 'test/fixtures/eslint-plugin-rule-tester.ts';

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: projectRoot,
    },
  },
});

const declarations = `
import Result, { type Result as TrueMythResult } from 'true-myth/result';
import Task, { reject, resolve, type Task as TrueMythTask } from 'true-myth/task';

declare const TaskCtor: {
  new(): TrueMythTask<number, string>;
};

declare const ResultCtor: {
  new(): TrueMythResult<number, string>;
};

declare function returnsResult(): TrueMythResult<number, string>;
declare function returnsTask(): TrueMythTask<number, string>;
declare const service: {
  check(): TrueMythResult<number, string>;
  load(): TrueMythTask<number, string>;
};
declare const fn: (value: number) => number;
declare const cond: (value: number) => boolean;
declare function consume(value: TrueMythResult<number, string>): void;
declare function consumeTask(value: TrueMythTask<number, string>): void;
`;

const additionalTypeDeclarations = `
import type { MyType, MyTask, Res } from 'my-lib';
import type DefaultMyType from 'my-lib/my-type';

declare function returnsMyType(): MyType<number, string>;
declare function returnsDefaultMyType(): DefaultMyType<number, string>;
declare function returnsMyTask(): MyTask<number, string>;
declare function returnsRes(): Res<number, string>;
`;

const myType = { module: 'my-lib', export: { kind: 'named', name: 'MyType' } };
const defaultMyType = { module: 'my-lib/my-type', export: { kind: 'default' } };
const myTask = { module: 'my-lib', export: { kind: 'named', name: 'MyTask' } };
const resType = { module: 'my-lib', export: { kind: 'named', name: 'Res' } };
const resultType = { module: 'true-myth/result', export: { kind: 'named', name: 'Result' } };
const taskType = { module: 'true-myth/task', export: { kind: 'named', name: 'Task' } };

function validCases(cases: Array<string | RuleTester.ValidTestCase>): RuleTester.ValidTestCase[] {
  return cases.map((testCase) =>
    typeof testCase === 'string'
      ? { code: testCase, filename: ruleTesterFixture }
      : { filename: ruleTesterFixture, ...testCase }
  );
}

function invalidCases(cases: RuleTester.InvalidTestCase[]): RuleTester.InvalidTestCase[] {
  return cases.map((testCase) => ({ filename: ruleTesterFixture, ...testCase }));
}

describe('ESLint plugin', () => {
  test('recommended config is consumable by ESLint defineConfig', () => {
    expect(defineConfig(trueMythPlugin.configs.recommended)).toHaveLength(1);
  });

  test('mustUseTypesFrom parses export-based type specs', () => {
    expect(mustUseTypesFrom([myType, defaultMyType])).toEqual([myType, defaultMyType]);
    expect(mustUseTypesFrom(undefined)).toEqual([]);
  });

  test('mustUseTypesFrom rejects malformed type specs', () => {
    expect(() =>
      mustUseTypesFrom({ module: 'my-lib', export: { kind: 'named', name: 'MyType' } })
    ).toThrow('Expected must-use types to be an array of must-use type definitions');
    expect(() => mustUseTypesFrom([{ lol: 'rofl' }])).toThrow(
      'Invalid must-use types: must-use types[0]: module must be a string, export must be'
    );
    expect(() => mustUseTypesFrom([{ module: 'my-lib' }])).toThrow(
      'Invalid must-use types: must-use types[0]: export must be'
    );
    expect(() =>
      mustUseTypesFrom([{ module: 'my-lib', export: { kind: 'lol', name: 'rofl' } }])
    ).toThrow('Invalid must-use types: must-use types[0]: export must be');
    expect(() =>
      mustUseTypesFrom([{ lol: 'rofl' }, { module: 'my-lib', export: { kind: 'lol' } }])
    ).toThrow('must-use types[0]: module must be a string');
    expect(() =>
      mustUseTypesFrom([{ lol: 'rofl' }, { module: 'my-lib', export: { kind: 'lol' } }])
    ).toThrow('must-use types[1]: export must be');
    expect(() => mustUseTypesFrom([{ module: 123, export: { kind: 'default' } }])).toThrow(
      'must-use types[0]: module must be a string'
    );
    expect(() => mustUseTypesFrom([null])).toThrow('must-use types[0]: expected an object');
  });

  test('Resolver stops on apparent type cycles after checking symbols', () => {
    const firstType = {
      getSymbol() {
        return undefined;
      },
    };
    const secondType = {
      getSymbol() {
        return undefined;
      },
    };
    const resolver = Object.create(Resolver.prototype) as Resolver;
    Object.assign(resolver, {
      checker: {
        getApparentType(type: unknown) {
          return type === firstType ? secondType : firstType;
        },
      },
      obligations: {
        get() {
          return Maybe.nothing();
        },
      },
    });

    expect(resolver.obligationFor(firstType as never).isNothing).toBe(true);
  });

  test('rules are exported', () => {
    expect(
      trueMythPlugin.rules?.['must-use'],
      'the `must-use` rule is exported'
    ).not.toBeUndefined();
    expect(
      trueMythPlugin.rules?.['must-await-task'],
      'the `must-await-task` rule is exported'
    ).not.toBeUndefined();
  });

  test('rules require typed parser services', () => {
    const sourceCode = {
      ast: {},
      getLoc() {
        return {
          end: { column: 0, line: 1 },
          start: { column: 0, line: 1 },
        };
      },
      getRange() {
        return [0, 0] satisfies [number, number];
      },
      parserServices: null,
      text: '',
      traverse() {
        return [][Symbol.iterator]();
      },
    };

    const context: Parameters<typeof mustUse.create>[0] = {
      cwd: projectRoot,
      filename: ruleTesterFixture,
      id: 'true-myth/must-use',
      languageOptions: {},
      options: [],
      physicalFilename: ruleTesterFixture,
      report() {},
      settings: {},
      sourceCode,
    };

    expect(() => {
      mustUse.create(context);
    }).toThrow('requires typed linting');
  });

  test('rules reject malformed options when called directly', () => {
    const sourceCode = {
      ast: {},
      getLoc() {
        return {
          end: { column: 0, line: 1 },
          start: { column: 0, line: 1 },
        };
      },
      getRange() {
        return [0, 0] satisfies [number, number];
      },
      parserServices: {
        esTreeNodeToTSNodeMap: new Map(),
        getTypeAtLocation() {
          throw new Error('not needed');
        },
        program: {
          getTypeChecker() {
            return {};
          },
        },
      },
      text: '',
      traverse() {
        return [][Symbol.iterator]();
      },
    };

    expect(() => {
      mustUse.create({
        cwd: projectRoot,
        filename: ruleTesterFixture,
        id: 'true-myth/must-use',
        languageOptions: {},
        options: [{ allowVoid: 'nope' }],
        physicalFilename: ruleTesterFixture,
        report() {},
        settings: {},
        sourceCode,
      });
    }).toThrow('Expected allowVoid to be a boolean or an array of must-use types.');

    expect(() => {
      mustUse.create({
        cwd: projectRoot,
        filename: ruleTesterFixture,
        id: 'true-myth/must-use',
        languageOptions: {},
        options: [{ allowVoid: [{ lol: 'rofl' }] }],
        physicalFilename: ruleTesterFixture,
        report() {},
        settings: {},
        sourceCode,
      });
    }).toThrow('Invalid allowVoid: allowVoid[0]: module must be a string, export must be');

    expect(() => {
      mustUse.create({
        cwd: projectRoot,
        filename: ruleTesterFixture,
        id: 'true-myth/must-use',
        languageOptions: {},
        options: [123],
        physicalFilename: ruleTesterFixture,
        report() {},
        settings: {},
        sourceCode,
      });
    }).toThrow('Expected must-use options to be an object.');

    expect(() => {
      mustAwaitTask.create({
        cwd: projectRoot,
        filename: ruleTesterFixture,
        id: 'true-myth/must-await-task',
        languageOptions: {},
        options: [123],
        physicalFilename: ruleTesterFixture,
        report() {},
        settings: {},
        sourceCode,
      });
    }).toThrow('Expected must-await-task options to be an object.');
  });
});

ruleTester.run('must-use', mustUse, {
  valid: validCases([
    {
      name: 'uses Result via assignment',
      code: `${declarations}
const value = returnsResult();
`,
    },
    {
      name: 'uses Task via assignment',
      code: `${declarations}
const value = returnsTask();
`,
    },
    {
      name: 'uses Result via return',
      code: `${declarations}
function getValue() {
  return returnsResult();
}
`,
    },
    {
      name: 'uses Task via return',
      code: `${declarations}
function getValue() {
  return returnsTask();
}
`,
    },
    {
      name: 'uses Result as an argument',
      code: `${declarations}
consume(returnsResult());
`,
    },
    {
      name: 'uses Task as an argument',
      code: `${declarations}
declare function consumeTask(value: TrueMythTask<number, string>): void;
consumeTask(returnsTask());
`,
    },
    {
      name: 'uses re-exported Result via assignment',
      code: `
import type { Result as ReexportedResult } from './true-myth-reexport.js';

declare function returnsResult(): ReexportedResult<number, string>;

const value = returnsResult();
`,
    },
    {
      name: 'uses re-exported Task via assignment',
      code: `
import type { Task as ReexportedTask } from './true-myth-reexport.js';

declare function returnsTask(): ReexportedTask<number, string>;

const value = returnsTask();
`,
    },
    {
      name: 'uses namespace Result via assignment',
      code: `
import * as trueMyth from 'true-myth';

declare function returnsResult(): trueMyth.Result<number, string>;

const value = returnsResult();
`,
    },
    {
      name: 'uses namespace Task via assignment',
      code: `
import * as trueMyth from 'true-myth';

declare function returnsTask(): trueMyth.Task<number, string>;

const value = returnsTask();
`,
    },
    {
      name: 'uses Result through unwrapping',
      code: `${declarations}
returnsResult().unwrapOr(0);
`,
    },
    {
      name: 'explicitly discards Result with void',
      code: `${declarations}
void returnsResult();
`,
    },
    {
      name: 'explicitly discards Task with void',
      code: `${declarations}
void returnsTask();
`,
    },
    {
      name: 'explicitly executes and discards Task with void await',
      code: `${declarations}
async function run() {
  void await returnsTask();
}
`,
    },
    {
      name: 'allows void discard for Result only',
      code: `${declarations}
void returnsResult();
`,
      options: [{ allowVoid: [resultType] }],
    },
    {
      name: 'allows void discard for Task only',
      code: `${declarations}
void returnsTask();
`,
      options: [{ allowVoid: [taskType] }],
    },
    {
      name: 'allows void await discard for Task only',
      code: `${declarations}
async function run() {
  void await returnsTask();
}
`,
      options: [{ allowVoid: [taskType] }],
    },
    {
      name: 'allows void discard for Result and Task',
      code: `${declarations}
void returnsResult();
void returnsTask();
`,
      options: [{ allowVoid: [resultType, taskType] }],
    },
    {
      name: 'uses default void handling for empty options',
      code: `${declarations}
void returnsTask();
`,
      options: [{}],
    },
    {
      name: 'allows non-must-use return type',
      code: `${declarations}
declare function returnsNumber(): number;
returnsNumber();
`,
    },
    {
      name: 'allows non-call expression statement',
      code: `${declarations}
1;
`,
    },
    {
      name: 'allows asserted void discard',
      code: `${declarations}
void (returnsTask() as TrueMythTask<number, string>);
`,
    },
    {
      name: 'ignores local Result with the same name',
      code: `
type Result<T, E> = { value: T; error?: E };
declare function returnsResult(): Result<number, string>;
returnsResult();
`,
    },
    {
      name: 'does not require custom type without option',
      code: `
type Outcome<T, E> = { value: T };
declare function returnsOutcome(): Outcome<number, string>;
returnsOutcome();
`,
    },
    {
      name: 'allows void discard for additional named export',
      code: `${additionalTypeDeclarations}
void returnsMyType();
`,
      options: [
        {
          additionalTypes: [myType],
          allowVoid: [myType],
        },
      ],
    },
    {
      name: 'allows void discard for additional default export',
      code: `${additionalTypeDeclarations}
void returnsDefaultMyType();
`,
      options: [
        {
          additionalTypes: [defaultMyType],
          allowVoid: [defaultMyType],
        },
      ],
    },
    {
      name: 'skips unresolvable additional type',
      code: `
interface MissingResult<T, E> {
  readonly value: T;
  readonly error?: E;
}

declare function returnsMissingType(): MissingResult<number, string>;
returnsMissingType();
`,
      options: [
        {
          additionalTypes: [
            { module: 'missing-lib', export: { kind: 'named', name: 'MissingResult' } },
          ],
        },
      ],
    },
    {
      name: 'does not require unrelated Result type',
      code: `
type Result<T, E> = { value: T; error?: E };
declare function returnsLocalResult(): Result<number, string>;
returnsLocalResult();
`,
    },
    {
      name: 'does not require unrelated Task type',
      code: `
type Task<T, E> = { value: T; error?: E };
declare function returnsLocalTask(): Task<number, string>;
returnsLocalTask();
`,
    },
  ]),
  invalid: invalidCases([
    {
      name: 'rejects bare Result-returning call',
      code: `${declarations}
returnsResult();
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects bare Task-returning call',
      code: `${declarations}
returnsTask();
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects bare Result-returning method call',
      code: `${declarations}
service.check();
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects bare Task-returning method call',
      code: `${declarations}
service.load();
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects bare re-exported Result-returning call',
      code: `
import type { Result as ReexportedResult } from './true-myth-reexport.js';

declare function returnsResult(): ReexportedResult<number, string>;

returnsResult();
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects bare re-exported Task-returning call',
      code: `
import type { Task as ReexportedTask } from './true-myth-reexport.js';

declare function returnsTask(): ReexportedTask<number, string>;

returnsTask();
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects bare namespace Result-returning call',
      code: `
import * as trueMyth from 'true-myth';

declare function returnsResult(): trueMyth.Result<number, string>;

returnsResult();
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects bare namespace Task-returning call',
      code: `
import * as trueMyth from 'true-myth';

declare function returnsTask(): trueMyth.Task<number, string>;

returnsTask();
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects bare Result constructor function',
      code: `${declarations}
Result.ok(1);
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects bare Task constructor function',
      code: `${declarations}
Task.resolve(1);
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects bare new expression returning Result',
      code: `${declarations}
new ResultCtor();
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects bare new expression returning Task',
      code: `${declarations}
new TaskCtor();
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects bare Result-returning chain',
      code: `${declarations}
returnsResult().map(fn);
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects bare Task-returning chain',
      code: `${declarations}
returnsTask().map(fn);
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects optional Result-returning chain',
      code: `${declarations}
returnsResult()?.map(fn);
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects optional Task-returning chain',
      code: `${declarations}
returnsTask()?.map(fn);
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects asserted Result-returning call',
      code: `${declarations}
(returnsResult() as TrueMythResult<number, string>);
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects asserted Task-returning call',
      code: `${declarations}
(returnsTask() as TrueMythTask<number, string>);
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects type-asserted Result-returning call',
      code: `${declarations}
(<TrueMythResult<number, string>>returnsResult());
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects type-asserted Task-returning call',
      code: `${declarations}
(<TrueMythTask<number, string>>returnsTask());
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects non-null asserted Result-returning call',
      code: `${declarations}
returnsResult()!;
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects non-null asserted Task-returning call',
      code: `${declarations}
returnsTask()!;
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects awaited Task result without use',
      code: `${declarations}
async function run() {
  await returnsTask();
}
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects awaited Result without use',
      code: `${declarations}
async function run() {
  await returnsResult();
}
`,
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects awaited additional await-like type without use',
      code: `${additionalTypeDeclarations}
async function run() {
  await returnsMyTask();
}
`,
      options: [{ additionalTypes: [myTask] }],
      errors: [{ messageId: 'unusedMustUseValue', data: { typeName: 'my-lib MyTask export' } }],
    },
    {
      name: 'rejects void discard when disabled',
      code: `${declarations}
void returnsResult();
`,
      options: [{ allowVoid: false }],
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects Task void discard when disabled',
      code: `${declarations}
void returnsTask();
`,
      options: [{ allowVoid: false }],
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects Result void discard when only Task is allowed',
      code: `${declarations}
void returnsResult();
`,
      options: [{ allowVoid: [taskType] }],
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects Task void discard when only Result is allowed',
      code: `${declarations}
void returnsTask();
`,
      options: [{ allowVoid: [resultType] }],
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects void await Task discard when only Result is allowed',
      code: `${declarations}
async function run() {
  void await returnsTask();
}
`,
      options: [{ allowVoid: [resultType] }],
      errors: [{ messageId: 'unusedMustUseValue' }],
    },
    {
      name: 'rejects bare additional type',
      code: `${additionalTypeDeclarations}
returnsMyType();
`,
      options: [{ additionalTypes: [myType] }],
      errors: [{ messageId: 'unusedMustUseValue', data: { typeName: 'my-lib MyType export' } }],
    },
    {
      name: 'rejects bare additional default export',
      code: `${additionalTypeDeclarations}
returnsDefaultMyType();
`,
      options: [{ additionalTypes: [defaultMyType] }],
      errors: [
        { messageId: 'unusedMustUseValue', data: { typeName: 'my-lib/my-type default export' } },
      ],
    },
    {
      name: 'rejects additional namespace type',
      code: `
import * as myLib from 'my-lib';

declare function returnsMyType(): myLib.MyType<number, string>;

returnsMyType();
`,
      options: [{ additionalTypes: [myType] }],
      errors: [{ messageId: 'unusedMustUseValue', data: { typeName: 'my-lib MyType export' } }],
    },
    {
      name: 'rejects void discard when allowVoid export does not match',
      code: `${additionalTypeDeclarations}
void returnsRes();
`,
      options: [{ additionalTypes: [resType], allowVoid: [myType] }],
      errors: [{ messageId: 'unusedMustUseValue', data: { typeName: 'my-lib Res export' } }],
    },
  ]),
});

ruleTester.run('must-await-task', mustAwaitTask, {
  valid: validCases([
    {
      name: 'awaits Task-returning call',
      code: `${declarations}
async function run() {
  await returnsTask();
}
`,
    },
    {
      name: 'explicitly awaits and discards Task-returning call',
      code: `${declarations}
async function run() {
  void await returnsTask();
}
`,
    },
    {
      name: 'awaits chained Task-returning call',
      code: `${declarations}
async function run() {
  await returnsTask().map(fn);
}
`,
    },
    {
      name: 'awaits chained Task-returning method call',
      code: `${declarations}
async function run() {
  await service.load().map(fn);
}
`,
    },
    {
      name: 'awaits optional chained Task-returning call',
      code: `${declarations}
async function run() {
  await returnsTask()?.map(fn);
}
`,
    },
    {
      name: 'awaits parenthesized optional chained Task-returning call',
      code: `${declarations}
async function run() {
  await (returnsTask()?.map)(fn);
}
`,
    },
    {
      name: 'awaits asserted Task-returning call',
      code: `${declarations}
async function run() {
  await (returnsTask() as TrueMythTask<number, string>);
}
`,
    },
    {
      name: 'awaits asserted chained Task-returning call',
      code: `${declarations}
async function run() {
  await (returnsTask() as TrueMythTask<number, string>).map(fn);
}
`,
    },
    {
      name: 'awaits non-null asserted chained Task-returning call',
      code: `${declarations}
async function run() {
  await returnsTask()!.map(fn);
}
`,
    },
    {
      name: 'awaits Task constructor function',
      code: `${declarations}
async function run() {
  await Task.resolve(1);
}
`,
    },
    {
      name: 'awaits optional Task-returning call',
      code: `${declarations}
async function run() {
  await returnsTask?.();
}
`,
    },
    {
      name: 'awaits new expression returning Task',
      code: `${declarations}
async function run() {
  await new TaskCtor();
}
`,
    },
    {
      name: 'binds Task-returning call for later handling',
      code: `${declarations}
const value = returnsTask();
`,
    },
    {
      name: 'binds Task constructor helpers for later handling',
      code: `${declarations}
let resolvedTask = resolve("Hello");
let rejectedTask = reject("Oh no!");
`,
    },
    {
      name: 'assigns Task-returning call for later handling',
      code: `${declarations}
let value: TrueMythTask<number, string>;
value = returnsTask();
`,
    },
    {
      name: 'returns Task-returning call for later handling',
      code: `${declarations}
function getValue() {
  return returnsTask();
}
`,
    },
    {
      name: 'passes Task-returning call for later handling',
      code: `${declarations}
consumeTask(returnsTask());
`,
    },
    {
      name: 'returns Task constructor helpers from combinator callback',
      code: `${declarations}
const nextTask = returnsTask().andThen((value) => {
  if (cond(value)) {
    return resolve(value);
  }

  return reject("Oh no!");
});
`,
    },
    {
      name: 'returns Task constructor helper from expression-bodied callback',
      code: `${declarations}
const nextTask = returnsTask().andThen((value) => resolve(value));
`,
    },
    {
      name: 'returns Task constructor helpers from conditional callback',
      code: `${declarations}
const nextTask = returnsTask().andThen((value) =>
  cond(value) ? resolve(value) : reject("Oh no!")
);
`,
    },
    {
      name: 'ignores Result-returning call',
      code: `${declarations}
const value = returnsResult();
`,
    },
    {
      name: 'ignores unrelated Task type',
      code: `
type Task<T, E> = { value: T; error?: E };
declare function returnsLocalTask(): Task<number, string>;
const value = returnsLocalTask();
`,
    },
    {
      name: 'uses default additional types for empty options',
      code: `${declarations}
const value = returnsTask();
`,
      options: [{}],
    },
    {
      name: 'awaits additional must-await type',
      code: `${additionalTypeDeclarations}
async function run() {
  await returnsMyTask();
}
`,
      options: [{ additionalTypes: [myTask] }],
    },
    {
      name: 'ignores additional type when module is unresolvable',
      code: `
interface MissingTask<T, E> {
  readonly value: T;
  readonly error?: E;
}

declare function returnsMissingTask(): MissingTask<number, string>;
returnsMissingTask();
`,
      options: [
        {
          additionalTypes: [
            { module: 'missing-lib', export: { kind: 'named', name: 'MissingTask' } },
          ],
        },
      ],
    },
  ]),
  invalid: invalidCases([
    {
      name: 'rejects bare Task-returning call',
      code: `${declarations}
returnsTask();
`,
      errors: [{ messageId: 'unawaitedTask' }],
    },
    {
      name: 'rejects bare Task-returning method call',
      code: `${declarations}
service.load();
`,
      errors: [{ messageId: 'unawaitedTask' }],
    },
    {
      name: 'rejects unawaited Task-returning chain',
      code: `${declarations}
returnsTask().map(fn);
`,
      errors: [{ messageId: 'unawaitedTask' }],
    },
    {
      name: 'rejects unawaited Task-returning method chain',
      code: `${declarations}
service.load().map(fn);
`,
      errors: [{ messageId: 'unawaitedTask' }],
    },
    {
      name: 'rejects unawaited optional Task-returning chain',
      code: `${declarations}
returnsTask()?.map(fn);
`,
      errors: [{ messageId: 'unawaitedTask' }],
    },
    {
      name: 'rejects unawaited optional Task-returning method call',
      code: `${declarations}
returnsTask().map?.(fn);
`,
      errors: [{ messageId: 'unawaitedTask' }],
    },
    {
      name: 'rejects Task-returning call used as member key',
      code: `${declarations}
declare const keyedService: Record<string, number>;
keyedService[returnsTask()];
`,
      errors: [{ messageId: 'unawaitedTask' }],
    },
    {
      name: 'rejects unawaited asserted Task-returning chain',
      code: `${declarations}
(returnsTask() as TrueMythTask<number, string>).map(fn);
`,
      errors: [{ messageId: 'unawaitedTask' }],
    },
    {
      name: 'rejects unawaited non-null asserted Task-returning chain',
      code: `${declarations}
returnsTask()!.map(fn);
`,
      errors: [{ messageId: 'unawaitedTask' }],
    },
    {
      name: 'rejects unawaited nested Task-returning chain',
      code: `${declarations}
returnsTask().map(fn).map(fn);
`,
      errors: [{ messageId: 'unawaitedTask' }],
    },
    {
      name: 'rejects void Task-returning call',
      code: `${declarations}
void returnsTask();
`,
      errors: [{ messageId: 'unawaitedTask' }],
    },
    {
      name: 'rejects bare Task constructor function',
      code: `${declarations}
Task.resolve(1);
`,
      errors: [{ messageId: 'unawaitedTask' }],
    },
    {
      name: 'rejects floating standalone Task constructor helper',
      code: `${declarations}
resolve("Hello");
`,
      errors: [{ messageId: 'unawaitedTask' }],
    },
    {
      name: 'rejects floating conditional Task constructor helpers',
      code: `${declarations}
cond(1) ? resolve("Hello") : reject("Oh no!");
`,
      errors: [{ messageId: 'unawaitedTask' }, { messageId: 'unawaitedTask' }],
    },
    {
      name: 'rejects optional bare Task-returning call',
      code: `${declarations}
returnsTask?.();
`,
      errors: [{ messageId: 'unawaitedTask' }],
    },
    {
      name: 'rejects bare new expression returning Task',
      code: `${declarations}
new TaskCtor();
`,
      errors: [{ messageId: 'unawaitedTask' }],
    },
    {
      name: 'rejects bare re-exported Task-returning call',
      code: `
import type { Task as ReexportedTask } from './true-myth-reexport.js';

declare function returnsTask(): ReexportedTask<number, string>;

returnsTask();
`,
      errors: [{ messageId: 'unawaitedTask' }],
    },
    {
      name: 'rejects bare namespace Task-returning call',
      code: `
import * as trueMyth from 'true-myth';

declare function returnsTask(): trueMyth.Task<number, string>;

returnsTask();
`,
      errors: [{ messageId: 'unawaitedTask' }],
    },
    {
      name: 'rejects bare additional must-await type',
      code: `${additionalTypeDeclarations}
returnsMyTask();
`,
      options: [{ additionalTypes: [myTask] }],
      errors: [{ messageId: 'unawaitedTask' }],
    },
  ]),
});
