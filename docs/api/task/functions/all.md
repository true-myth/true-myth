[True Myth](../../index.md) / [task](../index.md) / all

# Function: all()

## Call Signature

> **all**(`tasks`): [`Task`](../classes/Task.md)\<\[\], `never`\>

Given an array of tasks, return a new `Task` which resolves once all tasks
successfully resolve or any task rejects.

## Examples

Once all tasks resolve:

```ts
import { all, timer } from 'true-myth/task';

let allTasks = all([
  timer(10),
  timer(100),
  timer(1_000),
]);

let result = await allTasks;
console.log(result.toString()); // [Ok(10,100,1000)]
```

If any tasks do *not* resolve:

```ts
let { task: willReject, reject } = Task.withResolvers<never, string>();

let allTasks = all([
  timer(10),
  timer(20),
  willReject,
]);

reject("something went wrong");
let result = await allTasks;
console.log(result.toString()); // Err("something went wrong")
```

### Parameters

#### tasks

\[\]

The list of tasks to wait on.

### Returns

[`Task`](../classes/Task.md)\<\[\], `never`\>

## Call Signature

> **all**\<`A`\>(`tasks`): `All`\<\[`...A[]`\]\>

Given an array of tasks, return a new `Task` which resolves once all tasks
successfully resolve or any task rejects.

## Examples

Once all tasks resolve:

```ts
import { all, timer } from 'true-myth/task';

let allTasks = all([
  timer(10),
  timer(100),
  timer(1_000),
]);

let result = await allTasks;
console.log(result.toString()); // [Ok(10,100,1000)]
```

If any tasks do *not* resolve:

```ts
let { task: willReject, reject } = Task.withResolvers<never, string>();

let allTasks = all([
  timer(10),
  timer(20),
  willReject,
]);

reject("something went wrong");
let result = await allTasks;
console.log(result.toString()); // Err("something went wrong")
```

### Type Parameters

#### A

`A` *extends* readonly `AnyTask`[]

The type of the array or tuple of tasks.

### Parameters

#### tasks

readonly \[`A`\]

The list of tasks to wait on.

### Returns

`All`\<\[`...A[]`\]\>
