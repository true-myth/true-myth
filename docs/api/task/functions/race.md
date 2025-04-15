[True Myth](../../index.md) / [task](../index.md) / race

# Function: race()

## Call Signature

> **race**(`tasks`): [`Task`](../classes/Task.md)\<`never`, `never`\>

Given an array of tasks, produce a new [`Task`](../classes/Task.md) which will resolve or
reject with the resolution or rejection of the *first* task which settles.

## Example

```ts
import Task, { race } from 'true-myth/task';

let { task: task1, resolve } = Task.withResolvers();
let task2 = new Task((_resolve) => {});
let task3 = new Task((_resolve) => {});

resolve("Cool!");
let theResult = await race([task1, task2, task3]);
console.log(theResult.toString()); // Ok("Cool!")
```

### Parameters

#### tasks

\[\]

The tasks to race against each other.

### Returns

[`Task`](../classes/Task.md)\<`never`, `never`\>

## Call Signature

> **race**\<`A`\>(`tasks`): [`Task`](../classes/Task.md)\<\{ -readonly \[P in string \| number \| symbol\]: ResolvesTo\<A\[P\<P\>\]\> \}\[`number`\], \{ -readonly \[P in string \| number \| symbol\]: RejectsWith\<A\[P\<P\>\]\> \}\[`number`\]\>

Given an array of tasks, produce a new [`Task`](../classes/Task.md) which will resolve or
reject with the resolution or rejection of the *first* task which settles.

## Example

```ts
import Task, { race } from 'true-myth/task';

let { task: task1, resolve } = Task.withResolvers();
let task2 = new Task((_resolve) => {});
let task3 = new Task((_resolve) => {});

resolve("Cool!");
let theResult = await race([task1, task2, task3]);
console.log(theResult.toString()); // Ok("Cool!")
```

### Type Parameters

#### A

`A` *extends* readonly `AnyTask`[]

The type of the array or tuple of tasks.

### Parameters

#### tasks

`A`

The tasks to race against each other.

### Returns

[`Task`](../classes/Task.md)\<\{ -readonly \[P in string \| number \| symbol\]: ResolvesTo\<A\[P\<P\>\]\> \}\[`number`\], \{ -readonly \[P in string \| number \| symbol\]: RejectsWith\<A\[P\<P\>\]\> \}\[`number`\]\>
