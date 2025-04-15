[True Myth](../../index.md) / [toolbelt](../index.md) / transposeMaybe

# Function: transposeMaybe()

> **transposeMaybe**\<`T`, `E`\>(`maybe`): [`Result`](../../result/classes/Result.md)\<[`Maybe`](../../maybe/classes/Maybe.md)\<`T`\>, `E`\>

Transposes a [`Maybe`](../../maybe/classes/Maybe.md) of a [`Result`](../../result/classes/Result.md) into a `Result` of a
`Maybe`.

| Input          | Output        |
| -------------- | ------------- |
| `Just(Ok(T))`  | `Ok(Just(T))` |
| `Just(Err(E))` | `Err(E)`      |
| `Nothing`      | `Ok(Nothing)` |

## Type Parameters

### T

`T` *extends* `object`

### E

`E`

## Parameters

### maybe

[`Maybe`](../../maybe/classes/Maybe.md)\<[`Result`](../../result/classes/Result.md)\<`T`, `E`\>\>

a `Maybe<Result<T, E>>` to transform to a `Result<Maybe<T>, E>>`.

## Returns

[`Result`](../../result/classes/Result.md)\<[`Maybe`](../../maybe/classes/Maybe.md)\<`T`\>, `E`\>
