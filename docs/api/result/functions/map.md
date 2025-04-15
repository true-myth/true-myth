[True Myth](../../index.md) / [result](../index.md) / map

# Function: map()

## Call Signature

> **map**\<`T`, `U`, `E`\>(`mapFn`, `result`): [`Result`](../classes/Result.md)\<`U`, `E`\>

Map over a [`Result`](../classes/Result.md) instance: apply the function to the wrapped
value if the instance is [`Ok`](../interfaces/Ok.md), and return the wrapped error value
wrapped as a new [`Err`](../interfaces/Err.md) of the correct type (`Result<U, E>`) if the
instance is `Err`.

`map` works a lot like `Array.prototype.map`, but with one important
difference. Both `Result` and `Array` are containers for other kinds of items,
but where `Array.prototype.map` has 0 to _n_ items, a `Result` always has
exactly one item, which is *either* a success or an error instance.

Where `Array.prototype.map` will apply the mapping function to every item in
the array (if there are any), `Result.map` will only apply the mapping
function to the (single) element if an `Ok` instance, if there is one.

If you have no items in an array of numbers named `foo` and call `foo.map(x =>
x + 1)`, you'll still some have an array with nothing in it. But if you have
any items in the array (`[2, 3]`), and you call `foo.map(x => x + 1)` on it,
you'll get a new array with each of those items inside the array "container"
transformed (`[3, 4]`).

With this `map`, the `Err` variant is treated *by the `map` function* kind of
the same way as the empty array case: it's just ignored, and you get back a
new `Result` that is still just the same `Err` instance. But if you have an
`Ok` variant, the map function is applied to it, and you get back a new
`Result` with the value transformed, and still wrapped in an `Ok`.

#### Examples

```ts
import { ok, err, map, toString } from 'true-myth/result';
const double = n => n * 2;

const anOk = ok(12);
const mappedOk = map(double, anOk);
console.log(toString(mappedOk)); // Ok(24)

const anErr = err("nothing here!");
const mappedErr = map(double, anErr);
console.log(toString(mappedErr)); // Err(nothing here!)
```

### Type Parameters

#### T

`T`

The type of the value wrapped in an `Ok` instance, and taken as
              the argument to the `mapFn`.

#### U

`U`

The type of the value wrapped in the new `Ok` instance after
              applying `mapFn`, that is, the type returned by `mapFn`.

#### E

`E`

The type of the value wrapped in an `Err` instance.

### Parameters

#### mapFn

(`t`) => `U`

The function to apply the value to if `result` is `Ok`.

#### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

The `Result` instance to map over.

### Returns

[`Result`](../classes/Result.md)\<`U`, `E`\>

A new `Result` with the result of applying `mapFn` to the value
              in an `Ok`, or else the original `Err` value wrapped in the new
              instance.

## Call Signature

> **map**\<`T`, `U`, `E`\>(`mapFn`): (`result`) => [`Result`](../classes/Result.md)\<`U`, `E`\>

Map over a [`Result`](../classes/Result.md) instance: apply the function to the wrapped
value if the instance is [`Ok`](../interfaces/Ok.md), and return the wrapped error value
wrapped as a new [`Err`](../interfaces/Err.md) of the correct type (`Result<U, E>`) if the
instance is `Err`.

`map` works a lot like `Array.prototype.map`, but with one important
difference. Both `Result` and `Array` are containers for other kinds of items,
but where `Array.prototype.map` has 0 to _n_ items, a `Result` always has
exactly one item, which is *either* a success or an error instance.

Where `Array.prototype.map` will apply the mapping function to every item in
the array (if there are any), `Result.map` will only apply the mapping
function to the (single) element if an `Ok` instance, if there is one.

If you have no items in an array of numbers named `foo` and call `foo.map(x =>
x + 1)`, you'll still some have an array with nothing in it. But if you have
any items in the array (`[2, 3]`), and you call `foo.map(x => x + 1)` on it,
you'll get a new array with each of those items inside the array "container"
transformed (`[3, 4]`).

With this `map`, the `Err` variant is treated *by the `map` function* kind of
the same way as the empty array case: it's just ignored, and you get back a
new `Result` that is still just the same `Err` instance. But if you have an
`Ok` variant, the map function is applied to it, and you get back a new
`Result` with the value transformed, and still wrapped in an `Ok`.

#### Examples

```ts
import { ok, err, map, toString } from 'true-myth/result';
const double = n => n * 2;

const anOk = ok(12);
const mappedOk = map(double, anOk);
console.log(toString(mappedOk)); // Ok(24)

const anErr = err("nothing here!");
const mappedErr = map(double, anErr);
console.log(toString(mappedErr)); // Err(nothing here!)
```

### Type Parameters

#### T

`T`

The type of the value wrapped in an `Ok` instance, and taken as
              the argument to the `mapFn`.

#### U

`U`

The type of the value wrapped in the new `Ok` instance after
              applying `mapFn`, that is, the type returned by `mapFn`.

#### E

`E`

The type of the value wrapped in an `Err` instance.

### Parameters

#### mapFn

(`t`) => `U`

The function to apply the value to if `result` is `Ok`.

### Returns

`Function`

A new `Result` with the result of applying `mapFn` to the value
              in an `Ok`, or else the original `Err` value wrapped in the new
              instance.

#### Parameters

##### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

#### Returns

[`Result`](../classes/Result.md)\<`U`, `E`\>
