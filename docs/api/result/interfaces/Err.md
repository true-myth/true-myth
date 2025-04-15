[True Myth](../../index.md) / [result](../index.md) / Err

# Interface: Err\<T, E\>

An `Err` instance is the *failure* variant instance of the [`Result`](../classes/Result.md)
type, representing a failure outcome from an operation which may fail. For a
full discussion, see the module docs.

## Extends

- `Omit`\<`ResultImpl`\<`T`, `E`\>, `"value"` \| `"cast"`\>

## Type Parameters

### T

`T`

The type which would be wrapped in an `Ok` variant of `Result`.

### E

`E`

The type wrapped in this `Err` variant of `Result`.

## Properties

### \[IsResult\]

> `readonly` **\[IsResult\]**: \[`T`, `E`\]

#### Inherited from

`Omit.[IsResult]`

***

### error

> **error**: `E`

The wrapped error value.

#### Overrides

`Omit.error`

***

### isErr

> **isErr**: `true`

Is the `Result` an `Err`?

#### Overrides

`Omit.isErr`

***

### isOk

> **isOk**: `false`

Is the [`Result`](../classes/Result.md) an [`Ok`](Ok.md)?

#### Overrides

`Omit.isOk`

***

### variant

> `readonly` **variant**: `"Err"`

`Err` is always `Variant.Err`.

#### Overrides

`Omit.variant`

## Methods

### and()

> **and**\<`U`\>(`mAnd`): [`Result`](../classes/Result.md)\<`U`, `E`\>

Method variant for [`and`](../functions/and.md)

#### Type Parameters

##### U

`U`

#### Parameters

##### mAnd

[`Result`](../classes/Result.md)\<`U`, `E`\>

#### Returns

[`Result`](../classes/Result.md)\<`U`, `E`\>

#### Inherited from

`Omit.and`

***

### andThen()

#### Call Signature

> **andThen**\<`U`\>(`andThenFn`): [`Result`](../classes/Result.md)\<`U`, `E`\>

Method variant for [`andThen`](../functions/andThen.md)

##### Type Parameters

###### U

`U`

##### Parameters

###### andThenFn

(`t`) => [`Result`](../classes/Result.md)\<`U`, `E`\>

##### Returns

[`Result`](../classes/Result.md)\<`U`, `E`\>

##### Inherited from

`Omit.andThen`

#### Call Signature

> **andThen**\<`R`\>(`andThenFn`): [`Result`](../classes/Result.md)\<`OkFor`\<`R`\>, `E` \| `ErrFor`\<`R`\>\>

Method variant for [`andThen`](../functions/andThen.md)

##### Type Parameters

###### R

`R` *extends* `AnyResult`

##### Parameters

###### andThenFn

(`t`) => `R`

##### Returns

[`Result`](../classes/Result.md)\<`OkFor`\<`R`\>, `E` \| `ErrFor`\<`R`\>\>

##### Inherited from

`Omit.andThen`

***

### ap()

> **ap**\<`A`, `B`\>(`this`, `r`): [`Result`](../classes/Result.md)\<`B`, `E`\>

Method variant for [`ap`](../functions/ap.md)

#### Type Parameters

##### A

`A`

##### B

`B`

#### Parameters

##### this

[`Result`](../classes/Result.md)\<(`a`) => `B`, `E`\>

##### r

[`Result`](../classes/Result.md)\<`A`, `E`\>

#### Returns

[`Result`](../classes/Result.md)\<`B`, `E`\>

#### Inherited from

`Omit.ap`

***

### cast()

> **cast**\<`U`\>(): [`Result`](../classes/Result.md)\<`U`, `E`\>

#### Type Parameters

##### U

`U`

#### Returns

[`Result`](../classes/Result.md)\<`U`, `E`\>

***

### equals()

> **equals**(`comparison`): `boolean`

Method variant for [`equals`](../functions/equals.md)

#### Parameters

##### comparison

[`Result`](../classes/Result.md)\<`T`, `E`\>

#### Returns

`boolean`

#### Inherited from

`Omit.equals`

***

### map()

> **map**\<`U`\>(`mapFn`): [`Result`](../classes/Result.md)\<`U`, `E`\>

Method variant for [`map`](../functions/map.md)

#### Type Parameters

##### U

`U`

#### Parameters

##### mapFn

(`t`) => `U`

#### Returns

