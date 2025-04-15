[True Myth](../../index.md) / [maybe](../index.md) / mapOr

# Function: mapOr()

## Call Signature

> **mapOr**\<`T`, `U`\>(`orU`, `mapFn`, `maybe`): `U`

Map over a [`Maybe`](../classes/Maybe.md) instance and get out the value if `maybe` is a
[`Just`](../interfaces/Just.md), or return a default value if `maybe` is a
[`Nothing`](../interfaces/Nothing.md).

#### Examples

```ts
const length = (s: string) => s.length;

const justAString = Maybe.just('string');
const theStringLength = mapOr(0, length, justAString);
console.log(theStringLength); // 6

const notAString = Maybe.nothing<string>();
const notAStringLength = mapOr(0, length, notAString)
console.log(notAStringLength); // 0
```

### Type Parameters

#### T

`T`

The type of the wrapped value.

#### U

`U`

The type of the wrapped value of the returned `Maybe`.

### Parameters

#### orU

`U`

The default value to use if `maybe` is `Nothing`

#### mapFn

(`t`) => `U`

The function to apply the value to if `Maybe` is `Just`

#### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

The `Maybe` instance to map over.

### Returns

`U`

## Call Signature

> **mapOr**\<`T`, `U`\>(`orU`, `mapFn`): (`maybe`) => `U`

Map over a [`Maybe`](../classes/Maybe.md) instance and get out the value if `maybe` is a
[`Just`](../interfaces/Just.md), or return a default value if `maybe` is a
[`Nothing`](../interfaces/Nothing.md).

#### Examples

```ts
const length = (s: string) => s.length;

const justAString = Maybe.just('string');
const theStringLength = mapOr(0, length, justAString);
console.log(theStringLength); // 6

const notAString = Maybe.nothing<string>();
const notAStringLength = mapOr(0, length, notAString)
console.log(notAStringLength); // 0
```

### Type Parameters

#### T

`T`

The type of the wrapped value.

#### U

`U`

The type of the wrapped value of the returned `Maybe`.

### Parameters

#### orU

`U`

The default value to use if `maybe` is `Nothing`

#### mapFn

(`t`) => `U`

The function to apply the value to if `Maybe` is `Just`

### Returns

`Function`

#### Parameters

##### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

#### Returns

`U`

## Call Signature

> **mapOr**\<`T`, `U`\>(`orU`): (`mapFn`) => (`maybe`) => `U`

Map over a [`Maybe`](../classes/Maybe.md) instance and get out the value if `maybe` is a
[`Just`](../interfaces/Just.md), or return a default value if `maybe` is a
[`Nothing`](../interfaces/Nothing.md).

#### Examples

```ts
const length = (s: string) => s.length;

const justAString = Maybe.just('string');
const theStringLength = mapOr(0, length, justAString);
console.log(theStringLength); // 6

const notAString = Maybe.nothing<string>();
const notAStringLength = mapOr(0, length, notAString)
console.log(notAStringLength); // 0
```

### Type Parameters

#### T

`T`

The type of the wrapped value.

#### U

`U`

The type of the wrapped value of the returned `Maybe`.

### Parameters

#### orU

`U`

The default value to use if `maybe` is `Nothing`

### Returns

`Function`

#### Parameters

##### mapFn

(`t`) => `U`

#### Returns

`Function`

##### Parameters

###### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

##### Returns

`U`
