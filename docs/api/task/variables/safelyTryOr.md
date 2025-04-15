[True Myth](../../index.md) / [task](../index.md) / safelyTryOr

# Variable: safelyTryOr()

> `const` **safelyTryOr**: \<`T`, `E`\>(`rejection`, `fn`) => [`Task`](../classes/Task.md)\<`T`, `E`\>\<`T`, `E`\>(`rejection`) => (`fn`) => [`Task`](../classes/Task.md)\<`T`, `E`\> = `tryOr`

An alias for [`tryOr`](../functions/tryOr.md) for ease of migrating from v8.x to v9.x.

> [!TIP]
> You should switch to [`tryOr`](../functions/tryOr.md). We expect to deprecate and remove
> this alias at some point!

Given a function which takes no arguments and returns a `Promise` and a value
of type `E` to use as the rejection if the `Promise` rejects, return a
[`Task<T, E>`](../classes/Task.md) for the result of invoking that function. This
safely handles functions which fail synchronously or asynchronously, so unlike
[`fromPromise`](../functions/fromPromise.md) is safe to use with values which may throw errors
_before_ producing a `Promise`.

## Examples

```ts
import { safelyTryOr } from 'true-myth/task';

function throws(): Promise<number> {
  throw new Error("Uh oh!");
}

// Note: passing the function by name, *not* calling it.
let theTask = safelyTryOr("fallback", throws);
let theResult = await theTask;
if (theResult.isErr) {
  console.error(theResult.error); // "fallback"
}
```

You can also write this in “curried” form, passing just the fallback value and
getting back a function which accepts the:

```ts
import { safelyTryOr } from 'true-myth/task';

function throws(): Promise<number> {
  throw new Error("Uh oh!");
}

// Note: passing the function by name, *not* calling it.
let withFallback = safelyTryOr<number, string>("fallback");
let theResult = await withFallback(throws);
if (theResult.isErr) {
  console.error(theResult.error); // "fallback"
}
```

Note that in the curried form, you must specify the expected `T` type of the
resulting `Task`, or else it will always be `unknown`.

## Type Parameters

### T

`T`

### E

`E`

## Parameters

### rejection

`E`

The value to use if the `Promise` rejects.

### fn

() => `Promise`\<`T`\>

A function which returns a `Promise` when called.

## Returns

[`Task`](../classes/Task.md)\<`T`, `E`\>

A `Task` which resolves to the resolution value of the promise or
  rejects with the rejection value of the promise *or* any error thrown while
  invoking `fn`.

Given a function which takes no arguments and returns a `Promise` and a value
of type `E` to use as the rejection if the `Promise` rejects, return a
[`Task<T, E>`](../classes/Task.md) for the result of invoking that function. This
safely handles functions which fail synchronously or asynchronously, so unlike
[`fromPromise`](../functions/fromPromise.md) is safe to use with values which may throw errors
_before_ producing a `Promise`.

## Examples

```ts
import { safelyTryOr } from 'true-myth/task';

function throws(): Promise<number> {
  throw new Error("Uh oh!");
}

// Note: passing the function by name, *not* calling it.
let theTask = safelyTryOr("fallback", throws);
let theResult = await theTask;
if (theResult.isErr) {
  console.error(theResult.error); // "fallback"
}
```

You can also write this in “curried” form, passing just the fallback value and
getting back a function which accepts the:

```ts
import { safelyTryOr } from 'true-myth/task';

function throws(): Promise<number> {
  throw new Error("Uh oh!");
}

// Note: passing the function by name, *not* calling it.
let withFallback = safelyTryOr<number, string>("fallback");
let theResult = await withFallback(throws);
if (theResult.isErr) {
  console.error(theResult.error); // "fallback"
}
```

Note that in the curried form, you must specify the expected `T` type of the
resulting `Task`, or else it will always be `unknown`.

## Type Parameters

### T

`T`

### E

`E`

## Parameters

### rejection

`E`

The value to use if the `Promise` rejects.

## Returns

`Function`

A `Task` which resolves to the resolution value of the promise or
  rejects with the rejection value of the promise *or* any error thrown while
  invoking `fn`.

### Parameters

#### fn

() => `Promise`\<`T`\>

### Returns

[`Task`](../classes/Task.md)\<`T`, `E`\>
