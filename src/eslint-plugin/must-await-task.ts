import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';

import {
  createRule,
  Resolver,
  TRUE_MYTH_MUST_AWAIT_TYPES,
  getTypedParserServices,
  mustUseTypesFrom,
  type MustUseType,
} from './true-myth-support.js';

interface Options {
  additionalTypes?: MustUseType[];
}

const DEFAULT_OPTIONS: Required<Options> = {
  additionalTypes: [],
};

const MESSAGE_ID = 'unawaitedTask';
type MESSAGE_ID = typeof MESSAGE_ID;

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
  Disallows floating Task-producing expressions.

  @see https://true-myth.js.org/eslint-plugin/must-await-task
 */
export const mustAwaitTask = createRule({
  name: 'must-await-task',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow floating Task-producing expressions.',
    },
    messages: {
      [MESSAGE_ID]:
        'Handle this `Task` by awaiting, returning, binding, or otherwise passing it along.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
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
    const resolver = new Resolver(services.program, checker, [
      ...TRUE_MYTH_MUST_AWAIT_TYPES,
      ...options.additionalTypes,
    ]);

    return {
      CallExpression(node: TSESTree.CallExpression): void {
        checkTaskExpression(node);
      },

      NewExpression(node: TSESTree.NewExpression): void {
        checkTaskExpression(node);
      },
    };

    function checkTaskExpression(node: TSESTree.CallExpression | TSESTree.NewExpression): void {
      // For `returnsTask().map(fn)`, report on the full `.map(fn)` call rather
      // than on the `returnsTask()` receiver.
      if (isReceiverOfMethodCall(node)) {
        return;
      }

      // If the expression is awaited, returned, assigned, or passed onward, it
      // is no longer floating at this location.
      if (isHandled(node)) {
        return;
      }

      const type = services.getTypeAtLocation(node);
      if (resolver.obligationFor(type).isJust) {
        context.report({
          node,
          messageId: MESSAGE_ID,
        });
      }
    }
  },
});

function isHandled(node: TSESTree.Expression): boolean {
  let current = node;
  let parent = current.parent;

  while (parent) {
    switch (parent.type) {
      // Awaiting the expression executes and handles the Task.
      case AST_NODE_TYPES.AwaitExpression:
        return parent.argument === current;

      // These nodes do not handle the Task; they only wrap the expression, so
      // keep walking to find the construct that actually consumes it.
      case AST_NODE_TYPES.ChainExpression:
      case AST_NODE_TYPES.ConditionalExpression:
      case AST_NODE_TYPES.TSAsExpression:
      case AST_NODE_TYPES.TSNonNullExpression:
      case AST_NODE_TYPES.TSTypeAssertion:
        current = parent;
        parent = current.parent;
        continue;

      // Expression-bodied callbacks and block returns both pass the Task to
      // their caller, which is a handled use rather than a floating expression.
      case AST_NODE_TYPES.ArrowFunctionExpression:
        return parent.body === current;

      // Assignments, arguments, returns, and variable initializers all transfer
      // the Task value somewhere else for later handling.
      case AST_NODE_TYPES.AssignmentExpression:
        return parent.right === current;

      // Passing a Task as an argument is handled by the callee; using it as the
      // callee is not, because invoking a Task-valued expression still floats it.
      case AST_NODE_TYPES.CallExpression:
        return parent.callee !== current;

      case AST_NODE_TYPES.ReturnStatement:
        return parent.argument === current;

      case AST_NODE_TYPES.VariableDeclarator:
        return parent.init === current;

      default:
        return false;
    }
  }

  // ESLint traversal supplies parent links for visited expressions; reaching
  // this means a caller passed a detached node, so fail loudly instead of
  // silently treating an unknown context as unhandled.
  /* v8 ignore next */
  throw new Error('Expected expression to have a parent node.');
}

function isReceiverOfMethodCall(node: TSESTree.Expression): boolean {
  let current = node;
  let parent = current.parent;

  while (parent) {
    switch (parent.type) {
      // Syntax wrappers around the receiver should not change whether the
      // original expression is being used as the object of a method call.
      case AST_NODE_TYPES.ChainExpression:
      case AST_NODE_TYPES.TSAsExpression:
      case AST_NODE_TYPES.TSNonNullExpression:
      case AST_NODE_TYPES.TSTypeAssertion:
        current = parent;
        parent = current.parent;
        continue;

      // A method call consumes the receiver Task, e.g. task.map(fn); the rule
      // reports on the full method call expression if that call also returns a Task.
      case AST_NODE_TYPES.MemberExpression:
        // `task.method()` consumes `task`; `object[task]` uses the Task as a
        // property key and should be reported as floating.
        if (parent.object !== current) {
          return false;
        }

        return isCalledMemberExpression(parent);

      default:
        return false;
    }
  }

  // ESLint traversal supplies parent links for visited expressions; reaching
  // this means a caller passed a detached node, so fail loudly instead of
  // silently treating an unknown context as not-a-receiver.
  /* v8 ignore next */
  throw new Error('Expected expression to have a parent node.');
}

function isCalledMemberExpression(memberExpression: TSESTree.MemberExpression): boolean {
  let current: TSESTree.Expression = memberExpression;
  let parent = current.parent;

  while (parent?.type === AST_NODE_TYPES.ChainExpression) {
    current = parent;
    parent = current.parent;
  }

  return parent?.type === AST_NODE_TYPES.CallExpression && parent.callee === current;
}

function optionsFrom(value: unknown): Required<Options> {
  if (value === undefined) {
    return DEFAULT_OPTIONS;
  }

  if (!isRecord(value)) {
    throw new TypeError('Expected must-await-task options to be an object.');
  }

  return {
    additionalTypes: mustUseTypesFrom(value.additionalTypes, 'additionalTypes'),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
