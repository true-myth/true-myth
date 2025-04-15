[True Myth](../../index.md) / [result](../index.md) / isErr

# Function: isErr()

> **isErr**\<`T`, `E`\>(`result`): `result is Err<T, E>`

Is the [`Result`](../classes/Result.md) an [`Err`](../interfaces/Err.md)?

## Type Parameters

### T

`T`

The type of the item contained in the `Result`.

### E

`E`

## Parameters

### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

The `Result` to check.

## Returns

`result is Err<T, E>`

A type guarded `Err`.
