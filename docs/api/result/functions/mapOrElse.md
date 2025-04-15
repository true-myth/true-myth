[True Myth](../../index.md) / [result](../index.md) / mapOrElse

# Function: mapOrElse()

## Call Signature

> **mapOrElse**\<`T`, `U`, `E`\>(`orElseFn`, `mapFn`, `result`): `U`

Map over a [`Result`](../classes/Result.md) instance as in [`map`](map.md) and get out the
value if `result` is [`Ok`](../interfaces/Ok.md), or apply a function (`orElseFn`) to the
value wrapped in the [`Err`](../interfaces/Err.md) to get a default value.

Like [`mapOr`](mapOr.md) but using a function to transform the error into a
usable value instead of simply using a default value.

#### Examples

```ts
import { ok, err, mapOrElse } from 'true-myth/result';

const summarize = (s: string) => `The response was: '${s}'`;
const getReason = (err: { code: number, reason: string }) => err.reason;

const okResponse = ok("Things are grand here.");
const mappedOkAndUnwrapped = mapOrElse(getReason, summarize, okResponse);
console.log(mappedOkAndUnwrapped);  // The response was: 'Things are grand here.'

const errResponse = err({ code: 500, reason: 'Nothing at this endpoint!' });
const mappedErrAndUnwrapped = mapOrElse(getReason, summarize, errResponse);
console.log(mappedErrAndUnwrapped);  // Nothing at this endpoint!
```

### Type Parameters

#### T

`T`

The type of the wrapped `Ok` value.

#### U

`U`

The type of the resulting value from applying `mapFn` to the
                `Ok` value or `orElseFn` to the `Err` value.

#### E

`E`

The type of the wrapped `Err` value.

### Parameters

#### orElseFn

(`err`) => `U`

The function to apply to the wrapped `Err` value to get a
                usable value if `result` is an `Err`.

#### mapFn

(`t`) => `U`

The function to apply to the wrapped `Ok` value if `result` is
                an `Ok`.

#### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

The `Result` instance to map over.

### Returns

`U`

## Call Signature

> **mapOrElse**\<`T`, `U`, `E`\>(`orElseFn`, `mapFn`): (`result`) => `U`

Map over a [`Result`](../classes/Result.md) instance as in [`map`](map.md) and get out the
value if `result` is [`Ok`](../interfaces/Ok.md), or apply a function (`orElseFn`) to the
value wrapped in the [`Err`](../interfaces/Err.md) to get a default value.

Like [`mapOr`](mapOr.md) but using a function to transform the error into a
usable value instead of simply using a default value.

#### Examples

```ts
import { ok, err, mapOrElse } from 'true-myth/result';

const summarize = (s: string) => `The response was: '${s}'`;
const getReason = (err: { code: number, reason: string }) => err.reason;

const okResponse = ok("Things are grand here.");
const mappedOkAndUnwrapped = mapOrElse(getReason, summarize, okResponse);
console.log(mappedOkAndUnwrapped);  // The response was: 'Things are grand here.'

const errResponse = err({ code: 500, reason: 'Nothing at this endpoint!' });
const mappedErrAndUnwrapped = mapOrElse(getReason, summarize, errResponse);
console.log(mappedErrAndUnwrapped);  // Nothing at this endpoint!
```

### Type Parameters

#### T

`T`

The type of the wrapped `Ok` value.

#### U

`U`

The type of the resulting value from applying `mapFn` to the
                `Ok` value or `orElseFn` to the `Err` value.

#### E

`E`

The type of the wrapped `Err` value.

### Parameters

#### orElseFn

(`err`) => `U`

The function to apply to the wrapped `Err` value to get a
                usable value if `result` is an `Err`.

#### mapFn

(`t`) => `U`

The function to apply to the wrapped `Ok` value if `result` is
                an `Ok`.

### Returns

`Function`

#### Parameters

##### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

#### Returns

`U`

## Call Signature

> **mapOrElse**\<`T`, `U`, `E`\>(`orElseFn`): (`mapFn`) => (`result`) => `U`

Map over a [`Result`](../classes/Result.md) instance as in [`map`](map.md) and get out the
value if `result` is [`Ok`](../interfaces/Ok.md), or apply a function (`orElseFn`) to the
value wrapped in the [`Err`](../interfaces/Err.md) to get a default value.

Like [`mapOr`](mapOr.md) but using a function to transform the error into a
usable value instead of simply using a default value.

#### Examples

```ts
import { ok, err, mapOrElse } from 'true-myth/result';

const summarize = (s: string) => `The response was: '${s}'`;
const getReason = (err: { code: number, reason: string }) => err.reason;

const okResponse = ok("Things are grand here.");
const mappedOkAndUnwrapped = mapOrElse(getReason, summarize, okResponse);
console.log(mappedOkAndUnwrapped);  // The response was: 'Things are grand here.'

const errResponse = err({ code: 500, reason: 'Nothing at this endpoint!' });
const mappedErrAndUnwrapped = mapOrElse(getReason, summarize, errResponse);
console.log(mappedErrAndUnwrapped);  // Nothing at this endpoint!
```

### Type Parameters

#### T

`T`

The type of the wrapped `Ok` value.

#### U

`U`

The type of the resulting value from applying `mapFn` to the
                `Ok` value or `orElseFn` to the `Err` value.

#### E

`E`

The type of the wrapped `Err` value.

### Parameters

#### orElseFn

(`err`) => `U`

The function to apply to the wrapped `Err` value to get a
                usable value if `result` is an `Err`.

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
