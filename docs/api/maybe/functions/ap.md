[True Myth](../../index.md) / [maybe](../index.md) / ap

# Function: ap()

## Call Signature

> **ap**\<`T`, `U`\>(`maybeFn`, `maybe`): [`Maybe`](../classes/Maybe.md)\<`T` \| `U`\>

Allows you to *apply* (thus `ap`) a value to a function without having to take
either out of the context of their [`Maybe`](../classes/Maybe.md)s. This does mean that the
transforming function is itself within a `Maybe`, which can be hard to grok at
first but lets you do some very elegant things. For example, `ap` allows you
to this:

```ts
import { just, nothing } from 'true-myth/maybe';

const one = just(1);
const five = just(5);
const none = nothing();

const add = (a: number) => (b: number) => a + b;
const maybeAdd = just(add);

maybeAdd.ap(one).ap(five); // Just(6)
maybeAdd.ap(one).ap(none); // Nothing
maybeAdd.ap(none).ap(five) // Nothing
```

Without `ap`, you'd need to do something like a nested `match`:

```ts
import { just, nothing } from 'true-myth/maybe';

const one = just(1);
const five = just(5);
const none = nothing();

one.match({
  Just: n => five.match({
    Just: o => just(n + o),
    Nothing: () => nothing(),
  }),
  Nothing: ()  => nothing(),
}); // Just(6)

one.match({
  Just: n => none.match({
    Just: o => just(n + o),
    Nothing: () => nothing(),
  }),
  Nothing: ()  => nothing(),
}); // Nothing

none.match({
  Just: n => five.match({
    Just: o => just(n + o),
    Nothing: () => nothing(),
  }),
  Nothing: ()  => nothing(),
}); // Nothing
```

And this kind of thing comes up quite often once you're using `Maybe` to
handle optionality throughout your application.

For another example, imagine you need to compare the equality of two
ImmutableJS data structures, where a `===` comparison won't work. With `ap`,
that's as simple as this:

```ts
import Maybe from 'true-myth/maybe';
import { is as immutableIs, Set } from 'immutable';

const is = (first: unknown) =>  (second: unknown) =>
  immutableIs(first, second);

const x = Maybe.of(Set.of(1, 2, 3));
const y = Maybe.of(Set.of(2, 3, 4));

Maybe.of(is).ap(x).ap(y); // Just(false)
```

Without `ap`, we're back to that gnarly nested `match`:

```ts
import Maybe, { just, nothing } from 'true-myth/maybe';
import { is, Set } from 'immutable';

const x = Maybe.of(Set.of(1, 2, 3));
const y = Maybe.of(Set.of(2, 3, 4));

x.match({
  Just: iX => y.match({
    Just: iY => Maybe.just(is(iX, iY)),
    Nothing: () => Maybe.nothing(),
  })
  Nothing: () => Maybe.nothing(),
}); // Just(false)
```

In summary: anywhere you have two `Maybe` instances and need to perform an
operation that uses both of them, `ap` is your friend.

Two things to note, both regarding *currying*:

1.  All functions passed to `ap` must be curried. That is, they must be of the
    form (for add) `(a: number) => (b: number) => a + b`, *not* the more usual
    `(a: number, b: number) => a + b` you see in JavaScript more generally.

    (Unfortunately, these do not currently work with lodash or Ramda's `curry`
    helper functions. A future update to the type definitions may make that
    work, but the intermediate types produced by those helpers and the more
    general function types expected by this function do not currently align.)

2.  You will need to call `ap` as many times as there are arguments to the
    function you're dealing with. So in the case of this `add3` function,
    which has the "arity" (function argument count) of 3 (`a` and `b`), you'll
    need to call `ap` twice: once for `a`, and once for `b`. To see why, let's
    look at what the result in each phase is:

    ```ts
    const add3 = (a: number) => (b: number) => (c: number) => a + b + c;

    const maybeAdd = just(add3); // Just((a: number) => (b: number) => (c: number) => a + b + c)
    const maybeAdd1 = maybeAdd.ap(just(1)); // Just((b: number) => (c: number) => 1 + b + c)
    const maybeAdd1And2 = maybeAdd1.ap(just(2)) // Just((c: number) => 1 + 2 + c)
    const final = maybeAdd1.ap(just(3)); // Just(4)
    ```

    So for `toString`, which just takes a single argument, you would only need
    to call `ap` once.

    ```ts
    const toStr = (v: { toString(): string }) => v.toString();
    just(toStr).ap(12); // Just("12")
    ```

One other scenario which doesn't come up *quite* as often but is conceivable
is where you have something that may or may not actually construct a function
for handling a specific `Maybe` scenario. In that case, you can wrap the
possibly-present in `ap` and then wrap the values to apply to the function to
in `Maybe` themselves.

__Aside:__ `ap` is not named `apply` because of the overlap with JavaScript's
existing [`apply`] function – and although strictly speaking, there isn't any
direct overlap (`Maybe.apply` and `Function.prototype.apply` don't intersect
at all) it's useful to have a different name to avoid implying that they're
the same.

