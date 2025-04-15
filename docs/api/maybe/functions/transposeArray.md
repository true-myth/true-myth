[True Myth](../../index.md) / [maybe](../index.md) / transposeArray

# Function: transposeArray()

> **transposeArray**\<`T`\>(`maybes`): [`TransposedArray`](../type-aliases/TransposedArray.md)\<`T`\>

Given an array or tuple of [`Maybe`](../classes/Maybe.md)s, return a `Maybe` of the array
or tuple values.

-   Given an array of type `Array<Maybe<A> | Maybe<B>>`, the resulting type is
    `Maybe<Array<A | B>>`.
-   Given a tuple of type `[Maybe<A>, Maybe<B>]`, the resulting type is
    `Maybe<[A, B]>`.

If any of the items in the array or tuple are [`Nothing`](../interfaces/Nothing.md), the whole
result is `Nothing`. If all items in the array or tuple are [`Just`](../interfaces/Just.md),
the whole result is `Just`.

## Examples

Given an array with a mix of `Maybe` types in it, both `allJust` and `mixed`
here will have the type `Maybe<Array<string | number>>`, but will be `Just`
and `Nothing` respectively.

```ts
import Maybe, { transposeArray } from 'true-myth/maybe';

let valid = [Maybe.just(2), Maybe.just('three')];
let allJust = transposeArray(valid); // => Just([2, 'three']);

let invalid = [Maybe.just(2), Maybe.nothing<string>()];
let mixed = transposeArray(invalid); // => Nothing
```

When working with a tuple type, the structure of the tuple is preserved. Here,
for example, `result` has the type `Maybe<[string, number]>` and will be
`Nothing`:

```ts
import Maybe, { transposeArray } from 'true-myth/maybe';

type Tuple = [Maybe<string>, Maybe<number>];

let invalid: Tuple = [Maybe.just('wat'), Maybe.nothing()];
let result = transposeArray(invalid);  // => Nothing
```

If all of the items in the tuple are `Just`, the result is `Just` wrapping the
tuple of the values of the items. Here, for example, `result` again has the
type `Maybe<[string, number]>` and will be `Just(['hey', 12]`:

```ts
import Maybe, { transposeArray } from 'true-myth/maybe';

type Tuple = [Maybe<string>, Maybe<number>];

let valid: Tuple = [Maybe.just('hey'), Maybe.just(12)];
let result = transposeArray(valid);  // => Just(['hey', 12])
```

## Type Parameters

### T

`T` *extends* readonly [`Maybe`](../classes/Maybe.md)\<`unknown`\>[]

## Parameters

### maybes

`T`

The `Maybe`s to resolve to a single `Maybe`.

## Returns

[`TransposedArray`](../type-aliases/TransposedArray.md)\<`T`\>
