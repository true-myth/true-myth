[True Myth](../../index.md) / [task](../index.md) / safeNullable

# Function: safeNullable()

## Call Signature

> **safeNullable**\<`F`, `P`, `R`\>(`fn`): (...`params`) => [`Task`](../classes/Task.md)\<[`Maybe`](../../maybe/classes/Maybe.md)\<`NonNullable`\<`R`\>\>, `unknown`\>

Given a function which returns a `Promise` of a nullable type, return
a new function with the same parameters but which returns a [`Task`](../classes/Task.md) of a [`Maybe`](../../maybe/classes/Maybe.md) instead.

If you wish to transform the error directly, rather than with a combinator,
see the other overload, which accepts an error handler.

This is basically just a convenience for something you could do yourself by
chaining `safe` with `Maybe.of`:

```ts
import Maybe from 'true-myth/maybe';
import { safe, safeNullable } from 'true-myth/task';

async function numberOrNull(value: number): Promise<number | null> {
  return Math.random() > 0.5 ? value : null;
}

// Using this helper
const safeNumberOrNull = safeNullable(numberOrNull);

// Using `safe` and `Maybe.of` manually
const moreWorkThisWay= safe(numberOrNull);
let theTask = moreWorkThisWay(123).map((n) => Maybe.of(n));
```

The convenience is high, though, since you can now use this to create fully
safe abstractions to use throughout your codebase, rather than having to
remember to do the additional call to `map` the `Task`’s resolution value into
a `Maybe` at each call site.

### Type Parameters

#### F

`F` *extends* (...`params`) => `PromiseLike`\<`unknown`\>

#### P

`P` *extends* `never`[]

#### R

`R` *extends* `any`

### Parameters

#### fn

`F`

A function to wrap so it never throws an error or produces a
  `Promise` rejection.

### Returns

`Function`

#### Parameters

##### params

...`P`

#### Returns

[`Task`](../classes/Task.md)\<[`Maybe`](../../maybe/classes/Maybe.md)\<`NonNullable`\<`R`\>\>, `unknown`\>

## Call Signature

> **safeNullable**\<`F`, `P`, `R`, `E`\>(`fn`, `onError`): (...`params`) => [`Task`](../classes/Task.md)\<[`Maybe`](../../maybe/classes/Maybe.md)\<`NonNullable`\<`R`\>\>, `E`\>

Given a function which returns a `Promise` and a function to transform thrown
errors or `Promise` rejections resulting from calling that function, return a
new function with the same parameters but which returns a [`Task`](../classes/Task.md).

To catch all errors but leave them unhandled and `unknown`, see the other
overload.

This is basically just a convenience for something you could do yourself by
chaining `safe` with `Maybe.of`:

```ts
import Maybe from 'true-myth/maybe';
import { safe, safeNullable } from 'true-myth/task';

async function numberOrNull(value: number): Promise<number | null> {
  return Math.random() > 0.5 ? value : null;
}

// Using this helper
const safeNumberOrNull = safeNullable(numberOrNull);

// Using `safe` and `Maybe.of` manually
const moreWorkThisWay= safe(numberOrNull);
let theTask = moreWorkThisWay(123).map((n) => Maybe.of(n));
```

The convenience is high, though, since you can now use this to create fully
safe abstractions to use throughout your codebase, rather than having to
remember to do the additional call to `map` the `Task`’s resolution value into
a `Maybe` at each call site.

### Type Parameters

#### F

`F` *extends* (...`params`) => `PromiseLike`\<`unknown`\>

#### P

`P` *extends* `never`[]

#### R

`R` *extends* `any`

#### E

`E`

### Parameters

#### fn

`F`

A function to wrap so it never throws an error or produces a
  `Promise` rejection.

#### onError

(`reason`) => `E`

A function to use to transform the

### Returns

`Function`

#### Parameters

##### params

...`P`

#### Returns

[`Task`](../classes/Task.md)\<[`Maybe`](../../maybe/classes/Maybe.md)\<`NonNullable`\<`R`\>\>, `E`\>
