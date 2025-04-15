[True Myth](../../index.md) / [result](../index.md) / unwrapOrElse

# Function: unwrapOrElse()

## Call Signature

> **unwrapOrElse**\<`T`, `U`, `E`\>(`orElseFn`, `result`): `T` \| `U`

Safely get the value out of a [`Result`](../classes/Result.md) by returning the wrapped
value if it is [`Ok`](../interfaces/Ok.md), or by applying `orElseFn` to the value in the
[`Err`](../interfaces/Err.md).

This is useful when you need to *generate* a value (e.g. by using current
values in the environment – whether preloaded or by local closure) instead of
having a single default value available (as in [`unwrapOr`](unwrapOr.md)).

```ts
import { ok, err, unwrapOrElse } from 'true-myth/result';

// You can imagine that someOtherValue might be dynamic.
const someOtherValue = 2;
const handleErr = (errValue: string) => errValue.length + someOtherValue;

const anOk = ok<number, string>(42);
console.log(unwrapOrElse(handleErr, anOk));  // 42

const anErr = err<number, string>('oh teh noes');
console.log(unwrapOrElse(handleErr, anErr));  // 13
```

### Type Parameters

#### T

`T`

The value wrapped in the `Ok`.

#### U

`U`

#### E

`E`

The value wrapped in the `Err`.

### Parameters

#### orElseFn

(`error`) => `U`

A function applied to the value wrapped in `result` if it is
                an `Err`, to generate the final value.

#### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

The `result` to unwrap if it is an `Ok`.

### Returns

`T` \| `U`

The value wrapped in `result` if it is `Ok` or the value
                returned by `orElseFn` applied to the value in `Err`.

## Call Signature

> **unwrapOrElse**\<`T`, `U`, `E`\>(`orElseFn`): (`result`) => `T` \| `U`

Safely get the value out of a [`Result`](../classes/Result.md) by returning the wrapped
value if it is [`Ok`](../interfaces/Ok.md), or by applying `orElseFn` to the value in the
[`Err`](../interfaces/Err.md).

This is useful when you need to *generate* a value (e.g. by using current
values in the environment – whether preloaded or by local closure) instead of
having a single default value available (as in [`unwrapOr`](unwrapOr.md)).

```ts
import { ok, err, unwrapOrElse } from 'true-myth/result';

// You can imagine that someOtherValue might be dynamic.
const someOtherValue = 2;
const handleErr = (errValue: string) => errValue.length + someOtherValue;

const anOk = ok<number, string>(42);
console.log(unwrapOrElse(handleErr, anOk));  // 42

const anErr = err<number, string>('oh teh noes');
console.log(unwrapOrElse(handleErr, anErr));  // 13
```

### Type Parameters

#### T

`T`

The value wrapped in the `Ok`.

#### U

`U`

#### E

`E`

The value wrapped in the `Err`.

### Parameters

#### orElseFn

(`error`) => `U`

A function applied to the value wrapped in `result` if it is
                an `Err`, to generate the final value.

### Returns

`Function`

The value wrapped in `result` if it is `Ok` or the value
                returned by `orElseFn` applied to the value in `Err`.

#### Parameters

##### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

#### Returns

`T` \| `U`
