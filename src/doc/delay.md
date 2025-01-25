# Task > Delay

Types and helpers for managing retry delays with the `withRetries` helper from `Task`.

The `withRetries` function accepts two arguments:

- A callback that produces a `Task` or `StopRetrying`, an `Error` subclass that acts as a “sentinel” value for.
- A retry delay strategy, which is an iterable iterator of delay times.

When the callback produces a resolved `Task`, the `Task` returned from `withRetries` resolves to that value and all previous rejections are dropped. When the callback produces a rejected `Task`, `withRetries` retries the callback using the delay until the retry strategy is exhausted, at which point `withRetries` will produce a `Task` that rejects with a `RetryFailure`, which will have all rejection values.

The strategies provided in this module represent the *most common*, but definitely not the *only possible* strategies you can use for retrying.

- `exponential`
- `fibonacci`
- `fixed`
- `immediate`
- `linear`
- `none`

Additionally, the `jitter` function provides a useful tool for generating random variations on a retry strategy, to help avoid [“thundering herd” problems][thp] where many tasks kick off at the same time, fail at the same time, and then retry at the same time, causing increasing load on a resource that is already failing.

[thp]: https://en.wikipedia.org/wiki/Thundering_herd_problem

You should make sure you understand the tradeoffs of each backoff strategy.

> [!NOTE]
> All the helpers in this module except `none` are infinite, so you almost certainly want to use another helper to stop after a number of retries or to use the `count` passed as an argument to do the same.
>
> **Recommended:** Update to at least TS 5.6+, or use a TypeScript-aware polyfill for the Iterator Helpers feature (ES2025). In that case, you can simply use the `take` method directly:
>
> ```ts
> import * as Task from 'true-myth/task';
> import * as Delay from 'true-myth/task/delay';
>
> let theTask = Task.withRetries(
>   () => Task.fromPromise(fetch('https://example.com/')),
>   Delay.exponential().map(Delay.jitter).take(5),
> );
> ```
>
> **Fallback:** If you are unable to use a polyfill or upgrade to TS 5.6 for now, you can still use these safely using generator functions, which are long-standing JavaScript features available in all modern browsers since ES6. The above example might be written like this (note that these are fully-general versions of the `take` and `map` functions—that is, much more general than is required for working with the “strategies” from True Myth).
>
> ```ts
> import * as Task from 'true-myth/task';
> import { exponential, jitter } from 'true-myth/task/delay';
>
> let theTask = Task.withRetries(
>   () => Task.fromPromise(fetch('https://example.com/')),
>   take(map(Delay.exponential(), Delay.jitter), 5),
> );
>
> function* take<T>(iterable: Iterable<T>, count: number): Generator<T> {
>   let taken = 0;
>   for (let item of iterable) {
>     if (taken >= count) {
>       break;
>     }
>
>     taken += 1;
>     yield item;
>   }
> }
>
> function* map<T, U>(iterable: Iterable<T>, fn: (t: T) => U): Generator<U> {
>   for (let value of iterable) {
>     yield fn(value);
>   }
> }
> ```
>
> This is a bit harder to follow but works the same way, and will let you migrate incrementally once you are able to use the ES2025 Iterator Helpers features.
