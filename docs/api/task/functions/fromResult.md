[True Myth](../../index.md) / [task](../index.md) / fromResult

# Function: fromResult()

> **fromResult**\<`T`, `E`\>(`result`): [`Task`](../classes/Task.md)\<`T`, `E`\>

Build a [`Task<T, E>`](../classes/Task.md) from a [`Result<T, E>`](../../result/classes/Result.md).

> [!IMPORTANT]
> This does not (and by definition cannot) handle errors that happen during
> construction of the `Result`, because those happen before this is called.
> See [`tryOr`](tryOr.md) and [`tryOrElse`](tryOrElse.md) as well as the corresponding
> [`result.tryOr`](../../result/functions/tryOr.md) and [`> result.tryOrElse`](../../result/functions/tryOrElse.md) methods for synchronous functions.

## Examples

Given an [`Ok<T, E>`](../../result/interfaces/Ok.md), `fromResult` will produces a
[`Resolved<T, E>`](../interfaces/Resolved.md) task.

```ts
import { fromResult } from 'true-myth/task';
import { ok } from 'true-myth/result';

let successful = fromResult(ok("hello")); // -> Resolved("hello")
```

Likewise, given an `Err`, `fromResult` will produces a [`Rejected`](../interfaces/Rejected.md)
task.

```ts
import { fromResult } from 'true-myth/task';
import { err } from 'true-myth/result';

let successful = fromResult(err("uh oh!")); // -> Rejected("uh oh!")
```

It is often clearest to access the function via a namespace-style import:

```ts

import * as task from 'true-myth/task';
import { ok } from 'true-myth/result';

let theTask = task.fromResult(ok(123));
```

As an alternative, it can be useful to rename the import:

```ts
import { fromResult: taskFromResult } from 'true-myth/task';
import { err } from 'true-myth/result';

let theTask = taskFromResult(err("oh no!"));
```

## Type Parameters

### T

`T`

### E

`E`

## Parameters

### result

[`Result`](../../result/classes/Result.md)\<`T`, `E`\>

## Returns

[`Task`](../classes/Task.md)\<`T`, `E`\>
