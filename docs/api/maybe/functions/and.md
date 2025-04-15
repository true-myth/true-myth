[True Myth](../../index.md) / [maybe](../index.md) / and

# Function: and()

## Call Signature

> **and**\<`T`, `U`\>(`andMaybe`, `maybe`): [`Maybe`](../classes/Maybe.md)\<`U`\>

You can think of this like a short-circuiting logical "and" operation on a
[`Maybe`](../classes/Maybe.md) type. If `maybe` is [`just`](../variables/just.md), then the result is the
`andMaybe`. If `maybe` is [`Nothing`](../interfaces/Nothing.md), the result is `Nothing`.

This is useful when you have another `Maybe` value you want to provide if and
*only if* you have a `Just` – that is, when you need to make sure that if you
`Nothing`, whatever else you're handing a `Maybe` to *also* gets a `Nothing`.

Notice that, unlike in [`map`](#map) or its variants, the original `maybe` is
not involved in constructing the new `Maybe`.

#### Examples

```ts
import Maybe from 'true-myth/maybe';

const justA = Maybe.just('A');
const justB = Maybe.just('B');
const nothing: Maybe<number> = nothing();

console.log(Maybe.and(justB, justA).toString());  // Just(B)
console.log(Maybe.and(justB, nothing).toString());  // Nothing
console.log(Maybe.and(nothing, justA).toString());  // Nothing
console.log(Maybe.and(nothing, nothing).toString());  // Nothing
```

### Type Parameters

#### T

`T`

The type of the initial wrapped value.

#### U

`U`

The type of the wrapped value of the returned `Maybe`.

### Parameters

#### andMaybe

[`Maybe`](../classes/Maybe.md)\<`U`\>

The `Maybe` instance to return if `maybe` is `Just`

#### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

The `Maybe` instance to check.

### Returns

[`Maybe`](../classes/Maybe.md)\<`U`\>

`Nothing` if the original `maybe` is `Nothing`, or `andMaybe`
                if the original `maybe` is `Just`.

## Call Signature

> **and**\<`T`, `U`\>(`andMaybe`): (`maybe`) => [`Maybe`](../classes/Maybe.md)\<`U`\>

You can think of this like a short-circuiting logical "and" operation on a
[`Maybe`](../classes/Maybe.md) type. If `maybe` is [`just`](../variables/just.md), then the result is the
`andMaybe`. If `maybe` is [`Nothing`](../interfaces/Nothing.md), the result is `Nothing`.

This is useful when you have another `Maybe` value you want to provide if and
*only if* you have a `Just` – that is, when you need to make sure that if you
`Nothing`, whatever else you're handing a `Maybe` to *also* gets a `Nothing`.

Notice that, unlike in [`map`](#map) or its variants, the original `maybe` is
not involved in constructing the new `Maybe`.

#### Examples

```ts
import Maybe from 'true-myth/maybe';

const justA = Maybe.just('A');
const justB = Maybe.just('B');
const nothing: Maybe<number> = nothing();

console.log(Maybe.and(justB, justA).toString());  // Just(B)
console.log(Maybe.and(justB, nothing).toString());  // Nothing
console.log(Maybe.and(nothing, justA).toString());  // Nothing
console.log(Maybe.and(nothing, nothing).toString());  // Nothing
```

### Type Parameters

#### T

`T`

The type of the initial wrapped value.

#### U

`U`

The type of the wrapped value of the returned `Maybe`.

### Parameters

#### andMaybe

[`Maybe`](../classes/Maybe.md)\<`U`\>

The `Maybe` instance to return if `maybe` is `Just`

### Returns

`Function`

`Nothing` if the original `maybe` is `Nothing`, or `andMaybe`
                if the original `maybe` is `Just`.

#### Parameters

##### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

#### Returns

[`Maybe`](../classes/Maybe.md)\<`U`\>
