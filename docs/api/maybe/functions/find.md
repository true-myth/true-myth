[True Myth](../../index.md) / [maybe](../index.md) / find

# Function: find()

## Call Signature

> **find**\<`T`, `U`\>(`predicate`, `array`): [`Maybe`](../classes/Maybe.md)\<`U`\>

Safely search for an element in an array.

This function behaves like `Array.prototype.find`, but returns `Maybe<T>`
instead of `T | undefined`.

## Examples

The basic form is:

```ts
import Maybe from 'true-myth/maybe';

let array = [1, 2, 3];
Maybe.find(v => v > 1, array); // Just(2)
Maybe.find(v => v < 1, array); // Nothing
```

The function is curried so you can use it in a functional chain. For example
(leaving aside error handling on a bad response for simplicity), suppose the
url `https://arrays.example.com` returned a JSON payload with the type
`Array<{ count: number, name: string }>`, and we wanted to get the first
of these where `count` was at least 100. We could write this:

```ts
import Maybe from 'true-myth/maybe';

type Item = { count: number; name: string };
type Response = Array<Item>;

// curried variant!
const findAtLeast100 = Maybe.find(({ count }: Item) => count > 100);

fetch('https://arrays.example.com')
  .then(response => response.json() as Response)
  .then(findAtLeast100)
  .then(found => {
    if (found.isJust) {
      console.log(`The matching value is ${found.value.name}!`);
    }
  });
```

### Type Parameters

#### T

`T`

#### U

`U`

### Parameters

#### predicate

[`NarrowingPredicate`](../type-aliases/NarrowingPredicate.md)\<`T`, `U`\>

A function to execute on each value in the array, returning
                  `true` when the item in the array matches the condition. The
                  signature for `predicate` is identical to the signature for
                  the first argument to `Array.prototype.find`. The function
                  is called once for each element of the array, in ascending
                  order, until it finds one where predicate returns true. If
                  such an element is found, find immediately returns that
                  element value wrapped in `Just`. Otherwise, `Maybe.find`
                  returns `Nothing`.
*

#### array

[`AnyArray`](../type-aliases/AnyArray.md)\<`T`\>

The array to search using the predicate.

### Returns

[`Maybe`](../classes/Maybe.md)\<`U`\>

## Call Signature

> **find**\<`T`, `U`\>(`predicate`): (`array`) => [`Maybe`](../classes/Maybe.md)\<`U`\>

Safely search for an element in an array.

This function behaves like `Array.prototype.find`, but returns `Maybe<T>`
instead of `T | undefined`.

## Examples

The basic form is:

```ts
import Maybe from 'true-myth/maybe';

let array = [1, 2, 3];
Maybe.find(v => v > 1, array); // Just(2)
Maybe.find(v => v < 1, array); // Nothing
```

The function is curried so you can use it in a functional chain. For example
(leaving aside error handling on a bad response for simplicity), suppose the
url `https://arrays.example.com` returned a JSON payload with the type
`Array<{ count: number, name: string }>`, and we wanted to get the first
of these where `count` was at least 100. We could write this:

```ts
import Maybe from 'true-myth/maybe';

type Item = { count: number; name: string };
type Response = Array<Item>;

// curried variant!
const findAtLeast100 = Maybe.find(({ count }: Item) => count > 100);

fetch('https://arrays.example.com')
  .then(response => response.json() as Response)
  .then(findAtLeast100)
  .then(found => {
    if (found.isJust) {
      console.log(`The matching value is ${found.value.name}!`);
    }
  });
```

### Type Parameters

#### T

`T`

#### U

`U`

### Parameters

#### predicate

[`NarrowingPredicate`](../type-aliases/NarrowingPredicate.md)\<`T`, `U`\>

A function to execute on each value in the array, returning
                  `true` when the item in the array matches the condition. The
                  signature for `predicate` is identical to the signature for
                  the first argument to `Array.prototype.find`. The function
                  is called once for each element of the array, in ascending
                  order, until it finds one where predicate returns true. If
                  such an element is found, find immediately returns that
                  element value wrapped in `Just`. Otherwise, `Maybe.find`
                  returns `Nothing`.
*

### Returns

`Function`

#### Parameters

##### array