[`apply`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply

### Type Parameters

#### T

`T`

#### U

`U` *extends* `object`

### Parameters

#### maybeFn

[`Maybe`](../classes/Maybe.md)\<(`t`) => `U`\>

maybe a function from T to U

#### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

maybe a T to apply to `fn`

### Returns

[`Maybe`](../classes/Maybe.md)\<`T` \| `U`\>

## Call Signature

> **ap**\<`T`, `U`\>(`maybeFn`): (`maybe`) => [`Maybe`](../classes/Maybe.md)\<`T` \| `U`\>

Allows you to *apply* (thus `ap`) a value to a function without having to take
either out of the context of their [`Maybe`](../classes/Maybe.md)s. This does mean that the
transforming function is itself within a `Maybe`, which can be hard to grok at
first but lets you do some very elegant things. For example, `ap` allows you
to this:

```ts
import { just, nothing } from 'true-myth/maybe';

const one = just(1);
const five = just(5);
const none = nothing();

const add = (a: number) => (b: number) => a + b;
const maybeAdd = just(add);

maybeAdd.ap(one).ap(five); // Just(6)
maybeAdd.ap(one).ap(none); // Nothing
maybeAdd.ap(none).ap(five) // Nothing
```

Without `ap`, you'd need to do something like a nested `match`:

```ts
import { just, nothing } from 'true-myth/maybe';

const one = just(1);
const five = just(5);
const none = nothing();

one.match({
  Just: n => five.match({
    Just: o => just(n + o),
    Nothing: () => nothing(),
  }),
  Nothing: ()  => nothing(),
}); // Just(6)

one.match({
  Just: n => none.match({
    Just: o => just(n + o),
    Nothing: () => nothing(),
  }),
  Nothing: ()  => nothing(),
}); // Nothing

none.match({
  Just: n => five.match({
    Just: o => just(n + o),
    Nothing: () => nothing(),
  }),
  Nothing: ()  => nothing(),
}); // Nothing
```

And this kind of thing comes up quite often once you're using `Maybe` to
handle optionality throughout your application.

For another example, imagine you need to compare the equality of two
ImmutableJS data structures, where a `===` comparison won't work. With `ap`,
that's as simple as this:

```ts
import Maybe from 'true-myth/maybe';
import { is as immutableIs, Set } from 'immutable';

const is = (first: unknown) =>  (second: unknown) =>
  immutableIs(first, second);

const x = Maybe.of(Set.of(1, 2, 3));
const y = Maybe.of(Set.of(2, 3, 4));

Maybe.of(is).ap(x).ap(y); // Just(false)
```

Without `ap`, we're back to that gnarly nested `match`:

```ts
import Maybe, { just, nothing } from 'true-myth/maybe';
import { is, Set } from 'immutable';

const x = Maybe.of(Set.of(1, 2, 3));
const y = Maybe.of(Set.of(2, 3, 4));

x.match({
  Just: iX => y.match({
    Just: iY => Maybe.just(is(iX, iY)),
    Nothing: () => Maybe.nothing(),
  })
  Nothing: () => Maybe.nothing(),
}); // Just(false)
```

In summary: anywhere you have two `Maybe` instances and need to perform an
operation that uses both of them, `ap` is your friend.

Two things to note, both regarding *currying*:

1.  All functions passed to `ap` must be curried. That is, they must be of the
    form (for add) `(a: number) => (b: number) => a + b`, *not* the more usual
    `(a: number, b: number) => a + b` you see in JavaScript more generally.

    (Unfortunately, these do not currently work with lodash or Ramda's `curry`
    helper functions. A future update to the type definitions may make that
    work, but the intermediate types produced by those helpers and the more
    general function types expected by this function do not currently align.)

2.  You will need to call `ap` as many times as there are arguments to the
    function you're dealing with. So in the case of this `add3` function,
    which has the "arity" (function argument count) of 3 (`a` and `b`), you'll
    need to call `ap` twice: once for `a`, and once for `b`. To see why, let's
    look at what the result in each phase is:

    ```ts
    const add3 = (a: number) => (b: number) => (c: number) => a + b + c;

    const maybeAdd = just(add3); // Just((a: number) => (b: number) => (c: number) => a + b + c)
    const maybeAdd1 = maybeAdd.ap(just(1)); // Just((b: number) => (c: number) => 1 + b + c)
    const maybeAdd1And2 = maybeAdd1.ap(just(2)) // Just((c: number) => 1 + 2 + c)
    const final = maybeAdd1.ap(just(3)); // Just(4)
    ```

    So for `toString`, which just takes a single argument, you would only need
    to call `ap` once.

    ```ts
    const toStr = (v: { toString(): string }) => v.toString();
    just(toStr).ap(12); // Just("12")
    ```

One other scenario which doesn't come up *quite* as often but is conceivable
is where you have something that may or may not actually construct a function
for handling a specific `Maybe` scenario. In that case, you can wrap the
possibly-present in `ap` and then wrap the values to apply to the function to
in `Maybe` themselves.

__Aside:__ `ap` is not named `apply` because of the overlap with JavaScript's
existing [`apply`] function – and although strictly speaking, there isn't any
direct overlap (`Maybe.apply` and `Function.prototype.apply` don't intersect
at all) it's useful to have a different name to avoid implying that they're
the same.

[`apply`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply

### Type Parameters

#### T

`T`

#### U

`U` *extends* `object`

### Parameters

#### maybeFn

[`Maybe`](../classes/Maybe.md)\<(`t`) => `U`\>

maybe a function from T to U

### Returns

`Function`

#### Parameters

##### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

#### Returns

[`Maybe`](../classes/Maybe.md)\<`T` \| `U`\>
