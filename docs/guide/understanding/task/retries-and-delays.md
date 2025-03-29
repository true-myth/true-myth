# Task Retries and Delays

When working with a `Task`, you often need to retry it in the case of failure. Maybe an API endpoint failed to respond in time, or perhaps it’s expected that a given operation may fail a few times before succeeding. True Myth’s `task` module provides the `withRetries` helper to make this easy both to do at all and to get things “right” in terms of your system’s performance.

## Retrying a task

True Myth’s approach to retries is designed to let you compose all the pieces together yourself, and to opt into as much or as little complexity as you need.

The `withRetries` function ([API docs](/api/task/functions/withRetries)) accepts two arguments:

- A callback function that produces a `Task`.
- Optionally, a retry _strategy_.

Although you _can_ customize nearly every part of this, you do not _have_ to customize any of it.

Here’s the simplest version of a function that retries a `fetch` call:

```ts
import * as Task from 'true-myth/task';

let fetcher = () => Task.fromPromise(fetch('https://true-myth.js.org'));
let fetchWithRetries = Task.withRetries(fetcher);
```

The `fetchWithRetries` value has the type `Task<Response, RetryFailed<unknown>>`. If the `fetch` call succeeds, the `Task` will resolve with the `Response` from the `fetch` call. If the `fetch` call fails, `withRetries` will retry it immediately, up to 3 times, before stopping. If it stops, the `Task` will reject with a `RetryFailed` type: a special error subclass that is only available within the `true-myth/task` module. You can use its public APIs, as we will cover later, but you cannot construct one yourself: it only exists to allow True Myth to tell you that a `Task` rejected because retries failed.

We also provide the following tools to customize the behavior of `withRetries`:

- A retry status provided to the callback.
- The retry strategy argument.
- The `stopRetrying` helper.

In each of the following examples, we’ll use the following helper to give us slightly nicer types to work with in the case of rejections:

```ts
function intoError(cause: unknown): Error {
  return new Error('unknown error', { cause });
}
```

We won’t repeat this, for the sake of simplicity.

### The retry status

First, the retryable callback receives a status object which reports the number of retries and the elapsed time requested. You can use that to determine what actions to take depending on how long you have been trying an operation.

:::tip

The `elapsed` value will always be greater than or equal to the requested elapsed time after the first try, because even calling `setTimeout(() => {}, 0)` will take at least one microtask queue tick, and JavaScript runtimes do not guarantee _exactly_ the time it takes for promises to settle or `setTimeout` to resolve, and the resolution changes over time.

:::

Here’s one example of using the retry status in practice.

```ts
import Task, { RetryStatus, fromPromise, withRetries } from 'true-myth/task';

let fetcher = ({ count, elapsed }: RetryStatus): Task<Response, Error> => {
  if (count > 100 || elapsed > 1_000) {
    let message = `Overdid it! Count: ${count} | Time elapsed: ${elapsed}`;
    return Task.reject(new Error(message));
  }

  return fromPromise(fetch('https://true-myth.js.org')).mapRejected(intoError);
};

let taskWithRetries = withRetries(fetcher);
```

In this example, we reject with an error if the task has already been retried more than 100 times or if it has taken more 1,000 milliseconds (one second). The resulting `Task`

### A retry strategy

Second, you can supply a `Strategy` which is an [iterable iterator][itit] which produces a number of milliseconds to wait to try again. When the callback produces a rejected `Task`, `withRetries` retries the callback using the delay until the retry strategy is exhausted, at which point `withRetries` will produce a `Task` that rejects with a `RetryFailure`, which will have all rejection values.

For example, to use an exponential backoff strategy with the original `fetcher`, starting at 10 milliseconds and increasing by a factor of 10 with each retry, you could write this:

```ts
import * as Task from "true-myth/task";
import { exponential } from "true-myth/task/delay";

let fetcher = () =>
  Task.fromPromise(fetch("https://true-myth.js.org")).mapRejected(intoError);

let taskWithRetries = Task.withRetries(
  fetcher,
  exponential({ from: 10, withFactor: 10 }),
);

```

### The `stopRetrying` helper

Third, you can stop retrying at any time, using the supplied `stopRetrying()` function, which accepts a message describing why and an optional cause. Under the hood, this returns a custom `Error` subclass that can _only_ be constructed by calling that function, so that the `withRetries` implementation can know that any instance of that error is a signal that it needs to stop all further retries immediately.

### Combining these features

This next example show roughly the full <abbr title='application programming interface'>API</abbr> available, using the `exponential` delay strategy supplied by the library (there other supplied strategies are `fibonacci`, `fixed`, `immediate`, `linear`, and `none`):

```ts
import * as TMT from 'true-myth/task';
import { exponential, jitter } from 'true-myth/task/delay';

let fetchTask = TMT.withRetries(
  ({ count, elapsed }) => {
    if (elapsed > 100_000) {
      return TMT.stopRetrying(`Went too long: ${elapsed}ms`);
    }

    return TMT.fromPromise(fetch('https://true-myth.js.org')).orElse((rejection) => {
      let wrapped = new Error(`fetch has rejected ${count} times`, { cause: rejection });
      return TMT.reject(wrapped);
    });
  },
  exponential({ from: 10, factor: 3 }).map(jitter).take(10)
);
```

