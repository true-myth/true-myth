[True Myth](../../index.md) / [task](../index.md) / Task

# Class: Task

A `Task` is a type safe asynchronous computation.

You can think of a `Task<T, E>` as being basically a `Promise<Result<T, E>>`,
because it *is* a `Promise<Result<T, E>>` under the hood, but with two main
differences from a “normal” `Promise`:

1. A `Task` *cannot* “reject”. All errors must be handled. This means that,
   like a [`Result`](../../result/classes/Result.md), it will *never* throw an error if used in
   strict TypeScript.

2. Unlike `Promise`, `Task` robustly distinguishes between `map` and `andThen`
   operations.

`Task` also implements JavaScript’s `PromiseLike` interface, so you can
`await` it; when a `Task<T, E>` is awaited, it produces a [`Result<T, E>`](../../result/index.md).

## Constructors

### Constructor

> **new Task**\<`T`, `E`\>(): `Task`

Construct a new `Task`, using callbacks to wrap APIs which do not natively
provide a `Promise`.

This is identical to the [Promise][promise] constructor, with one very
important difference: rather than producing a value upon resolution and
throwing an exception when a rejection occurs like `Promise`, a `Task`
always “succeeds” in producing a usable value, just like [`Result`](../../result/classes/Result.md)
for synchronous code.

