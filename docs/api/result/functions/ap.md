[True Myth](../../index.md) / [result](../index.md) / ap

# Function: ap()

## Call Signature

> **ap**\<`A`, `B`, `E`\>(`resultFn`, `result`): [`Result`](../classes/Result.md)\<`B`, `E`\>

Allows you to *apply* (thus `ap`) a value to a function without having to take
either out of the context of their [`Result`](../classes/Result.md)s. This does mean that
the transforming function is itself within a `Result`, which can be hard to
grok at first but lets you do some very elegant things. For example, `ap`
allows you to do this (using the method form, since nesting `ap` calls is
awkward):

```ts
import { ap, ok, err } from 'true-myth/result';

const one = ok<number, string>(1);
const five = ok<number, string>(5);
const whoops = err<number, string>('oh no');

const add = (a: number) => (b: number) => a + b;
const resultAdd = ok<typeof add, string>(add);

resultAdd.ap(one).ap(five); // Ok(6)
resultAdd.ap(one).ap(whoops); // Err('oh no')
resultAdd.ap(whoops).ap(five) // Err('oh no')
```

Without `ap`, you'd need to do something like a nested `match`:

```ts
import { ok, err } from 'true-myth/result';

const one = ok<number, string>(1);
const five = ok<number, string>(5);
const whoops = err<number, string>('oh no');

one.match({
  Ok: n => five.match({
    Ok: o => ok<number, string>(n + o),
    Err: e => err<number, string>(e),
  }),
  Err: e  => err<number, string>(e),
}); // Ok(6)

one.match({
  Ok: n => whoops.match({
    Ok: o => ok<number, string>(n + o),
    Err: e => err<number, string>(e),
  }),
  Err: e  => err<number, string>(e),
}); // Err('oh no')

whoops.match({
  Ok: n => five.match({
    Ok: o => ok(n + o),
    Err: e => err(e),
  }),
  Err: e  => err(e),
}); // Err('oh no')
```

And this kind of thing comes up quite often once you're using `Result` to
handle errors throughout your application.

For another example, imagine you need to compare the equality of two
ImmutableJS data structures, where a `===` comparison won't work. With `ap`,
that's as simple as this:

```ts
import { ok } from 'true-myth/result';
import { is as immutableIs, Set } from 'immutable';

const is = (first: unknown) =>  (second: unknown) =>
  immutableIs(first, second);

const x = ok(Set.of(1, 2, 3));
const y = ok(Set.of(2, 3, 4));

ok(is).ap(x).ap(y); // Ok(false)
```

Without `ap`, we're back to that gnarly nested `match`:

```ts
import Result, { ok, err } from 'true-myth/result';
import { is, Set } from 'immutable';

const x = ok(Set.of(1, 2, 3));
const y = ok(Set.of(2, 3, 4));

x.match({
  Ok: iX => y.match({
    Ok: iY => Result.of(is(iX, iY)),
    Err: (e) => ok(false),
  })
  Err: (e) => ok(false),
}); // Ok(false)
```

In summary: anywhere you have two `Result` instances and need to perform an
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

    const resultAdd = ok(add); // Ok((a: number) => (b: number) => (c: number) => a + b + c)
    const resultAdd1 = resultAdd.ap(ok(1)); // Ok((b: number) => (c: number) => 1 + b + c)
    const resultAdd1And2 = resultAdd1.ap(ok(2)) // Ok((c: number) => 1 + 2 + c)
    const final = maybeAdd1.ap(ok(3)); // Ok(4)
    ```

    So for `toString`, which just takes a single argument, you would only need
    to call `ap` once.

    ```ts
    const toStr = (v: { toString(): string }) => v.toString();
    ok(toStr).ap(12); // Ok("12")
    ```

One other scenario which doesn't come up *quite* as often but is conceivable
is where you have something that may or may not actually construct a function
for handling a specific `Result` scenario. In that case, you can wrap the
possibly-present in `ap` and then wrap the values to apply to the function to
in `Result` themselves.

Because `Result` often requires you to type out the full type parameterization
on a regular basis, it's convenient to use TypeScript's `typeof` operator to
write out the type of a curried function. For example, if you had a function
that simply merged three strings, you might write it like this:

```ts
import Result from 'true-myth/result';
import { curry } from 'lodash';

const merge3Strs = (a: string, b: string, c: string) => string;
const curriedMerge = curry(merge3Strs);

const fn = Result.ok<typeof curriedMerge, string>(curriedMerge);
```

The alternative is writing out the full signature long-form:

```ts
const fn = Result.ok<(a: string) => (b: string) => (c: string) => string, string>(curriedMerge);
```

**Aside:** `ap` is not named `apply` because of the overlap with JavaScript's
existing [`apply`] function – and although strictly speaking, there isn't any
direct overlap (`Result.apply` and `Function.prototype.apply` don't intersect
at all) it's useful to have a different name to avoid implying that they're
the same.

[`apply`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply

### Type Parameters

#### A

`A`

#### B

`B`

#### E

`E`

### Parameters

#### resultFn

[`Result`](../classes/Result.md)\<(`a`) => `B`, `E`\>

result of a function from T to U

#### result

[`Result`](../classes/Result.md)\<`A`, `E`\>

result of a T to apply to `fn`

### Returns

[`Result`](../classes/Result.md)\<`B`, `E`\>

## Call Signature

> **ap**\<`A`, `B`, `E`\>(`resultFn`): (`result`) => [`Result`](../classes/Result.md)\<`B`, `E`\>

Allows you to *apply* (thus `ap`) a value to a function without having to take
either out of the context of their [`Result`](../classes/Result.md)s. This does mean that
the transforming function is itself within a `Result`, which can be hard to
grok at first but lets you do some very elegant things. For example, `ap`
allows you to do this (using the method form, since nesting `ap` calls is
awkward):

```ts
import { ap, ok, err } from 'true-myth/result';

