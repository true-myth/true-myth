/**
  {@include doc/task.md}

  @module
 */

import { curry1, safeToString } from './-private/utils.js';
import Maybe from './maybe.js';
import Result, { map as mapResult, mapErr, match as matchResult } from './result.js';
import Unit from './unit.js';
import * as Delay from './task/delay.js';

// Make the Delay namespace available as `Task.Delay` for convenience. This lets
// people do `Task.withRetries(aTask, Task.Delay.exponential(1_000).take(10))`.
export { Delay };

// This set of declarations is a hack to work around the fact that we cannot use
// the current union-based definition of `Task` in conjunction with types that
// directly infer the resolution or rejection types (i.e., `ResolvesTo` and
// `RejectsWith` below) *and* use those types in the body of `TaskImpl`, or else
// we end up with TS complaining about circular definitions. Instead, we provide
// a type-only “brand” via this symbol, that we can then use to drive inference
// against a type we know can *only* be our own `TaskImpl` and its derivative
// `Task` type, because this neither exists at runtime nor is not exported, and
// so cannot be attached to any type *other* than the ones we apply it to.
declare const IsTask: unique symbol;

type SomeTask<T, E> = { [IsTask]: [T, E] };

/** @internal */
type TypesFor<S extends AnyTask> =
  S extends SomeTask<infer T, infer E> ? { resolution: T; rejection: E } : never;

/**
  Internal implementation details for {@linkcode Task}.
 */
class TaskImpl<T, E> implements PromiseLike<Result<T, E>> {
  readonly #promise: Promise<Result<T, E>>;
  #state: Repr<T, E> = [State.Pending];

  // Attach the type-only symbol here so that it can be used for inference.
  declare readonly [IsTask]: [T, E];

