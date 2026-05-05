# ESLint Plugin

True Myth includes an ESLint plugin at `true-myth/eslint-plugin` to support your effective use of the package.

The plugin ships two rules:

- [`true-myth/must-use`](./must-use.md): requires actively using `Result` and `Task` values, because forgetting to use them is usually a mistake.
- [`true-myth/must-await-task`](./must-await-task.md): disallows floating `Task` values.

## Typed Linting

These rules require TypeScript parser services. Configure `@typescript-eslint/parser` with typed linting enabled:

```ts
import parser from '@typescript-eslint/parser';
import trueMyth from 'true-myth/eslint-plugin';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'true-myth': trueMyth,
    },
    rules: {
      'true-myth/must-await-task': 'error',
      'true-myth/must-use': 'error',
    },
  },
];
```


## Configuration

You can just use the recommended (“flat”-style) config:

```ts
import trueMyth from 'true-myth/eslint-plugin';

export default [trueMyth.configs.recommended];
```

You can also configure the rule options directly. For example:

```ts
import parser from '@typescript-eslint/parser';
import trueMyth from 'true-myth/eslint-plugin';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'true-myth': trueMyth,
    },
    rules: {
      'true-myth/must-use': [
        'error',
        {
          additionalTypes: [
            {
              module: '@acme/domain',
              export: { kind: 'named', name: 'ValidationResult' },
            },
          ],
          allowVoid: [
            {
              module: 'true-myth/task',
              export: { kind: 'named', name: 'Task' },
            },
          ],
        },
      ],
      'true-myth/must-await-task': [
        'error',
        {
          additionalTypes: [
            {
              module: '@acme/domain',
              export: { kind: 'named', name: 'QueuedTask' },
            },
          ],
        },
      ],
    },
  },
];
```

For detailed configuration info, see the rule docs.
