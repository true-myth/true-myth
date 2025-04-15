[True Myth](../../index.md) / [maybe](../index.md) / mapOrElse

# Function: mapOrElse()

## Call Signature

> **mapOrElse**\<`T`, `U`\>(`orElseFn`, `mapFn`, `maybe`): `U`

Map over a [`Maybe`](../classes/Maybe.md) instance and get out the value if `maybe` is a
[`Just`](../interfaces/Just.md), or use a function to construct a default value if `maybe` is
[`Nothing`](../interfaces/Nothing.md).

#### Examples

```ts
const length = (s: string) => s.length;
const getDefault = () => 0;

const justAString = Maybe.just('string');
const theStringLength = mapOrElse(getDefault, length, justAString);
console.log(theStringLength); // 6

const notAString = Maybe.nothing<string>();
const notAStringLength = mapOrElse(getDefault, length, notAString)
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

#### orElseFn

() => `U`

The function to apply if `maybe` is `Nothing`.

#### mapFn

(`t`) => `U`

The function to apply to the wrapped value if `maybe` is
`Just`

#### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

The `Maybe` instance to map over.

### Returns

`U`

## Call Signature

> **mapOrElse**\<`T`, `U`\>(`orElseFn`, `mapFn`): (`maybe`) => `U`

Map over a [`Maybe`](../classes/Maybe.md) instance and get out the value if `maybe` is a
[`Just`](../interfaces/Just.md), or use a function to construct a default value if `maybe` is
[`Nothing`](../interfaces/Nothing.md).

#### Examples

```ts
const length = (s: string) => s.length;
const getDefault = () => 0;

const justAString = Maybe.just('string');
const theStringLength = mapOrElse(getDefault, length, justAString);
console.log(theStringLength); // 6

const notAString = Maybe.nothing<string>();
const notAStringLength = mapOrElse(getDefault, length, notAString)
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

#### orElseFn

() => `U`

The function to apply if `maybe` is `Nothing`.

#### mapFn

(`t`) => `U`

The function to apply to the wrapped value if `maybe` is
`Just`

### Returns

`Function`

#### Parameters

##### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

#### Returns

`U`

## Call Signature

> **mapOrElse**\<`T`, `U`\>(`orElseFn`): (`mapFn`) => (`maybe`) => `U`

Map over a [`Maybe`](../classes/Maybe.md) instance and get out the value if `maybe` is a
[`Just`](../interfaces/Just.md), or use a function to construct a default value if `maybe` is
[`Nothing`](../interfaces/Nothing.md).

#### Examples

```ts
const length = (s: string) => s.length;
const getDefault = () => 0;

const justAString = Maybe.just('string');
const theStringLength = mapOrElse(getDefault, length, justAString);
console.log(theStringLength); // 6

const notAString = Maybe.nothing<string>();
const notAStringLength = mapOrElse(getDefault, length, notAString)
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

#### orElseFn

() => `U`

The function to apply if `maybe` is `Nothing`.

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
