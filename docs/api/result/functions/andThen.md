[True Myth](../../index.md) / [result](../index.md) / andThen

# Function: andThen()

## Call Signature

> **andThen**\<`T`, `E`, `R`\>(`thenFn`, `result`): [`Result`](../classes/Result.md)\<`OkFor`\<`R`\>, `E` \| `ErrFor`\<`R`\>\>

Apply a function to the wrapped value if [`Ok`](../interfaces/Ok.md) and return a new `Ok`
containing the resulting value; or if it is [`Err`](../interfaces/Err.md) return it
unmodified.

This differs from `map` in that `thenFn` returns another [`Result`](../classes/Result.md).
You can use `andThen` to combine two functions which *both* create a `Result`
from an unwrapped type.

You may find the `.then` method on an ES6 `Promise` helpful for comparison: if
you have a `Promise`, you can pass its `then` method a callback which returns
another `Promise`, and the result will not be a *nested* promise, but a single
`Promise`. The difference is that `Promise#then` unwraps *all* layers to only
ever return a single `Promise` value, whereas `Result.andThen` will not unwrap
nested `Result`s.

> [!NOTE] This is is sometimes also known as `bind`, but *not* aliased as such
> because [`bind` already means something in JavaScript][bind].

[bind]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind

#### Examples

```ts
import { ok, err, andThen, toString } from 'true-myth/result';

const toLengthAsResult = (s: string) => ok(s.length);

const anOk = ok('just a string');
const lengthAsResult = andThen(toLengthAsResult, anOk);
console.log(toString(lengthAsResult));  // Ok(13)

const anErr = err(['srsly', 'whatever']);
const notLengthAsResult = andThen(toLengthAsResult, anErr);
console.log(toString(notLengthAsResult));  // Err(srsly,whatever)
```

### Type Parameters

#### T

`T`

The type of the value wrapped in the `Ok` of the `Result`.

#### E

`E`

The type of the value wrapped in the `Err` of the `Result`.

#### R

`R` *extends* `AnyResult`

### Parameters

#### thenFn

(`t`) => `R`

The function to apply to the wrapped `T` if `maybe` is `Just`.

#### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

The `Maybe` to evaluate and possibly apply a function to.

### Returns

[`Result`](../classes/Result.md)\<`OkFor`\<`R`\>, `E` \| `ErrFor`\<`R`\>\>

## Call Signature

> **andThen**\<`T`, `E`, `R`\>(`thenFn`): (`result`) => [`Result`](../classes/Result.md)\<`OkFor`\<`R`\>, `E` \| `ErrFor`\<`R`\>\>

Apply a function to the wrapped value if [`Ok`](../interfaces/Ok.md) and return a new `Ok`
containing the resulting value; or if it is [`Err`](../interfaces/Err.md) return it
unmodified.

This differs from `map` in that `thenFn` returns another [`Result`](../classes/Result.md).
You can use `andThen` to combine two functions which *both* create a `Result`
from an unwrapped type.

You may find the `.then` method on an ES6 `Promise` helpful for comparison: if
you have a `Promise`, you can pass its `then` method a callback which returns
another `Promise`, and the result will not be a *nested* promise, but a single
`Promise`. The difference is that `Promise#then` unwraps *all* layers to only
ever return a single `Promise` value, whereas `Result.andThen` will not unwrap
nested `Result`s.

> [!NOTE] This is is sometimes also known as `bind`, but *not* aliased as such
> because [`bind` already means something in JavaScript][bind].

[bind]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind

#### Examples

```ts
import { ok, err, andThen, toString } from 'true-myth/result';

const toLengthAsResult = (s: string) => ok(s.length);

const anOk = ok('just a string');
const lengthAsResult = andThen(toLengthAsResult, anOk);
console.log(toString(lengthAsResult));  // Ok(13)

const anErr = err(['srsly', 'whatever']);
const notLengthAsResult = andThen(toLengthAsResult, anErr);
console.log(toString(notLengthAsResult));  // Err(srsly,whatever)
```

### Type Parameters

#### T

`T`

The type of the value wrapped in the `Ok` of the `Result`.

#### E

`E`

The type of the value wrapped in the `Err` of the `Result`.

#### R

`R` *extends* `AnyResult`

### Parameters

#### thenFn

(`t`) => `R`

The function to apply to the wrapped `T` if `maybe` is `Just`.

### Returns

`Function`

#### Parameters

##### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

#### Returns

[`Result`](../classes/Result.md)\<`OkFor`\<`R`\>, `E` \| `ErrFor`\<`R`\>\>
