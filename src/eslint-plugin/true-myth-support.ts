import { RuleContext, RuleDefinition } from '@eslint/core';
import type { TSESTree } from '@typescript-eslint/utils';
import ts from 'typescript';

import Maybe, * as maybe from 'true-myth/maybe';

interface NamedRuleDefinition extends RuleDefinition {
  name: string;
}

export function createRule(rule: NamedRuleDefinition): RuleDefinition {
  return {
    meta: {
      ...rule.meta,
      docs: {
        ...rule.meta?.docs,
        url: `https://true-myth.js.org/eslint-plugin/${rule.name}`,
      },
    },
    create: rule.create,
  };
}

interface TypedParserServices {
  esTreeNodeToTSNodeMap: {
    get(node: TSESTree.Node): ts.Node;
  };
  getTypeAtLocation(node: TSESTree.Node): ts.Type;
  program: ts.Program;
}

export function getTypedParserServices(context: RuleContext): TypedParserServices {
  let sourceCode = context.sourceCode;

  if (!('parserServices' in sourceCode) || !isTypedParserServices(sourceCode.parserServices)) {
    throw new Error(
      'The True Myth ESLint plugin requires typed linting from @typescript-eslint/parser.'
    );
  }

  return sourceCode.parserServices;
}

export type Export = { kind: 'default' } | { kind: 'named'; name: string };

export interface MustUseType {
  module: string;
  export: Export;
}

export class Obligation {
  readonly symbol: ts.Symbol;
  readonly type: MustUseType;
  private readonly equivalentTypes: MustUseType[];

  constructor(symbol: ts.Symbol, type: MustUseType) {
    this.symbol = symbol;
    this.type = type;
    this.equivalentTypes = [type];
  }

  get label(): string {
    switch (this.type.export.kind) {
      case 'default':
        return `${this.type.module} default export`;
      case 'named':
        return `${this.type.module} ${this.type.export.name} export`;
      /* v8 ignore start */
      default:
        return unreachable(this.type.export);
      /* v8 ignore stop */
    }
  }

  addEquivalentType(type: MustUseType): void {
    this.equivalentTypes.push(type);
  }

  matches(type: MustUseType): boolean {
    return this.equivalentTypes.some((equivalentType) => sameMustUseType(equivalentType, type));
  }
}

export function mustUseTypesFrom(value: unknown, optionName = 'must-use types'): MustUseType[] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new TypeError(`Expected ${optionName} to be an array of must-use type definitions.`);
  }

  let parsed = value.reduce(
    (result, item, index) => {
      if (isMustUseType(item)) {
        result.types.push(item);
      } else {
        result.errors.push(`${optionName}[${index}]: ${mustUseTypeErrorFor(item)}`);
      }

      return result;
    },
    { types: new Array<MustUseType>(), errors: new Array<string>() }
  );

  if (parsed.errors.length > 0) {
    throw new TypeError(`Invalid ${optionName}: ${parsed.errors.join('; ')}`);
  }

  return parsed.types;
}

export function sameMustUseType(left: MustUseType, right: MustUseType): boolean {
  if (left.module !== right.module || left.export.kind !== right.export.kind) {
    return false;
  }

  switch (left.export.kind) {
    case 'default':
      return true;
    case 'named':
      return right.export.kind === 'named' && left.export.name === right.export.name;
    /* v8 ignore start */
    default:
      return unreachable(left.export);
    /* v8 ignore stop */
  }
}

class SafeMap<K, V extends {}> {
  #internal = new Map<K, V>();

  set(key: K, value: V) {
    this.#internal.set(key, value);
  }

  get(key: K): Maybe<V> {
    return Maybe.of(this.#internal.get(key));
  }
}

export class Resolver {
  private readonly checker: ts.TypeChecker;
  private readonly obligations = new SafeMap<ts.Symbol, Obligation>();

  constructor(program: ts.Program, checker: ts.TypeChecker, types: MustUseType[]) {
    this.checker = checker;
    this.addTypes(program, types);
  }

  obligationFor(type: ts.Type, seen = new Set<ts.Type>()): Maybe<Obligation> {
    const symbolsForType = [type.aliasSymbol, type.getSymbol(), type.symbol].filter(
      (symbol): symbol is ts.Symbol => symbol !== undefined
    );

    for (let symbol of symbolsForType) {
      let obligation = this.obligations.get(this.canonicalSymbol(symbol));
      if (obligation.isJust) {
        return obligation;
      }
    }

    // If we see this type again, symbol lookup above already failed for it; only
    // apparent-type recursion remains, so stop instead of cycling forever.
    if (seen.has(type)) {
      return maybe.nothing();
    }

    // Otherwise, mark that we have seen it precisely to avoid that cycle.
    seen.add(type);

    // Fall back to the apparent type when direct symbol lookup only sees the
    // local type shape. For example, a value typed as `T` in
    // `T extends Result<number, string>` can expose the configured `Result`
    // export through its apparent type.
    let apparent = this.checker.getApparentType(type);
    if (apparent !== type) {
      return this.obligationFor(apparent, seen);
    }

    return maybe.nothing();
  }

