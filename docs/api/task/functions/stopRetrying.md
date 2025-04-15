[True Myth](../../index.md) / [task](../index.md) / stopRetrying

# Function: stopRetrying()

> **stopRetrying**(`message`, `cause`?): [`StopRetrying`](../classes/StopRetrying.md)

Produces the “sentinel” `Error` subclass [`StopRetrying`](../classes/StopRetrying.md), for use as
a return value from [`withRetries`](withRetries.md).

## Parameters

### message

`string`

The message to attach to the [`StopRetrying`](../classes/StopRetrying.md) instance.

### cause?

`unknown`

The previous cause (often another `Error`) that resulted in
  stopping retries.

## Returns

[`StopRetrying`](../classes/StopRetrying.md)
