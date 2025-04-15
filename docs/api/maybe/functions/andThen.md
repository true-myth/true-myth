[True Myth](../../index.md) / [maybe](../index.md) / andThen

# Function: andThen()

## Call Signature

> **andThen**\<`T`, `U`\>(`thenFn`, `maybe`): [`Maybe`](../classes/Maybe.md)\<`U`\>

Apply a function to the wrapped value if [`Just`](../interfaces/Just.md) and return a new
`Just` containing the resulting value; or return [`Nothing`](../interfaces/Nothing.md) if
`Nothing`.

This differs from [`map`](map.md) in that `thenFn` returns another `Maybe`.
You can use `andThen` to combine two functions which *both* create a `Maybe`
from an unwrapped type.

You may find the `.then` method on an ES6 `Promise` helpful for comparison: if
you have a `Promise`, you can pass its `then` method a callback which returns
another `Promise`, and the result will not be a *nested* promise, but a single
`Promise`. The difference is that `Promise#then` unwraps *all* layers to only
ever return a single `Promise` value, whereas `Maybe.andThen` will not unwrap
nested `Maybe`s.

> [!NOTE] This is sometimes also known as `bind`, but *not* aliased as such
> because [`bind` already means something in JavaScript][bind].

[bind]:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind

#### Example

(This is a somewhat contrived example, but it serves to show the way the
function behaves.)

```ts
import Maybe, { andThen, toString } from 'true-myth/maybe';

// string -> Maybe<number>
const toMaybeLength = (s: string) => Maybe.of(s.length);

// Maybe<string>
const aMaybeString = Maybe.of('Hello, there!');

// Maybe<number>
const resultingLength = andThen(toMaybeLength, aMaybeString);
console.log(toString(resultingLength)); // 13
```

Note that the result is not `Just(Just(13))`, but `Just(13)`!

### Type Parameters

#### T

`T`

The type of the wrapped value.

#### U

`U`

The type of the wrapped value in the resulting `Maybe`.

### Parameters

#### thenFn

(`t`) => [`Maybe`](../classes/Maybe.md)\<`U`\>

The function to apply to the wrapped `T` if `maybe` is `Just`.

#### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

The `Maybe` to evaluate and possibly apply a function to the
              contents of.

### Returns

[`Maybe`](../classes/Maybe.md)\<`U`\>

The result of the `thenFn` (a new `Maybe`) if `maybe` is a
              `Just`, otherwise `Nothing` if `maybe` is a `Nothing`.

## Call Signature

> **andThen**\<`T`, `R`\>(`thenFn`, `maybe`): [`Maybe`](../classes/Maybe.md)\<`ValueFor`\<`R`\>\>

Apply a function to the wrapped value if [`Just`](../interfaces/Just.md) and return a new
`Just` containing the resulting value; or return [`Nothing`](../interfaces/Nothing.md) if
`Nothing`.

This differs from [`map`](map.md) in that `thenFn` returns another `Maybe`.
You can use `andThen` to combine two functions which *both* create a `Maybe`
from an unwrapped type.

You may find the `.then` method on an ES6 `Promise` helpful for comparison: if
you have a `Promise`, you can pass its `then` method a callback which returns
another `Promise`, and the result will not be a *nested* promise, but a single
`Promise`. The difference is that `Promise#then` unwraps *all* layers to only
ever return a single `Promise` value, whereas `Maybe.andThen` will not unwrap
nested `Maybe`s.

> [!NOTE] This is sometimes also known as `bind`, but *not* aliased as such
> because [`bind` already means something in JavaScript][bind].

[bind]:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind

#### Example

(This is a somewhat contrived example, but it serves to show the way the
function behaves.)

```ts
import Maybe, { andThen, toString } from 'true-myth/maybe';

// string -> Maybe<number>
const toMaybeLength = (s: string) => Maybe.of(s.length);

// Maybe<string>
const aMaybeString = Maybe.of('Hello, there!');

// Maybe<number>
const resultingLength = andThen(toMaybeLength, aMaybeString);
console.log(toString(resultingLength)); // 13
```

Note that the result is not `Just(Just(13))`, but `Just(13)`!

### Type Parameters

#### T

`T`

The type of the wrapped value.

#### R

`R` *extends* `AnyMaybe`

### Parameters

#### thenFn

(`t`) => `R`

The function to apply to the wrapped `T` if `maybe` is `Just`.

#### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

The `Maybe` to evaluate and possibly apply a function to the
              contents of.

### Returns

[`Maybe`](../classes/Maybe.md)\<`ValueFor`\<`R`\>\>

