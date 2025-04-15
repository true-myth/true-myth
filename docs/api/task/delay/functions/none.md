[True Myth](../../../index.md) / [task/delay](../index.md) / none

# Function: none()

> **none**(): `Generator`\<`number`\>

A “no-op” strategy, for if you need to call supply a [`Strategy`](../interfaces/Strategy.md) to
a function but do not actually want to retry at all.

You should never use this directly with `Task.withRetries`; in the case where
you would, invoke the `Task` that would be retried directly (i.e. without
using `withRetries` at all) instead.

## Returns

`Generator`\<`number`\>
