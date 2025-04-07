/**
  {@include ../doc/delay.md}

  @module
 */

/**
  A `Strategy` is any iterator which yields numbers. You can implement it using
  the `Iterator` interface, i.e. `implements Strategy`, or you can write a
  generator function which produces `Generator<number>`, or you can subclass the
  `Iterator` built-in class if target a version of JavaScript that supports it
  or via a polyfill.

  ## Examples

  You can define your own generator functions or iterable iterators and pass
  them as the strategy for the delay, or you can implement a class which
  implements this interface. If you are able to target ES2025 (including by
  using a polyfill), you can also provide subclasses of `Iterator`.

  ```ts
  function* randomInRange(min: number, max: number): Strategy<number> {
    while (true) {
      let scaled = Math.random() * (max - min + 1);
      let scaledInt = Math.floor(scaled);
      let startingAtMin = scaledInt + min;
      yield startingAtMin
    }
  }

  //
  class RandomInteger implements Strategy {
    #nextValue: number;

    constructor(initial: number) {
      this.#nextValue = initial;
    }

    next(): IteratorResult<number, void> {
      this.#nextValue = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
      return { done: false, value: this.#nextValue };
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

  class Range extends Iterator {
    readonly #start: number;
    readonly #end: number;
    readonly #step: number;

    constructor(start: number, end: number, step = 1) {
      this.#start = start;
      this.#end = end;
      this.#step = step;
    }

    *[Symbol.iterator]() {
      for (let value = this.#start; value <= this.#end; value += this.#step) {
        yield value;
      }
    }
  }
  ```

  Then you can use any of these as a retry strategy (note that these examples
  assume you have access to [the ES2025 iterator helper methods][helpers]):

  [helpers]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator#iterator_helper_methods

  ```ts
  import * as Task from 'true-myth/task';
  import { someRetryableTask } from 'somewhere/in/your-app';

  let usingRandomInRange = Task.withRetries(
    someRetryableTask,
    randomInRange(1, 100).take(10)
  );

  let usingRandomInteger = Task.withRetries(
    someRetryableTask,
    new RandomInteger().take(10)
  );

  let usingRangeIterator = Task.withRetries(
    someRetryableTask,
    new Range(1, 100, 5).take(10)
  );
  ```
 */
export interface Strategy extends Iterator<number> {}

/**
  Generate an infinite iterable of integers beginning with `base` and increasing
  exponentially until reaching `Number.MAX_SAFE_INTEGER`, after which the
  generator will continue yielding `Number.MAX_SAFE_INTEGER` forever.

  By default, this increases exponentially by a factor of 2; you may optionally
  pass `{ factor: someOtherValue }` to change the exponentiation factor.

  If you pass a non-integral value as `base`, it will be rounded to the nearest
  integral value using `Math.round`.
 */
export function* exponential(options?: {
  /** Initial delay duration in milliseconds. Default is `1`. */
  from?: number;
  /**
    Exponentiation factor. Default is `2`.

    > [!IMPORTANT]
    > Setting this to a value less than `1` will cause the delay intervals to
    > *decay* rather than *increase*. This is rarely what you want!
   */
  withFactor?: number;
}): Generator<number> {
  const factor = options?.withFactor ?? 2;
  let curr = options?.from ? Math.round(options.from) : 1;
  while (true) {
    yield curr;
    let next = curr * factor;
    curr = Math.min(next, Number.MAX_SAFE_INTEGER);
  }
}

/**
  Generate an infinite iterable of integers beginning with `base` and
  increasing as a Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, ...) until reaching
  `Number.MAX_SAFE_INTEGER`, after which the generator will continue yielding
  `Number.MAX_SAFE_INTEGER` forever.

  If you pass a non-integral value as the `from` property on the configuration
  argument, it will be rounded to the nearest integral value using `Math.round`.
 */
export function* fibonacci(options?: {
  /** Initial delay duration in milliseconds. Default is `1`. */
  from: number;
}): Generator<number> {
  let integralBase = options?.from ? Math.round(options.from) : 1;
  let curr = integralBase;
  let next = integralBase;
  while (true) {
    yield curr;
    let next_next = curr + next;
    curr = next;
    next = Math.min(next_next, Number.MAX_SAFE_INTEGER);
  }
}

/**
  Generate an infinite iterable of the same integer value in milliseconds.

  If you pass a non-integral value, like `{ at: 2.5 }`, it will be rounded to
  the nearest integral value using `Math.round`, i.e. `3` in that case.
 */
export function* fixed(options?: {
  /** Delay duration in milliseconds. Default is `1` (immediate). */
  at: number;
}): Generator<number> {
  let integralValue = options?.at ? Math.round(options.at) : 1;
  while (true) {
    yield integralValue;
  }
}

/** Generate an infinite iterable of the value `0`. */
export function* immediate(): Generator<number> {
  while (true) {
    yield 0;
  }
}

/**
  Generate an infinite iterable of integers beginning with `base` and increasing
  linearly (1, 2, 3, 4, 5, 5, 7, ...) until reaching `Number.MAX_SAFE_INTEGER`,
  after which the generator will continue yielding `Number.MAX_SAFE_INTEGER`
  forever.

  By default, this increases by a step size of 1; you may optionally pass
  `{ step: someOtherValue }` to change the step size.

  If you pass a non-integral value as `base`, it will be rounded to the nearest
  integral value using `Math.round`.
 */
export function* linear(options?: {
  /** Initial delay duration in milliseconds. Default is `0`. */
  from?: number;
  /**
      Step size by which to increase the value. Default is `1`.

      > [!IMPORTANT]
      > Setting this to a value less than `1` will cause the delay intervals to
      > *decay* rather than *increase*. This is rarely what you want!
     */
  withStepSize?: number;
}): Generator<number> {
  const step = options?.withStepSize ?? 1;
  let curr = options?.from ? Math.round(options.from) : 0;
  while (true) {
    yield curr;
    curr += step;
  }
}

/**
  A “no-op” strategy, for if you need to call supply a {@linkcode Strategy} to
  a function but do not actually want to retry at all.

  You should never use this directly with `Task.withRetries`; in the case where
  you would, invoke the `Task` that would be retried directly (i.e. without
  using `withRetries` at all) instead.
 */
export function* none(): Generator<number> {
  return;
}

/**
  Apply fully random jitter proportional to the number passed in. The resulting
  value will never be larger than 2×n, and never less than 0.

  This is useful for making sure your retries generally follow a given
  {@linkcode Strategy}, but if multiple tasks start at the same time, they do
  not all retry at exactly the same time.

  @param n The value to apply random jitter to.
*/
export function jitter(n: number): number {
  let direction = Math.random() > 0.5 ? 1 : -1;
  let amount = Math.ceil(Math.random() * n);
  let total = n + direction * amount;
  return Math.max(total, 0);
}