  constructor(executor: (resolve: (value: T) => void, reject: (reason: E) => void) => void) {
    this.#promise = new Promise<Result<T, E>>((resolve) => {
      executor(
        (value) => {
          this.#state = [State.Resolved, value];
          resolve(Result.ok(value));
        },
        (reason) => {
          this.#state = [State.Rejected, reason];
          resolve(Result.err(reason));
        }
      );
    }).catch((e) => {
      throw new TaskExecutorException(e);
    });
  }

  // Implement `PromiseLike`; this allows `await someTask` to “just work” and to
  // produce the resulting `Result<A, B>`. It also powers the mechanics of things
  // like `andThen` below, since it makes it possible to use JS’ implicit
  // unwrapping of “thenables” to produce new `Task`s even when there is an
  // intermediate `Promise`.
  then<A, B>(
    onSuccess?: (result: Result<T, E>) => A | PromiseLike<A>,
    onRejected?: (reason: unknown) => B | PromiseLike<B>
  ): PromiseLike<A | B> {
    return this.#promise.then(onSuccess, onRejected);
  }

  toString() {
    switch (this.#state[0]) {
      case State.Pending:
        return 'Task.Pending';

      case State.Resolved:
        return `Task.Resolved(${safeToString(this.#state[1])})`;

      case State.Rejected:
        return `Task.Rejected(${safeToString(this.#state[1])})`;

      /* v8 ignore next 2 */
      default:
        unreachable(this.#state);
    }
  }

  /**
    Produce a `Task<T, E>` from a promise of a {@linkcode Result Result<T, E>}.

    > [!WARNING]
    > This constructor assumes you have already correctly handled the promise
    > rejection state, presumably by mapping it into the wrapped `Result`. It is
    > *unsafe* for this promise ever to reject! You should only ever use this
    > with `Promise<Result<T, E>>` you have created yourself (including via a
    > `Task`, of course).
    >
    > For any other `Promise<Result<T, E>>`, you should first attach a `catch`
    > handler which will also produce a `Result<T, E>`.
    >
    > If you call this with an unmanaged `Promise<Result<T, E>>`, that is, one
    > that has *not* correctly set up a `catch` handler, the rejection will
    > throw an {@linkcode UnsafePromise} error that will ***not*** be catchable
    > by awaiting the `Task` or its original `Promise`. This can cause test
    > instability and unpredictable behavior in your application.

    @param promise The promise from which to create the `Task`.

    @group Constructors

    @deprecated Use the module-scoped {@linkcode fromUnsafePromise} instead.
   */
  static fromUnsafePromise<T, E>(promise: Promise<Result<T, E>>): Task<T, E> {
    return new Task((resolve, reject) => {
      promise.then(
        matchResult({
          Ok: resolve,
          Err: reject,
        }),
        (rejectionReason: unknown) => {
          throw new UnsafePromise(rejectionReason);
        }
      );
    });
  }

  /**
    Produce a `Task<T, unknown>` from a promise.

    To handle the error case and produce a concrete `Task<T, E>` instead, use
    the overload which accepts an `onRejection` handler instead.

    @param promise The promise from which to create the `Task`.

    @group Constructors

    @deprecated This will be removed at 9.0. Switch to the module-scoped
      function {@linkcode fromPromise}.
   */
  static try<T>(promise: Promise<T>): Task<T, unknown> {
    return new Task((resolve, reject) => {
      promise.then(resolve, reject);
    });
  }

  /**
    Produce a {@linkcode Task Task<T, E>} from a `Promise<T>` and use a fallback
    value if the task rejects, ignoring the rejection reason.

    Notes:

    - To leave any error as `unknown`, use the overload which accepts only the
      promise.
    - To handle the rejection reason rather than ignoring it, use the overload
      which accepts a function.

    @param promise The promise from which to create the `Task`.
    @param rejectionValue A function to transform an unknown rejection reason
      into a known `E`.

    @group Constructors

    @deprecated This will be removed at 9.0. Switch to the module-level function
      {@linkcode safelyTryOr}, which accepts a callback instead.
   */
  static tryOr<T, E>(promise: Promise<T>, rejectionValue: E): Task<T, E> {
    return new Task((resolve, reject) => {
      promise.then(resolve, (_reason) => reject(rejectionValue));
    });
  }

  /**
    Produce a `Task<T, E>` from a `Promise<T>` and a function to transform an
    unknown error to `E`.

    To leave any error as `unknown`, use the overload which accepts only the
    promise.

    @param promise The promise from which to create the `Task`.
    @param onRejection A function to transform an unknown rejection reason into
      a known `E`.

    @group Constructors

    @deprecated This will be removed at 9.0. Switch to the module-level function
      {@linkcode safelyTryOrElse}, which accepts a callback instead.
   */
  static tryOrElse<T, E>(promise: Promise<T>, onRejection: (reason: unknown) => E): Task<T, E> {
    return new Task((resolve, reject) => {
      promise.then(resolve, (reason) => reject(onRejection(reason)));
    });
  }

  /**
    Construct a `Task` which is already resolved. Useful when you have a value
    already, but need it to be available in an API which expects a `Task`.

    @group Constructors
   */
  static resolve<T extends Unit, E = never>(): Task<Unit, E>;
  /**
    Construct a `Task` which is already resolved. Useful when you have a value
    already, but need it to be available in an API which expects a `Task`.

    @group Constructors
   */
  static resolve<T, E = never>(value: T): Task<T, E>;
  // The implementation is intentionally vague about the types: we do not know
  // and do not care what the actual types in play are at runtime; we just need
  // to uphold the contract. Because the overload matches the types above, the
  // *call site* will guarantee the safety of the resulting types.
  static resolve(value?: {}): Task<unknown, unknown> {
    // We produce `Unit` *only* in the case where no arguments are passed, so
    // that we can allow `undefined` in the cases where someone explicitly opts
    // into something like `Result<undefined, Blah>`.
    let result = arguments.length === 0 ? Unit : value;
    return new Task((resolve) => resolve(result));
  }

  /**
    Construct a `Task` which is already rejected. Useful when you have an error
    already, but need it to be available in an API which expects a `Task`.

    @group Constructors
   */
  static reject<T = never, E extends {} = {}>(): Task<T, Unit>;
  /**
    Construct a `Task` which is already rejected. Useful when you have an error
    already, but need it to be available in an API which expects a `Task`.

    @group Constructors
   */
  static reject<T = never, E = unknown>(reason: E): Task<T, E>;
  // The implementation is intentionally vague about the types: we do not know
  // and do not care what the actual types in play are at runtime; we just need
  // to uphold the contract. Because the overload matches the types above, the
  // *call site* will guarantee the safety of the resulting types.
  static reject(reason?: {}): Task<unknown, unknown> {
    // We produce `Unit` *only* in the case where no arguments are passed, so
    // that we can allow `undefined` in the cases where someone explicitly opts
    // into something like `Result<Blah, undefined>`.
    let result = arguments.length === 0 ? Unit : reason;
    return new Task((_, reject) => reject(result));
  }

  /**
    Build a {@linkcode Task Task<T, E>} from a {@linkcode Result Result<T, E>}.

    @deprecated Use the module-scoped {@linkcode fromResult} instead.
   */
  static fromResult<T, E>(result: Result<T, E>): Task<T, E> {
    return new Task((resolve, reject) =>
      result.match({
        Ok: resolve,
        Err: reject,
      })
    );
  }

  /**
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

    @group Constructors
   */
  static withResolvers<T, E>(): WithResolvers<T, E> {
    // SAFETY: immediately initialized via the `Task` constructor’s executor.
    let resolve!: WithResolvers<T, E>['resolve'];
    let reject!: WithResolvers<T, E>['reject'];
    let task = new Task<T, E>((resolveTask, rejectTask) => {
      resolve = resolveTask;
      reject = rejectTask;
    });
    return { task, resolve, reject };
  }

  get state(): State {
    return this.#state[0];
  }

  get isPending(): boolean {
    return this.#state[0] === State.Pending;
  }

  get isResolved(): boolean {
    return this.#state[0] === State.Resolved;
  }

  get isRejected(): boolean {
    return this.#state[0] === State.Rejected;
  }

  /**
    The value of a resolved `Task`.

    > [!WARNING]
    > It is an error to access this property on a `Task` which is `Pending` or
    > `Rejected`.
   */
  get value(): T {
    if (this.#state[0] === State.Resolved) {
      return this.#state[1];
    }

    throw new InvalidAccess('value', this.#state[0]);
  }

  /**
    The cause of a rejection.

    > [!WARNING]
    > It is an error to access this property on a `Task` which is `Pending` or
    > `Resolved`.
   */
  get reason(): E {
    if (this.#state[0] === State.Rejected) {
      return this.#state[1];
    }

    throw new InvalidAccess('reason', this.#state[0]);
  }

  /**
    Map over a {@linkcode Task} instance: apply the function to the resolved
    value if the task completes successfully, producing a new `Task` with the
    value returned from the function. If the task failed, return the rejection
    as {@linkcode Rejected} without modification.

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

    @template T The type of the resolved value.
    @template U The type of the resolved value of the returned `Task`.
    @param mapFn The function to apply the value to when the `Task` finishes if
      it is `Resolved`.
   */
  map<U>(mapFn: (t: T) => U): Task<U, E> {
    return Task.fromUnsafePromise(this.#promise.then(mapResult(mapFn)));
  }

  /**
    Map over a {@linkcode Task}, exactly as in {@linkcode map}, but operating on
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

    @template T The type of the value produced if the `Task` resolves.
    @template E The type of the rejection reason if the `Task` rejects.
    @template F The type of the rejection for the new `Task`, returned by the
      `mapFn`.
    @param mapFn The function to apply to the rejection reason if the `Task` is
      rejected.
   */
  mapRejected<F>(mapFn: (e: E) => F): Task<T, F> {
    return TaskImpl.fromUnsafePromise(this.#promise.then(mapErr(mapFn)));
  }

  /**
    You can think of this like a short-circuiting logical "and" operation on a
    {@linkcode Task}. If this `task` resolves, then the output is the task
    passed to the method. If this `task` rejects, the result is its rejection
    reason.

    This is useful when you have another `Task` value you want to provide if and
    *only if* the first task resolves successfully – that is, when you need to
    make sure that if you reject, whatever else you're handing a `Task` to
    *also* gets that {@linkcode Rejected}.

    Notice that, unlike in {@linkcode map Task.prototype.map}, the original
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

    @template U The type of the value for a resolved version of the `other`
      `Task`, i.e., the success type of the final `Task` present if the first
      `Task` is `Ok`.

    @param other The `Task` instance to return if `this` is `Rejected`.
   */
  and<U, F = E>(other: Task<U, F>): Task<U, E | F> {
    return new Task((resolve, reject) => {
      this.#promise.then(
        matchResult({
          Ok: (_) => {
            (other as TaskImpl<U, F>).#promise.then(
              matchResult({
                Ok: resolve,
                Err: reject,
              })
            );
          },
          Err: reject,
        })
      );
    });
  }

  /**
    Apply a function to the resulting value if a {@linkcode Task} is {@linkcode
    Resolved}, producing a new `Task`; or if it is {@linkcode Rejected} return
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

    `Promise.prototype.then` also acts the same way {@linkcode map
    Task.prototype.map} does, while `Task` distinguishes `map` from `andThen`.

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

    @template U The type of the value produced by the new `Task` of the `Result`
      returned by the `thenFn`.
    @param thenFn  The function to apply to the wrapped `T` if `maybe` is `Just`.
   */
  andThen<U>(thenFn: (t: T) => Task<U, E>): Task<U, E>;
  andThen<R extends AnyTask>(thenFn: (t: T) => R): Task<ResolvesTo<R>, E | RejectsWith<R>>;
  andThen<U>(thenFn: (t: T) => Task<U, E>): Task<U, E> {
    return new Task((resolve, reject) => {
      this.#promise.then(
        matchResult({
          Ok: (value) =>
            // This is a little annoying: there is no direct way to return the
            // resulting `Task` value here because of the intermediate `Promise`
            // and the resulting asynchrony. This is a direct consequences of
            // the fact that what `Task` is, `Promise` really should be in the
            // first place! We have to basically “unwrap” the inner `Result`,
            // but to do that, we have to wait for the intermediate `Promise` to
            // resolve so that the inner `Result` is available so it can in turn
            // be used with the top-most `Task`’s resolution/rejection helpers!
            (thenFn(value) as TaskImpl<U, E>).#promise.then(
              matchResult({
                Ok: resolve,
                Err: reject,
              })
            ),
          Err: reject,
        })
      );
    });
  }

  /**
    Provide a fallback for a given {@linkcode Task}. Behaves like a logical
    `or`: if the `task` value is {@linkcode Resolved}, returns that `task`
    unchanged, otherwise, returns the `other` `Task`.

    This is useful when you want to make sure that something which takes a
    `Task` always ends up getting a {@linkcode Resolved} variant, by supplying a
    default value for the case that you currently have an {@linkcode Rejected}.

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

    @template F   The type wrapped in the `Rejected` case of `other`.
    @param other  The `Result` to use if `this` is `Rejected`.
    @returns      `this` if it is `Resolved`, otherwise `other`.
   */
  or<F, U = T>(other: Task<U, F>): Task<T | U, F> {
    return new Task((resolve, reject) => {
      this.#promise.then(
        matchResult({
          Ok: resolve,
          Err: (_) => {
            (other as TaskImpl<U, F>).#promise.then(
              matchResult({
                Ok: resolve,
                Err: reject,
              })
            );
          },
        })
      );
    });
  }

  /**
    Like {@linkcode or}, but using a function to construct the alternative
    {@linkcode Task}.

    Sometimes you need to perform an operation using the rejection reason (and
    possibly also other data in the environment) to construct a new `Task`,
    which may itself resolve or reject. In these situations, you can pass a
    function (which may be a closure) as the `elseFn` to generate the fallback
    `Task<T, E>`. It can then transform the data in the {@linkcode Rejected} to
    something usable as an {@linkcode Resolved}, or generate a new `Rejected`
    instance as appropriate.

    Useful for transforming failures to usable data, for trigger retries, etc.

    @param elseFn The function to apply to the `Rejection` reason if the `Task`
      rejects, to create a new `Task`.
   */
  orElse<F>(elseFn: (reason: E) => Task<T, F>): Task<T, F>;
  orElse<R extends AnyTask>(elseFn: (reason: E) => R): Task<T | ResolvesTo<R>, RejectsWith<R>>;
  orElse<F>(elseFn: (reason: E) => Task<T, F>): Task<T, F> {
    return new Task((resolve, reject) => {
      this.#promise.then(
        matchResult({
          Ok: resolve,
          Err: (reason) => {
            // See the discussion in `andThen` above; this is exactly the same
            // issue, and with inverted implementation logic.
            (elseFn(reason) as TaskImpl<T, F>).#promise.then(
              matchResult({
                Ok: resolve,
                Err: reject,
              })
            );
          },
        })
      );
    });
  }

  /**
    Allows you to produce a new value by providing functions to operate against
    both the {@linkcode Resolved} and {@linkcode Rejected} states once the
    {@linkcode Task} resolves.

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

    @param matcher A lightweight object defining what to do in the case of each
                   variant.
   */
  match<A>(matcher: Matcher<T, E, A>): Promise<A> {
    return this.#promise.then(
      matchResult({
        Ok: matcher.Resolved,
        Err: matcher.Rejected,
      })
    );
  }

  /**
    Attempt to run this {@linkcode Task} to completion, but stop if the passed
    {@linkcode Timer}, or one constructed from a passed time in milliseconds,
    elapses first.

    If this `Task` and the duration happen to have the same duration, `timeout`
    will favor this `Task` over the timeout.

    @param timerOrMs A {@linkcode Timer} or a number of milliseconds to wait for
      this task before timing out.
    @returns A `Task` which has the resolution value of `this` or a `Timeout`
      if the timer elapsed.
   */
  timeout(timerOrMs: Timer | number): Task<T, E | Timeout> {
    let timerTask = typeof timerOrMs === 'number' ? timer(timerOrMs) : timerOrMs;
    let timeout = timerTask.andThen((ms) => Task.reject(new Timeout(ms)));
    return race([this as Task<T, E>, timeout]);
  }

  /**
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
   */
  toPromise(): Promise<Result<T, E>> {
    return this.#promise;
  }
}

/**
  An unknown {@linkcode Task}. This is a private type utility; it is only
  exported for the sake of internal tests.

  @internal
 */
