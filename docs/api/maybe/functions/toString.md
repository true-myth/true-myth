[True Myth](../../index.md) / [maybe](../index.md) / toString

# Function: toString()

> **toString**\<`T`\>(`maybe`): `string`

Create a `String` representation of a [`Maybe`](../classes/Maybe.md) instance.

A [`Just`](../interfaces/Just.md) instance will be `Just(<representation of the value>)`,
where the representation of the value is simply the value's own `toString`
representation. For example:

| call                                   | output                  |
|----------------------------------------|-------------------------|
| `toString(Maybe.of(42))`               | `Just(42)`              |
| `toString(Maybe.of([1, 2, 3]))`        | `Just(1,2,3)`           |
| `toString(Maybe.of({ an: 'object' }))` | `Just([object Object])` |
| `toString(Maybe.nothing())`            | `Nothing`               |

## Type Parameters

### T

`T`

The type of the wrapped value; its own `.toString` will be used
             to print the interior contents of the `Just` variant.

## Parameters

### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

The value to convert to a string.

## Returns

`string`

The string representation of the `Maybe`.
