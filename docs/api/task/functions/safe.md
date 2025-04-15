[True Myth](../../index.md) / [task](../index.md) / safe

# Function: safe()

## Call Signature

> **safe**\<`F`, `P`, `R`\>(`fn`): (...`params`) => [`Task`](../classes/Task.md)\<`R`, `unknown`\>

Given a function which returns a `Promise`, return a new function with the
same parameters but which returns a [`Task`](../classes/Task.md) instead.

If you wish to transform the error directly, rather than with a combinator,
see the other overload, which accepts an error handler.

## Examples

You can use this to create a safe version of the `fetch` function, which will
produce a `Task` instead of a `Promise` and which does not throw an error for
rejections, but instead produces a [`Rejected`](../interfaces/Rejected.md) variant of the `Task`.

```ts
import { safe } from 'true-myth/task';

const fetch = safe(window.fetch);
const toJson = safe((response: Response) => response.json() as unknown);
let json = fetch('https://www.example.com/api/users').andThen(toJson);
```

### Type Parameters

#### F

`F` *extends* (...`params`) => `PromiseLike`\<`unknown`\>

#### P

`P` *extends* `never`[]

#### R

`R` *extends* `any`

### Parameters

#### fn

`F`

A function to wrap so it never throws an error or produces a
  `Promise` rejection.

### Returns

`Function`

#### Parameters

##### params

...`P`

#### Returns

[`Task`](../classes/Task.md)\<`R`, `unknown`\>

## Call Signature

> **safe**\<`F`, `P`, `R`, `E`\>(`fn`, `onError`): (...`params`) => [`Task`](../classes/Task.md)\<`R`, `E`\>

Given a function which returns a `Promise` and a function to transform thrown
errors or `Promise` rejections resulting from calling that function, return a
new function with the same parameters but which returns a [`Task`](../classes/Task.md).

To catch all errors but leave them unhandled and `unknown`, see the other
overload.

## Examples

You can use this to create a safe version of the `fetch` function, which will
produce a `Task` instead of a `Promise` and which does not throw an error for
rejections, but instead produces a [`Rejected`](../interfaces/Rejected.md) variant of the `Task`.

```ts
import { safe } from 'true-myth/task';

class CustomError extends Error {
  constructor(name: string, cause: unknown) {
    super(`my-lib.error.${name}`, { cause });
    this.name = name;
  }
}

function handleErr(name: string): (cause: unknown) => CustomError {
  return (cause) => new CustomError(name);
}

const fetch = safe(window.fetch, handleErr('fetch'));
const toJson = safe(
  (response: Response) => response.toJson(),
  handleErr('json-parsing')
);

let json = fetch('https://www.example.com/api/users').andThen(toJson);
```

### Type Parameters

#### F

`F` *extends* (...`params`) => `PromiseLike`\<`unknown`\>

#### P

`P` *extends* `never`[]

#### R

`R` *extends* `any`

#### E

`E`

### Parameters

#### fn

`F`

A function to wrap so it never throws an error or produces a
  `Promise` rejection.

#### onError

(`reason`) => `E`

A function to use to transform the

### Returns

`Function`

#### Parameters

##### params

...`P`

#### Returns

[`Task`](../classes/Task.md)\<`R`, `E`\>
