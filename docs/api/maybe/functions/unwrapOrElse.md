[True Myth](../../index.md) / [maybe](../index.md) / unwrapOrElse

# Function: unwrapOrElse()

## Call Signature

> **unwrapOrElse**\<`T`, `U`\>(`orElseFn`, `maybe`): `T` \| `U`

Safely get the value out of a [`Maybe`](../classes/Maybe.md) by returning the wrapped value
if it is [`Just`](../interfaces/Just.md), or by applying `orElseFn` if it is
[`Nothing`](../interfaces/Nothing.md).

This is useful when you need to *generate* a value (e.g. by using current
values in the environment – whether preloaded or by local closure) instead of
having a single default value available (as in [`unwrapOr`](unwrapOr.md)).

```ts
import Maybe from 'true-myth/maybe';

// You can imagine that someOtherValue might be dynamic.
const someOtherValue = 99;
const handleNothing = () => someOtherValue;

const aJust = Maybe.just(42);
console.log(Maybe.unwrapOrElse(handleNothing, aJust));  // 42

const aNothing = nothing<number>();
console.log(Maybe.unwrapOrElse(handleNothing, aNothing)); // 99
```

### Type Parameters

#### T

`T`

The wrapped value.

#### U

`U`

### Parameters

#### orElseFn

() => `U`

A function used to generate a valid value if `maybe` is a
                `Nothing`.

#### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

The `Maybe` instance to unwrap if it is a `Just`

### Returns

`T` \| `U`

Either the content of `maybe` or the value returned from
                `orElseFn`.

## Call Signature

> **unwrapOrElse**\<`T`, `U`\>(`orElseFn`): (`maybe`) => `T` \| `U`

Safely get the value out of a [`Maybe`](../classes/Maybe.md) by returning the wrapped value
if it is [`Just`](../interfaces/Just.md), or by applying `orElseFn` if it is
[`Nothing`](../interfaces/Nothing.md).

This is useful when you need to *generate* a value (e.g. by using current
values in the environment – whether preloaded or by local closure) instead of
having a single default value available (as in [`unwrapOr`](unwrapOr.md)).

```ts
import Maybe from 'true-myth/maybe';

// You can imagine that someOtherValue might be dynamic.
const someOtherValue = 99;
const handleNothing = () => someOtherValue;

const aJust = Maybe.just(42);
console.log(Maybe.unwrapOrElse(handleNothing, aJust));  // 42

const aNothing = nothing<number>();
console.log(Maybe.unwrapOrElse(handleNothing, aNothing)); // 99
```

### Type Parameters

#### T

`T`

The wrapped value.

#### U

`U`

### Parameters

#### orElseFn

() => `U`

A function used to generate a valid value if `maybe` is a
                `Nothing`.

### Returns

`Function`

Either the content of `maybe` or the value returned from
                `orElseFn`.

#### Parameters

##### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

#### Returns

`T` \| `U`
