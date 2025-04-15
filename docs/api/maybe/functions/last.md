[True Myth](../../index.md) / [maybe](../index.md) / last

# Function: last()

> **last**\<`T`\>(`array`): [`Maybe`](../classes/Maybe.md)\<`T`\>

Safely get the last item from a list, returning [`Just`](../interfaces/Just.md) the last item
if the array has at least one item in it, or [`Nothing`](../interfaces/Nothing.md) if it is
empty.

## Examples

```ts
let empty = [];
Maybe.last(empty); // => Nothing

let full = [1, 2, 3];
Maybe.last(full); // => Just(3)
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
