[True Myth](../../index.md) / [maybe](../index.md) / or

# Function: or()

## Call Signature

> **or**\<`T`\>(`defaultMaybe`, `maybe`): [`Maybe`](../classes/Maybe.md)\<`T`\>

Provide a fallback for a given [`Maybe`](../classes/Maybe.md). Behaves like a logical `or`:
if the `maybe` value is a [`Just`](../interfaces/Just.md), returns that `maybe`; otherwise,
returns the `defaultMaybe` value.

This is useful when you want to make sure that something which takes a `Maybe`
always ends up getting a `Just` variant, by supplying a default value for the
case that you currently have a nothing.

```ts
import Maybe from 'true-utils/maybe';

const justA = Maybe.just("a");
const justB = Maybe.just("b");
const aNothing: Maybe<string> = nothing();

console.log(Maybe.or(justB, justA).toString());  // Just(A)
console.log(Maybe.or(aNothing, justA).toString());  // Just(A)
console.log(Maybe.or(justB, aNothing).toString());  // Just(B)
console.log(Maybe.or(aNothing, aNothing).toString());  // Nothing
```

### Type Parameters

#### T

`T`

The type of the wrapped value.

### Parameters

#### defaultMaybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

The `Maybe` to use if `maybe` is a `Nothing`.

#### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

The `Maybe` instance to evaluate.

### Returns

[`Maybe`](../classes/Maybe.md)\<`T`\>

`maybe` if it is a `Just`, otherwise `defaultMaybe`.

## Call Signature

> **or**\<`T`\>(`defaultMaybe`): (`maybe`) => [`Maybe`](../classes/Maybe.md)\<`T`\>

Provide a fallback for a given [`Maybe`](../classes/Maybe.md). Behaves like a logical `or`:
if the `maybe` value is a [`Just`](../interfaces/Just.md), returns that `maybe`; otherwise,
returns the `defaultMaybe` value.

This is useful when you want to make sure that something which takes a `Maybe`
always ends up getting a `Just` variant, by supplying a default value for the
case that you currently have a nothing.

```ts
import Maybe from 'true-utils/maybe';

const justA = Maybe.just("a");
const justB = Maybe.just("b");
const aNothing: Maybe<string> = nothing();

console.log(Maybe.or(justB, justA).toString());  // Just(A)
console.log(Maybe.or(aNothing, justA).toString());  // Just(A)
console.log(Maybe.or(justB, aNothing).toString());  // Just(B)
console.log(Maybe.or(aNothing, aNothing).toString());  // Nothing
```

### Type Parameters

#### T

`T`

The type of the wrapped value.

### Parameters

#### defaultMaybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

The `Maybe` to use if `maybe` is a `Nothing`.

### Returns

`Function`

`maybe` if it is a `Just`, otherwise `defaultMaybe`.

#### Parameters

##### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

#### Returns

[`Maybe`](../classes/Maybe.md)\<`T`\>
