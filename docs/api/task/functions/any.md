[True Myth](../../index.md) / [task](../index.md) / any

# Function: any()

## Call Signature

> **any**(`tasks`): [`Task`](../classes/Task.md)\<`never`, [`AggregateRejection`](../classes/AggregateRejection.md)\<\[\]\>\>

Given an array of tasks, return a new [`Task`](../classes/Task.md) which resolves once
_any_ of the tasks resolves successfully, or which rejects once _all_ the
tasks have rejected.

## Examples

When any item resolves:

```ts
import { any, timer } from 'true-myth/task';

let anyTask = any([
  timer(20),
  timer(10),
  timer(30),
]);

let result = await anyTask;
console.log(result.toString()); // Ok(10);
```

When all items reject:

```ts
import Task, { timer } from 'true-myth/task';

let anyTask = any([
  timer(20).andThen((time) => Task.reject(`${time}ms`)),
  timer(10).andThen((time) => Task.reject(`${time}ms`)),
  timer(30).andThen((time) => Task.reject(`${time}ms`)),
]);

let result = await anyTask;
console.log(result.toString()); // Err(AggregateRejection: `Task.any`: 10ms,20ms,30ms)
```

The order in the resulting `AggregateRejection` is guaranteed to be stable and
to match the order of the tasks passed in.

### Parameters

#### tasks

\[\]

The set of tasks to check for any resolution.

### Returns

[`Task`](../classes/Task.md)\<`never`, [`AggregateRejection`](../classes/AggregateRejection.md)\<\[\]\>\>

A Task which is either [`Resolved`](../interfaces/Resolved.md) with the value of the
  first task to resolve, or [`Rejected`](../interfaces/Rejected.md) with the rejection reasons
  for all the tasks passed in in an [`AggregateRejection`](../classes/AggregateRejection.md). Note that
  the order of the rejection reasons is not guaranteed.

## Call Signature

> **any**\<`A`\>(`tasks`): [`Task`](../classes/Task.md)\<\{ -readonly \[P in string \| number \| symbol\]: ResolvesTo\<A\[P\<P\>\]\> \}\[`number`\], [`AggregateRejection`](../classes/AggregateRejection.md)\<\[...\{ -readonly \[P in string \| number \| symbol\]: RejectsWith\<A\[P\<P\>\]\> \}\[\]\]\>\>

Given an array of tasks, return a new [`Task`](../classes/Task.md) which resolves once
_any_ of the tasks resolves successfully, or which rejects once _all_ the
tasks have rejected.

## Examples

When any item resolves:

```ts
import { any, timer } from 'true-myth/task';

let anyTask = any([
  timer(20),
  timer(10),
  timer(30),
]);

let result = await anyTask;
console.log(result.toString()); // Ok(10);
```

When all items reject:

```ts
import Task, { timer } from 'true-myth/task';

let anyTask = any([
  timer(20).andThen((time) => Task.reject(`${time}ms`)),
  timer(10).andThen((time) => Task.reject(`${time}ms`)),
  timer(30).andThen((time) => Task.reject(`${time}ms`)),
]);

let result = await anyTask;
console.log(result.toString()); // Err(AggregateRejection: `Task.any`: 10ms,20ms,30ms)
```

The order in the resulting `AggregateRejection` is guaranteed to be stable and
to match the order of the tasks passed in.

### Type Parameters

#### A

`A` *extends* readonly `AnyTask`[]

The type of the array or tuple of tasks.

### Parameters

#### tasks

readonly \[`A`\]

The set of tasks to check for any resolution.

### Returns

[`Task`](../classes/Task.md)\<\{ -readonly \[P in string \| number \| symbol\]: ResolvesTo\<A\[P\<P\>\]\> \}\[`number`\], [`AggregateRejection`](../classes/AggregateRejection.md)\<\[...\{ -readonly \[P in string \| number \| symbol\]: RejectsWith\<A\[P\<P\>\]\> \}\[\]\]\>\>

A Task which is either [`Resolved`](../interfaces/Resolved.md) with the value of the
  first task to resolve, or [`Rejected`](../interfaces/Rejected.md) with the rejection reasons
  for all the tasks passed in in an [`AggregateRejection`](../classes/AggregateRejection.md). Note that
  the order of the rejection reasons is not guaranteed.
