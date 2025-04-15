[True Myth](../../index.md) / [maybe](../index.md) / nothing

# Variable: nothing()

> `const` **nothing**: \<`T`\>(`_`?) => [`Nothing`](../interfaces/Nothing.md)\<`T`\> = `MaybeImpl.nothing`

Create a [`Maybe`](../classes/Maybe.md) instance which is a [`Nothing`](../interfaces/Nothing.md).

If you want to create an instance with a specific type, e.g. for use in a
function which expects a `Maybe<T>` where the `<T>` is known but you have no
value to give it, you can use a type parameter:

```ts
const notString = Maybe.nothing<string>();
```

Create an instance of `Maybe.Nothing`.

If you want to create an instance with a specific type, e.g. for use in a
function which expects a `Maybe<T>` where the `<T>` is known but you have no
value to give it, you can use a type parameter:

```ts
const notString = Maybe.nothing<string>();
```

## Type Parameters

### T

`T`

The type of the item contained in the `Maybe`.

## Parameters

### \_?

`null`

## Returns

[`Nothing`](../interfaces/Nothing.md)\<`T`\>

An instance of `Maybe.Nothing<T>`.

## Template

The type of the item contained in the `Maybe`.

## Returns

An instance of `Maybe.Nothing<T>`.
