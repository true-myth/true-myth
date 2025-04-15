[True Myth](../../index.md) / [task](../index.md) / safelyTry

# Function: safelyTry()

> **safelyTry**\<`T`\>(`fn`): [`Task`](../classes/Task.md)\<`T`, `unknown`\>

Given a function which takes no arguments and returns a `Promise`, return a
[`Task<T, unknown>`](../classes/Task.md) for the result of invoking that function.
This safely handles functions which fail synchronously or asynchronously, so
unlike [`fromPromise`](fromPromise.md) is safe to use with values which may throw
errors _before_ producing a `Promise`.

## Examples

```ts
import { safelyTry } from 'true-myth/task';

function throws(): Promise<T> {
  throw new Error("Uh oh!");
}

// Note: passing the function by name, *not* calling it.
let theTask = safelyTry(throws);
let theResult = await theTask;
console.log(theResult.toString()); // Err(Error: Uh oh!)
```

## Type Parameters

### T

`T`

## Parameters

### fn

() => `Promise`\<`T`\>

A function which returns a `Promise` when called.

## Returns

[`Task`](../classes/Task.md)\<`T`, `unknown`\>

A `Task` which resolves to the resolution value of the promise or
  rejects with the rejection value of the promise *or* any error thrown while
  invoking `fn`.
