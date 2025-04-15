[True Myth](../../index.md) / [task](../index.md) / allSettled

# Function: allSettled()

> **allSettled**\<`A`\>(`tasks`): [`Task`](../classes/Task.md)\<`Settled`\<`A`\>, `never`\>

Given an array of tasks, return a new [`Task`](../classes/Task.md) which resolves once all
of the tasks have either resolved or rejected. The resulting `Task` is a tuple
or array corresponding exactly to the tasks passed in, either resolved or
rejected.

## Example

Given a mix of resolving and rejecting tasks:

```ts
let settledTask = allSettled([
  Task.resolve<string, number>("hello"),
  Task.reject<number, boolean>(true),
  Task.resolve<{ fancy: boolean }>, Error>({ fancy: true }),
]);

let output = await settledTask;
if (output.isOk) { // always true, not currently statically knowable
  for (let result of output.value) {
    console.log(result.toString());
  }
}
```

The resulting output will be:

```
Ok("hello"),
Err(true),
Ok({ fancy: true }),
```

## Type Parameters

### A

`A` *extends* readonly `AnyTask`[]

The type of the array or tuple of tasks.

## Parameters

### tasks

`A`

The tasks to wait on settling.

## Returns

[`Task`](../classes/Task.md)\<`Settled`\<`A`\>, `never`\>
