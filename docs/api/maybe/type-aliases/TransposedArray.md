[True Myth](../../index.md) / [maybe](../index.md) / TransposedArray

# Type Alias: TransposedArray\<T\>

> **TransposedArray**\<`T`\> = `unknown`[] *extends* `T` ? [`Maybe`](../classes/Maybe.md)\<`{ -readonly [K in keyof T]: Unwrapped<T[K]> }`\> : [`Maybe`](../classes/Maybe.md)\<`{ [K in keyof T]: Unwrapped<T[K]> }`\>

## Type Parameters

### T

`T` *extends* `ReadonlyArray`\<[`Maybe`](../classes/Maybe.md)\<`unknown`\>\>