export type AnyTask = Task<unknown, unknown>;

export type TaskTypesFor<A extends readonly AnyTask[]> = [
  { -readonly [P in keyof A]: ResolvesTo<A[P]> },
  { -readonly [P in keyof A]: RejectsWith<A[P]> },
];

/**
  The resolution type for a given {@linkcode Task}.
  @internal
 */
export type ResolvesTo<T extends AnyTask> = TypesFor<T>['resolution'];

/**
  The rejection type for a given {@linkcode Task}
  @internal
 */
export type RejectsWith<T extends AnyTask> = TypesFor<T>['rejection'];

/**
  Create a {@linkcode Task} which will resolve to {@linkcode Unit} after a set
  interval. (Safely wraps [`setTimeout`][setTimeout].)

  [setTimeout]: https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout

  This can be combined with the {@linkcode Task.timeout} instance method.

  @param ms The number of milliseconds to wait before resolving the `Task`.
  @returns a Task which resolves to the passed-in number of milliseconds.
 */
export function timer(ms: number): Timer {
  return new Task((resolve) => setTimeout(() => resolve(ms), ms)) as Timer;
}

/**
  A type utility for mapping an input array of tasks into the appropriate output
  for `all`.

  @internal
 */
export type All<A extends readonly AnyTask[]> = Task<
  [...TaskTypesFor<A>[0]],
  TaskTypesFor<A>[1][number]
>;

/**
  Given an array of tasks, return a new `Task` which resolves once all tasks
  successfully resolve or any task rejects.

  ## Examples

  Once all tasks resolve:

  ```ts
  import { all, timer } from 'true-myth/task';

  let allTasks = all([
    timer(10),
    timer(100),
    timer(1_000),
  ]);

  let result = await allTasks;
  console.log(result.toString()); // [Ok(10,100,1000)]
  ```

  If any tasks do *not* resolve:

  ```ts
  let { task: willReject, reject } = Task.withResolvers<never, string>();

  let allTasks = all([
    timer(10),
    timer(20),
    willReject,
  ]);

  reject("something went wrong");
  let result = await allTasks;
  console.log(result.toString()); // Err("something went wrong")
  ```

  @param tasks The list of tasks to wait on.

  @template A The type of the array or tuple of tasks.
*/
export function all(tasks: []): Task<[], never>;
// This overload uses a variadic generic `[...A]` in both parameter and return
// position to correctly
export function all<A extends readonly AnyTask[]>(tasks: readonly [...A]): All<[...A]>;
export function all<A extends readonly AnyTask[]>(tasks: A): Task<unknown, unknown> {
  if (tasks.length === 0) {
    return Task.resolve([]);
  }

  let total = tasks.length;
  let oks = Array.from({ length: tasks.length });
  let resolved = 0;
  let hasRejected = false;

  return new Task((resolve, reject) => {
    // Because all tasks will *always* resolve, we need to manage this manually,
    // rather than using `Promise.all`, so that we produce a rejected `Task` as
    // soon as *any* `Task` rejects.
    for (let [idx, task] of tasks.entries()) {
      // Instead, each `Task` wires up handlers for resolution and rejection.
      task.match({
        // If it rejected, then check whether one of the other tasks has already
        // rejected. If so, there is nothing to do. Otherwise, *this* task is
        // the first to reject, so we reject the overall `Task` with the reason
        // for this one, and flag that the `Task` is rejected.
        Rejected: (reason) => {
          if (hasRejected) {
            return;
          }

          hasRejected = true;
          reject(reason);
        },

        // If it resolved, the same rule applies if one of the other tasks has
        // rejected, because the`Task` for this `any` will already be rejected
        // with that task’s rejection reason. Otherwise, we will add this value
        // to the bucket of resolutions, and track whether *all* the tasks have
        // resolved. If or when we get to that point, we resolve with the full
        // set of values.
        Resolved: (value) => {
          if (hasRejected) {
            return;
          }

          oks[idx] = value;
          resolved += 1;
          if (resolved === total) {
            resolve(oks);
          }
        },
      });
    }
  });
}

/**
  @internal
*/
export type Settled<A extends readonly AnyTask[]> = {
  -readonly [P in keyof A]: Result<ResolvesTo<A[P]>, RejectsWith<A[P]>>;
};

/**
  Given an array of tasks, return a new {@linkcode Task} which resolves once all
  of the tasks have either resolved or rejected. The resulting `Task` is a tuple
  or array corresponding exactly to the tasks passed in, either resolved or
  rejected.

  ## Example

  Given a mix of resolving and rejecting tasks:

  ```ts
  let settledTask = allSettled([
    Task.resolve<string, number>("hello"),
    Task.reject<number, boolean>(true),
    Task.resolve<{ fancy: boolean }>, Error>({ fancy: true }),
  ]);

  let output = await settledTask;
  if (output.isOk) { // always true, not currently statically knowable
    for (let result of output.value) {
      console.log(result.toString());
    }
  }
  ```

  The resulting output will be:

  ```
  Ok("hello"),
  Err(true),
  Ok({ fancy: true }),
  ```

  @param tasks The tasks to wait on settling.

  @template A The type of the array or tuple of tasks.
 */
export function allSettled<A extends readonly AnyTask[]>(tasks: A): Task<Settled<A>, never>;
export function allSettled(tasks: AnyTask[]): Task<unknown, never> {
  // All task promises should resolve; none should ever reject, by definition.
  // The “settled” state here is represented by the `Task` itself, *not* by the
  // `Promise` rejection. This means the logic of `allSettled` is actually just
  // `Promise.all`!
  return new Task((resolve) => {
    Promise.all(tasks).then(resolve);
  });
}

/**
  Given an array of tasks, return a new {@linkcode Task} which resolves once
  _any_ of the tasks resolves successfully, or which rejects once _all_ the
  tasks have rejected.

  ## Examples

  When any item resolves:

  ```ts
  import { any, timer } from 'true-myth/task';

  let anyTask = any([
    timer(20),
    timer(10),
    timer(30),
  ]);

  let result = await anyTask;
  console.log(result.toString()); // Ok(10);
  ```

  When all items reject:

  ```ts
  import Task, { timer } from 'true-myth/task';

  let anyTask = any([
    timer(20).andThen((time) => Task.reject(`${time}ms`)),
    timer(10).andThen((time) => Task.reject(`${time}ms`)),
    timer(30).andThen((time) => Task.reject(`${time}ms`)),
  ]);

  let result = await anyTask;
  console.log(result.toString()); // Err(AggregateRejection: `Task.race`: 10ms,20ms,30ms)
  ```

  The order in the resulting `AggregateRejection` is guaranteed to be stable and
  to match the order of the tasks passed in.

  @param tasks The set of tasks to check for any resolution.
  @returns A Task which is either {@linkcode Resolved} with the value of the
    first task to resolve, or {@linkcode Rejected} with the rejection reasons
    for all the tasks passed in in an {@linkcode AggregateRejection}. Note that
    the order of the rejection reasons is not guaranteed.

  @template A The type of the array or tuple of tasks.
*/
export function any(tasks: []): Task<never, AggregateRejection<[]>>;
export function any<A extends readonly AnyTask[]>(
  tasks: readonly [...A]
): Task<TaskTypesFor<A>[0][number], AggregateRejection<[...TaskTypesFor<A>[1]]>>;
// export function all<A extends readonly AnyTask[]>(tasks: readonly [...A]): All<[...A]>;
export function any(tasks: readonly [] | readonly AnyTask[]): AnyTask {
  if (tasks.length === 0) {
    return Task.reject(new AggregateRejection([]));
  }

  let total = tasks.length;
  let hasResolved = false;
  let rejections = Array.from({ length: tasks.length });
  let rejected = 0;

  return new Task((resolve, reject) => {
    // We cannot use `Promise.any`, because it will only return the first `Task`
    // that resolves, and the `Promise` for a `Task` *always* either resolves if
    // it settles.
    for (let [idx, task] of tasks.entries()) {
      // Instead, each `Task` wires up handlers for resolution and rejection.
      task.match({
        // If it resolved, then check whether one of the other tasks has already
        // resolved. If so, there is nothing to do. Otherwise, *this* task is
        // the first to resolve, so we resolve the overall `Task` with the value
        // for this one, and flag that the `Task` is resolved.
        Resolved: (value) => {
          if (hasResolved) {
            return;
          }

          hasResolved = true;
          resolve(value);
        },

        // If it rejected, the same rule applies if one of the other tasks has
        // successfully resolved, because the`Task` for this `any` will already
        // have resolved to that task. Otherwise, we will add this rejection to
        // the bucket of rejections, and track whether *all* the tasks have
        // rejected. If or when we get to that point, we reject with the full
        // set of rejections.
        Rejected: (reason) => {
          if (hasResolved) {
            return;
          }

          rejections[idx] = reason;
          rejected += 1;

          if (rejected === total) {
            reject(new AggregateRejection(rejections));
          }
        },
      });
    }
  });
}

