[True Myth](../../index.md) / [maybe](../index.md) / of

# Variable: of()

> `const` **of**: \<`F`\>(`value`) => [`Maybe`](../classes/Maybe.md)\<`F`\>\<`T`, `F`\>(`value`) => `never`\<`F`\>(`value`) => `never`\<`T`\>(`value`) => [`Maybe`](../classes/Maybe.md)\<`T`\> = `MaybeImpl.of`

Create a [`Maybe`](../classes/Maybe.md) from any value.

To specify that the result should be interpreted as a specific type, you may
invoke `Maybe.of` with an explicit type parameter:

```ts
import * as maybe from 'true-myth/maybe';
const foo = maybe.of<string>(null);
```

This is usually only important in two cases:

1.  If you are intentionally constructing a `Nothing` from a known `null` or
    undefined value *which is untyped*.
2.  If you are specifying that the type is more general than the value passed
    (since TypeScript can define types as literals).

Create a `Maybe` from any value.

To specify that the result should be interpreted as a specific type, you may
invoke `Maybe.of` with an explicit type parameter:

```ts
const foo = Maybe.of<string>(null);
```

This is usually only important in two cases:

1.  If you are intentionally constructing a `Nothing` from a known `null` or
    undefined value *which is untyped*.
2.  If you are specifying that the type is more general than the value passed
    (since TypeScript can define types as literals).

## Type Parameters

### F

`F` *extends* (...`args`) => `object`

## Parameters

### value

`F`

The value to wrap in a `Maybe`. If it is `undefined` or `null`,
            the result will be `Nothing`; otherwise it will be the type of
            the value passed.

## Returns

[`Maybe`](../classes/Maybe.md)\<`F`\>

Create a `Maybe` from any value.

To specify that the result should be interpreted as a specific type, you may
invoke `Maybe.of` with an explicit type parameter:

```ts
const foo = Maybe.of<string>(null);
```

This is usually only important in two cases:

1.  If you are intentionally constructing a `Nothing` from a known `null` or
    undefined value *which is untyped*.
2.  If you are specifying that the type is more general than the value passed
    (since TypeScript can define types as literals).

## Type Parameters

### T

`T` *extends* `object`

The type of the item contained in the `Maybe`.

### F

`F` *extends* (...`args`) => `undefined` \| `null` \| `T`

## Parameters

### value

`F`

The value to wrap in a `Maybe`. If it is `undefined` or `null`,
            the result will be `Nothing`; otherwise it will be the type of
            the value passed.

## Returns

`never`

Create a `Maybe` from any value.

To specify that the result should be interpreted as a specific type, you may
invoke `Maybe.of` with an explicit type parameter:

```ts
const foo = Maybe.of<string>(null);
```

This is usually only important in two cases:

1.  If you are intentionally constructing a `Nothing` from a known `null` or
    undefined value *which is untyped*.
2.  If you are specifying that the type is more general than the value passed
    (since TypeScript can define types as literals).

## Type Parameters

### F

`F` *extends* (...`args`) => `undefined` \| `null`

## Parameters

### value

`F`

The value to wrap in a `Maybe`. If it is `undefined` or `null`,
            the result will be `Nothing`; otherwise it will be the type of
            the value passed.

## Returns

`never`

Create a `Maybe` from any value.

To specify that the result should be interpreted as a specific type, you may
invoke `Maybe.of` with an explicit type parameter:

```ts
const foo = Maybe.of<string>(null);
```

This is usually only important in two cases:

1.  If you are intentionally constructing a `Nothing` from a known `null` or
    undefined value *which is untyped*.
2.  If you are specifying that the type is more general than the value passed
    (since TypeScript can define types as literals).

## Type Parameters

### T

`T`

The type of the item contained in the `Maybe`.

## Parameters

### value

The value to wrap in a `Maybe`. If it is `undefined` or `null`,
            the result will be `Nothing`; otherwise it will be the type of
            the value passed.

`undefined` | `null` | `T`

## Returns

[`Maybe`](../classes/Maybe.md)\<`T`\>

## Template

The type of the item contained in the `Maybe`.

## Param

The value to wrap in a `Maybe`. If it is `undefined` or `null`,
             the result will be `Nothing`; otherwise it will be the type of
             the value passed.
