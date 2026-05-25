# `true-myth/must-use`

Require callers to use values whose type should not be discarded. Most of the time, when callers return a `Result` or `Task`, it is a mistake not to handle its errors.

For example, when reading from a file with an API that returns a `Result`, callers will naturally need to handle the error explicitly simply to get the data:

```ts
/** Return string if succesfully read or IoError if not */
declare function readFile(path: string): Result<string, IoError>;

let contents = readFile("some-path").unwrapOrElse((err) => {
  console.error(err);
  return "";
});
```

When writing a file, though, it can be easy to overlook failure cases:

```ts
/** Return bytes written if succesful or IoError if not */
declare function writeFile(path: string, body: string): Result<number, IoError>;

writeFile("some-path", "hello!"); // what if the write fails?
```

This lint rule will provide an error indicating that the `Result` is unhandled, prompting you to make sure you account for the failure case:

```ts
writeFile("some-path").match({
  Ok: (written) => {
    console.log(`wrote ${written}b to "some-path"`);
  }
  Err: (ioError) => {
    console.error(`failed writing to "some-path"`, ioError);
  }
});
```

This rule is inspired by Rust’s `#[must_use]` attribute.

## Examples

Invalid:

```ts
returnsResult();
returnsTask();
Result.ok(1);
Task.resolve(1);
returnsResult().map(fn);

async function run() {
  await returnsTask();
}
```

Valid:

```ts
const result = returnsResult();
return returnsTask();
consume(returnsResult());
returnsResult().unwrapOr(0);

void returnsResult();

async function run() {
  void await returnsTask();
}
```

## Options

This rule provides two options: `allowVoid` and `additionalTypes`.

```ts
{
  allowVoid?: boolean | MustUseType[];
  additionalTypes?: MustUseType[];
}

type MustUseType = {
  module: string;
  export: { kind: 'default' } | { kind: 'named'; name: string };
};
```

### `allowVoid`

The `allowVoid` option allows you to explicitly discard types by using [the `void` operator][void], e.g. `void returnsResult()` and `void await returnsTask()`.

[void]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void

- `allowVoid` defaults to `true`, allowing explicit discards.
- Set `allowVoid` to `false` to reject all `void` discards.
- Set `allowVoid` to specific module exports to allow explicit discards only for those types.

### `additionalTypes` 

Set `additionalTypes` to module exports for any other types this rule should treat as must-use.

#### Named exports

Imagine a package named `@acme/domain` that re-exports a domain-specific `Result` alias:

```ts
export type ValidationResult<T> = Result<T, ValidationError>;
```

To configure the rule to flag this `ValidationResult` as well as True Myth's native `Result` and `Task` types, add it as a named export to `additionalTypes`:

```ts
{
  additionalTypes: [
    {
      module: '@acme/domain',
      export: { kind: 'named', name: 'ValidationResult' },
    },
  ],
}
```

#### Default exports

The same basic approach works for default exports. Again, imagine that `@acme/domain/operation` has a default export derived from True Myth’s `Task` type, like so:

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

To allow `void` only for selected exports, use the same shape:

```ts
{
  allowVoid: [
    {
      module: 'true-myth/task',
      export: { kind: 'named', name: 'Task' },
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
      'true-myth/must-use': [
        'error',
        {
          additionalTypes: [
            {
              module: '@acme/domain',
              export: { kind: 'named', name: 'ValidationResult' },
            },
          ],
        },
      ],
    },
  },
];
```

The plugin also provides `trueMyth.configs.recommended`, which enables this rule and sets `allowVoid` to `true`.

## Typed Linting

This rule requires TypeScript parser services, such as those provided by
`@typescript-eslint/parser` with typed linting enabled.

> [!NOTE]
> The plugin shape is compatible with ESLint flat config and Oxlint’s JavaScript plugin loading model, but Oxlint does not currently expose the TypeScript type information this rule needs. When Oxlint provides that capability, we will add support for it.