[`AnyArray`](../type-aliases/AnyArray.md)\<`T`\>

#### Returns

[`Maybe`](../classes/Maybe.md)\<`U`\>

## Call Signature

> **find**\<`T`\>(`predicate`, `array`): [`Maybe`](../classes/Maybe.md)\<`T`\>

Safely search for an element in an array.

This function behaves like `Array.prototype.find`, but returns `Maybe<T>`
instead of `T | undefined`.

## Examples

The basic form is:

```ts
import Maybe from 'true-myth/maybe';

let array = [1, 2, 3];
Maybe.find(v => v > 1, array); // Just(2)
Maybe.find(v => v < 1, array); // Nothing
```

The function is curried so you can use it in a functional chain. For example
(leaving aside error handling on a bad response for simplicity), suppose the
url `https://arrays.example.com` returned a JSON payload with the type
`Array<{ count: number, name: string }>`, and we wanted to get the first
of these where `count` was at least 100. We could write this:

```ts
import Maybe from 'true-myth/maybe';

type Item = { count: number; name: string };
type Response = Array<Item>;

// curried variant!
const findAtLeast100 = Maybe.find(({ count }: Item) => count > 100);

fetch('https://arrays.example.com')
  .then(response => response.json() as Response)
  .then(findAtLeast100)
  .then(found => {
    if (found.isJust) {
      console.log(`The matching value is ${found.value.name}!`);
    }
  });
```

### Type Parameters

#### T

`T`

### Parameters

#### predicate

[`Predicate`](../type-aliases/Predicate.md)\<`T`\>

A function to execute on each value in the array, returning
                  `true` when the item in the array matches the condition. The
                  signature for `predicate` is identical to the signature for
                  the first argument to `Array.prototype.find`. The function
                  is called once for each element of the array, in ascending
                  order, until it finds one where predicate returns true. If
                  such an element is found, find immediately returns that
                  element value wrapped in `Just`. Otherwise, `Maybe.find`
                  returns `Nothing`.
*

#### array

[`AnyArray`](../type-aliases/AnyArray.md)\<`T`\>

The array to search using the predicate.

### Returns

[`Maybe`](../classes/Maybe.md)\<`T`\>

## Call Signature

> **find**\<`T`\>(`predicate`): (`array`) => [`Maybe`](../classes/Maybe.md)\<`T`\>

Safely search for an element in an array.

This function behaves like `Array.prototype.find`, but returns `Maybe<T>`
instead of `T | undefined`.

## Examples

The basic form is:

```ts
import Maybe from 'true-myth/maybe';

let array = [1, 2, 3];
Maybe.find(v => v > 1, array); // Just(2)
Maybe.find(v => v < 1, array); // Nothing
```

The function is curried so you can use it in a functional chain. For example
(leaving aside error handling on a bad response for simplicity), suppose the
url `https://arrays.example.com` returned a JSON payload with the type
`Array<{ count: number, name: string }>`, and we wanted to get the first
of these where `count` was at least 100. We could write this:

```ts
import Maybe from 'true-myth/maybe';

type Item = { count: number; name: string };
type Response = Array<Item>;

// curried variant!
const findAtLeast100 = Maybe.find(({ count }: Item) => count > 100);

fetch('https://arrays.example.com')
  .then(response => response.json() as Response)
  .then(findAtLeast100)
  .then(found => {
    if (found.isJust) {
      console.log(`The matching value is ${found.value.name}!`);
    }
  });
```

### Type Parameters

#### T

`T`

### Parameters

#### predicate

[`Predicate`](../type-aliases/Predicate.md)\<`T`\>

A function to execute on each value in the array, returning
                  `true` when the item in the array matches the condition. The
                  signature for `predicate` is identical to the signature for
                  the first argument to `Array.prototype.find`. The function
                  is called once for each element of the array, in ascending
                  order, until it finds one where predicate returns true. If
                  such an element is found, find immediately returns that
                  element value wrapped in `Just`. Otherwise, `Maybe.find`
                  returns `Nothing`.
*

### Returns

`Function`

#### Parameters

##### array

[`AnyArray`](../type-aliases/AnyArray.md)\<`T`\>

#### Returns

[`Maybe`](../classes/Maybe.md)\<`T`\>