  private addTypes(program: ts.Program, types: MustUseType[]): void {
    let host: ts.ModuleResolutionHost = {
      directoryExists: ts.sys.directoryExists,
      fileExists: ts.sys.fileExists,
      getCurrentDirectory: () => program.getCurrentDirectory(),
      readFile: ts.sys.readFile,
      // ESLint runs this plugin in Node, where TypeScript's system host provides
      // realpath; include it directly instead of branching for non-Node hosts.
      realpath: ts.sys.realpath!,
    };

    for (let type of types) {
      let symbol = maybe
        .first(program.getSourceFiles())
        .flatten()
        .andThen((sourceFile) =>
          Maybe.of(
            ts.resolveModuleName(
              type.module,
              sourceFile.fileName,
              program.getCompilerOptions(),
              host
            ).resolvedModule
          )
        )
        .andThen((resolved) => Maybe.of(program.getSourceFile(resolved.resolvedFileName)))
        .andThen((sourceFile) => Maybe.of(this.checker.getSymbolAtLocation(sourceFile)))
        .andThen((moduleSymbol) =>
          maybe.find(
            (candidate) =>
              candidate.getName() ===
              (type.export.kind === 'default' ? 'default' : type.export.name),
            this.checker.getExportsOfModule(moduleSymbol)
          )
        );

      if (symbol.isJust) {
        let canonical = this.canonicalSymbol(symbol.value);
        let existing = this.obligations.get(canonical);
        if (existing.isJust) {
          existing.value.addEquivalentType(type);
        } else {
          this.obligations.set(canonical, new Obligation(symbol.value, type));
        }
      }
    }
  }

  canonicalSymbol(symbol: ts.Symbol, seen = new Set<ts.Symbol>()): ts.Symbol {
    if (seen.has(symbol) || (symbol.flags & ts.SymbolFlags.Alias) === 0) {
      return symbol;
    }

    seen.add(symbol);
    return this.canonicalSymbol(this.checker.getAliasedSymbol(symbol), seen);
  }
}

const TRUE_MYTH_RESULT_TYPE: MustUseType = {
  export: { kind: 'default' },
  module: 'true-myth/result',
};

const TRUE_MYTH_TASK_TYPE: MustUseType = {
  export: { kind: 'default' },
  module: 'true-myth/task',
};

const TRUE_MYTH_NAMED_RESULT_TYPE: MustUseType = {
  export: { kind: 'named', name: 'Result' },
  module: 'true-myth/result',
};

const TRUE_MYTH_NAMED_TASK_TYPE: MustUseType = {
  export: { kind: 'named', name: 'Task' },
  module: 'true-myth/task',
};

const TRUE_MYTH_ROOT_RESULT_TYPE: MustUseType = {
  export: { kind: 'named', name: 'Result' },
  module: 'true-myth',
};

const TRUE_MYTH_ROOT_TASK_TYPE: MustUseType = {
  export: { kind: 'named', name: 'Task' },
  module: 'true-myth',
};

export const TRUE_MYTH_MUST_USE_TYPES = [
  TRUE_MYTH_RESULT_TYPE,
  TRUE_MYTH_NAMED_RESULT_TYPE,
  TRUE_MYTH_TASK_TYPE,
  TRUE_MYTH_NAMED_TASK_TYPE,
  TRUE_MYTH_ROOT_RESULT_TYPE,
  TRUE_MYTH_ROOT_TASK_TYPE,
];

export const TRUE_MYTH_MUST_AWAIT_TYPES = [
  TRUE_MYTH_TASK_TYPE,
  TRUE_MYTH_NAMED_TASK_TYPE,
  TRUE_MYTH_ROOT_TASK_TYPE,
];

function isTypedParserServices(value: unknown): value is TypedParserServices {
  if (!isIndexable(value)) {
    return false;
  }

  return (
    isMapLike(value.esTreeNodeToTSNodeMap) &&
    hasFunction(value, 'getTypeAtLocation') &&
    hasFunction(value.program, 'getTypeChecker')
  );
}

function isMustUseType(value: unknown): value is MustUseType {
  return isIndexable(value) && typeof value.module === 'string' && isExport(value.export);
}

function mustUseTypeErrorFor(value: unknown): string {
  if (!isIndexable(value)) {
    return 'expected an object';
  }

  let errors: string[] = [];

  if (typeof value.module !== 'string') {
    errors.push('module must be a string');
  }

  if (!isExport(value.export)) {
    errors.push('export must be { kind: "default" } or { kind: "named", name: string }');
  }

  return errors.join(', ');
}

function isExport(value: unknown): value is Export {
  if (!isIndexable(value)) {
    return false;
  }

  switch (value.kind) {
    case 'default':
      return true;
    case 'named':
      return typeof value.name === 'string';
    default:
      return false;
  }
}

function isMapLike(value: unknown): boolean {
  return hasFunction(value, 'get');
}

function hasFunction(value: unknown, name: string): boolean {
  return isIndexable(value) && typeof value[name] === 'function';
}

function isIndexable(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/* v8 ignore start */
function unreachable(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}
/* v8 ignore stop */
