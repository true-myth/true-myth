[True Myth](../../index.md) / [result](../index.md) / mapErr

# Function: mapErr()

## Call Signature

> **mapErr**\<`T`, `E`, `F`\>(`mapErrFn`, `result`): [`Result`](../classes/Result.md)\<`T`, `F`\>

Map over a [`Ok`](../interfaces/Ok.md), exactly as in [`map`](map.md), but operating on the
value wrapped in an [`Err`](../interfaces/Err.md) instead of the value wrapped in the
[`Ok`](../interfaces/Ok.md). This is handy for when you need to line up a bunch of
different types of errors, or if you need an error of one shape to be in a
different shape to use somewhere else in your codebase.

#### Examples

```ts
import { ok, err, mapErr, toString } from 'true-myth/result';

const reason = (err: { code: number, reason: string }) => err.reason;

const anOk = ok(12);
const mappedOk = mapErr(reason, anOk);
console.log(toString(mappedOk));  // Ok(12)

const anErr = err({ code: 101, reason: 'bad file' });
const mappedErr = mapErr(reason, anErr);
console.log(toString(mappedErr));  // Err(bad file)
```

### Type Parameters

#### T

`T`

The type of the value wrapped in the `Ok` of the `Result`.

#### E

`E`

The type of the value wrapped in the `Err` of the `Result`.

#### F

`F`

The type of the value wrapped in the `Err` of a new `Result`,
                returned by the `mapErrFn`.

### Parameters

#### mapErrFn

(`e`) => `F`

The function to apply to the value wrapped in `Err` if
`result` is an `Err`.

#### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

The `Result` instance to map over an error case for.

### Returns

[`Result`](../classes/Result.md)\<`T`, `F`\>

## Call Signature

> **mapErr**\<`T`, `E`, `F`\>(`mapErrFn`): (`result`) => [`Result`](../classes/Result.md)\<`T`, `F`\>

Map over a [`Ok`](../interfaces/Ok.md), exactly as in [`map`](map.md), but operating on the
value wrapped in an [`Err`](../interfaces/Err.md) instead of the value wrapped in the
[`Ok`](../interfaces/Ok.md). This is handy for when you need to line up a bunch of
different types of errors, or if you need an error of one shape to be in a
different shape to use somewhere else in your codebase.

#### Examples

```ts
import { ok, err, mapErr, toString } from 'true-myth/result';

const reason = (err: { code: number, reason: string }) => err.reason;

const anOk = ok(12);
const mappedOk = mapErr(reason, anOk);
console.log(toString(mappedOk));  // Ok(12)

const anErr = err({ code: 101, reason: 'bad file' });
const mappedErr = mapErr(reason, anErr);
console.log(toString(mappedErr));  // Err(bad file)
```

### Type Parameters

#### T

`T`

The type of the value wrapped in the `Ok` of the `Result`.

#### E

`E`

The type of the value wrapped in the `Err` of the `Result`.

#### F

`F`

The type of the value wrapped in the `Err` of a new `Result`,
                returned by the `mapErrFn`.

### Parameters

#### mapErrFn

(`e`) => `F`

The function to apply to the value wrapped in `Err` if
`result` is an `Err`.

### Returns

`Function`

#### Parameters

##### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

#### Returns

[`Result`](../classes/Result.md)\<`T`, `F`\>