/**
  Given an array of tasks, produce a new {@linkcode Task} which will resolve or
  reject with the resolution or rejection of the *first* task which settles.

  ## Example

  ```ts
  import Task, { race } from 'true-myth/task';

  let { task: task1, resolve } = Task.withResolvers();
  let task2 = new Task((_resolve) => {});
  let task3 = new Task((_resolve) => {});

  resolve("Cool!");
  let theResult = await race([task1, task2, task3]);
  console.log(theResult.toString()); // Ok("Cool!")
  ```

  @param tasks The tasks to race against each other.

  @template A The type of the array or tuple of tasks.
 */
export function race(tasks: []): Task<never, never>;
export function race<A extends readonly AnyTask[]>(
  tasks: A
): Task<TaskTypesFor<A>[0][number], TaskTypesFor<A>[1][number]>;
export function race(tasks: [] | AnyTask[]): AnyTask {
  if (tasks.length === 0) {
    return new Task(() => {
      /* pending forever, just like `Promise.race` */
    });
  }

  return new Task((resolve, reject) => {
    Promise.race(tasks).then((result) =>
      result.match({
        Ok: resolve,
        Err: reject,
      })
    );
  });
}

/**
  An error type produced when {@linkcode any} produces any rejections. All
  rejections are aggregated into this type.

  > [!NOTE]
  > This error type is not allowed to be subclassed.

  @template E The type of the rejection reasons.
*/
export class AggregateRejection<E extends unknown[]> extends Error {
  readonly name = 'AggregateRejection';

  constructor(readonly errors: E) {
    super('`Task.race`');
  }

  toString() {
    let internalMessage = this.errors.length > 0 ? `[${safeToString(this.errors)}]` : 'No tasks';
    return super.toString() + `: ${internalMessage}`;
  }
}

/**
  A {@linkcode Task Task<T, E>} that has not yet resolved.

  @template T The type of the value when the `Task` resolves successfully.
  @template E The type of the rejection reason when the `Task` rejects.

  @group Task Variants
 */
export interface Pending<T, E> extends Omit<TaskImpl<T, E>, 'value' | 'reason'> {
  get isPending(): true;
  get isResolved(): false;
  get isRejected(): false;
  get state(): typeof State.Pending;
}

/**
  A {@linkcode Task Task<T, E>} that has resolved. Its `value` is of type `T`.

  @template T The type of the value when the `Task` resolves successfully.
  @template E The type of the rejection reason when the `Task` rejects.

  @group Task Variants
 */
export interface Resolved<T, E> extends Omit<TaskImpl<T, E>, 'reason'> {
  get isPending(): false;
  get isResolved(): true;
  get isRejected(): false;
  get state(): typeof State.Resolved;
  get value(): T;
}

/**
  A {@linkcode Task Task<T, E>} that has rejected. Its `reason` is of type `E`.

  @template T The type of the value when the `Task` resolves successfully.
  @template E The type of the rejection reason when the `Task` rejects.

  @group Task Variants
 */
export interface Rejected<T, E> extends Omit<TaskImpl<T, E>, 'value'> {
  get isPending(): false;
  get isResolved(): false;
  get isRejected(): true;
  get state(): typeof State.Rejected;
  get reason(): E;
}

export const State = {
  Pending: 'Pending',
  Resolved: 'Resolved',
  Rejected: 'Rejected',
} as const;

type State = (typeof State)[keyof typeof State];

type Repr<T, E> =
  | [tag: typeof State.Pending]
  | [tag: typeof State.Resolved, value: T]
  | [tag: typeof State.Rejected, reason: E];

/** Type returned by calling {@linkcode Task.withResolvers} */
export type WithResolvers<T, E> = {
  task: Task<T, E>;
  resolve: (value: T) => void;
  reject: (reason: E) => void;
};

/**
  A lightweight object defining how to handle each outcome state of a
  {@linkcode Task}.
 */
export type Matcher<T, E, A> = {
  Resolved: (value: T) => A;
  Rejected: (reason: E) => A;
};

/**
  The error thrown when an error is thrown in the executor passed to {@linkcode
  Task.constructor}. This error class exists so it is clear exactly what went
  wrong in that case.

  @group Errors
 */
export class TaskExecutorException extends Error {
  name = 'TrueMyth.Task.ThrowingExecutor';

  constructor(originalError: unknown) {
    super(
      'The executor for `Task` threw an error. This cannot be handled safely.',
      // TODO (v9.0): remove this.
      // @ts-ignore -- the types for `cause` required `Error | undefined` for a
      // while before being loosened to allow `unknown`.
      { cause: originalError }
    );
  }
}

/**
  An error thrown when the `Promise<Result<T, E>>` passed to
  {@link fromUnsafePromise} rejects.

  @group Errors
*/
export class UnsafePromise extends Error {
  readonly name = 'TrueMyth.Task.UnsafePromise';

  constructor(unhandledError: unknown) {
    let explanation =
      'If you see this message, it means someone constructed a True Myth `Task` with a `Promise<Result<T, E>` but where the `Promise` could still reject. To fix it, make sure all calls to `Task.fromUnsafePromise` have a `catch` handler. Never use `Task.fromUnsafePromise` with a `Promise` on which you cannot verify by inspection that it was created with a catch handler.';

    super(
      `Called 'Task.fromUnsafePromise' with an unsafe promise.\n${explanation}`,
      // TODO (v9.0): remove this.
      // @ts-ignore -- the types for `cause` required `Error | undefined` for a
      // while before being loosened to allow `unknown`.
      { cause: unhandledError }
    );
  }
}

export class InvalidAccess extends Error {
  readonly name = 'TrueMyth.Task.InvalidAccess';
  constructor(field: 'value' | 'reason', state: State) {
    super(`Tried to access 'Task.${field}' when its state was '${state}'`);
  }
}

/** @inheritdoc Task.tryOr */
export const tryOr = TaskImpl.tryOr;

/** @inheritdoc Task.tryOrElse */
export const tryOrElse = TaskImpl.tryOrElse;

