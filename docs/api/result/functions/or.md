[True Myth](../../index.md) / [result](../index.md) / or

# Function: or()

## Call Signature

> **or**\<`T`, `E`, `F`\>(`defaultResult`, `result`): [`Result`](../classes/Result.md)\<`T`, `F`\>

Provide a fallback for a given [`Result`](../classes/Result.md). Behaves like a logical
`or`: if the `result` value is an [`Ok`](../interfaces/Ok.md), returns that `result`;
otherwise, returns the `defaultResult` value.

This is useful when you want to make sure that something which takes a
`Result` always ends up getting an `Ok` variant, by supplying a default value
for the case that you currently have an [`Err`](../interfaces/Err.md).

```ts
import { ok, err, Result, or } from 'true-utils/result';

const okA = ok<string, string>('a');
const okB = ok<string, string>('b');
const anErr = err<string, string>(':wat:');
const anotherErr = err<string, string>(':headdesk:');

console.log(or(okB, okA).toString());  // Ok(A)
console.log(or(anErr, okA).toString());  // Ok(A)
console.log(or(okB, anErr).toString());  // Ok(B)
console.log(or(anotherErr, anErr).toString());  // Err(:headdesk:)
```

### Type Parameters

#### T

`T`

The type wrapped in the `Ok` case of `result`.

#### E

`E`

The type wrapped in the `Err` case of `result`.

#### F

`F`

The type wrapped in the `Err` case of `defaultResult`.

### Parameters

#### defaultResult

[`Result`](../classes/Result.md)\<`T`, `F`\>

The `Result` to use if `result` is an `Err`.

#### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

The `Result` instance to check.

### Returns

[`Result`](../classes/Result.md)\<`T`, `F`\>

`result` if it is an `Ok`, otherwise `defaultResult`.

## Call Signature

> **or**\<`T`, `E`, `F`\>(`defaultResult`): (`result`) => [`Result`](../classes/Result.md)\<`T`, `F`\>

Provide a fallback for a given [`Result`](../classes/Result.md). Behaves like a logical
`or`: if the `result` value is an [`Ok`](../interfaces/Ok.md), returns that `result`;
otherwise, returns the `defaultResult` value.

This is useful when you want to make sure that something which takes a
`Result` always ends up getting an `Ok` variant, by supplying a default value
for the case that you currently have an [`Err`](../interfaces/Err.md).

```ts
import { ok, err, Result, or } from 'true-utils/result';

const okA = ok<string, string>('a');
const okB = ok<string, string>('b');
const anErr = err<string, string>(':wat:');
const anotherErr = err<string, string>(':headdesk:');

console.log(or(okB, okA).toString());  // Ok(A)
console.log(or(anErr, okA).toString());  // Ok(A)
console.log(or(okB, anErr).toString());  // Ok(B)
console.log(or(anotherErr, anErr).toString());  // Err(:headdesk:)
```

### Type Parameters

#### T

`T`

The type wrapped in the `Ok` case of `result`.

#### E

`E`

The type wrapped in the `Err` case of `result`.

#### F

`F`

The type wrapped in the `Err` case of `defaultResult`.

### Parameters

#### defaultResult

[`Result`](../classes/Result.md)\<`T`, `F`\>

The `Result` to use if `result` is an `Err`.

### Returns

`Function`

`result` if it is an `Ok`, otherwise `defaultResult`.

#### Parameters

##### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

#### Returns

[`Result`](../classes/Result.md)\<`T`, `F`\>
