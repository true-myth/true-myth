[True Myth](../../index.md) / [task](../index.md) / withRetries

# Function: withRetries()

> **withRetries**\<`T`, `E`\>(`retryable`, `strategy`): [`Task`](../classes/Task.md)\<`T`, [`RetryFailed`](../classes/RetryFailed.md)\<`E`\>\>

Execute a callback that produces either a [`Task`](../classes/Task.md) or the “sentinel”
[`Error`][error-mdn] subclass [`StopRetrying`](../classes/StopRetrying.md). `withRetries` retries
the `retryable` callback until the retry strategy is exhausted *or* until the
callback returns either `StopRetrying` or a `Task` that rejects with
`StopRetrying`. If no strategy is supplied, a default strategy of retrying
immediately up to three times is used.

[error-mdn]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error

The `strategy` is any iterable iterator that produces an integral number,
which is used as the number of milliseconds to delay before retrying the
`retryable`. When the `strategy` stops yielding values, this will produce a
[`Rejected`](../interfaces/Rejected.md) `Task` whose rejection value is an instance of
[`RetryFailed`](../classes/RetryFailed.md).

Returning `stopRetrying()` from the top-level of the function or as the
rejection reason will also produce a rejected `Task` whose rejection value is
an instance of `RetryFailed`, but will also immediately stop all further
retries and will include the `StopRetrying` instance as the `cause` of the
`RetryFailed` instance.

You can determine whether retries stopped because the strategy was exhausted
or because `stopRetrying` was called by checking the `cause` on the
`RetryFailed` instance. It will be `undefined` if the the `RetryFailed` was
the result of the strategy being exhausted. It will be a `StopRetrying` if it
stopped because the caller returned `stopRetrying()`.

## Examples

### Retrying with backoff

When attempting to fetch data from a server, you might want to retry if and
only if the response was an HTTP 408 response, indicating that there was a
timeout but that the client is allowed to try again. For other error codes, it
will simply reject immediately.

```ts
import * as task from 'true-myth/task';
import * as delay from 'true-myth/task/delay';

let theTask = withRetries(
  () => task.fromPromise(fetch('https://example.com')).andThen((res) => {
      if (res.status === 200) {
        return task.fromPromise(res.json());
      } else if (res.status === 408) {
        return task.reject(res.statusText);
      } else {
        return task.stopRetrying(res.statusText);
      }
    }),
  delay.fibonacci().map(delay.jitter).take(10)
);
```

Here, this uses a Fibonacci backoff strategy, which can be preferable in some
cases to a classic exponential backoff strategy (see [A Performance Comparison
of Different Backoff Algorithms under Different Rebroadcast Probabilities for
MANET's][pdf] for more details).

[pdf]: https://www.researchgate.net/publication/255672213_A_Performance_Comparison_of_Different_Backoff_Algorithms_under_Different_Rebroadcast_Probabilities_for_MANET's

### Manually canceling retries

Sometimes, you may determine that the result of an operation is fatal, so
there is no point in retrying even if the retry strategy still allows it. In
that case, you can return the special `StopRetrying` error produced by calling
`stopRetrying` to immediately stop all further retries.

For example, imagine you have a library function that returns a custom `Error`
subclass that includes an `isFatal` value on it, something like this::

```ts
class AppError extends Error {
  isFatal: boolean;
  constructor(message: string, options?: { isFatal?: boolean, cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.isFatal = options?.isFatal ?? false;
  }
}
```

You could check that flag in a `Task` rejection and return `stopRetrying()` if
it is set:

```ts
import * as task from 'true-myth/task';
import { fibonacci, jitter } from 'true-myth/task/delay';
import { doSomethingThatMayFailWithAppError } from 'someplace/in/my-app';

let theTask = task.withRetries(
  () => {
    doSomethingThatMayFailWithAppError().orElse((rejection) => {
      if (rejection.isFatal) {
        return task.stopRetrying("It was fatal!", { cause: rejection });
      }

      return task.reject(rejection);
    });
  },
  fibonacci().map(jitter).take(20)
);
```

### Using the retry `status` parameter

Every time `withRetries` tries the `retryable`, it provides the current count
of attempts and the total elapsed duration as properties on the `status`
object, so you can do different things for a given way of trying the async
operation represented by the `Task` depending on the count. Here, for example,
the task is retried if the HTTP request rejects, with an exponential backoff
starting at 100 milliseconds, and captures the number of retries in an `Error`
wrapping the rejection reason when the response rejects or when converting the
response to JSON fails. It also stops if it has tried the call more than 10
times or if the total elapsed time exceeds 10 seconds.

```ts
import * as task from 'true-myth/task';
import { exponential, jitter } from 'true-myth/task/delay';

let theResult = await task.withRetries(
  ({ count, elapsed }) => {
    if (count > 10) {
      return task.stopRetrying(`Tried too many times: ${count}`);
    }

    if (elapsed > 10_000) {
      return task.stopRetrying(`Took too long: ${elapsed}ms`);
    }

    return task.fromPromise(fetch('https://www.example.com/'))
      .andThen((res) => task.fromPromise(res.json()))
      .orElse((cause) => {
        let message = `Attempt #${count} failed`;
        return task.reject(new Error(message, { cause }));
      });
  },
  exponential().map(jitter),
);
```

### Custom strategies

While the [task/delay](../delay/index.md) module supplies a number of useful strategies,
you can also supply your own. The easiest way is to write [a generator
function][gen], but you can also implement a custom iterable iterator,
including by providing a subclass of the ES2025 `Iterator` class.

Here is an example of using a generator function to produce a random but
[monotonically increasing][monotonic] value proportional to the current
value:

```ts
import * as task from 'true-myth/task';

function* randomIncrease(options?: { from: number }) {
  // always use integral values, and default to one second.
  let value = options ? Math.round(options.from) : 1_000;
  while (true) {
    yield value;
    value += Math.ceil(Math.random() * value); // always increase!
  }
}

await task.withRetries(({ count }) => {
  let delay = Math.round(Math.random() * 100);
  return task.timer(delay).andThen((time) =>
    task.reject(`Rejection #${count} after ${time}ms`),
  );
}, randomIncrease(10).take(10));
```

[monotonic]: https://en.wikipedia.org/wiki/Monotonic_function

## Type Parameters

### T

`T`

The type of a [`Resolved`](../interfaces/Resolved.md) [`Task`](../classes/Task.md).

### E

`E`

The type of a [`Rejected`](../interfaces/Rejected.md) [`Task`](../classes/Task.md).

## Parameters

### retryable

(`status`) => [`StopRetrying`](../classes/StopRetrying.md) \| [`Task`](../classes/Task.md)\<`T`, `E` \| [`StopRetrying`](../classes/StopRetrying.md)\>

A callback that produces a [`Task<T, E>`](../classes/Task.md).

### strategy

[`Strategy`](../delay/interfaces/Strategy.md) = `...`

An iterable iterator that produces an integral number of
  milliseconds to wait before trying `retryable` again. If not supplied, the
  `retryable` will be retried immediately up to three times.

## Returns

[`Task`](../classes/Task.md)\<`T`, [`RetryFailed`](../classes/RetryFailed.md)\<`E`\>\>
