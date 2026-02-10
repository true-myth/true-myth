# Task Retries and Delays

When working with a `Task`, you often need to retry it in the case of failure. Maybe an API endpoint failed to respond in time, or perhaps it's expected that a given operation may fail a few times before succeeding. True Myth's `task` module provides the `withRetries` helper to make this easy both to do at all and to get things "right" in terms of your system's performance.

## Retrying a task

True Myth's approach to retries is designed to let you compose all the pieces together yourself, and to opt into as much or as little complexity as you need.

The `withRetries` function ([API docs](/api/task/functions/withRetries)) accepts two arguments:

- A callback function that produces a `Task`.
- Optionally, a retry _strategy_.

Although you _can_ customize nearly every part of this, you do not _have_ to customize any of it.

Here's the simplest version of a function that retries a `fetch` call:

```ts twoslash
import * as task from 'true-myth/task';

let fetcher = () => task.fromPromise(fetch('https://true-myth.js.org'));
let fetchWithRetries = task.withRetries(fetcher);
```

The `fetchWithRetries` value has the type `Task<Response, RetryFailed<unknown>>`. If the `fetch` call succeeds, the `Task` will resolve with the `Response` from the `fetch` call. If the `fetch` call fails, `withRetries` will retry it immediately, up to 3 times, before stopping. If it stops, the `Task` will reject with a `RetryFailed` type: a special error subclass that is only available within the `true-myth/task` module. You can use its public APIs, as we will cover later, but you cannot construct one yourself: it only exists to allow True Myth to tell you that a `Task` rejected because retries failed.

We also provide the following tools to customize the behavior of `withRetries`:

- A retry status provided to the callback.
- The retry strategy argument.
- The `stopRetrying` helper.

In each of the following examples, we'll use the following helper to give us slightly nicer types to work with in the case of rejections:

```ts twoslash
function intoError(cause: unknown): Error {
  return new Error('unknown error', { cause });
}
```

We won't repeat this, for the sake of simplicity.

### The retry status

First, the retryable callback receives a status object which reports the number of retries and the elapsed time requested. You can use that to determine what actions to take depending on how long you have been trying an operation.

:::tip

The `elapsed` value will always be greater than or equal to the requested elapsed time after the first try, because even calling `setTimeout(() => {}, 0)` will take at least one microtask queue tick, and JavaScript runtimes do not guarantee _exactly_ the time it takes for promises to settle or `setTimeout` to resolve, and the resolution changes over time.

:::

Here's one example of using the retry status in practice.

```ts twoslash
function intoError(cause: unknown): Error {
  return new Error('unknown error', { cause });
}
// ---cut---
import Task, * as task from 'true-myth/task';

let fetcher = ({ count, elapsed }: task.RetryStatus): Task<Response, Error> => {
  if (count > 100 || elapsed > 1_000) {
    let message = `Overdid it! Count: ${count} | Time elapsed: ${elapsed}`;
    return task.reject(new Error(message));
  }

  return task
    .fromPromise(fetch('https://true-myth.js.org'))
    .mapRejected(intoError);
};

let taskWithRetries = task.withRetries(fetcher);
```

In this example, we reject with an error if the task has already been retried more than 100 times or if it has taken more 1,000 milliseconds (one second). The resulting `Task` has the type `Task<Response, RetryFailed<Error>>`. [The `RetryFailed` type](/api/task/classes/RetryFailed) gathers up all the different kinds of errors emitted during retries so you can inspect them:

```ts twoslash
function intoError(cause: unknown): Error {
  return new Error('unknown error', { cause });
}
import Task, * as task from 'true-myth/task';
let fetcher = ({ count, elapsed }: task.RetryStatus): Task<Response, Error> => {
  if (count > 100 || elapsed > 1_000) {
    let message = `Overdid it! Count: ${count} | Time elapsed: ${elapsed}`;
    return task.reject(new Error(message));
  }
  return task
    .fromPromise(fetch('https://true-myth.js.org'))
    .mapRejected(intoError);
};
let taskWithRetries = task.withRetries(fetcher);
// ---cut---
let described = taskWithRetries.orElse((retryFailed) => {
  let tries = `Failed ${retryFailed.tries} times.`;
  let time = `Took ${retryFailed.totalDuration}ms.`;

  const LI = '\n- ';

  let reasons =
    retryFailed.rejections.length > 0
      ? LI +
      retryFailed.rejections
        .map((err) => {
          let cause = err.cause ? `\nCaused by: ${err.cause}` : '';
          let stack = err.stack ? `\n${err.stack}` : '';
          return err.message + cause + stack;
        })
        .join(LI)
      : '';

  let description = `${tries}\n${time}\n${reasons}`;

  return Task.reject(description);
});
```

### A retry strategy