const one = ok<number, string>(1);
const five = ok<number, string>(5);
const whoops = err<number, string>('oh no');

const add = (a: number) => (b: number) => a + b;
const resultAdd = ok<typeof add, string>(add);

resultAdd.ap(one).ap(five); // Ok(6)
resultAdd.ap(one).ap(whoops); // Err('oh no')
resultAdd.ap(whoops).ap(five) // Err('oh no')
```

Without `ap`, you'd need to do something like a nested `match`:

```ts
import { ok, err } from 'true-myth/result';

const one = ok<number, string>(1);
const five = ok<number, string>(5);
const whoops = err<number, string>('oh no');

one.match({
  Ok: n => five.match({
    Ok: o => ok<number, string>(n + o),
    Err: e => err<number, string>(e),
  }),
  Err: e  => err<number, string>(e),
}); // Ok(6)

one.match({
  Ok: n => whoops.match({
    Ok: o => ok<number, string>(n + o),
    Err: e => err<number, string>(e),
  }),
  Err: e  => err<number, string>(e),
}); // Err('oh no')

whoops.match({
  Ok: n => five.match({
    Ok: o => ok(n + o),
    Err: e => err(e),
  }),
  Err: e  => err(e),
}); // Err('oh no')
```

And this kind of thing comes up quite often once you're using `Result` to
handle errors throughout your application.

For another example, imagine you need to compare the equality of two
ImmutableJS data structures, where a `===` comparison won't work. With `ap`,
that's as simple as this:

```ts
import { ok } from 'true-myth/result';
import { is as immutableIs, Set } from 'immutable';

const is = (first: unknown) =>  (second: unknown) =>
  immutableIs(first, second);

const x = ok(Set.of(1, 2, 3));
const y = ok(Set.of(2, 3, 4));

ok(is).ap(x).ap(y); // Ok(false)
```

Without `ap`, we're back to that gnarly nested `match`:

```ts
import Result, { ok, err } from 'true-myth/result';
import { is, Set } from 'immutable';

const x = ok(Set.of(1, 2, 3));
const y = ok(Set.of(2, 3, 4));

x.match({
  Ok: iX => y.match({
    Ok: iY => Result.of(is(iX, iY)),
    Err: (e) => ok(false),
  })
  Err: (e) => ok(false),
}); // Ok(false)
```

In summary: anywhere you have two `Result` instances and need to perform an
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

    const resultAdd = ok(add); // Ok((a: number) => (b: number) => (c: number) => a + b + c)
    const resultAdd1 = resultAdd.ap(ok(1)); // Ok((b: number) => (c: number) => 1 + b + c)
    const resultAdd1And2 = resultAdd1.ap(ok(2)) // Ok((c: number) => 1 + 2 + c)
    const final = maybeAdd1.ap(ok(3)); // Ok(4)
    ```

    So for `toString`, which just takes a single argument, you would only need
    to call `ap` once.

    ```ts
    const toStr = (v: { toString(): string }) => v.toString();
    ok(toStr).ap(12); // Ok("12")
    ```

One other scenario which doesn't come up *quite* as often but is conceivable
is where you have something that may or may not actually construct a function
for handling a specific `Result` scenario. In that case, you can wrap the
possibly-present in `ap` and then wrap the values to apply to the function to
in `Result` themselves.

Because `Result` often requires you to type out the full type parameterization
on a regular basis, it's convenient to use TypeScript's `typeof` operator to
write out the type of a curried function. For example, if you had a function
that simply merged three strings, you might write it like this:

```ts
import Result from 'true-myth/result';
import { curry } from 'lodash';

const merge3Strs = (a: string, b: string, c: string) => string;
const curriedMerge = curry(merge3Strs);

const fn = Result.ok<typeof curriedMerge, string>(curriedMerge);
```

The alternative is writing out the full signature long-form:

```ts
const fn = Result.ok<(a: string) => (b: string) => (c: string) => string, string>(curriedMerge);
```

**Aside:** `ap` is not named `apply` because of the overlap with JavaScript's
existing [`apply`] function – and although strictly speaking, there isn't any
direct overlap (`Result.apply` and `Function.prototype.apply` don't intersect
at all) it's useful to have a different name to avoid implying that they're
the same.

[`apply`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply

### Type Parameters

#### A

`A`

#### B

`B`

#### E

`E`

### Parameters

#### resultFn

[`Result`](../classes/Result.md)\<(`a`) => `B`, `E`\>

result of a function from T to U

### Returns

`Function`

#### Parameters

##### result

[`Result`](../classes/Result.md)\<`A`, `E`\>

#### Returns

[`Result`](../classes/Result.md)\<`B`, `E`\>
