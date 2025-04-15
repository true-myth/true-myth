[True Myth](../../index.md) / [maybe](../index.md) / just

# Variable: just()

> `const` **just**: \<`F`\>(`value`) => [`Maybe`](../classes/Maybe.md)\<`F`\>\<`T`, `F`\>(`value`) => `never`\<`F`\>(`value`) => `never`\<`T`\>(`value`) => [`Maybe`](../classes/Maybe.md)\<`T`\> = `MaybeImpl.just`

Create a [`Maybe`](../classes/Maybe.md) instance which is a [`Just`](../interfaces/Just.md).

`null` and `undefined` are allowed by the type signature so that the
function may `throw` on those rather than constructing a type like
`Maybe<undefined>`.

Create an instance of `Maybe.Just`.

## Type Parameters

### F

`F` *extends* (...`args`) => `object`

## Parameters

### value

`F`

The value to wrap in a `Maybe.Just`.

## Returns

[`Maybe`](../classes/Maybe.md)\<`F`\>

An instance of `Maybe.Just<T>`.

## Throws

If you pass `null` or `undefined`.

Create an instance of `Maybe.Just`.

## Type Parameters

### T

`T` *extends* `object`

The type of the item contained in the `Maybe`.

### F

`F` *extends* (...`args`) => `undefined` \| `null` \| `T`

## Parameters

### value

`F`

The value to wrap in a `Maybe.Just`.

## Returns

`never`

An instance of `Maybe.Just<T>`.

## Throws

If you pass `null` or `undefined`.

Create an instance of `Maybe.Just`.

## Type Parameters

### F

`F` *extends* (...`args`) => `undefined` \| `null`

## Parameters

### value

`F`

The value to wrap in a `Maybe.Just`.

## Returns

`never`

An instance of `Maybe.Just<T>`.

## Throws

If you pass `null` or `undefined`.

Create an instance of `Maybe.Just`.

## Type Parameters

### T

`T` *extends* `object`

The type of the item contained in the `Maybe`.

## Parameters

### value

`T`

The value to wrap in a `Maybe.Just`.

## Returns

[`Maybe`](../classes/Maybe.md)\<`T`\>

An instance of `Maybe.Just<T>`.

## Throws

If you pass `null` or `undefined`.

## Template

The type of the item contained in the `Maybe`.

## Param

The value to wrap in a `Maybe.Just`.

## Returns

An instance of `Maybe.Just<T>`.

## Throws

If you pass `null` or `undefined`.