Second, you can supply a retry strategy, which tells `task.withRetries` how often to retry, including how much to back off between retries. (We talk more about how strategies work in [Retry strategies](#retry-strategies) below.) When the callback produces a rejected `Task`, `withRetries` retries the callback using the delay until the retry strategy is exhausted, at which point `withRetries` will produce a `Task` that rejects with a `RetryFailure`, which will have all rejection values.

For example, to use an exponential backoff strategy with the original `fetcher`, starting at 10 milliseconds and increasing by a factor of 10 with each retry, you could write this:

```ts twoslash
function intoError(cause: unknown): Error {
  return new Error('unknown error', { cause });
}
// ---cut---
import * as task from "true-myth/task";
import { exponential } from "true-myth/task/delay";

let fetcher = () =>
  task.fromPromise(fetch("https://true-myth.js.org")).mapRejected(intoError);

let taskWithRetries = task.withRetries(
  fetcher,
  exponential({ from: 10, withFactor: 10 }),
);
```

### The `stopRetrying` helper

Third, you can stop retrying at any time, using the supplied `stopRetrying()` function, which accepts a message describing why and an optional cause. Under the hood, this returns a custom `Error` subclass that can _only_ be constructed by calling that function, so that the `withRetries` implementation can know that any instance of that error is a signal that it needs to stop all further retries immediately.

### Combining these features

This next example show roughly the full <abbr title='application programming interface'>API</abbr> available, using the `exponential` delay strategy supplied by the library (there other supplied strategies are `fibonacci`, `fixed`, `immediate`, `linear`, and `none`):

```ts twoslash
import * as task from 'true-myth/task';
import { exponential, jitter } from 'true-myth/task/delay';

let fetchTask = task.withRetries(
  ({ count, elapsed }) => {
    if (elapsed > 100_000) {
      return task.stopRetrying(`Went too long: ${elapsed}ms`);
    }

    return task.fromPromise(fetch('https://true-myth.js.org')).orElse((rejection) => {
      let wrapped = new Error(`fetch has rejected ${count} times`, { cause: rejection });
      return task.reject(wrapped);
    });
  },
  exponential({ from: 10, withFactor: 3 }).map(jitter).take(10)
);
```

All of the built-in retry delay strategies (`exponential`, `fibonacci`, `fixed`, `immediate`, `linear`, and `none`) have good defaults such that you can simply call them like `fibonacci()`. The goal here is "progressive disclosure of complexity": out of the box, it does something reasonable, and you can opt into customizing it with quite a few options, and if you need totally custom behavior, you can supply your own generator or iterable iterator.

[crate]: https://docs.rs/retry/latest/retry/

## Retry strategies

In general, a retry strategy is a way of configuring a retry function for when it should retry: how long between the first retry and the second, the second and the third, and so on. In the wild, you will commonly see both linear and exponential backoff, for example.

True Myth's `task.withRetries` function doesn't actually know *anything* about back-off strategies, though. Instead, `task.withRetries` accepts any iterator that produces numbers. Each number produced by the iterator is used as the duration of time to wait before retrying again.

This way, we don't have to bake in special handling for a handful of pre-configured backoff strategies. Instead, we can *implement* those common strategies and make them available to you, while also allowing you maximum flexibility to implement your own.

When combined with iterator helpers (either manually authored via generator functions or via the new iterator built-ins in ES2025), this makes for a very straightforward way to build up custom retry behaviors, because an iterator—and in particular a generator function—is a very natural way to express a sequence of numbers produced on demand, potentially forever.

::: info Credit where due!

True Myth borrowed this idea, and modeled this <abbr title='application programming interface'>API</abbr>, fairly directly on the [the Rust `retry` crate][crate]: it's a brilliant insight, but the insight was not ours!

[itit]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols

:::

## Built-in retry strategies

The strategies provided in this module represent the _most common_, but definitely not the _only possible_ strategies you can use for retrying.

- `exponential` ([API docs](/api/task/delay/functions/exponential))
- `fibonacci` ([API docs](/api/task/delay/functions/fibonacci))
- `fixed` ([API docs](/api/task/delay/functions/fixed))
- `immediate` ([API docs](/api/task/delay/functions/immediate))
- `linear` ([API docs](/api/task/delay/functions/linear))
- `none` ([API docs](/api/task/delay/functions/none))

Additionally, the `jitter` function provides a useful tool for generating random variations on a retry strategy, to help avoid ["thundering herd" problems][thp] where many tasks kick off at the same time, fail at the same time, and then retry at the same time, causing increasing load on a resource that is already failing.

[thp]: https://en.wikipedia.org/wiki/Thundering_herd_problem

You should make sure you understand the tradeoffs of each of these backoff strategies before deploying them!

## Custom retry strategies

There are three basic patterns for creating custom retry strategies:

- Using generator functions.
- Subclassing the `Iterator` class (requires ES2025 or a polyfill).
- Implementing the `Iterator` interface.

For the following examples, we'll use this function to get a `Result` that usually rejects.

```ts twoslash
import Task from 'true-myth/task';

const unpredictable = () => Math.random() > 0.9
  ? Task.resolve("Success!")
  : Task.reject(new Error("Nope, try again!"));
```

### Using generator functions

Here's an example of implementing a custom retry strategy using a generator function to produce up to 10 random backoffs of up to 10 seconds (10,000 milliseconds) each:

```ts twoslash
import Task from 'true-myth/task';
const unpredictable = () => Math.random() > 0.9
  ? Task.resolve("Success!")
  : Task.reject(new Error("Nope, try again!"));
// ---cut---
import * as task from 'true-myth/task';

function* random10Times(): task.delay.Strategy {
  const MAX = 10_000;

  let retries = 0;
  while (retries < 10) {
    yield Math.round(Math.random() * MAX);
    retries += 1;
  }
}

let taskWithRetries = task.withRetries(unpredictable, random10Times());
```

We use a generator function that yields a random integer somewhere between `0` and the `max` passed in, up to 10 times. We do not have to explicitly name the `Strategy` return type, but doing so makes sure that the generator function produces the expected type (`number`), so it is a good idea. Then we can pass the result of calling the generator function directly as the strategy to `Task.withRetries`, just like the built-in strategies.

### Subclassing `Iterator`

```ts twoslash
// @noErrors
class InRange extends Iterator<number> {
  readonly #start: number;
  readonly #end: number;
  readonly #step: number;

  #curr: number;

  constructor(start: number, end: number, step = 1) {
    super();
    this.#start = start;
    this.#end = end;
    this.#step = step;
    this.#curr = this.#start;
  }

  next() {
    if (this.#curr < this.#end) {
      let value = this.#curr;
      this.#curr += this.#step;
      return { value, done: false } as const;
    } else {
      return { value: undefined, done: true } as const;
    }
  }
}
```

Then you can use any of these as a retry strategy (note that these examples assume you have access to [the ES2025 iterator helper methods][helpers]):

[helpers]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator#iterator_helper_methods

```ts twoslash
// @noErrors
import * as task from 'true-myth/task';
import { someRetryableTask } from 'somewhere/in/your-app';

let usingRandomInRange = task.withRetries(
  someRetryableTask,
  randomInRange(1, 100).take(10)
);

let usingRandomInteger = task.withRetries(
  someRetryableTask,
  Iterator.from(new RandomInteger()).take(10)
);

let usingRangeIterator = task.withRetries(
  someRetryableTask,
  new InRange(1, 100, 5).take(10)
);
```

### Implementing the `Iterator` interface

:::warning 🚧 Under Construction 🚧

There will be more content here Soon™. We didn't want to block getting the new docs site live on having finished updating all the existing content!

:::

```ts twoslash
// @noErrors
class RandomInteger implements Iterator<number> {
  #nextValue: number;

  constructor(initial: number) {
    this.#nextValue = initial;
  }

  next(): IteratorResult<number, void> {
    let value = this.#nextValue;
    this.#nextValue = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    return { done: false, value };
  }

  return(value: number): IteratorResult<number, void> {
    return { done: false, value };
  }

  throw(_error: unknown): IteratorResult<number, void> {
    return { done: true, value: undefined };
  }

  [Symbol.iterator](): Generator<number, any, unknown> {
    return this;
  }
}
```


## Limiting retries

All the helpers from [`true-myth/task/delay`](/api/task/delay/) are infinite except `none`, so you almost certainly want to use another iterator helper to stop after a number of retries or to use the `count` passed as an argument to do the same.

### Recommended approach

Update to at least TS 5.6+, or use a TypeScript-aware polyfill for the Iterator Helpers feature (ES2025). In that case, you can simply use the `take` method directly:

```ts twoslash
import * as task from 'true-myth/task';
import * as delay from 'true-myth/task/delay';

let theTask = task.withRetries(
  () => task.fromPromise(fetch('https://example.com/')),
  delay.exponential().map(delay.jitter).take(5)
);
```

### Fallback approach

If you are unable to use a polyfill or upgrade to TS 5.6 for now, you can still use these safely using generator functions, which are long-standing JavaScript features available in all modern browsers since ES6. The above example might be written like this (note that these are fully-general versions of the `take` and `map` functions—that is, much more general than is required for working with the "strategies" from True Myth).

```ts twoslash
import * as task from 'true-myth/task';
import * as delay from 'true-myth/task/delay';

function* take<T>(iterator: Iterator<T>, count: number): Generator<T> {
  let taken = 0;
  let next = iterator.next();
  while (!next.done) {
    if (taken >= count) {
      return;
    }

    taken += 1;
    yield next.value;
    next = iterator.next();
  }
}

function* map<T, U>(iterator: Iterator<T>, fn: (t: T) => U): Generator<U> {
  let next = iterator.next();
  while (!next.done) {
    yield fn(next.value);
    next = iterator.next();
  }
}

let theTask = task.withRetries(
  () => task.fromPromise(fetch('https://example.com/')),
  take(map(delay.exponential(), delay.jitter), 5),
);
```

This is a bit harder to follow, but works the same way, and will let you migrate incrementally once you are able to use the ES2025 Iterator Helpers features.

## Design note: `Strategy`

You may notice that `Strategy` is simply an alias for `Iterator<number>`. This means that you can ignore it and use `Iterator<number>`, `Generator<number>`, or `IterableIterator<number>`—really, anything that `extends Iterator<number>`. Given that, you might wonder why we have `Strategy` at all.

The answer is so that if we need to change the definition of a `Strategy` in the future in some way, any place that uses
