[True Myth](../../index.md) / [maybe](../index.md) / toJSON

# Function: toJSON()

> **toJSON**\<`T`\>(`maybe`): [`MaybeJSON`](../type-aliases/MaybeJSON.md)\<`unknown`\>

Create an `Object` representation of a [`Maybe`](../classes/Maybe.md) instance.

Useful for serialization. `JSON.stringify()` uses it.

## Type Parameters

### T

`T`

## Parameters

### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

The value to convert to JSON

## Returns

[`MaybeJSON`](../type-aliases/MaybeJSON.md)\<`unknown`\>

The JSON representation of the `Maybe`
