[True Myth](../../index.md) / [result](../index.md) / safe

# Function: safe()

## Call Signature

> **safe**\<`F`, `P`, `R`\>(`fn`): (...`params`) => [`Result`](../classes/Result.md)\<`R`, `unknown`\>

Transform a function which may throw an error into one with an identical call
signature except that it will return a [`Result`](../classes/Result.md) instead of throwing
an error.

This allows you to handle the error locally with all the normal `Result` tools
rather than having to catch an exception. Where the [`tryOr`](tryOr.md) and
[`tryOrElse`](tryOrElse.md) functions are useful for a single call, this is useful
to make a new version of a function to be used repeatedly.

This overload absorbs all exceptions into an [`Err`](../interfaces/Err.md) with the type
`unknown`. If you want to transform the error immediately rather than using a
combinator, see the other overload.

## Examples

The `JSON.parse` method will throw if the string passed to it is invalid. You
can use this `safe` method to transform it into a form which will *not* throw:

```ts
import { safe } from 'true-myth/task';
const parse = safe(JSON.parse);

let result = parse(`"ill-formed gobbledygook'`);
console.log(result.toString()); // Err(SyntaxError: Unterminated string in JSON at position 25)
```

You could do this once in a utility module and then require that *all* JSON
parsing operations in your code use this version instead.

### Type Parameters

#### F

`F` *extends* `AnyFunction`

#### P

`P` *extends* `never`[]

#### R

`R` *extends* `unknown`

### Parameters

#### fn

`F`

The function which may throw, which will be wrapped.

### Returns

`Function`

#### Parameters

##### params

...`P`

#### Returns

[`Result`](../classes/Result.md)\<`R`, `unknown`\>

## Call Signature

> **safe**\<`F`, `P`, `R`, `E`\>(`fn`, `handleErr`): (...`params`) => [`Result`](../classes/Result.md)\<`R`, `E`\>

Transform a function which may throw an error into one with an identical call
signature except that it will return a [`Result`](../classes/Result.md) instead of throwing
an error.

This allows you to handle the error locally with all the normal `Result` tools
rather than having to catch an exception. Where the [`tryOr`](tryOr.md) and
[`tryOrElse`](tryOrElse.md) functions are useful for a single call, this is useful
to make a new version of a function to be used repeatedly.

This overload allows you to transform the error immediately, using the second
argument.

## Examples

The `JSON.parse` method will throw if the string passed to it is invalid. You
can use this `safe` method to transform it into a form which will *not* throw,
wrapping it in a custom error :

```ts
import { safe } from 'true-myth/task';

class ParsingError extends Error {
  name = 'ParsingError';
  constructor(error: unknown) {
    super('Parsing error.', { cause: error });
  }
}

const parse = safe(JSON.parse, (error) => {
  return new ParsingError(error);
});

let result = parse(`"ill-formed gobbledygook'`);
console.log(result.toString()); // Err(SyntaxError: Unterminated string in JSON at position 25)
```

You could do this once in a utility module and then require that *all* JSON
parsing operations in your code use this version instead.

### Type Parameters

#### F

`F` *extends* `AnyFunction`

#### P

`P` *extends* `never`[]

#### R

`R` *extends* `unknown`

#### E

`E`

### Parameters

#### fn

`F`

The function which may throw, which will be wrapped.

#### handleErr

(`error`) => `E`

A function to use to transform an unknown error into a known
  error type.

### Returns

`Function`

#### Parameters

##### params

...`P`

#### Returns

[`Result`](../classes/Result.md)\<`R`, `E`\>
