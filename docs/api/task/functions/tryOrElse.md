[True Myth](../../index.md) / [task](../index.md) / tryOrElse

# Function: tryOrElse()

## Call Signature

> **tryOrElse**\<`T`, `E`\>(`onError`, `fn`): [`Task`](../classes/Task.md)\<`T`, `E`\>

Given a function which takes no arguments and returns a `PromiseLike` and a
function which accepts an `unknown` rejection reason and transforms it into a
known rejection type `E`, return a [`Task<T, E>`](../classes/Task.md) for the result
of invoking that function. This safely handles functions which fail
synchronously or asynchronously, so unlike [`fromPromise`](fromPromise.md) is safe to
use with values which may throw errors _before_ producing a `Promise`.

## Examples

```ts
import { tryOrElse } from 'true-myth/task';

function throws(): Promise<number> {
  throw new Error("Uh oh!");
}

// Note: passing the function by name, *not* calling it.
let theTask = tryOrElse(
  (reason) => `Something went wrong: ${reason}`,
  throws
);
let theResult = await theTask;
console.log(theResult.toString); // Err("Something went wrong: Error: Uh oh!")
```

You can also write this in “curried” form, passing just the fallback value and
getting back a function which accepts the:

```ts
import { tryOrElse } from 'true-myth/task';

function throws(): Promise<number> {
  throw new Error("Uh oh!");
}

// Note: passing the function by name, *not* calling it.
let withFallback = tryOrElse<number, string>(
  (reason) => `Something went wrong: ${reason}`
);
let theResult = await withFallback(throws);
console.log(theResult.toString); // Err("Something went wrong: Error: Uh oh!")
```

Note that in the curried form, you must specify the expected `T` type of the
resulting `Task`, or else it will always be `unknown`.

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### onError

(`reason`) => `E`

The function to use to transform the rejection reasons if the
  `PromiseLike` produced by `fn` rejects.

#### fn

() => `PromiseLike`\<`T`\>

A function which returns a `PromiseLike` when called.

### Returns

[`Task`](../classes/Task.md)\<`T`, `E`\>

A `Task` which resolves to the resolution value of the promise or
  rejects with the rejection value of the promise *or* any error thrown while
  invoking `fn`.

## Call Signature

> **tryOrElse**\<`T`, `E`\>(`onError`): (`fn`) => [`Task`](../classes/Task.md)\<`T`, `E`\>

Given a function which takes no arguments and returns a `PromiseLike` and a
function which accepts an `unknown` rejection reason and transforms it into a
known rejection type `E`, return a [`Task<T, E>`](../classes/Task.md) for the result
of invoking that function. This safely handles functions which fail
synchronously or asynchronously, so unlike [`fromPromise`](fromPromise.md) is safe to
use with values which may throw errors _before_ producing a `Promise`.

## Examples

```ts
import { tryOrElse } from 'true-myth/task';

function throws(): Promise<number> {
  throw new Error("Uh oh!");
}

// Note: passing the function by name, *not* calling it.
let theTask = tryOrElse(
  (reason) => `Something went wrong: ${reason}`,
  throws
);
let theResult = await theTask;
console.log(theResult.toString); // Err("Something went wrong: Error: Uh oh!")
```

You can also write this in “curried” form, passing just the fallback value and
getting back a function which accepts the:

```ts
import { tryOrElse } from 'true-myth/task';

function throws(): Promise<number> {
  throw new Error("Uh oh!");
}

// Note: passing the function by name, *not* calling it.
let withFallback = tryOrElse<number, string>(
  (reason) => `Something went wrong: ${reason}`
);
let theResult = await withFallback(throws);
console.log(theResult.toString); // Err("Something went wrong: Error: Uh oh!")
```

Note that in the curried form, you must specify the expected `T` type of the
resulting `Task`, or else it will always be `unknown`.

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### onError

(`reason`) => `E`

The function to use to transform the rejection reasons if the
  `PromiseLike` produced by `fn` rejects.

### Returns

`Function`

A `Task` which resolves to the resolution value of the promise or
  rejects with the rejection value of the promise *or* any error thrown while
  invoking `fn`.

#### Parameters

##### fn

() => `PromiseLike`\<`T`\>

#### Returns

[`Task`](../classes/Task.md)\<`T`, `E`\>
