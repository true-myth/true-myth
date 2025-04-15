[True Myth](../../index.md) / [toolbelt](../index.md) / toMaybe

# Function: toMaybe()

> **toMaybe**\<`T`\>(`result`): [`Maybe`](../../maybe/classes/Maybe.md)\<`T`\>

Convert a [`Result`](../../result/classes/Result.md) to a [`Maybe`](../../maybe/classes/Maybe.md).

The converted type will be [`Just`](../../maybe/interfaces/Just.md) if the `Result` is
[`Ok`](../../result/interfaces/Ok.md) or [`Nothing`](../../maybe/interfaces/Nothing.md) if the
`Result` is [`Err`](../../result/interfaces/Err.md); the wrapped error value will be
discarded.

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### result

[`Result`](../../result/classes/Result.md)\<`T`, `unknown`\>

The `Result` to convert to a `Maybe`

## Returns

[`Maybe`](../../maybe/classes/Maybe.md)\<`T`\>

`Just` the value in `result` if it is `Ok`; otherwise `Nothing`
