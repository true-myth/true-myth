# `true-myth/must-await-task`

Disallow floating `Task`-producing expressions. As with native JS `Promise` instances, unhandled `Task` instances can cause memory leaks, or produce application or test instability when they live beyond the normal lifetime of a function or class hosting them.

You likely want to combine this with [`true-myth/must-use`][must-use] and [`@typescript-eslint/no-floating-promises`][nfp] to handle related failure modes.

[must-use]: ./must-use.md
[nfp]: https://typescript-eslint.io/rules/no-floating-promises/

## Examples

Invalid:

```ts
returnsTask();
Task.resolve(1);
void returnsTask();
returnsTask().map(fn);
service.load().andThen(fn);
cond(value) ? resolve(value) : reject("Oh no!");
```

Valid:

```ts
await returnsTask();
const value = await returnsTask();
void await returnsTask();
const task = returnsTask();
return returnsTask();
await returnsTask().map(fn);
await service.load().andThen(fn);
const nextTask = returnsTask().andThen((value) => resolve(value));
const conditionalTask = returnsTask().andThen((value) =>
  cond(value) ? resolve(value) : reject("Oh no!")
);
returnsTask().match({
  resolved: (value) => { /* ... */ },
  rejected: (reason) => { /* ... */ },
});
returnsTask().toPromise();
```

## Options

This rule supplies one option: `additionalTypes`. Use it to define module exports for other `Task`-like types this rule should treat as must-await.

```ts
{
  additionalTypes?: MustUseType[];
}

type MustUseType = {
  module: string;
  export: { kind: 'default' } | { kind: 'named'; name: string };
};
```

### Named exports

Imagine a package named `@acme/domain` that re-exports a domain-specific `Task` alias:

```ts
export type QueuedTask<T> = Task<T, QueueError>;
```

To configure the rule to flag this `QueuedTask` as well as True Myth's native `Task` type, add it as a named export to `additionalTypes`:

```ts
{
  additionalTypes: [
    {
      module: '@acme/domain',
      export: { kind: 'named', name: 'QueuedTask' },
    },
  ],
}
```

### Default exports

The same basic approach works for default exports. Again, imagine that `@acme/domain/operation` has a default export derived from True Myth's `Task` type, like so:

```ts
export default interface Operation<T> extends Task<T, OperationError> {}
```

Then you would configure the lint rule by adding it to `additionalTypes` like so:

```ts
{
  additionalTypes: [
    {
      module: '@acme/domain/operation',
      export: { kind: 'default' },
    },
  ],
}
```

## Configuration

```ts
import trueMyth from 'true-myth/eslint-plugin';

export default [
  {
    plugins: {
      'true-myth': trueMyth,
    },
    rules: {
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

The plugin also provides `trueMyth.configs.recommended`, which enables this rule.

## Typed Linting

This rule requires TypeScript parser services, such as those provided by `@typescript-eslint/parser` with typed linting enabled.
