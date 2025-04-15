[True Myth](../../index.md) / [maybe](../index.md) / MaybeConstructor

# Interface: MaybeConstructor

The public interface for the [`Maybe`](../classes/Maybe.md) class *as a value*: a
constructor and the associated static properties.

## Constructors

### Constructor

> **new MaybeConstructor**\<`T`\>(`value`?): [`Maybe`](../classes/Maybe.md)\<`T`\>

#### Parameters

##### value?

`null` | `T`

#### Returns

[`Maybe`](../classes/Maybe.md)\<`T`\>

## Properties

### just()

> **just**: \<`F`\>(`value`) => [`Maybe`](../classes/Maybe.md)\<`F`\>\<`T`, `F`\>(`value`) => `never`\<`F`\>(`value`) => `never`\<`T`\>(`value`) => [`Maybe`](../classes/Maybe.md)\<`T`\>

Create an instance of `Maybe.Just`.

#### Type Parameters

##### F

`F` *extends* (...`args`) => `object`

#### Parameters

##### value

`F`

The value to wrap in a `Maybe.Just`.

#### Returns

[`Maybe`](../classes/Maybe.md)\<`F`\>

An instance of `Maybe.Just<T>`.

#### Throws

If you pass `null` or `undefined`.

Create an instance of `Maybe.Just`.

#### Type Parameters

##### T

`T` *extends* `object`

The type of the item contained in the `Maybe`.

##### F

`F` *extends* (...`args`) => `undefined` \| `null` \| `T`

#### Parameters

##### value

`F`

The value to wrap in a `Maybe.Just`.

#### Returns

`never`

An instance of `Maybe.Just<T>`.

#### Throws

If you pass `null` or `undefined`.

Create an instance of `Maybe.Just`.

#### Type Parameters

##### F

`F` *extends* (...`args`) => `undefined` \| `null`

#### Parameters

##### value

`F`

The value to wrap in a `Maybe.Just`.

#### Returns

`never`

An instance of `Maybe.Just<T>`.

#### Throws

If you pass `null` or `undefined`.

Create an instance of `Maybe.Just`.

#### Type Parameters

##### T

`T` *extends* `object`

The type of the item contained in the `Maybe`.

#### Parameters

##### value

`T`

The value to wrap in a `Maybe.Just`.

#### Returns

[`Maybe`](../classes/Maybe.md)\<`T`\>

An instance of `Maybe.Just<T>`.

#### Throws

If you pass `null` or `undefined`.

***

### nothing()

> **nothing**: \<`T`\>(`_`?) => [`Nothing`](Nothing.md)\<`T`\>

Create an instance of `Maybe.Nothing`.

If you want to create an instance with a specific type, e.g. for use in a
function which expects a `Maybe<T>` where the `<T>` is known but you have no
value to give it, you can use a type parameter:

```ts
const notString = Maybe.nothing<string>();
```

#### Type Parameters

##### T

`T`

The type of the item contained in the `Maybe`.

#### Parameters

##### \_?

`null`

#### Returns

[`Nothing`](Nothing.md)\<`T`\>

An instance of `Maybe.Nothing<T>`.

***

### of()

> **of**: \<`F`\>(`value`) => [`Maybe`](../classes/Maybe.md)\<`F`\>\<`T`, `F`\>(`value`) => `never`\<`F`\>(`value`) => `never`\<`T`\>(`value`) => [`Maybe`](../classes/Maybe.md)\<`T`\>

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

#### Type Parameters

##### F

`F` *extends* (...`args`) => `object`

#### Parameters

##### value

`F`

The value to wrap in a `Maybe`. If it is `undefined` or `null`,
            the result will be `Nothing`; otherwise it will be the type of
            the value passed.

#### Returns

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

#### Type Parameters

##### T

`T` *extends* `object`

The type of the item contained in the `Maybe`.

##### F

`F` *extends* (...`args`) => `undefined` \| `null` \| `T`

#### Parameters

##### value

`F`

The value to wrap in a `Maybe`. If it is `undefined` or `null`,
            the result will be `Nothing`; otherwise it will be the type of
            the value passed.

#### Returns

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

#### Type Parameters

##### F

`F` *extends* (...`args`) => `undefined` \| `null`

#### Parameters

##### value

`F`

The value to wrap in a `Maybe`. If it is `undefined` or `null`,
            the result will be `Nothing`; otherwise it will be the type of
            the value passed.

#### Returns

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

#### Type Parameters

##### T

`T`

The type of the item contained in the `Maybe`.

#### Parameters

##### value

The value to wrap in a `Maybe`. If it is `undefined` or `null`,
            the result will be `Nothing`; otherwise it will be the type of
            the value passed.

`undefined` | `null` | `T`

#### Returns

[`Maybe`](../classes/Maybe.md)\<`T`\>
