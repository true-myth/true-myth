[True Myth](../../index.md) / [result](../index.md) / mapOr

# Function: mapOr()

## Call Signature

> **mapOr**\<`T`, `U`, `E`\>(`orU`, `mapFn`, `result`): `U`

Map over a [`Result`](../classes/Result.md) instance as in [`map`](#map) and get out the
value if `result` is an [`Ok`](../interfaces/Ok.md), or return a default value if `result`
is an [`Err`](../interfaces/Err.md).

#### Examples

```ts
import { ok, err, mapOr } from 'true-myth/result';

const length = (s: string) => s.length;

const anOkString = ok('a string');
const theStringLength = mapOr(0, length, anOkString);
console.log(theStringLength);  // 8

const anErr = err('uh oh');
const anErrMapped = mapOr(0, length, anErr);
console.log(anErrMapped);  // 0
```

### Type Parameters

#### T

`T`

#### U

`U`

#### E

`E`

### Parameters

#### orU

`U`

The default value to use if `result` is an `Err`.

#### mapFn

(`t`) => `U`

The function to apply the value to if `result` is an `Ok`.

#### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

The `Result` instance to map over.

### Returns

`U`

## Call Signature

> **mapOr**\<`T`, `U`, `E`\>(`orU`, `mapFn`): (`result`) => `U`

Map over a [`Result`](../classes/Result.md) instance as in [`map`](#map) and get out the
value if `result` is an [`Ok`](../interfaces/Ok.md), or return a default value if `result`
is an [`Err`](../interfaces/Err.md).

#### Examples

```ts
import { ok, err, mapOr } from 'true-myth/result';

const length = (s: string) => s.length;

const anOkString = ok('a string');
const theStringLength = mapOr(0, length, anOkString);
console.log(theStringLength);  // 8

const anErr = err('uh oh');
const anErrMapped = mapOr(0, length, anErr);
console.log(anErrMapped);  // 0
```

### Type Parameters

#### T

`T`

#### U

`U`

#### E

`E`

### Parameters

#### orU

`U`

The default value to use if `result` is an `Err`.

#### mapFn

(`t`) => `U`

The function to apply the value to if `result` is an `Ok`.

### Returns

`Function`

#### Parameters

##### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

#### Returns

`U`

## Call Signature

> **mapOr**\<`T`, `U`, `E`\>(`orU`): (`mapFn`) => (`result`) => `U`

Map over a [`Result`](../classes/Result.md) instance as in [`map`](#map) and get out the
value if `result` is an [`Ok`](../interfaces/Ok.md), or return a default value if `result`
is an [`Err`](../interfaces/Err.md).

#### Examples

```ts
import { ok, err, mapOr } from 'true-myth/result';

const length = (s: string) => s.length;

const anOkString = ok('a string');
const theStringLength = mapOr(0, length, anOkString);
console.log(theStringLength);  // 8

const anErr = err('uh oh');
const anErrMapped = mapOr(0, length, anErr);
console.log(anErrMapped);  // 0
```

### Type Parameters

#### T

`T`

#### U

`U`

#### E

`E`

### Parameters

#### orU

`U`

The default value to use if `result` is an `Err`.

### Returns

`Function`

#### Parameters

##### mapFn

(`t`) => `U`

#### Returns

`Function`

##### Parameters

###### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

##### Returns

`U`