[`Result`](../classes/Result.md)\<`U`, `E`\>

#### Inherited from

`Omit.map`

***

### mapErr()

> **mapErr**\<`F`\>(`mapErrFn`): [`Result`](../classes/Result.md)\<`T`, `F`\>

Method variant for [`mapErr`](../functions/mapErr.md)

#### Type Parameters

##### F

`F`

#### Parameters

##### mapErrFn

(`e`) => `F`

#### Returns

[`Result`](../classes/Result.md)\<`T`, `F`\>

#### Inherited from

`Omit.mapErr`

***

### mapOr()

> **mapOr**\<`U`\>(`orU`, `mapFn`): `U`

Method variant for [`mapOr`](../functions/mapOr.md)

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

`Omit.mapOr`

***

### mapOrElse()

> **mapOrElse**\<`U`\>(`orElseFn`, `mapFn`): `U`

Method variant for [`mapOrElse`](../functions/mapOrElse.md)

#### Type Parameters

##### U

`U`

#### Parameters

##### orElseFn

(`err`) => `U`

##### mapFn

(`t`) => `U`

#### Returns

`U`

#### Inherited from

`Omit.mapOrElse`

***

### match()

> **match**\<`A`\>(`matcher`): `A`

Method variant for [`match`](../functions/match.md)

#### Type Parameters

##### A

`A`

#### Parameters

##### matcher

[`Matcher`](../type-aliases/Matcher.md)\<`T`, `E`, `A`\>

#### Returns

`A`

#### Inherited from

`Omit.match`

***

### or()

> **or**\<`F`\>(`orResult`): [`Result`](../classes/Result.md)\<`T`, `F`\>

Method variant for [`or`](../functions/or.md)

#### Type Parameters

##### F

`F`

#### Parameters

##### orResult

[`Result`](../classes/Result.md)\<`T`, `F`\>

#### Returns

[`Result`](../classes/Result.md)\<`T`, `F`\>

#### Inherited from

`Omit.or`

***

### orElse()

#### Call Signature

> **orElse**\<`F`\>(`orElseFn`): [`Result`](../classes/Result.md)\<`T`, `F`\>

Method variant for [`orElse`](../functions/orElse.md)

##### Type Parameters

###### F

`F`

##### Parameters

###### orElseFn

(`err`) => [`Result`](../classes/Result.md)\<`T`, `F`\>

##### Returns

[`Result`](../classes/Result.md)\<`T`, `F`\>

##### Inherited from

`Omit.orElse`

#### Call Signature

> **orElse**\<`R`\>(`orElseFn`): [`Result`](../classes/Result.md)\<`T` \| `OkFor`\<`R`\>, `ErrFor`\<`R`\>\>

Method variant for [`orElse`](../functions/orElse.md)

##### Type Parameters

###### R

`R` *extends* `AnyResult`

##### Parameters

###### orElseFn

(`err`) => `R`

##### Returns

[`Result`](../classes/Result.md)\<`T` \| `OkFor`\<`R`\>, `ErrFor`\<`R`\>\>

##### Inherited from

`Omit.orElse`

***

### toJSON()

> **toJSON**(): [`ResultJSON`](../type-aliases/ResultJSON.md)\<`T`, `E`\>

Method variant for [`toJSON`](../functions/toJSON.md)

#### Returns

[`ResultJSON`](../type-aliases/ResultJSON.md)\<`T`, `E`\>

#### Inherited from

`Omit.toJSON`

***

### toString()

> **toString**(): `string`

Method variant for [`toString`](../functions/toString.md)

#### Returns

`string`

#### Inherited from

`Omit.toString`

***

### unwrapOr()

> **unwrapOr**\<`U`\>(`defaultValue`): `T` \| `U`

Method variant for [`unwrapOr`](../functions/unwrapOr.md)

#### Type Parameters

##### U

`U` = `T`

#### Parameters

##### defaultValue

`U`

#### Returns

`T` \| `U`

#### Inherited from

`Omit.unwrapOr`

***

### unwrapOrElse()

> **unwrapOrElse**\<`U`\>(`elseFn`): `T` \| `U`

Method variant for [`unwrapOrElse`](../functions/unwrapOrElse.md)

#### Type Parameters

##### U

`U`

#### Parameters

##### elseFn

(`error`) => `U`

#### Returns

`T` \| `U`

#### Inherited from

`Omit.unwrapOrElse`
