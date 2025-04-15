[True Myth](../../index.md) / [toolbelt](../index.md) / fromResult

# Function: fromResult()

> **fromResult**\<`T`\>(`result`): [`Maybe`](../../maybe/classes/Maybe.md)\<`T`\>

Construct a [`Maybe<T>`](../../maybe/classes/Maybe.md) from a
[`Result<T, E>`](../../result/classes/Result.md).

If the `Result` is a [`Ok`](../../result/interfaces/Ok.md), wrap its value in [`Just`](../../maybe/interfaces/Just.md). If the `Result` is an [`Err`](../../result/interfaces/Err.md), throw
away the wrapped `E` and transform to a [`Nothing`](../../maybe/interfaces/Nothing.md).

## Type Parameters

### T

`T` *extends* `object`

The type of the value wrapped in a [`Ok`](../../result/interfaces/Ok.md) and
  therefore in the [`Just`](../../maybe/interfaces/Just.md) of the resulting `Maybe`.

## Parameters

### result

[`Result`](../../result/classes/Result.md)\<`T`, `unknown`\>

The `Result` to construct a `Maybe` from.

## Returns

[`Maybe`](../../maybe/classes/Maybe.md)\<`T`\>

`Just` if `result` was `Ok` or `Nothing` if it was `Err`.
