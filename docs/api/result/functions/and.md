[True Myth](../../index.md) / [result](../index.md) / and

# Function: and()

## Call Signature

> **and**\<`T`, `U`, `E`\>(`andResult`, `result`): [`Result`](../classes/Result.md)\<`U`, `E`\>

You can think of this like a short-circuiting logical "and" operation on a
[`Result`](../classes/Result.md) type. If `result` is [`Ok`](../interfaces/Ok.md), then the result is the
`andResult`. If `result` is [`Err`](../interfaces/Err.md), the result is the `Err`.

This is useful when you have another `Result` value you want to provide if and
*only if* you have an `Ok` – that is, when you need to make sure that if you
`Err`, whatever else you're handing a `Result` to *also* gets that `Err`.

Notice that, unlike in [`map`](#map) or its variants, the original `result` is
not involved in constructing the new `Result`.

#### Examples

```ts
import { and, ok, err, toString } from 'true-myth/result';

const okA = ok('A');
const okB = ok('B');
const anErr = err({ so: 'bad' });

console.log(toString(and(okB, okA)));  // Ok(B)
console.log(toString(and(okB, anErr)));  // Err([object Object])
console.log(toString(and(anErr, okA)));  // Err([object Object])
console.log(toString(and(anErr, anErr)));  // Err([object Object])
```

### Type Parameters

#### T

`T`

The type of the value wrapped in the `Ok` of the `Result`.

#### U

`U`

The type of the value wrapped in the `Ok` of the `andResult`,
                 i.e. the success type of the `Result` present if the checked
                 `Result` is `Ok`.

#### E

`E`

The type of the value wrapped in the `Err` of the `Result`.

### Parameters

#### andResult

[`Result`](../classes/Result.md)\<`U`, `E`\>

The `Result` instance to return if `result` is `Err`.

#### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

The `Result` instance to check.

### Returns

[`Result`](../classes/Result.md)\<`U`, `E`\>

## Call Signature

> **and**\<`T`, `U`, `E`\>(`andResult`): (`result`) => [`Result`](../classes/Result.md)\<`U`, `E`\>

You can think of this like a short-circuiting logical "and" operation on a
[`Result`](../classes/Result.md) type. If `result` is [`Ok`](../interfaces/Ok.md), then the result is the
`andResult`. If `result` is [`Err`](../interfaces/Err.md), the result is the `Err`.

This is useful when you have another `Result` value you want to provide if and
*only if* you have an `Ok` – that is, when you need to make sure that if you
`Err`, whatever else you're handing a `Result` to *also* gets that `Err`.

Notice that, unlike in [`map`](#map) or its variants, the original `result` is
not involved in constructing the new `Result`.

#### Examples

```ts
import { and, ok, err, toString } from 'true-myth/result';

const okA = ok('A');
const okB = ok('B');
const anErr = err({ so: 'bad' });

console.log(toString(and(okB, okA)));  // Ok(B)
console.log(toString(and(okB, anErr)));  // Err([object Object])
console.log(toString(and(anErr, okA)));  // Err([object Object])
console.log(toString(and(anErr, anErr)));  // Err([object Object])
```

### Type Parameters

#### T

`T`

The type of the value wrapped in the `Ok` of the `Result`.

#### U

`U`

The type of the value wrapped in the `Ok` of the `andResult`,
                 i.e. the success type of the `Result` present if the checked
                 `Result` is `Ok`.

#### E

`E`

The type of the value wrapped in the `Err` of the `Result`.

### Parameters

#### andResult

[`Result`](../classes/Result.md)\<`U`, `E`\>

The `Result` instance to return if `result` is `Err`.

### Returns

`Function`

#### Parameters

##### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

#### Returns

[`Result`](../classes/Result.md)\<`U`, `E`\>