All of the built-in retry delay strategies (`exponential`, `fibonacci`, `fixed`, `immediate`, `linear`, and `none`) have good defaults such that you can simply call them like `fibonacci()`. The goal here is “progressive disclosure of complexity”: out of the box, it does something reasonable, and you can opt into customizing it with quite a few options, and if you need totally custom behavior, you can supply your own generator or iterable iterator.

[crate]: https://docs.rs/retry/latest/retry/

## Built-in retry strategies

The strategies provided in this module represent the _most common_, but definitely not the _only possible_ strategies you can use for retrying.

- `exponential` ([API docs](/api/task/delay/functions/exponential))
- `fibonacci` ([API docs](/api/task/delay/functions/fibonacci))
- `fixed` ([API docs](/api/task/delay/functions/fixed))
- `immediate` ([API docs](/api/task/delay/functions/immediate))
- `linear` ([API docs](/api/task/delay/functions/linear))
- `none` ([API docs](/api/task/delay/functions/none))

Additionally, the `jitter` function provides a useful tool for generating random variations on a retry strategy, to help avoid [“thundering herd” problems][thp] where many tasks kick off at the same time, fail at the same time, and then retry at the same time, causing increasing load on a resource that is already failing.

[thp]: https://en.wikipedia.org/wiki/Thundering_herd_problem

You should make sure you understand the tradeoffs of each of these backoff strategies before deploying them!

## Custom retry strategies

While the built-in backoff strategies are likely sufficient for most use cases, you are not limited to them. A retry strategy is actually *any iterable iterator* that produces numbers, where the numbers are used as the number of milliseconds to delay before trying again.

Most retry libraries have a limited set of options they allow you to use, usually configured with some kind of options object. By using iterable iterators instead, True Myth provides maximum flexibility, while making it straightforward to implement entirely custom retry strategies. The retry strategy simply *is* the values produced by an iterator.

When combined with iterator helpers (either manually authored via generator functions or via the new iterator built-ins in ES2025), this makes for a very straightforward way to build up custom retry behaviors, because an iterator—and in particular a generator function—is a very natural way to express a sequence of numbers produced on demand, potentially forever.

::: info Credit where due!

True Myth borrowed this idea, and modeled this <abbr title='application programming interface'>API</abbr>, fairly directly on the [the Rust `retry` crate][crate]: it’s a brilliant insight, but the insight was not ours!

[itit]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols

:::

Here’s an example of implementing a custom retry strategy using a generator function to produce up to 10 random backoffs of up to 10 seconds (10,000 milliseconds) each:

```ts
import * as Task from 'true-myth/task';
import { type Strategy } from 'true-myth/task/delay';

function* random10Times(): Strategy {
  const MAX = 10_000;

  let retries = 0;
  while (retries < 10) {
    yield Math.round(Math.random() * MAX);
    retries += 1;
  }
}

let fetcher = () =>
  Task.fromPromise(fetch("https://true-myth.js.org")).mapRejected(intoError);

let taskWithRetries = Task.withRetries(fetcher, random10Times());
```

We use a generator function that yields a random integer somewhere between `0` and the `max` passed in. We do not have to explicitly name the `Strategy` return type, but doing so makes sure that the generator function produces the expected type—a `number`, so it is a good idea. Then we can pass the result of calling the generator function directly as the strategy to `Task.withRetries`, just like the built-in strategies.

You can also implement the `IterableIterator` interface using a custom class that `implements Strategy`, or a subclass of the built-in `Iterator` type. See [the API docs for `Strategy`](/api/task/delay/interfaces/Strategy) for examples.

## Limiting retries

All the helpers from [`true-myth/task/delay`](/api/task/delay/) are infinite except `none`, so you almost certainly want to use another iterator helper to stop after a number of retries or to use the `count` passed as an argument to do the same.

### Recommended approach

Update to at least TS 5.6+, or use a TypeScript-aware polyfill for the Iterator Helpers feature (ES2025). In that case, you can simply use the `take` method directly:

```ts
import * as Task from 'true-myth/task';
import * as Delay from 'true-myth/task/delay';

let theTask = Task.withRetries(
  () => Task.fromPromise(fetch('https://example.com/')),
  Delay.exponential().map(Delay.jitter).take(5)
);
```

### Fallback approach

If you are unable to use a polyfill or upgrade to TS 5.6 for now, you can still use these safely using generator functions, which are long-standing JavaScript features available in all modern browsers since ES6. The above example might be written like this (note that these are fully-general versions of the `take` and `map` functions—that is, much more general than is required for working with the “strategies” from True Myth).

```ts
import * as Task from 'true-myth/task';
import { exponential, jitter } from 'true-myth/task/delay';

function* take<T>(iterable: Iterable<T>, count: number): Generator<T> {
  let taken = 0;
  for (let item of iterable) {
    if (taken >= count) {
      break;
    }

    taken += 1;
    yield item;
  }
}

function* map<T, U>(iterable: Iterable<T>, fn: (t: T) => U): Generator<U> {
  for (let value of iterable) {
    yield fn(value);
  }
}

let theTask = Task.withRetries(
  () => Task.fromPromise(fetch('https://example.com/')),
  take(map(Delay.exponential(), Delay.jitter), 5),
);
```

This is a bit harder to follow, but works the same way, and will let you migrate incrementally once you are able to use the ES2025 Iterator Helpers features.
