[True Myth](../../index.md) / [task](../index.md) / Timer

# Type Alias: Timer

> **Timer** = [`Task`](../classes/Task.md)\<`number`, `never`\>

A [`Task`](../classes/Task.md) specialized for use with [`timeout`](../functions/timeout.md) or other
methods or functions which want to know they are using.

> [!NOTE]
> This type has zero runtime overhead, including for construction: it is just
> a `Task` with additional *type information*.