/* v8 ignore next 3 */
function unreachable(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

/**
  The public interface for the {@linkcode Task} class *as a value*: a
  constructor and the associated static properties.
 */
export interface TaskConstructor extends Omit<typeof TaskImpl, 'constructor'> {
  /**
    Construct a new `Task`, using callbacks to wrap APIs which do not natively
    provide a `Promise`.

    This is identical to the [Promise][promise] constructor, with one very
    important difference: rather than producing a value upon resolution and
    throwing an exception when a rejection occurs like `Promise`, a `Task`
    always “succeeds” in producing a usable value, just like {@linkcode Result}
    for synchronous code.

    [promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise

    For constructing a `Task` from an existing `Promise`, see:

    - {@linkcode fromPromise}
    - {@linkcode safelyTry}
    - {@linkcode safelyTryOr}
    - {@linkcode safelyTryOrElse}

    For constructing a `Task` immediately resolved or rejected with given
    values, see {@linkcode Task.resolve} and {@linkcode Task.reject}
    respectively.

    @param executor A function which the constructor will execute to manage
      the lifecycle of the `Task`. The executor in turn has two functions as
      parameters: one to call on resolution, the other on rejection.
   */
  new <T, E>(
    executor: (resolve: (value: T) => void, reject: (reason: E) => void) => void
  ): Task<T, E>;
}

// Duplicate documentation because it will show up more nicely when rendered in
// TypeDoc than if it applies to only one or the other; using `@inheritdoc` will
// also work but works less well in terms of how editors render it (they do not
// process that “directive” in general).
/**
  A `Task` is a type safe asynchronous computation.

  You can think of a `Task<T, E>` as being basically a `Promise<Result<T, E>>`,
  because it *is* a `Promise<Result<T, E>>` under the hood, but with two main
  differences from a “normal” `Promise`:

  1. A `Task` *cannot* “reject”. All errors must be handled. This means that,
     like a {@linkcode Result}, it will *never* throw an error if used in
     strict TypeScript.

  2. Unlike `Promise`, `Task` robustly distinguishes between `map` and `andThen`
     operations.

  `Task` also implements JavaScript’s `PromiseLike` interface, so you can
  `await` it; when a `Task<T, E>` is awaited, it produces a {@linkcode result
  Result<T, E>}.

  @class
 */
export const Task = TaskImpl as TaskConstructor;

/**
  A `Task` is a type safe asynchronous computation.

  You can think of a `Task<T, E>` as being basically a `Promise<Result<T, E>>`,
  because it *is* a `Promise<Result<T, E>>` under the hood, but with two main
  differences from a “normal” `Promise`:

  1. A `Task` *cannot* “reject”. All errors must be handled. This means that,
     like a {@linkcode Result}, it will *never* throw an error if used in
     strict TypeScript.

  2. Unlike `Promise`, `Task` robustly distinguishes between `map` and `andThen`
     operations.

  `Task` also implements JavaScript’s `PromiseLike` interface, so you can
  `await` it; when a `Task<T, E>` is awaited, it produces a {@linkcode result
  Result<T, E>}.

  @class

  @template T The type of the value when the `Task` resolves successfully.
  @template E The type of the rejection reason when the `Task` rejects.
 */
export type Task<T, E> = Pending<T, E> | Resolved<T, E> | Rejected<T, E>;
export default Task;

// Branded timer type.
declare const PhantomData: unique symbol;

/** @internal */
export declare class Phantom<T extends PropertyKey> {
  private readonly [PhantomData]: T;
}

/**
  A {@linkcode Task} specialized for use with {@linkcode timeout} or other
  methods or functions which want to know they are using.

  > [!NOTE]
  > This type has zero runtime overhead, including for construction: it is just
  > a `Task` with additional *type information*.
 */
export type Timer = Task<number, never> & Phantom<'Timer'>;

/**
  An `Error` type representing a timeout, as when a {@linkcode Timer} elapses.
 */
class Timeout extends Error {
  readonly #duration: number;

  get duration(): number {
    return this.#duration;
  }

  constructor(readonly ms: number) {
    super(`Timed out after ${ms} milliseconds`);
    this.#duration = ms;
  }
}

// Export *only* the type side (at least until we hear of a reason to do
// otherwise): people ought not be subclassing or instantiating `Timeout`!
export type { Timeout };

/** Standalone function version of {@linkcode Task.resolve} */
export const resolve = Task.resolve;

/** Standalone function version of {@linkcode Task.reject} */
export const reject = Task.reject;

/** Standalone function version of {@linkcode Task.withResolvers} */
export const withResolvers = Task.withResolvers;

/**
  Produce a {@linkcode Task Task<T, unknown>} from a [`Promise`][mdn-promise].

  [mdn-promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

  To handle the error case and produce a `Task<T, E>` instead, use the overload
  the overload which accepts an `onRejection` handler instead.

  > [!IMPORTANT]
  > This does not (and by definition cannot) handle errors that happen during
  > construction of the `Promise`, because those happen before this is called.
  > See {@linkcode safelyTry}, {@linkcode safelyTryOr}, or
  > {@linkcode safelyTryOrElse} for alternatives which accept a callback for
  > constructing a promise and can therefore handle errors thrown in the call.

  @param promise The promise from which to create the `Task`.

  @template T The type the `Promise` would resolve to, and thus that the `Task`
    will also resolve to if the `Promise` resolves.

  @group Constructors
 */
export function fromPromise<T>(promise: Promise<T>): Task<T, unknown>;
/**
  Produce a {@linkcode Task Task<T, E>} from a [`Promise`][mdn-promise], using a
  .

  [mdn-promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

  To absorb all errors/rejections as `unknown`, use the overload without an
  `onRejection` handler instead.

  > [!IMPORTANT]
  > This does not (and by definition cannot) handle errors that happen during
  > construction of the `Promise`, because those happen before this is called.
  > See {@linkcode safelyTry}, {@linkcode safelyTryOr}, or
  > {@linkcode safelyTryOrElse} for alternatives which accept a callback for
  > constructing a promise and can therefore handle errors thrown in the call.

  @param promise The promise from which to create the `Task`.
  @param onRejection Transform errors from `unknown` to a known error type.

  @template T The type the `Promise` would resolve to, and thus that the `Task`
    will also resolve to if the `Promise` resolves.
  @template E The type of a rejected `Task` if the promise rejects.

  @group Constructors
 */
export function fromPromise<T, E>(
  promise: Promise<T>,
  onRejection: (reason: unknown) => E
): Task<T, E>;
export function fromPromise<T>(
  promise: Promise<T>,
  onRejection?: (reason: unknown) => unknown
): Task<T, unknown> {
  let handleError = onRejection ?? identity;
  return new Task((resolve, reject) => {
    promise.then(resolve, (reason) => reject(handleError(reason)));
  });
}

/**
  Build a {@linkcode Task Task<T, E>} from a {@linkcode Result Result<T, E>}.

  > [!IMPORTANT]
  > This does not (and by definition cannot) handle errors that happen during
  > construction of the `Result`, because those happen before this is called.
  > See {@linkcode tryOr} and {@linkcode tryOrElse} as well as the corresponding
  > {@linkcode "result".tryOr result.tryOr} and {@linkcode "result".tryOrElse
  > result.tryOrElse} methods for synchronous functions.

  ## Examples

  Given an {@linkcode "result".Ok Ok<T, E>}, `fromResult` will produces a
  {@linkcode Resolved Resolved<T, E>} task.

  ```ts
  import { fromResult } from 'true-myth/task';
  import { ok } from 'true-myth/result';

  let successful = fromResult(ok("hello")); // -> Resolved("hello")
  ```

  Likewise, given an `Err`, `fromResult` will produces a {@linkcode Rejected}
  task.

  ```ts
  import { fromResult } from 'true-myth/task';
  import { err } from 'true-myth/result';

  let successful = fromResult(err("uh oh!")); // -> Rejected("uh oh!")
  ```

  It is often clearest to access the function via a namespace-style import:

  ```ts

  import * as Task from 'true-myth/task';
  import { ok } from 'true-myth/result';

  let theTask = Task.fromResult(ok(123));
  ```

  As an alternative, it can be useful to rename the import:

  ```ts
  import { fromResult: taskFromResult } from 'true-myth/task';
  import { err } from 'true-myth/result';

  let theTask = taskFromResult(err("oh no!"));
  ```
 */
export function fromResult<T, E>(result: Result<T, E>): Task<T, E> {
  return new Task((resolve, reject) =>
    result.match({
      Ok: resolve,
      Err: reject,
    })
  );
}

/**
  Produce a `Task<T, E>` from a promise of a {@linkcode Result Result<T, E>}.

  > [!WARNING]
  > This constructor assumes you have already correctly handled the promise
  > rejection state, presumably by mapping it into the wrapped `Result`. It is
  > *unsafe* for this promise ever to reject! You should only ever use this
  > with `Promise<Result<T, E>>` you have created yourself (including via a
  > `Task`, of course).
  >
  > For any other `Promise<Result<T, E>>`, you should first attach a `catch`
  > handler which will also produce a `Result<T, E>`.
  >
  > If you call this with an unmanaged `Promise<Result<T, E>>`, that is, one
  > that has *not* correctly set up a `catch` handler, the rejection will
  > throw an {@linkcode UnsafePromise} error that will ***not*** be catchable
  > by awaiting the `Task` or its original `Promise`. This can cause test
  > instability and unpredictable behavior in your application.

  @param promise The promise from which to create the `Task`.

  @group Constructors
 */
export function fromUnsafePromise<T, E>(promise: Promise<Result<T, E>>): Task<T, E> {
  return new Task((resolve, reject) => {
    promise.then(
      matchResult({
        Ok: resolve,
        Err: reject,
      }),
      (rejectionReason: unknown) => {
        throw new UnsafePromise(rejectionReason);
      }
    );
  });
}

/**
  Given a function which takes no arguments and returns a `Promise`, return a
  {@linkcode Task Task<T, unknown>} for the result of invoking that function.
  This safely handles functions which fail synchronously or asynchronously, so
  unlike {@linkcode Task.try} is safe to use with values which may throw errors
  _before_ producing a `Promise`.

  ## Examples

  ```ts
  import { safelyTry } from 'true-myth/task';

  function throws(): Promise<T> {
    throw new Error("Uh oh!");
  }

  // Note: passing the function by name, *not* calling it.
  let theTask = safelyTry(throws);
  let theResult = await theTask;
  console.log(theResult.toString()); // Err(Error: Uh oh!)
  ```

  @param fn A function which returns a `Promise` when called.
  @returns A `Task` which resolves to the resolution value of the promise or
    rejects with the rejection value of the promise *or* any error thrown while
    invoking `fn`.
 */
export function safelyTry<T>(fn: () => Promise<T>): Task<T, unknown> {
  return new Task((resolve, reject) => {
    try {
      fn().then(resolve, reject);
    } catch (e) {
      reject(e);
    }
  });
}

/**
  Given a function which takes no arguments and returns a `Promise` and a value
  of type `E` to use as the rejection if the `Promise` rejects, return a
  {@linkcode Task Task<T, E>} for the result of invoking that function. This
  safely handles functions which fail synchronously or asynchronously, so unlike
  {@linkcode fromPromise} is safe to use with values which may throw errors
  _before_ producing a `Promise`.

  ## Examples

  ```ts
  import { safelyTryOr } from 'true-myth/task';

  function throws(): Promise<number> {
    throw new Error("Uh oh!");
  }

  // Note: passing the function by name, *not* calling it.
  let theTask = safelyTryOr("fallback", throws);
  let theResult = await theTask;
  if (theResult.isErr) {
    console.error(theResult.error); // "fallback"
  }
  ```

  You can also write this in “curried” form, passing just the fallback value and
  getting back a function which accepts the:

  ```ts
  import { safelyTryOr } from 'true-myth/task';

  function throws(): Promise<number> {
    throw new Error("Uh oh!");
  }

  // Note: passing the function by name, *not* calling it.
  let withFallback = safelyTryOr<number, string>("fallback");
  let theResult = await withFallback(throws);
  if (theResult.isErr) {
    console.error(theResult.error); // "fallback"
  }
  ```

  Note that in the curried form, you must specify the expected `T` type of the
  resulting `Task`, or else it will always be `unknown`.

  @param rejection The value to use if the `Promise` rejects.
  @param fn A function which returns a `Promise` when called.
  @returns A `Task` which resolves to the resolution value of the promise or
    rejects with the rejection value of the promise *or* any error thrown while
    invoking `fn`.
*/
export function safelyTryOr<T, E>(rejection: E, fn: () => Promise<T>): Task<T, E>;
export function safelyTryOr<T, E>(rejection: E): (fn: () => Promise<T>) => Task<T, E>;
export function safelyTryOr<T, E>(
  rejection: E,
  fn?: () => Promise<T>
): Task<T, E> | ((fn: () => Promise<T>) => Task<T, E>) {
  const op = (curriedFn: () => Promise<T>): Task<T, E> =>
    new Task((resolve, reject) => {
      try {
        curriedFn().then(resolve, (_reason) => reject(rejection));
      } catch (_e) {
        reject(rejection);
      }
    });

  return curry1(op, fn);
}

/**
  Given a function which takes no arguments and returns a `PromiseLike` and a
  function which accepts an `unknown` rejection reason and transforms it into a
  known rejection type `E`, return a {@linkcode Task Task<T, E>} for the result
  of invoking that function. This safely handles functions which fail
  synchronously or asynchronously, so unlike {@linkcode fromPromise} is safe to
  use with values which may throw errors _before_ producing a `Promise`.

  ## Examples

  ```ts
  import { safelyTryOrElse } from 'true-myth/task';

  function throws(): Promise<number> {
    throw new Error("Uh oh!");
  }

  // Note: passing the function by name, *not* calling it.
  let theTask = safelyTryOrElse(
    (reason) => `Something went wrong: ${reason}`,
    throws
  );
  let theResult = await theTask;
  console.log(theResult.toString); // Err("Something went wrong: Error: Uh oh!")
  ```

  You can also write this in “curried” form, passing just the fallback value and
  getting back a function which accepts the:

  ```ts
  import { safelyTryOrElse } from 'true-myth/task';

  function throws(): Promise<number> {
    throw new Error("Uh oh!");
  }

  // Note: passing the function by name, *not* calling it.
  let withFallback = safelyTryOrElse<number, string>(
    (reason) => `Something went wrong: ${reason}`
  );
  let theResult = await withFallback(throws);
  console.log(theResult.toString); // Err("Something went wrong: Error: Uh oh!")
  ```

  Note that in the curried form, you must specify the expected `T` type of the
  resulting `Task`, or else it will always be `unknown`.

  @param onError The function to use to transform the rejection reasons if the
    `PromiseLike` produced by `fn` rejects.
  @param fn A function which returns a `PromiseLike` when called.
  @returns A `Task` which resolves to the resolution value of the promise or
    rejects with the rejection value of the promise *or* any error thrown while
    invoking `fn`.
*/
export function safelyTryOrElse<T, E>(
  onError: (reason: unknown) => E,
  fn: () => PromiseLike<T>
): Task<T, E>;
export function safelyTryOrElse<T, E>(
  onError: (reason: unknown) => E
): (fn: () => PromiseLike<T>) => Task<T, E>;
export function safelyTryOrElse<T, E>(
  onError: (reason: unknown) => E,
  fn?: () => PromiseLike<T>
): Task<T, E> | ((fn: () => Promise<T>) => Task<T, E>) {
  const op = (fn: () => PromiseLike<T>): Task<T, E> =>
    new Task((resolve, reject) => {
      try {
        fn().then(resolve, (reason) => reject(onError(reason)));
      } catch (error) {
        reject(onError(error));
      }
    });

  return curry1(op, fn);
}

/**
  Given a function which returns a `Promise`, return a new function with the
  same parameters but which returns a {@linkcode Task} instead.

  If you wish to transform the error directly, rather than with a combinator,
  see the other overload, which accepts an error handler.

  ## Examples

  You can use this to create a safe version of the `fetch` function, which will
  produce a `Task` instead of a `Promise` and which does not throw an error for
  rejections, but instead produces a {@Rejected} variant of the `Task`.

  ```ts
  import { safe } from 'true-myth/task';

  const fetch = safe(window.fetch);
  const toJson = safe((response: Response) => response.json() as unknown);
  let json = fetch('https://www.example.com/api/users').andThen(toJson);
  ```

  @param fn A function to wrap so it never throws an error or produces a
    `Promise` rejection.
*/
export function safe<
  F extends (...params: never[]) => PromiseLike<unknown>,
  P extends Parameters<F>,
  R extends Awaited<ReturnType<F>>,
  >(fn: F): (...params: P) => Task<R, unknown>;
/**
  Given a function which returns a `Promise` and a function to transform thrown
  errors or `Promise` rejections resulting from calling that function, return a
  new function with the same parameters but which returns a {@linkcode Task}.

  To catch all errors but leave them unhandled and `unknown`, see the other
  overload.

  ## Examples

  You can use this to create a safe version of the `fetch` function, which will
  produce a `Task` instead of a `Promise` and which does not throw an error for
  rejections, but instead produces a {@Rejected} variant of the `Task`.

  ```ts
  import { safe } from 'true-myth/task';

  class CustomError extends Error {
    constructor(name: string, cause: unknown) {
      super(`my-lib.error.${name}`, { cause });
      this.name = name;
    }
  }

  function handleErr(name: string): (cause: unknown) => CustomError {
    return (cause) => new CustomError(name);
  }

  const fetch = safe(window.fetch, handleErr('fetch'));
  const toJson = safe(
    (response: Response) => response.toJson(),
    handleErr('json-parsing')
  );

  let json = fetch('https://www.example.com/api/users').andThen(toJson);
  ```

  @param fn A function to wrap so it never throws an error or produces a
    `Promise` rejection.
  @param onError A function to use to transform the
*/
export function safe<
  F extends (...params: never[]) => PromiseLike<unknown>,
  P extends Parameters<F>,
  R extends Awaited<ReturnType<F>>,
  E,
  >(fn: F, onError: (reason: unknown) => E): (...params: P) => Task<R, E>;
export function safe<
  F extends (...params: never[]) => PromiseLike<unknown>,
  P extends Parameters<F>,
  E,
  >(fn: F, onError?: (reason: unknown) => E): (...params: P) => Task<unknown, unknown> {
  let handleError = onError ?? identity;
  return (...params) => safelyTryOrElse(handleError, () => fn(...params));
}

/**
  Given a function which returns a `Promise` of a nullable type, return
  a new function with the same parameters but which returns a {@linkcode
  Task} of a {@linkcode Maybe} instead.

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

  @param fn A function to wrap so it never throws an error or produces a
    `Promise` rejection.
*/
export function safeNullable<
  F extends (...params: never[]) => PromiseLike<unknown>,
  P extends Parameters<F>,
  R extends Awaited<ReturnType<F>>,
  >(fn: F): (...params: P) => Task<Maybe<NonNullable<R>>, unknown>;
/**
  Given a function which returns a `Promise` and a function to transform thrown
  errors or `Promise` rejections resulting from calling that function, return a
  new function with the same parameters but which returns a {@linkcode Task}.

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

  @param fn A function to wrap so it never throws an error or produces a
    `Promise` rejection.
  @param onError A function to use to transform the
*/
export function safeNullable<
  F extends (...params: never[]) => PromiseLike<unknown>,
  P extends Parameters<F>,
  R extends Awaited<ReturnType<F>>,
  E,
  >(fn: F, onError: (reason: unknown) => E): (...params: P) => Task<Maybe<NonNullable<R>>, E>;
export function safeNullable<
  F extends (...params: never[]) => PromiseLike<unknown>,
  P extends Parameters<F>,
  R extends Awaited<ReturnType<F>>,
  E,
  >(fn: F, onError?: (reason: unknown) => E): (...params: P) => Task<Maybe<NonNullable<R>>, unknown> {
  let handleError = onError ?? identity;
  return (...params) =>
    safelyTryOrElse(handleError, async () => {
      let theValue = (await fn(...params)) as R;
      return Maybe.of(theValue) as Maybe<NonNullable<R>>;
    });
}

/**
  Auto-curried, standalone function form of
  {@linkcode Task.map Task.prototype.map}.

  > [!TIP]
  > The auto-curried version is provided for parity with the similar functions
  > that the `Maybe` and `Result` modules provide. However, like `Result`, you
  > will likely find that this form is somewhat difficult to use, because
  > TypeScript’s type inference does not support it well: you will tend to end
  > up with an awful lot of `unknown` unless you write the type parameters
  > explicitly at the call site.
  >
  > The non-curried form will not have that problem, so you should prefer it.

  @template T The type of the value when the `Task` resolves successfully.
  @template E The type of the rejection reason when the `Task` rejects.
 */
export function map<T, U, E>(mapFn: (t: T) => U): (task: Task<T, E>) => Task<U, E>;
export function map<T, U, E>(mapFn: (t: T) => U, task: Task<T, E>): Task<U, E>;
export function map<T, U, E>(
  mapFn: (t: T) => U,
  task?: Task<T, E>
): Task<U, E> | ((task: Task<T, E>) => Task<U, E>) {
  return curry1((task) => task.map(mapFn), task);
}

/**
  Auto-curried, standalone function form of
  {@linkcode Task.mapRejected Task.prototype.mapRejected}.

  > [!TIP]
  > The auto-curried version is provided for parity with the similar functions
  > that the `Maybe` and `Result` modules provide. However, like `Result`, you
  > will likely find that this form is somewhat difficult to use, because
  > TypeScript’s type inference does not support it well: you will tend to end
  > up with an awful lot of `unknown` unless you write the type parameters
  > explicitly at the call site.
  >
  > The non-curried form will not have that problem, so you should prefer it.

  @template T The type of the value when the `Task` resolves successfully.
  @template E The type of the rejection reason when the `Task` rejects.
 */
export function mapRejected<T, E, F>(mapFn: (e: E) => F): (task: Task<T, E>) => Task<T, F>;
export function mapRejected<T, E, F>(mapFn: (e: E) => F, task: Task<T, E>): Task<T, F>;
export function mapRejected<T, E, F>(
  mapFn: (e: E) => F,
  task?: Task<T, E>
): Task<T, F> | ((task: Task<T, E>) => Task<T, F>) {
  return curry1((task) => task.mapRejected(mapFn), task);
}

/**
  Auto-curried, standalone function form of
  {@linkcode Task.and Task.prototype.and}.

  > [!TIP]
  > The auto-curried version is provided for parity with the similar functions
  > that the `Maybe` and `Result` modules provide. However, like `Result`, you
  > will likely find that this form is somewhat difficult to use, because
  > TypeScript’s type inference does not support it well: you will tend to end
  > up with an awful lot of `unknown` unless you write the type parameters
  > explicitly at the call site.
  >
  > The non-curried form will not have that problem, so you should prefer it.

  @template T The type of the value when the `Task` resolves successfully.
  @template E The type of the rejection reason when the `Task` rejects.
 */
export function and<T, U, E>(andTask: Task<U, E>): (task: Task<T, E>) => Task<U, E>;
export function and<T, U, E>(andTask: Task<U, E>, task: Task<T, E>): Task<U, E>;
export function and<T, U, E>(
  andTask: Task<U, E>,
  task?: Task<T, E>
): Task<U, E> | ((task: Task<T, E>) => Task<U, E>) {
  return curry1((task) => task.and(andTask), task);
}

/**
  Auto-curried, standalone function form of
  {@linkcode Task.andThen Task.prototype.andThen}.

  > [!TIP]
  > The auto-curried version is provided for parity with the similar functions
  > that the `Maybe` and `Result` modules provide. However, like `Result`, you
  > will likely find that this form is somewhat difficult to use, because
  > TypeScript’s type inference does not support it well: you will tend to end
  > up with an awful lot of `unknown` unless you write the type parameters
  > explicitly at the call site.
  >
  > The non-curried form will not have that problem, so you should prefer it.

  @template T The type of the value when the `Task` resolves successfully.
  @template E The type of the rejection reason when the `Task` rejects.
 */
export function andThen<T, E, R extends AnyTask>(
  thenFn: (t: T) => R
): (task: Task<T, E>) => Task<ResolvesTo<R>, E | RejectsWith<R>>;
export function andThen<T, U, E>(thenFn: (t: T) => U): (task: Task<T, E>) => Task<U, E>;
export function andThen<T, E, R extends AnyTask>(
  thenFn: (t: T) => R,
  task: Task<T, E>
): Task<ResolvesTo<R>, E | RejectsWith<R>>;
export function andThen<T, U, E>(thenFn: (t: T) => Task<U, E>, task: Task<T, E>): Task<U, E>;
export function andThen<T, U, E>(
  thenFn: (t: T) => Task<U, E>,
  task?: Task<T, E>
): Task<U, E> | ((task: Task<T, E>) => Task<U, E>) {
  return curry1((task) => task.andThen(thenFn), task);
}

/**
  Auto-curried, standalone function form of
  {@linkcode Task.or Task.prototype.or}.

  > [!TIP]
  > The auto-curried version is provided for parity with the similar functions
  > that the `Maybe` and `Result` modules provide. However, like `Result`, you
  > will likely find that this form is somewhat difficult to use, because
  > TypeScript’s type inference does not support it well: you will tend to end
  > up with an awful lot of `unknown` unless you write the type parameters
  > explicitly at the call site.
  >
  > The non-curried form will not have that problem, so you should prefer it.

  @template T The type of the value when the `Task` resolves successfully.
  @template E The type of the rejection reason when the `Task` rejects.
 */
export function or<U, F, T, E>(other: Task<U, F>): (task: Task<T, E>) => Task<T | U, F>;
export function or<U, F, T, E>(other: Task<U, F>, task: Task<T, E>): Task<T | U, F>;
export function or<U, F, T, E>(
  other: Task<U, F>,
  task?: Task<T, E>
): Task<T | U, F> | ((task: Task<T, E>) => Task<T | U, F>) {
  return curry1((task) => task.or(other), task);
}

/**
  Auto-curried, standalone function form of
  {@linkcode Task.orElse Task.prototype.orElse}.

  > [!TIP]
  > The auto-curried version is provided for parity with the similar functions
  > that the `Maybe` and `Result` modules provide. However, like `Result`, you
  > will likely find that this form is somewhat difficult to use, because
  > TypeScript’s type inference does not support it well: you will tend to end
  > up with an awful lot of `unknown` unless you write the type parameters
  > explicitly at the call site.
  >
  > The non-curried form will not have that problem, so you should prefer it.

  @template T The type of the value when the `Task` resolves successfully.
  @template E The type of the rejection reason when the `Task` rejects.
 */
export function orElse<T, E, F, U = T>(
  elseFn: (reason: E) => Task<U, F>
): (task: Task<T, E>) => Task<T | U, F>;
export function orElse<T, E, R extends AnyTask>(
  elseFn: (reason: E) => R
): (task: Task<T, E>) => Task<T | ResolvesTo<R>, RejectsWith<R>>;
export function orElse<T, E, F, U = T>(
  elseFn: (reason: E) => Task<U, F>,
  task: Task<T, E>
): Task<T | U, F>;
export function orElse<T, E, R extends AnyTask>(
  elseFn: (reason: E) => R,
  task: Task<T, E>
): Task<T | ResolvesTo<R>, RejectsWith<R>>;
export function orElse<T, E, F, U = T>(
  elseFn: (reason: E) => Task<U, F>,
  task?: Task<T, E>
): Task<T | U, F> | ((task: Task<T, E>) => Task<T | U, F>) {
  return curry1((task) => task.orElse(elseFn), task);
}

/**
  Auto-curried, standalone function form of
  {@linkcode Task.match Task.prototype.match}.

  > [!TIP]
  > The auto-curried version is provided for parity with the similar functions
  > that the `Maybe` and `Result` modules provide. However, like `Result`, you
  > will likely find that this form is somewhat difficult to use, because
  > TypeScript’s type inference does not support it well: you will tend to end
  > up with an awful lot of `unknown` unless you write the type parameters
  > explicitly at the call site.
  >
  > The non-curried form will not have that problem, so you should prefer it.

  @template T The type of the value when the `Task` resolves successfully.
  @template E The type of the rejection reason when the `Task` rejects.
 */
export function match<T, E, A>(matcher: Matcher<T, E, A>): (task: Task<T, E>) => Promise<A>;
export function match<T, E, A>(matcher: Matcher<T, E, A>, task: Task<T, E>): Promise<A>;
export function match<T, E, A>(
  matcher: Matcher<T, E, A>,
  task?: Task<T, E>
): Promise<A> | ((task: Task<T, E>) => Promise<A>) {
  return curry1((task) => task.match(matcher), task);
}

/**
  Auto-curried, standalone function form of
  {@linkcode Task.timeout Task.prototype.timeout}.

  > [!TIP]
  > The auto-curried version is provided for parity with the similar functions
  > that the `Maybe` and `Result` modules provide. However, like `Result`, you
  > will likely find that this form is somewhat difficult to use, because
  > TypeScript’s type inference does not support it well: you will tend to end
  > up with an awful lot of `unknown` unless you write the type parameters
  > explicitly at the call site.
  >
  > The non-curried form will not have that problem, so you should prefer it.

  @template T The type of the value when the `Task` resolves successfully.
  @template E The type of the rejection reason when the `Task` rejects.
 */
export function timeout<T, E>(
  timerOrMs: Timer | number
): (task: Task<T, E>) => Task<T, E | Timeout>;
export function timeout<T, E>(timerOrMs: Timer | number, task: Task<T, E>): Task<T, E | Timeout>;
export function timeout<T, E>(
  timerOrMs: Timer | number,
  task?: Task<T, E>
): Task<T, E | Timeout> | ((task: Task<T, E>) => Task<T, E | Timeout>) {
  return curry1((task) => task.timeout(timerOrMs), task);
}

/**
  Standalone version of {@linkcode Task.toPromise Task.prototype.toPromise}.

  @template T The type of the value when the `Task` resolves successfully.
  @template E The type of the rejection reason when the `Task` rejects.
 */
export function toPromise<T, E>(task: Task<T, E>) {
  return task.toPromise();
}

function identity<T>(value: T): T {
  return value;
}

/**
  Execute a callback that produces either a {@linkcode Task} or the “sentinel”
  [`Error`][error-mdn] subclass {@linkcode StopRetrying}. `withRetries` retries
  the `retryable` callback until the retry strategy is exhausted *or* until the
  callback returns either `StopRetrying` or a `Task` that rejects with
  `StopRetrying`. If no strategy is supplied, a default strategy of retrying
  immediately up to three times is used.

  [error-mdn]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error

  The `strategy` is any iterable iterator that produces an integral number,
  which is used as the number of milliseconds to delay before retrying the
  `retryable`. When the `strategy` stops yielding values, this will produce a
  {@linkcode Rejected} `Task` whose rejection value is an instance of
  {@linkcode RetryFailed}.

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
  import * as Task from 'true-myth/task';
  import * as Delay from 'true-myth/task/delay';

  let theTask = withRetries(
    () => Task.fromPromise(fetch('https://example.com')).andThen((res) => {
        if (res.status === 200) {
          return Task.fromPromise(res.json());
        } else if (res.status === 408) {
          return Task.reject(res.statusText);
        } else {
          return Task.stopRetrying(res.statusText);
        }
      }),
    Delay.fibonacci().map(Delay.jitter).take(10)
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
  import * as Task from 'true-myth/task';
  import { fibonacci, jitter } from 'true-myth/task/delay';
  import { doSomethingThatMayFailWithAppError } from 'someplace/in/my-app';

  let theTask = Task.withRetries(
    () => {
      doSomethingThatMayFailWithAppError().orElse((rejection) => {
        if (rejection.isFatal) {
          return Task.stopRetrying("It was fatal!", { cause: rejection });
        }

        return Task.reject(rejection);
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
  import * as Task from 'true-myth/task';
  import { exponential, jitter } from 'true-myth/task/delay';

  let theResult = await Task.withRetries(
    ({ count, elapsed }) => {
      if (count > 10) {
        return Task.stopRetrying(`Tried too many times: ${count}`);
      }

      if (elapsed > 10_000) {
        return Task.stopRetrying(`Took too long: ${elapsed}ms`);
      }

      return Task.fromPromise(fetch('https://www.example.com/'))
        .andThen((res) => Task.fromPromise(res.json()))
        .orElse((cause) => {
          let message = `Attempt #${count} failed`;
          return Task.reject(new Error(message, { cause }));
        });
    },
    exponential().map(jitter),
  );
  ```

  ### Custom strategies

  While the {@link task/delay} module supplies a number of useful strategies,
  you can also supply your own. The easiest way is to write [a generator
  function][gen], but you can also implement a custom iterable iterator,
  including by providing a subclass of the ES2025 `Iterator` class.

  Here is an example of using a generator function to produce a random but
  [monotonically increasing][monotonic] value proportional to the current
  value:

  ```ts
  import * as Task from 'true-myth/task';

  function* randomIncrease(options?: { from: number }) {
    // always use integral values, and default to one second.
    let value = options ? Math.round(options.from) : 1_000;
    while (true) {
      yield value;
      value += Math.ceil(Math.random() * value); // always increase!
    }
  }

  await Task.withRetries(({ count }) => {
    let delay = Math.round(Math.random() * 100);
    return Task.timer(delay).andThen((time) =>
      Task.reject(`Rejection #${count} after ${time}ms`),
    );
  }, randomIncrease(10).take(10));
  ```

  [monotonic]: https://en.wikipedia.org/wiki/Monotonic_function

  @param retryable A callback that produces a {@linkcode Task Task<T, E>}.
  @param strategy An iterable iterator that produces an integral number of
    milliseconds to wait before trying `retryable` again. If not supplied, the
    `retryable` will be retried immediately up to three times.

  @template T The type of a {@linkcode Resolved} {@linkcode Task}.
  @template E The type of a {@linkcode Rejected} {@linkcode Task}.
 */
export function withRetries<T, E>(
  retryable: (status: RetryStatus) => Task<T, E | StopRetrying> | StopRetrying,
  strategy: Delay.Strategy = (function* () {
    for (let i = 0; i < 3; i++) {
      yield 0;
    }
  })()
): Task<T, RetryFailed<E>> {
  const startTime = Date.now();

  let count = 0;
  let totalDuration = 0;
  let rejections = new Array<E>();

  /**
    Internal helper so the operation can recurse. Note: if you have too large a
    retry count, this *can* blow the stack; there is no trampolining here.
    However, that would be extremely unlikely in most backoff scenarios, where
    you usually take a set number of retries and/or take so long *between*
    retries.
   */
  function helper(): Task<T, RetryFailed<E>> {
    // Try it!
    let taskOrErr = retryable({ count, elapsed: totalDuration });

    if (taskOrErr instanceof Error) {
      return Task.reject(
        new RetryFailed({
          tries: count,
          totalDuration,
          rejections,
          cause: taskOrErr,
        })
      );
    }

    // On `Task` rejection, capture the rejection, then check whether the task
    // can be retried:
    //
    // - If the `Task` rejected specifically with `StopRetrying`… stop retrying.
    // - If there are no more retries available, reject with `RetryFailed`.
    // - If there are still retries available, execute the retryable on the next
    //   delay, keeping track of how many retries have been attempted and the
    //   cumulative delay of those retries.
    return taskOrErr.orElse((reason) => {
      if (reason instanceof StopRetrying) {
        return Task.reject(
          new RetryFailed({
            tries: count,
            totalDuration,
            rejections,
            cause: reason,
          })
        );
      }

      rejections.push(reason);

      let next = strategy.next();
      if (next.done) {
        return Task.reject(new RetryFailed({ tries: count, totalDuration, rejections }));
      }

      let delay = next.value;
      totalDuration += Date.now() - startTime;
      count += 1;

      return timer(delay).andThen(helper);
    });
  }

  return helper();
}

/** Information about the current retryable call status. */
export interface RetryStatus {
  /** The 0-indexed number of times the retryable has been called. */
  count: number;
  /** The total duration that has elapsed across calls. Initially 0. */
  elapsed: number;
}

/**
  A custom [`Error`][mdn-error] subclass which acts as a “sentinel”: when you
  return it either as the top-level return value from the callback for
  {@linkcode withRetries} or the rejection reason for a {@linkcode Task}
  produces by `withRetries`, the function will stop retrying immediately.

  [mdn-error]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error

  You can neither construct this class directly nor subclass it. Instead, use
  the {@linkcode stopRetrying} helper function to construct it.

  @group Errors
 */
class StopRetrying extends Error {
  get name(): string {
    return 'TrueMyth.Task.StopRetrying';
  }
}

export type { StopRetrying };

/**
  Produces the “sentinel” `Error` subclass {@linkcode StopRetrying}, for use as
  a return value from {@linkcode withRetries}.

  @param message The message to attach to the {@linkcode StopRetrying} instance.
  @param cause The previous cause (often another `Error`) that resulted in
    stopping retries.
 */
export function stopRetrying(message: string, cause?: unknown): StopRetrying {
  return new StopRetrying(message, {
    // @ts-ignore: work around a bug in older TypeScript versions where the lib
    // definitions incorrectly required `cause` to be an `Error`. That is the
    // best practice, but it is not required.
    cause,
  });
}

export const RETRY_FAILED_NAME = 'TrueMyth.Task.RetryFailed';

/**
  An [`Error`][mdn-error] subclass for when a `Task` rejected after a specified
  number of retries. It includes all rejection reasons, including the final one,
  as well as the number of retries and the total duration spent on the retries.
  It distinguishes between the list of rejections and the optional `cause`
  property inherited from `Error` so that it can indicate if the retries failed
  because the retry strategy was exhausted (in which case `cause` will be
  `undefined`) or because the caller returned a {@linkcode StopRetrying}
  instance (in which case `cause` will be that instance.)

  You can neither construct nor subclass this error, only use its properties. If
  you need to check whether an `Error` class is an instance of this class, you
  can check whether its `name` is {@linkcode RETRY_FAILED_NAME} or you can use
  the {@linkcode isRetryFailed} helper function:

  ```ts
  import * as Task from 'true-myth/task';

  // snip
  let result = await someFnThatReturnsATask();
  if (result.isErr) {
    if (isRetryFailed(result.error)) {
      if (result.error.cause) {
        console.error('You quit on purpose: ', cause);
      }

      for (let rejection of result.error.rejections) {
        console.error(rejection);
       }
    } else {
      // handle other error types
    }
  }
  ```

  [mdn-error]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error

  @group Errors
*/
class RetryFailed<E> extends Error {
  get name(): typeof RETRY_FAILED_NAME {
    return RETRY_FAILED_NAME;
  }

  readonly tries: number;
  readonly totalDuration: number;
  readonly rejections: E[];

  /** @internal */
  constructor({
    tries,
    totalDuration,
    rejections,
    cause,
  }: {
    tries: number;
    totalDuration: number;
    rejections: E[];
    cause?: Error;
  }) {
    super(
      `Stopped retrying after ${tries} tries (${totalDuration}ms)`,
      // @ts-ignore: work around a bug in older TypeScript versions where the
      // lib definitions incorrectly required `cause` to be an `Error`. That is
      // the best practice, but it is not required.
      { cause }
    );
    this.rejections = rejections;
    this.tries = tries;
    this.totalDuration = totalDuration;
  }
}

export function isRetryFailed(error: unknown): error is RetryFailed<unknown> {
  return error instanceof Error && error.name === RETRY_FAILED_NAME;
}

export type { RetryFailed };
