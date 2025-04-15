[True Myth](../../index.md) / [maybe](../index.md) / map

# Function: map()

## Call Signature

> **map**\<`T`, `U`\>(`mapFn`): (`maybe`) => [`Maybe`](../classes/Maybe.md)\<`U`\>

Map over a [`Maybe`](../classes/Maybe.md) instance: apply the function to the wrapped value
if the instance is [`Just`](../interfaces/Just.md), and return [`Nothing`](../interfaces/Nothing.md) if the
instance is `Nothing`.

`map` works a lot like `Array.prototype.map`: `Maybe` and `Array` are both
*containers* for other things. If you have no items in an array of numbers
named `foo` and call `foo.map(x => x + 1)`, you'll still just have an array
with nothing in it. But if you have any items in the array (`[2, 3]`), and you
call `foo.map(x => x + 1)` on it, you'll get a new array with each of those
items inside the array "container" transformed (`[3, 4]`).

That's exactly what's happening with `map`. If the container is *empty* – the
`Nothing` variant – you just get back an empty container. If the container has
something in it – the `Just` variant – you get back a container with the item
inside transformed.

(So... why not just use an array? The biggest reason is that an array can be
any length. With a `Maybe`, we're capturing the idea of "something or nothing"
rather than "0 to n" items. And this lets us implement a whole set of *other*
interfaces, like those in this module.)

#### Examples

```ts
const length = (s: string) => s.length;

const justAString = Maybe.just('string');
const justTheStringLength = map(length, justAString);
console.log(justTheStringLength.toString()); // Just(6)

const notAString = Maybe.nothing<string>();
const notAStringLength = map(length, notAString);
console.log(notAStringLength.toString()); // "Nothing"
```

### Type Parameters

#### T

`T`

The type of the wrapped value.

#### U

`U` *extends* `object`

The type of the wrapped value of the returned `Maybe`.

### Parameters

#### mapFn

(`t`) => `U`

The function to apply the value to if `Maybe` is `Just`.

### Returns

`Function`

A function accepting a `Maybe<T>`, which will produce `Maybe<U>`
             after applying `mapFn`.

#### Parameters

##### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

#### Returns

[`Maybe`](../classes/Maybe.md)\<`U`\>

## Call Signature

> **map**\<`T`, `U`\>(`mapFn`, `maybe`): [`Maybe`](../classes/Maybe.md)\<`U`\>

Map over a [`Maybe`](../classes/Maybe.md) instance: apply the function to the wrapped value
if the instance is [`Just`](../interfaces/Just.md), and return [`Nothing`](../interfaces/Nothing.md) if the
instance is `Nothing`.

`map` works a lot like `Array.prototype.map`: `Maybe` and `Array` are both
*containers* for other things. If you have no items in an array of numbers
named `foo` and call `foo.map(x => x + 1)`, you'll still just have an array
with nothing in it. But if you have any items in the array (`[2, 3]`), and you
call `foo.map(x => x + 1)` on it, you'll get a new array with each of those
items inside the array "container" transformed (`[3, 4]`).

That's exactly what's happening with `map`. If the container is *empty* – the
`Nothing` variant – you just get back an empty container. If the container has
something in it – the `Just` variant – you get back a container with the item
inside transformed.

(So... why not just use an array? The biggest reason is that an array can be
any length. With a `Maybe`, we're capturing the idea of "something or nothing"
rather than "0 to n" items. And this lets us implement a whole set of *other*
interfaces, like those in this module.)

#### Examples

```ts
const length = (s: string) => s.length;

const justAString = Maybe.just('string');
const justTheStringLength = map(length, justAString);
console.log(justTheStringLength.toString()); // Just(6)

const notAString = Maybe.nothing<string>();
const notAStringLength = map(length, notAString);
console.log(notAStringLength.toString()); // "Nothing"
```

### Type Parameters

#### T

`T`

The type of the wrapped value.

#### U

`U` *extends* `object`

The type of the wrapped value of the returned `Maybe`.

### Parameters

#### mapFn

(`t`) => `U`

The function to apply the value to if `Maybe` is `Just`.

#### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

The `Maybe` instance to map over.

### Returns

[`Maybe`](../classes/Maybe.md)\<`U`\>

A new `Maybe` with the result of applying `mapFn` to the value in
             a `Just`, or `Nothing` if `maybe` is `Nothing`.
