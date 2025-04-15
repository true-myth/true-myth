[True Myth](../../index.md) / [result](../index.md) / toJSON

# Function: toJSON()

> **toJSON**\<`T`, `E`\>(`result`): [`ResultJSON`](../type-aliases/ResultJSON.md)\<`T`, `E`\>

Create an `Object` representation of a [`Result`](../classes/Result.md) instance.

Useful for serialization. `JSON.stringify()` uses it.

## Type Parameters

### T

`T`

### E

`E`

## Parameters

### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

The value to convert to JSON

## Returns

[`ResultJSON`](../type-aliases/ResultJSON.md)\<`T`, `E`\>

The JSON representation of the `Result`