The result of the `thenFn` (a new `Maybe`) if `maybe` is a
              `Just`, otherwise `Nothing` if `maybe` is a `Nothing`.

## Call Signature

> **andThen**\<`T`, `U`\>(`thenFn`): (`maybe`) => [`Maybe`](../classes/Maybe.md)\<`U`\>

Apply a function to the wrapped value if [`Just`](../interfaces/Just.md) and return a new
`Just` containing the resulting value; or return [`Nothing`](../interfaces/Nothing.md) if
`Nothing`.

This differs from [`map`](map.md) in that `thenFn` returns another `Maybe`.
You can use `andThen` to combine two functions which *both* create a `Maybe`
from an unwrapped type.

You may find the `.then` method on an ES6 `Promise` helpful for comparison: if
you have a `Promise`, you can pass its `then` method a callback which returns
another `Promise`, and the result will not be a *nested* promise, but a single
`Promise`. The difference is that `Promise#then` unwraps *all* layers to only
ever return a single `Promise` value, whereas `Maybe.andThen` will not unwrap
nested `Maybe`s.

> [!NOTE] This is sometimes also known as `bind`, but *not* aliased as such
> because [`bind` already means something in JavaScript][bind].

[bind]:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind

#### Example

(This is a somewhat contrived example, but it serves to show the way the
function behaves.)

```ts
import Maybe, { andThen, toString } from 'true-myth/maybe';

// string -> Maybe<number>
const toMaybeLength = (s: string) => Maybe.of(s.length);

// Maybe<string>
const aMaybeString = Maybe.of('Hello, there!');

// Maybe<number>
const resultingLength = andThen(toMaybeLength, aMaybeString);
console.log(toString(resultingLength)); // 13
```

Note that the result is not `Just(Just(13))`, but `Just(13)`!

### Type Parameters

#### T

`T`

The type of the wrapped value.

#### U

`U`

The type of the wrapped value in the resulting `Maybe`.

### Parameters

#### thenFn

(`t`) => [`Maybe`](../classes/Maybe.md)\<`U`\>

The function to apply to the wrapped `T` if `maybe` is `Just`.

### Returns

`Function`

The result of the `thenFn` (a new `Maybe`) if `maybe` is a
              `Just`, otherwise `Nothing` if `maybe` is a `Nothing`.

#### Parameters

##### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

#### Returns

[`Maybe`](../classes/Maybe.md)\<`U`\>

## Call Signature

> **andThen**\<`T`, `R`\>(`thenFn`): (`maybe`) => [`Maybe`](../classes/Maybe.md)\<`ValueFor`\<`R`\>\>

Apply a function to the wrapped value if [`Just`](../interfaces/Just.md) and return a new
`Just` containing the resulting value; or return [`Nothing`](../interfaces/Nothing.md) if
`Nothing`.

This differs from [`map`](map.md) in that `thenFn` returns another `Maybe`.
You can use `andThen` to combine two functions which *both* create a `Maybe`
from an unwrapped type.

You may find the `.then` method on an ES6 `Promise` helpful for comparison: if
you have a `Promise`, you can pass its `then` method a callback which returns
another `Promise`, and the result will not be a *nested* promise, but a single
`Promise`. The difference is that `Promise#then` unwraps *all* layers to only
ever return a single `Promise` value, whereas `Maybe.andThen` will not unwrap
nested `Maybe`s.

> [!NOTE] This is sometimes also known as `bind`, but *not* aliased as such
> because [`bind` already means something in JavaScript][bind].

[bind]:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind

#### Example

(This is a somewhat contrived example, but it serves to show the way the
function behaves.)

```ts
import Maybe, { andThen, toString } from 'true-myth/maybe';

// string -> Maybe<number>
const toMaybeLength = (s: string) => Maybe.of(s.length);

// Maybe<string>
const aMaybeString = Maybe.of('Hello, there!');

// Maybe<number>
const resultingLength = andThen(toMaybeLength, aMaybeString);
console.log(toString(resultingLength)); // 13
```

Note that the result is not `Just(Just(13))`, but `Just(13)`!

### Type Parameters

#### T

`T`

The type of the wrapped value.

#### R

`R` *extends* `AnyMaybe`

### Parameters

#### thenFn

(`t`) => `R`

The function to apply to the wrapped `T` if `maybe` is `Just`.

### Returns

`Function`

The result of the `thenFn` (a new `Maybe`) if `maybe` is a
              `Just`, otherwise `Nothing` if `maybe` is a `Nothing`.

#### Parameters

##### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

#### Returns

[`Maybe`](../classes/Maybe.md)\<`ValueFor`\<`R`\>\>
