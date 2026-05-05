import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';

import Maybe from 'true-myth/maybe';

import {
  createRule,
  Resolver,
  TRUE_MYTH_MUST_AWAIT_TYPES,
  TRUE_MYTH_MUST_USE_TYPES,
  getTypedParserServices,
  mustUseTypesFrom,
  type MustUseType,
  type Obligation,
} from './true-myth-support.js';

type AllowVoid = boolean | MustUseType[];

interface Options {
  allowVoid?: AllowVoid;
  additionalTypes?: MustUseType[];
}

const MESSAGE_ID = 'unusedMustUseValue';
type MESSAGE_ID = typeof MESSAGE_ID;

const DEFAULT_OPTIONS: Required<Options> = {
  additionalTypes: [],
  allowVoid: true,
};

const mustUseTypeSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    export: {
      anyOf: [
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            kind: { enum: ['default'], type: 'string' },
          },
          required: ['kind'],
        },
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            kind: { enum: ['named'], type: 'string' },
            name: { type: 'string' },
          },
          required: ['kind', 'name'],
        },
      ],
    },
    module: { type: 'string' },
  },
  required: ['module', 'export'],
};

/**
  Requires callers to use True Myth `Result` and `Task` values.

  @see https://true-myth.js.org/eslint-plugin/must-use
 */
export const mustUse = createRule({
  name: 'must-use',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require callers to use values whose type must not be discarded.',
    },
    messages: {
      [MESSAGE_ID]: '{{typeName}} values should be used or explicitly discarded with `void`.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowVoid: {
            anyOf: [
              {
                type: 'boolean',
              },
              {
                type: 'array',
                items: {
                  ...mustUseTypeSchema,
                },
                uniqueItems: true,
              },
            ],
          },
          additionalTypes: {
            type: 'array',
            items: {
              ...mustUseTypeSchema,
            },
          },
        },
      },
    ],
  },
  create(context) {
    const services = getTypedParserServices(context);
    const checker = services.program.getTypeChecker();
    const options = optionsFrom(context.options[0]);
    const mustAwaitTypes = [...TRUE_MYTH_MUST_AWAIT_TYPES, ...options.additionalTypes];
    const resolver = new Resolver(services.program, checker, [
      ...TRUE_MYTH_MUST_USE_TYPES,
      ...options.additionalTypes,
    ]);

    return {
      ExpressionStatement(node: TSESTree.ExpressionStatement): void {
        const candidate = unwrapExpressionStatement(node.expression);
        const expression = candidate.expression;
        if (!isMustUseCandidate(expression)) {
          return;
        }

        const obligation = obligationForExpression(expression);
        if (obligation.isJust) {
          if (candidate.explicitlyDiscarded && allowVoidFor(obligation.value, options.allowVoid)) {
            return;
          }

          context.report({
            node: expression,
            messageId: 'unusedMustUseValue',
            data: {
              typeName: obligation.value.label,
            },
          });
        }
      },
    };

    function obligationForExpression(
      expression: TSESTree.AwaitExpression | TSESTree.CallExpression | TSESTree.NewExpression
    ): Maybe<Obligation> {
      if (expression.type === AST_NODE_TYPES.AwaitExpression) {
        let obligation = resolver.obligationFor(services.getTypeAtLocation(expression.argument));

        if (obligation.isJust && isAwaitObligation(obligation.value, mustAwaitTypes)) {
          return obligation;
        }
      }

      return resolver.obligationFor(services.getTypeAtLocation(expression));
    }
  },
});

function unwrapExpressionStatement(expression: TSESTree.Expression): {
  explicitlyDiscarded: boolean;
  expression: TSESTree.Expression;
} {
  let current = expression;

  while (true) {
    if (current.type === AST_NODE_TYPES.UnaryExpression && current.operator === 'void') {
      return {
        explicitlyDiscarded: true,
        expression: unwrapSyntax(current.argument),
      };
    }

    let next = unwrapSyntaxOnce(current);
    if (next === current) {
      return {
        explicitlyDiscarded: false,
        expression: current,
      };
    }

    current = next;
  }
}

function unwrapSyntax(expression: TSESTree.Expression): TSESTree.Expression {
  let current = expression;
  while (true) {
    let next = unwrapSyntaxOnce(current);
    if (next === current) {
      return current;
    }

    current = next;
  }
}

function unwrapSyntaxOnce(expression: TSESTree.Expression): TSESTree.Expression {
  switch (expression.type) {
    case AST_NODE_TYPES.ChainExpression:
      return expression.expression;
    case AST_NODE_TYPES.TSAsExpression:
    case AST_NODE_TYPES.TSNonNullExpression:
    case AST_NODE_TYPES.TSTypeAssertion:
      return expression.expression;
    default:
      return expression;
  }
}

function isMustUseCandidate(
  expression: TSESTree.Expression
): expression is TSESTree.AwaitExpression | TSESTree.CallExpression | TSESTree.NewExpression {
  return (
    expression.type === AST_NODE_TYPES.AwaitExpression ||
    expression.type === AST_NODE_TYPES.CallExpression ||
    expression.type === AST_NODE_TYPES.NewExpression
  );
}

function allowVoidFor(obligation: Obligation, allowVoid: AllowVoid): boolean {
  return (
    allowVoid === true ||
    (Array.isArray(allowVoid) && allowVoid.some((allowedType) => obligation.matches(allowedType)))
  );
}

function optionsFrom(value: unknown): Required<Options> {
  if (value === undefined) {
    return DEFAULT_OPTIONS;
  }

  if (!isRecord(value)) {
    throw new TypeError('Expected must-use options to be an object.');
  }

  return {
    additionalTypes: mustUseTypesFrom(value.additionalTypes, 'additionalTypes'),
    allowVoid: allowVoidFrom(value.allowVoid),
  };
}

function allowVoidFrom(value: unknown): AllowVoid {
  if (value === undefined) {
    return DEFAULT_OPTIONS.allowVoid;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    return mustUseTypesFrom(value, 'allowVoid');
  }

  throw new TypeError('Expected allowVoid to be a boolean or an array of must-use types.');
}

function isAwaitObligation(obligation: Obligation, mustAwaitTypes: MustUseType[]): boolean {
  return mustAwaitTypes.some((type) => obligation.matches(type));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
