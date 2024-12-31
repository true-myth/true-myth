/**
  {@include doc/task.md}

  @module
 */

import { safeToString } from './-private/utils.js';
import Result, { map as mapResult, mapErr, match as matchResult } from './result.js';
import Unit from './unit.js';

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
 */
export class Task<T, E> implements Promise<Result<T, E>> {
  readonly #promise: Promise<Result<T, E>>;
  #state: Repr<T, E> = [State.Pending];

  // TODO: handle a case where the executor *throws an error itself*. That is
  // not trivial to see what should happen: in the case of `Promise`, it gets
  // folded into the resulting rejection, but it also does not have to try to
  // account for the type of the rejection!
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

    - {@linkcode Task.try}
    - {@linkcode Task.tryOr}
    - {@linkcode Task.tryOrElse}

    For constructing a `Task` immediately resolved or rejected with given
    values, see {@linkcode Task.resolved} and {@linkcode Task.rejected}
    respectively.

    @param executor A function which the constructor will execute to manage
      the lifecycle of the `Task`. The executor in turn has two functions as
      parameters: one to call on resolution, the other on rejection.
   */
  constructor(executor: (resolve: (value: T) => void, reject: (reason: E) => void) => void) {
    this.#promise = new Promise<Result<T, E>>((resolve) =>
      executor(
        (value) => {
          this.#state = [State.Resolved, value];
          resolve(Result.ok(value));
        },
        (reason) => {
          this.#state = [State.Rejected, reason];
          resolve(Result.err(reason));
        }
      )
    );
  }

  then<TResult1 = Result<T, E>, TResult2 = never>(
    onfulfilled?: ((value: Result<T, E>) => TResult1 | PromiseLike<TResult1>) | null | undefined,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined
  ): Promise<TResult1 | TResult2> {
    return this.#promise.then(onfulfilled, onrejected);
  }

  // For the semantics of this to be appropriate to `Task`, it should return
  // something a bit different: `Promise<Result<T, F>>`. As far as I can see, it
  // cannot do that while being properly substitutable (in the Liskov sense)
  // with `Promise.prototype.catch`.
  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined
  ): Promise<Result<T, E> | TResult> {
    return this.#promise.catch(onrejected);
  }

  finally(onfinally?: (() => void) | null | undefined): Task<T, E> {
    return Task.from(this.#promise.finally(onfinally));
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
   */
  static unsafeTrusted<T, E>(promise: Promise<Result<T, E>>): Task<T, E> {
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
   */
  static try<T>(promise: Promise<T>): Task<T, unknown> {
    return new Task((resolve, reject) => {
      promise.then(resolve, reject);
    });
  }

  /**
    Produce a `Task<T, E>` from a `Promise<T>` and use a fallback value if the
    task rejects, ignoring the rejection reason.

    Notes:

    - To leave any error as `unknown`, use the overload which accepts only the
      promise.
    - To handle the rejection reason rather than ignoring it, use the overload
      which accepts a function.

    @param promise The promise from which to create the `Task`.
    @param onRejection A function to transform an unknown rejection reason into
      a known `E`.

    @group Constructors
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
  static resolved<T extends Unit, E = never>(): Task<Unit, E>;
  /**
    Construct a `Task` which is already resolved. Useful when you have a value
    already, but need it to be available in an API which expects a `Task`.

    @group Constructors
   */
  static resolved<T, E = never>(value: T): Task<T, E>;
  // The implementation is intentionally vague about the types: we do not know
  // and do not care what the actual types in play are at runtime; we just need
  // to uphold the contract. Because the overload matches the types above, the
  // *call site* will guarantee the safety of the resulting types.
  static resolved(value?: {}): Task<unknown, unknown> {
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
  static rejected<T = never, E extends {} = {}>(): Task<T, Unit>;
  /**
    Construct a `Task` which is already rejected. Useful when you have an error
    already, but need it to be available in an API which expects a `Task`.

    @group Constructors
   */
  static rejected<T = never, E = unknown>(reason: E): Task<T, E>;
  // The implementation is intentionally vague about the types: we do not know
  // and do not care what the actual types in play are at runtime; we just need
  // to uphold the contract. Because the overload matches the types above, the
  // *call site* will guarantee the safety of the resulting types.
  static rejected(reason?: {}): Task<unknown, unknown> {
    // We produce `Unit` *only* in the case where no arguments are passed, so
    // that we can allow `undefined` in the cases where someone explicitly opts
    // into something like `Result<Blah, undefined>`.
    let result = arguments.length === 0 ? Unit : reason;
    return new Task((_, reject) => reject(result));
  }

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
    let resolveWith!: WithResolvers<T, E>['resolveWith'];
    let rejectWith!: WithResolvers<T, E>['rejectWith'];
    let task = new Task<T, E>((resolve, reject) => {
      resolveWith = resolve;
      rejectWith = reject;
    });
    return { task, resolveWith, rejectWith };
  }

  get state(): State {
    return this.#state[0];
  }

  isPending(): this is Pending<T, E> {
    return this.#state[0] === State.Pending;
  }

  isResolved(): this is Resolved<T, E> {
    return this.#state[0] === State.Resolved;
  }

  isRejected(): this is Rejected<T, E> {
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

    const aResolvedTask = Task.resolved(12);
    const mappedResolved = aResolvedTask.map(double);
    let resolvedResult = await aResolvedTask;
    console.log(resolvedResult.toString()); // Ok(24)

    const aRejectedTask = Task.rejected("nothing here!");
    const mappedRejected = map(double, aRejectedTask);
    let rejectedResult = await aRejectedTask;
    console.log(rejectedResult.toString()); // Err("nothing here!")
    ```

    @template T The type of the resolved value.
    @template U The type of the resolved value of the returned `Task`.
    @param mapFn The function to apply the value to when the `Task` finishes if
      it is `Resolved`.
   */
  map<U>(mapFn: (t: T) => U): Task<U, E> {
    return Task.unsafeTrusted(this.#promise.then(mapResult(mapFn)));
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

    const aResolvedTask = Task.resolved(12);
    const mappedResolved = aResolvedTask.mapErr(extractReason);
    console.log(mappedOk));  // Ok(12)

    const aRejectedTask = Task.rejected({ code: 101, reason: 'bad file' });
    const mappedRejection = await aRejectedTask.map(extractReason);
    console.log(toString(mappedRejection));  // Err("bad file")
    ```

    @template T The type of the value produced if the `Task` resolves.
    @template E The type of the rejection reason if the `Task` rejects.
    @template F The type of the rejection for the new `Task`, returned by the
      `mapFn`.
    @param mapFn The function to apply to the rejection reason if the `Task` is
      rejected.
    @param result   The `Result` instance to map over an error case for.
   */
  mapRejected<F>(mapFn: (e: E) => F): Task<T, F> {
    return Task.unsafeTrusted(this.#promise.then(mapErr(mapFn)));
  }

  /**
    You can think of this like a short-circuiting logical "and" operation on a
    {@linkcode Task}. If this `task` resolves, then the output is the task
    passed to the method. If this `task` rejects, the result is its rejection
    reason.

    This is useful when you have another `Task` value you want to provide if and
    *only if* the first task resolves successfully – that is, when you need to
    make sure that if you reject, whatever else you're handing a `Task` to
    *also* gets that {@linkcode Rejection}.

    Notice that, unlike in {@linkcode Task.map}, the original `task`
    resolution value is not involved in constructing the new `Task`.

    ## Examples

    ```ts
    let resolvedA = Task.resolved<string, string>('A');
    let resolvedB = Task.resolved<string, string>('B');
    let rejectedA = Task.rejected<string, string>('bad');
    let rejectedB = Task.rejected<string, string>('lame');

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

    @param other The `Result` instance to return if `result` is `Err`.
   */
  and<U>(other: Task<U, E>): Task<U, E> {
    return new Task((resolve, reject) => {
      this.#promise.then(
        matchResult({
          Ok: (_) => {
            other.#promise.then(
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

    The [`Promise.prototype.then`][then] method a helpful comparison: if you
    have a `Promise`, you can pass its `then` method a callback which returns
    another `Promise`, and the result will not be a *nested* promise, but a
    single `Promise`. The difference is that `Promise.prototype.then` unwraps
    *all* layers to only ever return a single `Promise` value, whereas this
    method will not unwrap nested `Task`s.

    `Promise.prototype.then` also acts the same way {@linkcode Task.map map}
    does, while `Task` distinguishes `map` from `andThen`.

    > [!NOTE] `andThen` is sometimes also known as `bind`, but *not* aliased as
    > such because [`bind` already means something in JavaScript][bind].

    [then]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then
    [bind]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind

    ## Examples

    ```ts
    import Task from 'true-myth/task';

    const toLengthAsResult = (s: string) => ok(s.length);

    const aResolvedTask = Task.resolved('just a string');
    const lengthAsResult = await aResolvedTask.andThen(toLengthAsResult);
    console.log(lengthAsResult.toString());  // Ok(13)

    const aRejectedTask = Task.rejected(['srsly', 'whatever']);
    const notLengthAsResult = await aRejectedTask.andThen(toLengthAsResult);
    console.log(notLengthAsResult.toString());  // Err(srsly,whatever)
    ```

    @template T The type of the value produced if the `Task` resolves.
    @template U The type of the value produced by the new `Task` of the `Result`
      returned by the `thenFn`.
    @template E  The type of the value wrapped in the `Err` of the `Result`.
    @param thenFn  The function to apply to the wrapped `T` if `maybe` is `Just`.
    @param result  The `Maybe` to evaluate and possibly apply a function to.
   */
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
            thenFn(value).#promise.then(
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
    `Result` always ends up getting an `Ok` variant, by supplying a default value
    for the case that you currently have an {@linkcode Err}.

    ```ts
    import { ok, err, Result, or } from 'true-utils/result';

    const okA = ok<string, string>('a');
    const okB = ok<string, string>('b');
    const anErr = err<string, string>(':wat:');
    const anotherErr = err<string, string>(':headdesk:');

    console.log(or(okB, okA).toString());  // Ok(A)
    console.log(or(anErr, okA).toString());  // Ok(A)
    console.log(or(okB, anErr).toString());  // Ok(B)
    console.log(or(anotherErr, anErr).toString());  // Err(:headdesk:)
    ```

    @template T          The type wrapped in the `Ok` case of `result`.
    @template E          The type wrapped in the `Err` case of `result`.
    @template F          The type wrapped in the `Err` case of `defaultResult`.
    @param defaultResult  The `Result` to use if `result` is an `Err`.
    @param result         The `Result` instance to check.
    @returns              `result` if it is an `Ok`, otherwise `defaultResult`.
   */
  or<F>(other: Task<T, F>): Task<T, F> {
    return new Task((resolve, reject) => {
      this.#promise.then(
        matchResult({
          Ok: resolve,
          Err: (_) => {
            other.#promise.then(
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
    `Result<T>`. It can then transform the data in the `Err` to something usable
    as an {@linkcode Ok}, or generate a new {@linkcode Err} instance as
    appropriate.

    Useful for transforming failures to usable data, for trigger retries, etc.

    @param elseFn The function to apply to the `Rejection` reason if the `Task`
      rejects, to create a new `Task`.
   */
  orElse<F>(elseFn: (reason: E) => Task<T, F>): Task<T, F> {
    return new Task((resolve, reject) => {
      this.#promise.then(
        matchResult({
          Ok: resolve,
          Err: (reason) => {
            // See the discussion in `andThen` above; this is exactly the same
            // issue, and with inverted implementation logic.
            elseFn(reason).#promise.then(
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
    @param result  The `result` instance to check.
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

/** @group Task Variants */
export interface Pending<T, E> extends Omit<Task<T, E>, 'value' | 'reason'> {
  get state(): typeof State.Pending;
}

/** @group Task Variants */
export interface Resolved<T, E> extends Omit<Task<T, E>, 'value' | 'reason'> {
  get state(): typeof State.Resolved;
  get value(): T;
}

/** @group Task Variants */
export interface Rejected<T, E> extends Omit<Task<T, E>, 'value' | 'reason'> {
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

type WithResolvers<T, E> = {
  task: Task<T, E>;
  resolveWith: (value: T) => void;
  rejectWith: (reason: E) => void;
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
  An error thrown when the `Promise` passed to {@linkcode Task.unsafeTrusted}
  rejects.
 */
export class UnsafePromise extends Error {
  readonly name = 'TrueMyth.Task.UnsafePromise';

  constructor(unhandledError: unknown) {
    let explanation =
      'If you see this message, it means someone constructed a True Myth `Task` with a `Promise<Result<T, E>` but where the `Promise` could still reject. To fix it, make sure all calls to `Task.unsafeTrusted` have a `catch` handler. Never use `Task.unsafeTrusted` with a `Promise` on which you cannot verify by inspection that it was created with a catch handler.';

    super(
      `Called 'Task.unsafeTrusted' with an unsafe promise.\n${explanation}`,
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
export const tryOr = Task.tryOr;

export const tryOrElse = Task.tryOrElse;

/* v8 ignore next 3 */
function unreachable(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

export default Task;