[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise

For constructing a `Task` from an existing `Promise`, see:

- [`fromPromise`](../functions/fromPromise.md)
- [`safelyTry`](../functions/safelyTry.md)
- [`tryOr`](../functions/tryOr.md)
- [`tryOrElse`](../functions/tryOrElse.md)

For constructing a `Task` immediately resolved or rejected with given
values, see [`Task.resolve`](../interfaces/TaskConstructor.md#resolve) and [`Task.reject`](../interfaces/TaskConstructor.md#reject)
respectively.

#### Returns

`Task`

***

### reject()

#### Call Signature

> `static` **reject**\<`T`, `E`\>(): `Task`\<`T`, [`Unit`](../../unit/interfaces/Unit.md)\>

Construct a `Task` which is already rejected. Useful when you have an error
already, but need it to be available in an API which expects a `Task`.

##### Type Parameters

###### T

`T` = `never`

###### E

`E` *extends* `object` = \{\}

##### Returns

`Task`\<`T`, [`Unit`](../../unit/interfaces/Unit.md)\>

#### Call Signature

> `static` **reject**\<`T`, `E`\>(`reason`): `Task`\<`T`, `E`\>

Construct a `Task` which is already rejected. Useful when you have an error
already, but need it to be available in an API which expects a `Task`.

##### Type Parameters

###### T

`T` = `never`

###### E

`E` = `unknown`

##### Parameters

###### reason

`E`

##### Returns

`Task`\<`T`, `E`\>

***

### resolve()

#### Call Signature

> `static` **resolve**\<`T`, `E`\>(): `Task`\<[`Unit`](../../unit/interfaces/Unit.md), `E`\>

Construct a `Task` which is already resolved. Useful when you have a value
already, but need it to be available in an API which expects a `Task`.

##### Type Parameters

###### T

`T` *extends* [`Unit`](../../unit/interfaces/Unit.md)

###### E

`E` = `never`

##### Returns

`Task`\<[`Unit`](../../unit/interfaces/Unit.md), `E`\>

#### Call Signature

> `static` **resolve**\<`T`, `E`\>(`value`): `Task`\<`T`, `E`\>

Construct a `Task` which is already resolved. Useful when you have a value
already, but need it to be available in an API which expects a `Task`.

##### Type Parameters

###### T

`T`

###### E

`E` = `never`

##### Parameters

###### value

`T`

##### Returns

`Task`\<`T`, `E`\>

***

### withResolvers()

> `static` **withResolvers**\<`T`, `E`\>(): [`WithResolvers`](../type-aliases/WithResolvers.md)\<`T`, `E`\>

Create a pending `Task` and supply `resolveWith` and `rejectWith` helpers,
similar to the [`Promise.withResolvers`][pwr] static method, but producing a
`Task` with the usual safety guarantees.

[pwr]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers

## Examples

### Resolution

```ts
let { task, resolveWith, rejectWith } = Task.withResolvers<string, Error>();
resolveWith("Hello!");

let result = await task.map((s) => s.length);
let length = result.unwrapOr(0);
console.log(length); // 5
```

### Rejection

```ts
let { task, resolveWith, rejectWith } = Task.withResolvers<string, Error>();
rejectWith(new Error("oh teh noes!"));

let result = await task.mapRejection((s) => s.length);
let errLength = result.isErr ? result.error : 0;
console.log(errLength); // 5
```

#### Type Parameters

##### T

`T`

##### E

`E`

#### Returns

[`WithResolvers`](../type-aliases/WithResolvers.md)\<`T`, `E`\>

## Properties

### \[IsTask\]

> `readonly` **\[IsTask\]**: \[`T`, `E`\]

***

### isPending

> **isPending**: `boolean`

***

### isRejected

> **isRejected**: `boolean`

***

### isResolved

> **isResolved**: `boolean`

***

### state

> **state**: `"Pending"` \| `"Resolved"` \| `"Rejected"`

## Methods

### and()

> **and**\<`U`, `F`\>(`other`): `Task`\<`U`, `E` \| `F`\>

You can think of this like a short-circuiting logical "and" operation on a
`Task`. If this `task` resolves, then the output is the task
passed to the method. If this `task` rejects, the result is its rejection
reason.

This is useful when you have another `Task` value you want to provide if and
*only if* the first task resolves successfully – that is, when you need to
make sure that if you reject, whatever else you're handing a `Task` to
*also* gets that [`Rejected`](../interfaces/Rejected.md).

Notice that, unlike in [`Task.prototype.map`](../functions/map.md), the original
`task` resolution value is not involved in constructing the new `Task`.

## Examples

```ts
import Task from 'true-myth/task';

let resolvedA = Task.resolve<string, string>('A');
let resolvedB = Task.resolve<string, string>('B');
let rejectedA = Task.reject<string, string>('bad');
let rejectedB = Task.reject<string, string>('lame');

let aAndB = resolvedA.and(resolvedB);
await aAndB;

let aAndRA = resolvedA.and(rejectedA);
await aAndRA;

let raAndA = rejectedA.and(resolvedA);
await raAndA;

let raAndRb = rejectedA.and(rejectedB);
await raAndRb;

expect(aAndB.toString()).toEqual('Task.Resolved("B")');
expect(aAndRA.toString()).toEqual('Task.Rejected("bad")');
expect(raAndA.toString()).toEqual('Task.Rejected("bad")');
expect(raAndRb.toString()).toEqual('Task.Rejected("bad")');
```

#### Type Parameters

##### U

`U`

The type of the value for a resolved version of the `other`
  `Task`, i.e., the success type of the final `Task` present if the first
  `Task` is `Ok`.

##### F

`F` = `E`

#### Parameters

##### other

`Task`\<`U`, `F`\>

The `Task` instance to return if `this` is `Rejected`.

#### Returns

`Task`\<`U`, `E` \| `F`\>

***

### andThen()

#### Call Signature

> **andThen**\<`U`\>(`thenFn`): `Task`\<`U`, `E`\>

Apply a function to the resulting value if a `Task` is [`Resolved`](../interfaces/Resolved.md), producing a new `Task`; or if it is [`Rejected`](../interfaces/Rejected.md) return
the rejection reason unmodified.

This differs from `map` in that `thenFn` returns another `Task`. You can use
`andThen` to combine two functions which *both* create a `Task` from an
unwrapped type.

The [`Promise.prototype.then`][then] method is a helpful comparison: if you
have a `Promise`, you can pass its `then` method a callback which returns
another `Promise`, and the result will not be a *nested* promise, but a
single `Promise`. The difference is that `Promise.prototype.then` unwraps
*all* layers to only ever return a single `Promise` value, whereas this
method will not unwrap nested `Task`s.

`Promise.prototype.then` also acts the same way [`Task.prototype.map`](../functions/map.md) does, while `Task` distinguishes `map` from `andThen`.

> [!NOTE] `andThen` is sometimes also known as `bind`, but *not* aliased as
> such because [`bind` already means something in JavaScript][bind].

[then]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then
[bind]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind

## Examples

```ts
import Task from 'true-myth/task';

const toLengthAsResult = (s: string) => ok(s.length);

const aResolvedTask = Task.resolve('just a string');
const lengthAsResult = await aResolvedTask.andThen(toLengthAsResult);
console.log(lengthAsResult.toString());  // Ok(13)

const aRejectedTask = Task.reject(['srsly', 'whatever']);
const notLengthAsResult = await aRejectedTask.andThen(toLengthAsResult);
console.log(notLengthAsResult.toString());  // Err(srsly,whatever)
```

##### Type Parameters

###### U

`U`

The type of the value produced by the new `Task` of the `Result`
  returned by the `thenFn`.

##### Parameters

###### thenFn

(`t`) => `Task`\<`U`, `E`\>

The function to apply to the wrapped `T` if `maybe` is `Just`.

##### Returns

`Task`\<`U`, `E`\>

#### Call Signature

> **andThen**\<`R`\>(`thenFn`): `Task`\<`ResolvesTo`\<`R`\>, `E` \| `RejectsWith`\<`R`\>\>

Apply a function to the resulting value if a `Task` is [`Resolved`](../interfaces/Resolved.md), producing a new `Task`; or if it is [`Rejected`](../interfaces/Rejected.md) return
the rejection reason unmodified.

This differs from `map` in that `thenFn` returns another `Task`. You can use
`andThen` to combine two functions which *both* create a `Task` from an
unwrapped type.

The [`Promise.prototype.then`][then] method is a helpful comparison: if you
have a `Promise`, you can pass its `then` method a callback which returns
another `Promise`, and the result will not be a *nested* promise, but a
single `Promise`. The difference is that `Promise.prototype.then` unwraps
*all* layers to only ever return a single `Promise` value, whereas this
method will not unwrap nested `Task`s.

`Promise.prototype.then` also acts the same way [`Task.prototype.map`](../functions/map.md) does, while `Task` distinguishes `map` from `andThen`.

> [!NOTE] `andThen` is sometimes also known as `bind`, but *not* aliased as
> such because [`bind` already means something in JavaScript][bind].

[then]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then
[bind]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind

## Examples

```ts
import Task from 'true-myth/task';

const toLengthAsResult = (s: string) => ok(s.length);

const aResolvedTask = Task.resolve('just a string');
const lengthAsResult = await aResolvedTask.andThen(toLengthAsResult);
console.log(lengthAsResult.toString());  // Ok(13)

const aRejectedTask = Task.reject(['srsly', 'whatever']);
const notLengthAsResult = await aRejectedTask.andThen(toLengthAsResult);
console.log(notLengthAsResult.toString());  // Err(srsly,whatever)
```

##### Type Parameters

###### R

`R` *extends* `AnyTask`

##### Parameters

###### thenFn

(`t`) => `R`

The function to apply to the wrapped `T` if `maybe` is `Just`.

##### Returns

`Task`\<`ResolvesTo`\<`R`\>, `E` \| `RejectsWith`\<`R`\>\>

***

### map()

> **map**\<`U`\>(`mapFn`): `Task`\<`U`, `E`\>

Map over a `Task` instance: apply the function to the resolved
value if the task completes successfully, producing a new `Task` with the
value returned from the function. If the task failed, return the rejection
as [`Rejected`](../interfaces/Rejected.md) without modification.

`map` works a lot like [`Array.prototype.map`][array-map], but with one
important difference. Both `Task` and `Array` are kind of like a “container”
for other kinds of items, but where `Array.prototype.map` has 0 to _n_
items, a `Task` represents the possibility of an item being available at
some point in the future, and when it is present, it is *either* a success
or an error.

[array-map]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map

Where `Array.prototype.map` will apply the mapping function to every item in
the array (if there are any), `Task.map` will only apply the mapping
function to the resolved element if it is `Resolved`.

If you have no items in an array of numbers named `foo` and call `foo.map(x
=> x + 1)`, you'll still some have an array with nothing in it. But if you
have any items in the array (`[2, 3]`), and you call `foo.map(x => x + 1)`
on it, you'll get a new array with each of those items inside the array
"container" transformed (`[3, 4]`).

With this `map`, the `Rejected` variant is treated *by the `map` function*
kind of the same way as the empty array case: it's just ignored, and you get
back a new `Task` that is still just the same `Rejected` instance. But if
you have an `Resolved` variant, the map function is applied to it, and you
get back a new `Task` with the value transformed, and still `Resolved`.

## Examples

```ts
import Task from 'true-myth/task';
const double = n => n * 2;

const aResolvedTask = Task.resolve(12);
const mappedResolved = aResolvedTask.map(double);
let resolvedResult = await aResolvedTask;
console.log(resolvedResult.toString()); // Ok(24)

const aRejectedTask = Task.reject("nothing here!");
const mappedRejected = aRejectedTask.map(double);
let rejectedResult = await aRejectedTask;
console.log(rejectedResult.toString()); // Err("nothing here!")
```

#### Type Parameters

##### U

`U`

The type of the resolved value of the returned `Task`.

#### Parameters

##### mapFn

(`t`) => `U`

The function to apply the value to when the `Task` finishes if
  it is `Resolved`.

#### Returns

`Task`\<`U`, `E`\>

***

### mapRejected()

> **mapRejected**\<`F`\>(`mapFn`): `Task`\<`T`, `F`\>

Map over a `Task`, exactly as in [`map`](../functions/map.md), but operating on
the rejection reason if the `Task` rejects, producing a new `Task`, still
rejected, with the value returned from the function. If the task completed
successfully, return it as `Resolved` without modification. This is handy
for when you need to line up a bunch of different types of errors, or if you
need an error of one shape to be in a different shape to use somewhere else
in your codebase.

## Examples

```ts
import Task from 'true-myth/task';

const extractReason = (err: { code: number, reason: string }) => err.reason;

const aResolvedTask = Task.resolve(12);
const mappedResolved = aResolvedTask.mapRejected(extractReason);
console.log(mappedOk));  // Ok(12)

const aRejectedTask = Task.reject({ code: 101, reason: 'bad file' });
const mappedRejection = await aRejectedTask.mapRejected(extractReason);
console.log(toString(mappedRejection));  // Err("bad file")
```

#### Type Parameters

##### F

`F`

The type of the rejection for the new `Task`, returned by the
  `mapFn`.

#### Parameters

##### mapFn

(`e`) => `F`

The function to apply to the rejection reason if the `Task` is
  rejected.

#### Returns

`Task`\<`T`, `F`\>

***

### match()

> **match**\<`A`\>(`matcher`): `Promise`\<`A`\>

Allows you to produce a new value by providing functions to operate against
both the [`Resolved`](../interfaces/Resolved.md) and [`Rejected`](../interfaces/Rejected.md) states once the
`Task` resolves.

(This is a workaround for JavaScript’s lack of native pattern-matching.)

## Example

```ts
import Task from 'true-myth/task';

let theTask = new Task<number, Error>((resolve, reject) => {
  let value = Math.random();
  if (value > 0.5) {
    resolve(value);
  } else {
    reject(new Error(`too low: ${value}`));
  }
});

// Note that we are here awaiting the `Promise` returned from the `Task`,
// not the `Task` itself.
await theTask.match({
  Resolved: (num) => {
    console.log(num);
  },
  Rejected: (err) => {
    console.error(err);
  },
});
```

This can both be used to produce side effects (as here) and to produce a
value regardless of the resolution/rejection of the task, and is often
clearer than trying to use other methods. Thus, this is especially
convenient for times when there is a complex task output.

> [!NOTE]
> You could also write the above example like this, taking advantage of how
> awaiting a `Task` produces its inner `Result`:
>
> ```ts
> import Task from 'true-myth/task';
>
> let theTask = new Task<number, Error>((resolve, reject) => {
>   let value = Math.random();
>   if (value > 0.5) {
>     resolve(value);
>   } else {
>     reject(new Error(`too low: ${value}`));
>   }
> });
>
> let theResult = await theTask;
> theResult.match({
>   Ok: (num) => {
>     console.log(num);
>   },
>   Err: (err) => {
>     console.error(err);
>   },
> });
> ```
>
> Which of these you choose is a matter of taste!

#### Type Parameters

##### A

`A`

#### Parameters

##### matcher

[`Matcher`](../type-aliases/Matcher.md)\<`T`, `E`, `A`\>

A lightweight object defining what to do in the case of each
               variant.

#### Returns

`Promise`\<`A`\>

***

### or()

> **or**\<`F`, `U`\>(`other`): `Task`\<`T` \| `U`, `F`\>

Provide a fallback for a given `Task`. Behaves like a logical
`or`: if the `task` value is [`Resolved`](../interfaces/Resolved.md), returns that `task`
unchanged, otherwise, returns the `other` `Task`.

This is useful when you want to make sure that something which takes a
`Task` always ends up getting a [`Resolved`](../interfaces/Resolved.md) variant, by supplying a
default value for the case that you currently have an [`Rejected`](../interfaces/Rejected.md).

```ts
import Task from 'true-utils/task';

const resolvedA = Task.resolve<string, string>('a');
const resolvedB = Task.resolve<string, string>('b');
const rejectedWat = Task.reject<string, string>(':wat:');
const rejectedHeaddesk = Task.reject<string, string>(':headdesk:');

console.log(resolvedA.or(resolvedB).toString());  // Resolved("a")
console.log(resolvedA.or(rejectedWat).toString());  // Resolved("a")
console.log(rejectedWat.or(resolvedB).toString());  // Resolved("b")
console.log(rejectedWat.or(rejectedHeaddesk).toString());  // Rejected(":headdesk:")
```

#### Type Parameters

##### F

`F`

The type wrapped in the `Rejected` case of `other`.

##### U

`U` = `T`

#### Parameters

##### other

`Task`\<`U`, `F`\>

The `Result` to use if `this` is `Rejected`.

#### Returns

`Task`\<`T` \| `U`, `F`\>

`this` if it is `Resolved`, otherwise `other`.

***

### orElse()

#### Call Signature

> **orElse**\<`F`\>(`elseFn`): `Task`\<`T`, `F`\>

Like [`or`](../functions/or.md), but using a function to construct the alternative
`Task`.

Sometimes you need to perform an operation using the rejection reason (and
possibly also other data in the environment) to construct a new `Task`,
which may itself resolve or reject. In these situations, you can pass a
function (which may be a closure) as the `elseFn` to generate the fallback
`Task<T, E>`. It can then transform the data in the [`Rejected`](../interfaces/Rejected.md) to
something usable as an [`Resolved`](../interfaces/Resolved.md), or generate a new `Rejected`
instance as appropriate.

Useful for transforming failures to usable data, for trigger retries, etc.

##### Type Parameters

###### F

`F`

##### Parameters

###### elseFn

(`reason`) => `Task`\<`T`, `F`\>

The function to apply to the `Rejection` reason if the `Task`
  rejects, to create a new `Task`.

##### Returns

`Task`\<`T`, `F`\>

#### Call Signature

> **orElse**\<`R`\>(`elseFn`): `Task`\<`T` \| `ResolvesTo`\<`R`\>, `RejectsWith`\<`R`\>\>

Like [`or`](../functions/or.md), but using a function to construct the alternative
`Task`.

Sometimes you need to perform an operation using the rejection reason (and
possibly also other data in the environment) to construct a new `Task`,
which may itself resolve or reject. In these situations, you can pass a
function (which may be a closure) as the `elseFn` to generate the fallback
`Task<T, E>`. It can then transform the data in the [`Rejected`](../interfaces/Rejected.md) to
something usable as an [`Resolved`](../interfaces/Resolved.md), or generate a new `Rejected`
instance as appropriate.

Useful for transforming failures to usable data, for trigger retries, etc.

##### Type Parameters

###### R

`R` *extends* `AnyTask`

##### Parameters

###### elseFn

(`reason`) => `R`

The function to apply to the `Rejection` reason if the `Task`
  rejects, to create a new `Task`.

##### Returns

`Task`\<`T` \| `ResolvesTo`\<`R`\>, `RejectsWith`\<`R`\>\>

***

### then()

> **then**\<`A`, `B`\>(`onSuccess`?, `onRejected`?): `PromiseLike`\<`A` \| `B`\>

Attaches callbacks for the resolution and/or rejection of the Promise.

#### Type Parameters

##### A

`A`

##### B

`B`

#### Parameters

##### onSuccess?

(`result`) => `A` \| `PromiseLike`\<`A`\>

##### onRejected?

(`reason`) => `B` \| `PromiseLike`\<`B`\>

#### Returns

`PromiseLike`\<`A` \| `B`\>

A Promise for the completion of which ever callback is executed.

***

### timeout()

> **timeout**(`timerOrMs`): `Task`\<`T`, [`Timeout`](Timeout.md) \| `E`\>

Attempt to run this `Task` to completion, but stop if the passed
[`Timer`](../type-aliases/Timer.md), or one constructed from a passed time in milliseconds,
elapses first.

If this `Task` and the duration happen to have the same duration, `timeout`
will favor this `Task` over the timeout.

#### Parameters

##### timerOrMs

A [`Timer`](../type-aliases/Timer.md) or a number of milliseconds to wait for
  this task before timing out.

`number` | [`Timer`](../type-aliases/Timer.md)

#### Returns

`Task`\<`T`, [`Timeout`](Timeout.md) \| `E`\>

A `Task` which has the resolution value of `this` or a `Timeout`
  if the timer elapsed.

***

### toPromise()

> **toPromise**(): `Promise`\<[`Result`](../../result/classes/Result.md)\<`T`, `E`\>\>

Get the underlying `Promise`. Useful when you need to work with an
API which *requires* a `Promise`, rather than a `PromiseLike`.

Note that this maintains the invariants for a `Task` *up till the point you
call this function*. That is, because the resulting promise was managed by a
`Task`, it always resolves successfully to a `Result`. However, calling then
`then` or `catch` methods on that `Promise` will produce a *new* `Promise`
for which those guarantees do not hold.

> [!IMPORTANT]
> If the resulting `Promise` ever rejects, that is a ***BUG***, and you
> should [open an issue](https://github.com/true-myth/true-myth/issues) so
> we can fix it!

#### Returns

`Promise`\<[`Result`](../../result/classes/Result.md)\<`T`, `E`\>\>

***

### toString()

> **toString**(): `string`

Returns a string representation of an object.

#### Returns

`string`
