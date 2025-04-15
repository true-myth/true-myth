[True Myth](../../index.md) / [toolbelt](../index.md) / transposeResult

# Function: transposeResult()

> **transposeResult**\<`T`, `E`\>(`result`): [`Maybe`](../../maybe/classes/Maybe.md)\<[`Result`](../../result/classes/Result.md)\<`T`, `E`\>\>

Transposes a [`Result`](../../result/classes/Result.md) of a [`Maybe`](../../maybe/classes/Maybe.md) into a `Maybe` of a
`Result`.

| Input         | Output         |
| ------------- | -------------- |
| `Ok(Just(T))` | `Just(Ok(T))`  |
| `Err(E)`      | `Just(Err(E))` |
| `Ok(Nothing)` | `Nothing`      |

## Type Parameters

### T

`T`

### E

`E`

## Parameters

### result

[`Result`](../../result/classes/Result.md)\<[`Maybe`](../../maybe/classes/Maybe.md)\<`T`\>, `E`\>

a `Result<Maybe<T>, E>` to transform to a `Maybe<Result<T, E>>`.

## Returns

[`Maybe`](../../maybe/classes/Maybe.md)\<[`Result`](../../result/classes/Result.md)\<`T`, `E`\>\>
