[True Myth](../../index.md) / [maybe](../index.md) / Just

# Interface: Just\<T\>

A `Just` instance is the *present* variant instance of the
[`Maybe`](../classes/Maybe.md) type, representing the presence of a
value which may be absent. For a full discussion, see the module docs.

## Extends

- `MaybeImpl`\<`T`\>

## Type Parameters

### T

`T`

The type wrapped in this `Just` variant of `Maybe`.

## Properties

### \[IsMaybe\]

> `readonly` **\[IsMaybe\]**: `T`

#### Inherited from

`MaybeImpl.[IsMaybe]`

***

### isJust

> **isJust**: `true`

Is the [`Maybe`](../classes/Maybe.md) a `Just`?

#### Overrides

`MaybeImpl.isJust`

***

### isNothing

> **isNothing**: `false`

Is the [`Maybe`](../classes/Maybe.md) a [`Nothing`](Nothing.md)?

#### Overrides

`MaybeImpl.isNothing`

***

### value

> **value**: `T`

The wrapped value.

#### Overrides

`MaybeImpl.value`

***

### variant

> `readonly` **variant**: `"Just"`

`Just` is always [`Variant.Just`](../variables/Variant.md#just).

#### Overrides

`MaybeImpl.variant`

## Methods

### and()

> **and**\<`U`\>(`mAnd`): [`Maybe`](../classes/Maybe.md)\<`U`\>

Method variant for [`and`](../functions/and.md)

#### Type Parameters

##### U

`U`

#### Parameters

##### mAnd

[`Maybe`](../classes/Maybe.md)\<`U`\>

#### Returns

[`Maybe`](../classes/Maybe.md)\<`U`\>

#### Inherited from

`MaybeImpl.and`

***

### andThen()

#### Call Signature

> **andThen**\<`U`\>(`andThenFn`): [`Maybe`](../classes/Maybe.md)\<`U`\>

Method variant for [`andThen`](../functions/andThen.md)

##### Type Parameters

###### U

`U`

##### Parameters

###### andThenFn

(`t`) => [`Maybe`](../classes/Maybe.md)\<`U`\>

##### Returns

[`Maybe`](../classes/Maybe.md)\<`U`\>

##### Inherited from

`MaybeImpl.andThen`

#### Call Signature

> **andThen**\<`R`\>(`andThenFn`): [`Maybe`](../classes/Maybe.md)\<`ValueFor`\<`R`\>\>

Method variant for [`andThen`](../functions/andThen.md)

##### Type Parameters

###### R

`R` *extends* `AnyMaybe`

##### Parameters

###### andThenFn

(`t`) => `R`

##### Returns

[`Maybe`](../classes/Maybe.md)\<`ValueFor`\<`R`\>\>

##### Inherited from

`MaybeImpl.andThen`

***

### ap()

> **ap**\<`A`, `B`\>(`this`, `val`): [`Maybe`](../classes/Maybe.md)\<`B`\>

Method variant for [`ap`](../functions/ap.md)

#### Type Parameters

##### A

`A`

##### B

`B` *extends* `object`

#### Parameters

##### this

[`Maybe`](../classes/Maybe.md)\<(`val`) => `B`\>

##### val

[`Maybe`](../classes/Maybe.md)\<`A`\>

#### Returns

[`Maybe`](../classes/Maybe.md)\<`B`\>

#### Inherited from

`MaybeImpl.ap`

***

### equals()

> **equals**(`comparison`): `boolean`

Method variant for [`equals`](../functions/equals.md)

#### Parameters

##### comparison

[`Maybe`](../classes/Maybe.md)\<`T`\>

#### Returns

`boolean`

#### Inherited from

`MaybeImpl.equals`

***

### get()

> **get**\<`K`\>(`key`): [`Maybe`](../classes/Maybe.md)\<`NonNullable`\<`T`\[`K`\]\>\>

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

[`Maybe`](../classes/Maybe.md)\<`NonNullable`\<`T`\[`K`\]\>\>

#### Inherited from

`MaybeImpl.get`

***

### map()

> **map**\<`U`\>(`mapFn`): [`Maybe`](../classes/Maybe.md)\<`U`\>

Method variant for [`map`](../functions/map.md)

#### Type Parameters

##### U

`U` *extends* `object`

#### Parameters

##### mapFn

(`t`) => `U`

#### Returns

[`Maybe`](../classes/Maybe.md)\<`U`\>

#### Inherited from

`MaybeImpl.map`

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

#### Inherited from

`MaybeImpl.mapOr`

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

#### Inherited from

`MaybeImpl.mapOrElse`

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

#### Inherited from

`MaybeImpl.match`

***

### or()

> **or**(`mOr`): [`Maybe`](../classes/Maybe.md)\<`T`\>

Method variant for [`or`](../functions/or.md)

#### Parameters

##### mOr

[`Maybe`](../classes/Maybe.md)\<`T`\>

#### Returns

[`Maybe`](../classes/Maybe.md)\<`T`\>

#### Inherited from

`MaybeImpl.or`

***

### orElse()

#### Call Signature

> **orElse**(`orElseFn`): [`Maybe`](../classes/Maybe.md)\<`T`\>

Method variant for [`orElse`](../functions/orElse.md)

##### Parameters

###### orElseFn

() => [`Maybe`](../classes/Maybe.md)\<`T`\>

##### Returns

[`Maybe`](../classes/Maybe.md)\<`T`\>

##### Inherited from

`MaybeImpl.orElse`

#### Call Signature

> **orElse**\<`R`\>(`orElseFn`): [`Maybe`](../classes/Maybe.md)\<`ValueFor`\<`R`\>\>

Method variant for [`orElse`](../functions/orElse.md)

##### Type Parameters

###### R

`R` *extends* `AnyMaybe`

##### Parameters

###### orElseFn

() => `R`

##### Returns

[`Maybe`](../classes/Maybe.md)\<`ValueFor`\<`R`\>\>

##### Inherited from

`MaybeImpl.orElse`

***

### toJSON()

> **toJSON**(): [`MaybeJSON`](../type-aliases/MaybeJSON.md)\<`unknown`\>

Method variant for [`toJSON`](../functions/toJSON.md)

#### Returns

[`MaybeJSON`](../type-aliases/MaybeJSON.md)\<`unknown`\>

#### Inherited from

`MaybeImpl.toJSON`

***

### toString()

> **toString**(): `string`

Method variant for [`toString`](../functions/toString.md)

#### Returns

`string`

#### Inherited from

`MaybeImpl.toString`

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

#### Inherited from

`MaybeImpl.unwrapOr`

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

#### Inherited from

`MaybeImpl.unwrapOrElse`
