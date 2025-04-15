[True Myth](../../index.md) / [result](../index.md) / unwrapOr

# Function: unwrapOr()

## Call Signature

> **unwrapOr**\<`T`, `U`, `E`\>(`defaultValue`, `result`): `T` \| `U`

Safely get the value out of the [`Ok`](../interfaces/Ok.md) variant of a [`Result`](../classes/Result.md).

This is the recommended way to get a value out of a `Result` most of the time.

```ts
import { ok, err, unwrapOr } from 'true-myth/result';

const anOk = ok<number, string>(12);
console.log(unwrapOr(0, anOk));  // 12

const anErr = err<number, string>('nooooo');
console.log(unwrapOr(0, anErr));  // 0
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

#### defaultValue

`U`

The value to use if `result` is an `Err`.

#### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

The `Result` instance to unwrap if it is an `Ok`.

### Returns

`T` \| `U`

The content of `result` if it is an `Ok`, otherwise
                    `defaultValue`.

## Call Signature

> **unwrapOr**\<`T`, `U`, `E`\>(`defaultValue`): (`result`) => `T` \| `U`

Safely get the value out of the [`Ok`](../interfaces/Ok.md) variant of a [`Result`](../classes/Result.md).

This is the recommended way to get a value out of a `Result` most of the time.

```ts
import { ok, err, unwrapOr } from 'true-myth/result';

const anOk = ok<number, string>(12);
console.log(unwrapOr(0, anOk));  // 12

const anErr = err<number, string>('nooooo');
console.log(unwrapOr(0, anErr));  // 0
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

#### defaultValue

`U`

The value to use if `result` is an `Err`.

### Returns

`Function`

The content of `result` if it is an `Ok`, otherwise
                    `defaultValue`.

#### Parameters

##### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

#### Returns

`T` \| `U`
