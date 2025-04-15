[True Myth](../../index.md) / [maybe](../index.md) / Maybe

# Class: Maybe

`Maybe` represents a value which may ([`` `Just<T>` ``](../interfaces/Just.md)) or may not
([`Nothing`](../interfaces/Nothing.md)) be present.

## Constructors

### Constructor

> **new Maybe**\<`T`\>(): `Maybe`

#### Returns

`Maybe`

## Properties

### \[IsMaybe\]

> `readonly` **\[IsMaybe\]**: `T`

***

### isJust

> **isJust**: `boolean`

Is the `Maybe` a [`Just`](../interfaces/Just.md)?

***

### isNothing

> **isNothing**: `boolean`

Is the `Maybe` a [`Nothing`](../interfaces/Nothing.md)?

***

### variant

> `readonly` **variant**: `"Just"` \| `"Nothing"`

`Just` is always [`Variant.Just`](../variables/Variant.md#just).

***

### just()

> `static` **just**: \<`F`\>(`value`) => `Maybe`\<`F`\>\<`T`, `F`\>(`value`) => `never`\<`F`\>(`value`) => `never`\<`T`\>(`value`) => `Maybe`\<`T`\>

Create an instance of `Maybe.Just`.

#### Type Parameters

##### F

`F` *extends* (...`args`) => `object`

#### Parameters

##### value

`F`

The value to wrap in a `Maybe.Just`.

#### Returns

`Maybe`\<`F`\>

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

`Maybe`\<`T`\>

An instance of `Maybe.Just<T>`.

#### Throws

If you pass `null` or `undefined`.

***

### nothing()

> `static` **nothing**: \<`T`\>(`_`?) => [`Nothing`](../interfaces/Nothing.md)\<`T`\>

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

[`Nothing`](../interfaces/Nothing.md)\<`T`\>

An instance of `Maybe.Nothing<T>`.

***

### of()

> `static` **of**: \<`F`\>(`value`) => `Maybe`\<`F`\>\<`T`, `F`\>(`value`) => `never`\<`F`\>(`value`) => `never`\<`T`\>(`value`) => `Maybe`\<`T`\>

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

`Maybe`\<`F`\>

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

`Maybe`\<`T`\>

## Methods

### and()

> **and**\<`U`\>(`mAnd`): `Maybe`\<`U`\>

Method variant for [`and`](../functions/and.md)

#### Type Parameters

##### U

`U`

#### Parameters

##### mAnd

`Maybe`\<`U`\>

#### Returns

`Maybe`\<`U`\>

***

### andThen()

#### Call Signature

> **andThen**\<`U`\>(`andThenFn`): `Maybe`\<`U`\>

Method variant for [`andThen`](../functions/andThen.md)

##### Type Parameters

###### U

`U`

##### Parameters

###### andThenFn

(`t`) => `Maybe`\<`U`\>

##### Returns

`Maybe`\<`U`\>

#### Call Signature

> **andThen**\<`R`\>(`andThenFn`): `Maybe`\<`ValueFor`\<`R`\>\>

Method variant for [`andThen`](../functions/andThen.md)

##### Type Parameters

###### R

`R` *extends* `AnyMaybe`

##### Parameters

###### andThenFn

(`t`) => `R`

##### Returns

`Maybe`\<`ValueFor`\<`R`\>\>

***

### ap()

> **ap**\<`A`, `B`\>(`this`, `val`): `Maybe`\<`B`\>

Method variant for [`ap`](../functions/ap.md)

#### Type Parameters

##### A

`A`

##### B

`B` *extends* `object`

#### Parameters

##### this

`Maybe`\<(`val`) => `B`\>

##### val

`Maybe`\<`A`\>

#### Returns

`Maybe`\<`B`\>

***

### equals()

> **equals**(`comparison`): `boolean`

Method variant for [`equals`](../functions/equals.md)

#### Parameters

##### comparison

`Maybe`\<`T`\>

#### Returns

`boolean`

***

### get()

> **get**\<`K`\>(`key`): `Maybe`\<`NonNullable`\<`T`\[`K`\]\>\>

Method variant for [`get`](../functions/get.md)

If you have a `Maybe` of an object type, you can do `thatMaybe.get('a key')`
to look up the next layer down in the object.

```ts
type DeepOptionalType = {
  something?: {
    with?: {
      deeperKeys?: string;
    }
  }
};

const fullySet: DeepType = {
  something: {
    with: {
      deeperKeys: 'like this'
    }
  }
};

const deepJust = Maybe.of(fullySet)
  .get('something')
  .get('with')
  .get('deeperKeys');

console.log(deepJust); // Just('like this');

const partiallyUnset: DeepType = { something: { } };

const deepEmpty = Maybe.of(partiallyUnset)
  .get('something')
  .get('with')
  .get('deeperKeys');

console.log(deepEmpty); // Nothing
```

#### Type Parameters

##### K

`K` *extends* `string` \| `number` \| `symbol`

#### Parameters

##### key

`K`

#### Returns

`Maybe`\<`NonNullable`\<`T`\[`K`\]\>\>

***

### map()

> **map**\<`U`\>(`mapFn`): `Maybe`\<`U`\>

Method variant for [`map`](../functions/map.md)

#### Type Parameters

##### U

`U` *extends* `object`

#### Parameters

##### mapFn

(`t`) => `U`

#### Returns

`Maybe`\<`U`\>

***

### mapOr()

> **mapOr**\<`U`\>(`orU`, `mapFn`): `U`

Method variant for [\`mapOr\`](../functions/mapOr.md)

#### Type Parameters

##### U

`U`

#### Parameters

##### orU

`U`

##### mapFn

(`t`) => `U`

#### Returns

`U`

***

### mapOrElse()

> **mapOrElse**\<`U`\>(`orElseFn`, `mapFn`): `U`

Method variant for [`mapOrElse`](../functions/mapOrElse.md)

#### Type Parameters

##### U

`U`

#### Parameters

##### orElseFn

() => `U`

##### mapFn

(`t`) => `U`

#### Returns

`U`

***

### match()

> **match**\<`U`\>(`matcher`): `U`

Method variant for [`match`](../functions/match.md)

#### Type Parameters

##### U

`U`

#### Parameters

##### matcher

[`Matcher`](../type-aliases/Matcher.md)\<`T`, `U`\>

#### Returns

`U`

***

### or()

> **or**(`mOr`): `Maybe`\<`T`\>

Method variant for [`or`](../functions/or.md)

#### Parameters

##### mOr

`Maybe`\<`T`\>

#### Returns

`Maybe`\<`T`\>

***

### orElse()

#### Call Signature

> **orElse**(`orElseFn`): `Maybe`\<`T`\>

Method variant for [`orElse`](../functions/orElse.md)

##### Parameters

###### orElseFn

() => `Maybe`\<`T`\>

##### Returns

`Maybe`\<`T`\>

#### Call Signature

> **orElse**\<`R`\>(`orElseFn`): `Maybe`\<`ValueFor`\<`R`\>\>

Method variant for [`orElse`](../functions/orElse.md)

##### Type Parameters

###### R

`R` *extends* `AnyMaybe`

##### Parameters

###### orElseFn

() => `R`

##### Returns

`Maybe`\<`ValueFor`\<`R`\>\>

***

### toJSON()

> **toJSON**(): [`MaybeJSON`](../type-aliases/MaybeJSON.md)\<`unknown`\>

Method variant for [`toJSON`](../functions/toJSON.md)

#### Returns

[`MaybeJSON`](../type-aliases/MaybeJSON.md)\<`unknown`\>

***

### toString()

> **toString**(): `string`

Method variant for [`toString`](../functions/toString.md)

#### Returns

`string`

***

### unwrapOr()

> **unwrapOr**\<`U`\>(`defaultValue`): `T` \| `U`

Method variant for [`unwrapOr`](../functions/unwrapOr.md)

#### Type Parameters

##### U

`U`

#### Parameters

##### defaultValue

`U`

#### Returns

`T` \| `U`

***

### unwrapOrElse()

> **unwrapOrElse**\<`U`\>(`elseFn`): `T` \| `U`

Method variant for [`unwrapOrElse`](../functions/unwrapOrElse.md)

#### Type Parameters

##### U

`U`

#### Parameters

##### elseFn

() => `U`

#### Returns

`T` \| `U`
