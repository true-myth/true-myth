[True Myth](../../index.md) / [maybe](../index.md) / first

# Function: first()

> **first**\<`T`\>(`array`): [`Maybe`](../classes/Maybe.md)\<`T`\>

Safely get the first item from a list, returning [`Just`](../interfaces/Just.md) the first
item if the array has at least one item in it, or [`Nothing`](../interfaces/Nothing.md) if it is
empty.

## Examples

```ts
let empty = [];
Maybe.head(empty); // => Nothing

let full = [1, 2, 3];
Maybe.head(full); // => Just(1)
```

## Type Parameters

### T

`T`

## Parameters

### array

[`AnyArray`](../type-aliases/AnyArray.md)\<`undefined` \| `null` \| `T`\>

The array to get the first item from.

## Returns

[`Maybe`](../classes/Maybe.md)\<`T`\>
