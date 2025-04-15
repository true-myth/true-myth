/**
  {@include doc/result.md}

  @module
 */

import Unit from './unit.js';
import { curry1, safeToString } from './-private/utils.js';
import { AnyFunction } from './-private/utils.js';

/**
  Discriminant for {@linkcode Ok} and {@linkcode Err} variants of the
  {@linkcode Result} type.

  You can use the discriminant via the `variant` property of `Result` instances
  if you need to match explicitly on it.
 */
export const Variant = {
  Ok: 'Ok',
  Err: 'Err',
} as const;

export type Variant = keyof typeof Variant;

export interface OkJSON<T> {
  variant: 'Ok';
  value: T;
}

export interface ErrJSON<E> {
  variant: 'Err';
  error: E;
}

export type ResultJSON<T, E> = OkJSON<T> | ErrJSON<E>;

type Repr<T, E> = [tag: 'Ok', value: T] | [tag: 'Err', error: E];

declare const IsResult: unique symbol;
type AnyResult = Result<unknown, unknown>;

type SomeResult<T, E> = { [IsResult]: [T, E] };

type TypesFor<R extends AnyResult> =
  R extends SomeResult<infer T, infer E> ? { ok: T; err: E } : never;

type OkFor<R extends AnyResult> = TypesFor<R>['ok'];
type ErrFor<R extends AnyResult> = TypesFor<R>['err'];

// Defines the *implementation*, but not the *types*. See the exports below.
class ResultImpl<T, E> {
  private constructor(private repr: Repr<T, E>) {}

  declare readonly [IsResult]: [T, E];

  /**
    Create an instance of {@linkcode Ok}.

    Note that you may explicitly pass {@linkcode Unit} to the {@linkcode ok}
    constructor to create a `Result<Unit, E>`. However, you may *not* call the
    `ok` constructor with `null` or `undefined` to get that result (the type
    system won't allow you to construct it that way). Instead, for convenience,
    you can simply call {@linkcode ok `Result.ok()`}, which will construct the
    type correctly.
   */
  static ok(): Result<Unit, never>;
  /**
    @param value The value to wrap in an `Ok`.
   */
  static ok<T, E = never>(value: T): Result<T, E>;
  static ok<T, E = never>(value?: T): Result<Unit, E> | Result<T, E> {
    // We produce `Unit` *only* in the case where no arguments are passed, so
    // that we can allow `undefined` in the cases where someone explicitly opts
    // into something like `Result<undefined, Blah>`.
    return arguments.length === 0
      ? (new ResultImpl<Unit, E>(['Ok', Unit]) as Result<Unit, E>)
      : // SAFETY: TS does not understand that the arity check above accounts for
        // the case where the value is not passed.
        (new ResultImpl<T, E>(['Ok', value as T]) as Result<T, E>);
  }

  /**
    Create an instance of {@linkcode Err}.

    ```ts
    const anErr = Result.err('alas, failure');
    ```
   */
  static err<T = never, E = unknown>(): Result<T, Unit>;
  /**
    Create an instance of {@linkcode Err}.

    ```ts
    const anErr = Result.err('alas, failure');
    ```

    @param error The value to wrap in an `Err`.
   */
  static err<T = never, E = unknown>(error: E): Result<T, E>;
  static err<T = never, E = unknown>(error?: E): Result<T, Unit> | Result<T, E> {
    // We produce `Unit` *only* in the case where no arguments are passed, so
    // that we can allow `undefined` in the cases where someone explicitly opts
    // into something like `Result<undefined, Blah>`.
    return arguments.length === 0
      ? (new ResultImpl<T, Unit>(['Err', Unit]) as Result<T, Unit>)
      : // SAFETY: TS does not understand that the arity check above accounts for
        // the case where the value is not passed.
        (new ResultImpl<T, E>(['Err', error as E]) as Result<T, E>);
  }

  /** Distinguish between the {@linkcode Variant.Ok} and {@linkcode Variant.Err} {@linkcode Variant variants}. */
  get variant(): Variant {
    return this.repr[0];
  }

  /**
    The wrapped value.

    @throws if you access when the {@linkcode Result} is not {@linkcode Ok}
   */
  get value(): T | never {
    if (this.repr[0] === Variant.Err) {
      throw new Error('Cannot get the value of Err');
    }

    return this.repr[1];
  }

  /**
    The wrapped error value.

    @throws if you access when the {@linkcode Result} is not {@linkcode Err}
   */
  get error(): E | never {
    if (this.repr[0] === Variant.Ok) {
      throw new Error('Cannot get the error of Ok');
    }

    return this.repr[1];
  }

  /** Is the {@linkcode Result} an {@linkcode Ok}? */
  get isOk() {
    return this.repr[0] === Variant.Ok;
  }

  /** Is the `Result` an `Err`? */
  get isErr() {
    return this.repr[0] === Variant.Err;
  }

  /** Method variant for {@linkcode map} */
  map<U>(mapFn: (t: T) => U): Result<U, E> {
    return (this.repr[0] === 'Ok' ? Result.ok(mapFn(this.repr[1])) : this) as Result<U, E>;
  }

  /** Method variant for {@linkcode mapOr} */
  mapOr<U>(orU: U, mapFn: (t: T) => U): U {
    return this.repr[0] === 'Ok' ? mapFn(this.repr[1]) : orU;
  }

  /** Method variant for {@linkcode mapOrElse} */
  mapOrElse<U>(orElseFn: (err: E) => U, mapFn: (t: T) => U): U {
    return this.repr[0] === 'Ok' ? mapFn(this.repr[1]) : orElseFn(this.repr[1]);
  }

  /** Method variant for {@linkcode match} */
  match<A>(matcher: Matcher<T, E, A>): A {
    return this.repr[0] === 'Ok' ? matcher.Ok(this.repr[1]) : matcher.Err(this.repr[1]);
  }

  /** Method variant for {@linkcode mapErr} */
  mapErr<F>(mapErrFn: (e: E) => F): Result<T, F> {
    return (this.repr[0] === 'Ok' ? this : Result.err(mapErrFn(this.repr[1]))) as Result<T, F>;
  }

  /** Method variant for {@linkcode or} */
  or<F>(orResult: Result<T, F>): Result<T, F> {
    return (this.repr[0] === 'Ok' ? this : orResult) as Result<T, F>;
  }

  /** Method variant for {@linkcode orElse} */
  orElse<F>(orElseFn: (err: E) => Result<T, F>): Result<T, F>;
  orElse<R extends AnyResult>(orElseFn: (err: E) => R): Result<T | OkFor<R>, ErrFor<R>>;
  orElse<F>(orElseFn: (err: E) => Result<T, F>): Result<T, F> {
    return this.repr[0] === 'Ok' ? (this as Ok<T, E>).cast() : orElseFn(this.repr[1]);
  }

  /** Method variant for {@linkcode and} */
  and<U>(mAnd: Result<U, E>): Result<U, E> {
    // (r.isOk ? andResult : err<U, E>(r.error))
    return (this.repr[0] === 'Ok' ? mAnd : this) as Result<U, E>;
  }

  /** Method variant for {@linkcode andThen} */
  andThen<U>(andThenFn: (t: T) => Result<U, E>): Result<U, E>;
  andThen<R extends AnyResult>(andThenFn: (t: T) => R): Result<OkFor<R>, E | ErrFor<R>>;
  andThen<U>(andThenFn: (t: T) => Result<U, E>): Result<U, E> {
    return this.repr[0] === 'Ok' ? andThenFn(this.repr[1]) : (this as Err<T, E>).cast();
  }

  /** Method variant for {@linkcode unwrapOr} */
  unwrapOr<U = T>(defaultValue: U): T | U {
    return this.repr[0] === 'Ok' ? this.repr[1] : defaultValue;
  }

  /** Method variant for {@linkcode unwrapOrElse} */
  unwrapOrElse<U>(elseFn: (error: E) => U): T | U {
    return this.repr[0] === 'Ok' ? this.repr[1] : elseFn(this.repr[1]);
  }

  /** Method variant for {@linkcode toString} */
  toString(): string {
    return `${this.repr[0]}(${safeToString(this.repr[1])})`;
  }

  /** Method variant for {@linkcode toJSON} */
  toJSON(): ResultJSON<T, E> {
    const variant = this.repr[0];
    return variant === 'Ok' ? { variant, value: this.repr[1] } : { variant, error: this.repr[1] };
  }

  /** Method variant for {@linkcode equals} */
  equals(comparison: Result<T, E>): boolean {
    // SAFETY: these casts are stripping away the `Ok`/`Err` distinction and
    // simply testing what `comparison` *actually* is, which is always an
    // instance of `ResultImpl` (the same as this method itself).
    return (
      this.repr[0] === (comparison as ResultImpl<T, E>).repr[0] &&
      this.repr[1] === (comparison as ResultImpl<T, E>).repr[1]
    );
  }

  /** Method variant for {@linkcode ap} */
  ap<A, B>(this: Result<(a: A) => B, E>, r: Result<A, E>): Result<B, E> {
    return r.andThen((val) => this.map((fn) => fn(val)));
  }

  cast() {
    return this;
  }
}

/**
  An `Ok` instance is the *successful* variant instance of the
  {@linkcode Result} type, representing a successful outcome from an operation
  which may fail. For a full discussion, see the module docs.

  @template T The type wrapped in this `Ok` variant of `Result`.
  @template E The type which would be wrapped in an `Err` variant of `Result`.
 */
export interface Ok<T, E> extends Omit<ResultImpl<T, E>, 'error' | 'cast'> {
  /** `Ok` is always `Variant.Ok`. */
  readonly variant: 'Ok';
  isOk: true;
  isErr: false;
  /** The wrapped value */
  value: T;
  cast<F>(): Result<T, F>;
}

/**
  An `Err` instance is the *failure* variant instance of the {@linkcode Result}
  type, representing a failure outcome from an operation which may fail. For a
  full discussion, see the module docs.

  @template T The type which would be wrapped in an `Ok` variant of `Result`.
  @template E The type wrapped in this `Err` variant of `Result`.
  */
export interface Err<T, E> extends Omit<ResultImpl<T, E>, 'value' | 'cast'> {
  /** `Err` is always `Variant.Err`. */
  readonly variant: 'Err';
  isOk: false;
  isErr: true;
  /** The wrapped error value. */
  error: E;
  cast<U>(): Result<U, E>;
}

/**
  Execute the provided callback, wrapping the return value in {@linkcode Ok} or
  {@linkcode Err Err(error)} if there is an exception.

  ```ts
  const aSuccessfulOperation = () => 2 + 2;

  const anOkResult = Result.tryOr('Oh noes!!1', () => {
    aSuccessfulOperation()
  }); // => Ok(4)

  const thisOperationThrows = () => throw new Error('Bummer');

  const anErrResult = Result.tryOr('Oh noes!!1', () => {
    thisOperationThrows();
  }); // => Err('Oh noes!!1')
 ```

  @param error The error value in case of an exception
  @param callback The callback to try executing
 */
export function tryOr<T, E>(error: E, callback: () => T): Result<T, E>;
export function tryOr<T, E>(error: E): (callback: () => T) => Result<T, E>;
export function tryOr<T, E>(
  error: E,
  callback?: () => T
): Result<T, E> | ((callback: () => T) => Result<T, E>) {
  const op = (cb: () => T) => {
    try {
      return ok<T, E>(cb());
    } catch {
      return err<T, E>(error);
    }
  };

  return curry1(op, callback);
}

/**
  Create an instance of {@linkcode Ok}.

  If you need to create an instance with a specific type (as you do whenever you
  are not constructing immediately for a function return or as an argument to a
  function), you can use a type parameter:

  ```ts
  const yayNumber = Result.ok<number, string>(12);
  ```

  Note: passing nothing, or passing `null` or `undefined` explicitly, will
  produce a `Result<Unit, E>`, rather than producing the nonsensical and in
  practice quite annoying `Result<null, string>` etc. See {@linkcode Unit} for
  more.

  ```ts
  const normalResult = Result.ok<number, string>(42);
  const explicitUnit = Result.ok<Unit, string>(Unit);
  const implicitUnit = Result.ok<Unit, string>();
  ```

  In the context of an immediate function return, or an arrow function with a
  single expression value, you do not have to specify the types, so this can be
  quite convenient.

  ```ts
  type SomeData = {
    //...
  };

  const isValid = (data: SomeData): boolean => {
    // true or false...
  }

  const arrowValidate = (data: SomeData): Result<Unit, string> =>
    isValid(data) ? Result.ok() : Result.err('something was wrong!');

  function fnValidate(data: someData): Result<Unit, string> {
    return isValid(data) ? Result.ok() : Result.err('something was wrong');
  }
  ```

  @template T The type of the item contained in the `Result`.
  @param value The value to wrap in a `Result.Ok`.
 */
export const ok = ResultImpl.ok;

/**
  Is the {@linkcode Result} an {@linkcode Ok}?

  @template T The type of the item contained in the `Result`.
  @param result The `Result` to check.
  @returns A type guarded `Ok`.
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T, E> {
  return result.isOk;
}

/**
  Is the {@linkcode Result} an {@linkcode Err}?

  @template T The type of the item contained in the `Result`.
  @param result The `Result` to check.
  @returns A type guarded `Err`.
*/
export function isErr<T, E>(result: Result<T, E>): result is Err<T, E> {
  return result.isErr;
}

/**
  Create an instance of {@linkcode Err}.

  If you need to create an instance with a specific type (as you do whenever you
  are not constructing immediately for a function return or as an argument to a
  function), you can use a type parameter:

  ```ts
  const notString = Result.err<number, string>('something went wrong');
  ```

  Note: passing nothing, or passing `null` or `undefined` explicitly, will
  produce a `Result<T, Unit>`, rather than producing the nonsensical and in
  practice quite annoying `Result<null, string>` etc. See {@linkcode Unit} for
  more.

  ```ts
  const normalResult = Result.err<number, string>('oh no');
  const explicitUnit = Result.err<number, Unit>(Unit);
  const implicitUnit = Result.err<number, Unit>();
  ```

  In the context of an immediate function return, or an arrow function with a
  single expression value, you do not have to specify the types, so this can be
  quite convenient.

  ```ts
  type SomeData = {
    //...
  };

  const isValid = (data: SomeData): boolean => {
    // true or false...
  }

  const arrowValidate = (data: SomeData): Result<number, Unit> =>
    isValid(data) ? Result.ok(42) : Result.err();

  function fnValidate(data: someData): Result<number, Unit> {
    return isValid(data) ? Result.ok(42) : Result.err();
  }
  ```

  @template T The type of the item contained in the `Result`.
  @param E The error value to wrap in a `Result.Err`.
 */
export const err = ResultImpl.err;

/**
  Execute the provided callback, wrapping the return value in {@linkcode Ok}.
  If there is an exception, return a {@linkcode Err} of whatever the `onError`
  function returns.

  ```ts
  import { tryOrElse } from 'true-myth/result';

  const aSuccessfulOperation = () => 2 + 2;

  const anOkResult = tryOrElse(
    (e) => e,
    aSuccessfulOperation
  ); // => Ok(4)

  const thisOperationThrows = () => throw 'Bummer'

  const anErrResult = tryOrElse(
    (e) => e,
    () => {
      thisOperationThrows();
    }
  ); // => Err('Bummer')
 ```

  @param onError A function that takes `e` exception and returns what will
    be wrapped in a `Result.Err`
  @param callback The callback to try executing
 */
export function tryOrElse<T, E>(onError: (e: unknown) => E, callback: () => T): Result<T, E>;
export function tryOrElse<T, E>(onError: (e: unknown) => E): (callback: () => T) => Result<T, E>;
export function tryOrElse<T, E>(
  onError: (e: unknown) => E,
  callback?: () => T
): Result<T, E> | ((callback: () => T) => Result<T, E>) {
  const op = (cb: () => T) => {
    try {
      return ok<T, E>(cb());
    } catch (e) {
      return err<T, E>(onError(e));
    }
  };

  return curry1(op, callback);
}

/**
  Map over a {@linkcode Result} instance: apply the function to the wrapped
  value if the instance is {@linkcode Ok}, and return the wrapped error value
  wrapped as a new {@linkcode Err} of the correct type (`Result<U, E>`) if the
  instance is `Err`.

  `map` works a lot like `Array.prototype.map`, but with one important
  difference. Both `Result` and `Array` are containers for other kinds of items,
  but where `Array.prototype.map` has 0 to _n_ items, a `Result` always has
  exactly one item, which is *either* a success or an error instance.

  Where `Array.prototype.map` will apply the mapping function to every item in
  the array (if there are any), `Result.map` will only apply the mapping
  function to the (single) element if an `Ok` instance, if there is one.

  If you have no items in an array of numbers named `foo` and call `foo.map(x =>
  x + 1)`, you'll still some have an array with nothing in it. But if you have
  any items in the array (`[2, 3]`), and you call `foo.map(x => x + 1)` on it,
  you'll get a new array with each of those items inside the array "container"
  transformed (`[3, 4]`).

  With this `map`, the `Err` variant is treated *by the `map` function* kind of
  the same way as the empty array case: it's just ignored, and you get back a
  new `Result` that is still just the same `Err` instance. But if you have an
  `Ok` variant, the map function is applied to it, and you get back a new
  `Result` with the value transformed, and still wrapped in an `Ok`.

  #### Examples

  ```ts
  import { ok, err, map, toString } from 'true-myth/result';
  const double = n => n * 2;

  const anOk = ok(12);
  const mappedOk = map(double, anOk);
  console.log(toString(mappedOk)); // Ok(24)

  const anErr = err("nothing here!");
  const mappedErr = map(double, anErr);
  console.log(toString(mappedErr)); // Err(nothing here!)
  ```

  @template T  The type of the value wrapped in an `Ok` instance, and taken as
                the argument to the `mapFn`.
  @template U  The type of the value wrapped in the new `Ok` instance after
                applying `mapFn`, that is, the type returned by `mapFn`.
  @template E  The type of the value wrapped in an `Err` instance.
  @param mapFn  The function to apply the value to if `result` is `Ok`.
  @param result The `Result` instance to map over.
  @returns      A new `Result` with the result of applying `mapFn` to the value
                in an `Ok`, or else the original `Err` value wrapped in the new
                instance.
 */
export function map<T, U, E>(mapFn: (t: T) => U, result: Result<T, E>): Result<U, E>;
export function map<T, U, E>(mapFn: (t: T) => U): (result: Result<T, E>) => Result<U, E>;
export function map<T, U, E>(
  mapFn: (t: T) => U,
  result?: Result<T, E>
): Result<U, E> | ((result: Result<T, E>) => Result<U, E>) {
  const op = (r: Result<T, E>) => r.map(mapFn);
  return curry1(op, result);
}

/**
  Map over a {@linkcode Result} instance as in [`map`](#map) and get out the
  value if `result` is an {@linkcode Ok}, or return a default value if `result`
  is an {@linkcode Err}.

  #### Examples

  ```ts
  import { ok, err, mapOr } from 'true-myth/result';

  const length = (s: string) => s.length;

  const anOkString = ok('a string');
  const theStringLength = mapOr(0, length, anOkString);
  console.log(theStringLength);  // 8

  const anErr = err('uh oh');
  const anErrMapped = mapOr(0, length, anErr);
  console.log(anErrMapped);  // 0
  ```

  @param orU The default value to use if `result` is an `Err`.
  @param mapFn The function to apply the value to if `result` is an `Ok`.
  @param result The `Result` instance to map over.
 */
export function mapOr<T, U, E>(orU: U, mapFn: (t: T) => U, result: Result<T, E>): U;
export function mapOr<T, U, E>(orU: U, mapFn: (t: T) => U): (result: Result<T, E>) => U;
export function mapOr<T, U, E>(orU: U): (mapFn: (t: T) => U) => (result: Result<T, E>) => U;
export function mapOr<T, U, E>(
  orU: U,
  mapFn?: (t: T) => U,
  result?: Result<T, E>
): U | ((result: Result<T, E>) => U) | ((mapFn: (t: T) => U) => (result: Result<T, E>) => U) {
  function fullOp(fn: (t: T) => U, r: Result<T, E>): U {
    return r.mapOr(orU, fn);
  }

  function partialOp(fn: (t: T) => U): (maybe: Result<T, E>) => U;
  function partialOp(fn: (t: T) => U, curriedResult: Result<T, E>): U;
  function partialOp(
    fn: (t: T) => U,
    curriedResult?: Result<T, E>
  ): U | ((maybe: Result<T, E>) => U) {
    return curriedResult !== undefined
      ? fullOp(fn, curriedResult)
      : (extraCurriedResult: Result<T, E>) => fullOp(fn, extraCurriedResult);
  }

  return mapFn === undefined
    ? partialOp
    : result === undefined
      ? partialOp(mapFn)
      : partialOp(mapFn, result);
}

/**
  Map over a {@linkcode Result} instance as in {@linkcode map} and get out the
  value if `result` is {@linkcode Ok}, or apply a function (`orElseFn`) to the
  value wrapped in the {@linkcode Err} to get a default value.

  Like {@linkcode mapOr} but using a function to transform the error into a
  usable value instead of simply using a default value.

  #### Examples

  ```ts
  import { ok, err, mapOrElse } from 'true-myth/result';

  const summarize = (s: string) => `The response was: '${s}'`;
  const getReason = (err: { code: number, reason: string }) => err.reason;

  const okResponse = ok("Things are grand here.");
  const mappedOkAndUnwrapped = mapOrElse(getReason, summarize, okResponse);
  console.log(mappedOkAndUnwrapped);  // The response was: 'Things are grand here.'

  const errResponse = err({ code: 500, reason: 'Nothing at this endpoint!' });
  const mappedErrAndUnwrapped = mapOrElse(getReason, summarize, errResponse);
  console.log(mappedErrAndUnwrapped);  // Nothing at this endpoint!
  ```

  @template T    The type of the wrapped `Ok` value.
  @template U    The type of the resulting value from applying `mapFn` to the
                  `Ok` value or `orElseFn` to the `Err` value.
  @template E    The type of the wrapped `Err` value.
  @param orElseFn The function to apply to the wrapped `Err` value to get a
                  usable value if `result` is an `Err`.
  @param mapFn    The function to apply to the wrapped `Ok` value if `result` is
                  an `Ok`.
  @param result   The `Result` instance to map over.
 */
export function mapOrElse<T, U, E>(
  orElseFn: (err: E) => U,
  mapFn: (t: T) => U,
  result: Result<T, E>
): U;
export function mapOrElse<T, U, E>(
  orElseFn: (err: E) => U,
  mapFn: (t: T) => U
): (result: Result<T, E>) => U;
export function mapOrElse<T, U, E>(
  orElseFn: (err: E) => U
): (mapFn: (t: T) => U) => (result: Result<T, E>) => U;
export function mapOrElse<T, U, E>(
  orElseFn: (err: E) => U,
  mapFn?: (t: T) => U,
  result?: Result<T, E>
): U | ((result: Result<T, E>) => U) | ((mapFn: (t: T) => U) => (result: Result<T, E>) => U) {
  function fullOp(fn: (t: T) => U, r: Result<T, E>) {
    return r.mapOrElse(orElseFn, fn);
  }

  function partialOp(fn: (t: T) => U): (result: Result<T, E>) => U;
  function partialOp(fn: (t: T) => U, curriedResult: Result<T, E>): U;
  function partialOp(
    fn: (t: T) => U,
    curriedResult?: Result<T, E>
  ): U | ((maybe: Result<T, E>) => U) {
    return curriedResult !== undefined
      ? fullOp(fn, curriedResult)
      : (extraCurriedResult: Result<T, E>) => fullOp(fn, extraCurriedResult);
  }

  return mapFn === undefined
    ? partialOp
    : result === undefined
      ? partialOp(mapFn)
      : partialOp(mapFn, result);
}

/**
  Map over a {@linkcode Ok}, exactly as in {@linkcode map}, but operating on the
  value wrapped in an {@linkcode Err} instead of the value wrapped in the
  {@linkcode Ok}. This is handy for when you need to line up a bunch of
  different types of errors, or if you need an error of one shape to be in a
  different shape to use somewhere else in your codebase.

  #### Examples

  ```ts
  import { ok, err, mapErr, toString } from 'true-myth/result';

  const reason = (err: { code: number, reason: string }) => err.reason;

  const anOk = ok(12);
  const mappedOk = mapErr(reason, anOk);
  console.log(toString(mappedOk));  // Ok(12)

  const anErr = err({ code: 101, reason: 'bad file' });
  const mappedErr = mapErr(reason, anErr);
  console.log(toString(mappedErr));  // Err(bad file)
  ```

  @template T    The type of the value wrapped in the `Ok` of the `Result`.
  @template E    The type of the value wrapped in the `Err` of the `Result`.
  @template F    The type of the value wrapped in the `Err` of a new `Result`,
                  returned by the `mapErrFn`.
  @param mapErrFn The function to apply to the value wrapped in `Err` if
  `result` is an `Err`.
  @param result   The `Result` instance to map over an error case for.
 */
export function mapErr<T, E, F>(mapErrFn: (e: E) => F, result: Result<T, E>): Result<T, F>;
export function mapErr<T, E, F>(mapErrFn: (e: E) => F): (result: Result<T, E>) => Result<T, F>;
export function mapErr<T, E, F>(
  mapErrFn: (e: E) => F,
  result?: Result<T, E>
): Result<T, F> | ((result: Result<T, E>) => Result<T, F>) {
  const op = (r: Result<T, E>) => r.mapErr(mapErrFn);
  return curry1(op, result);
}

/**
  You can think of this like a short-circuiting logical "and" operation on a
  {@linkcode Result} type. If `result` is {@linkcode Ok}, then the result is the
  `andResult`. If `result` is {@linkcode Err}, the result is the `Err`.

  This is useful when you have another `Result` value you want to provide if and
  *only if* you have an `Ok` – that is, when you need to make sure that if you
  `Err`, whatever else you're handing a `Result` to *also* gets that `Err`.

  Notice that, unlike in [`map`](#map) or its variants, the original `result` is
  not involved in constructing the new `Result`.

  #### Examples

  ```ts
  import { and, ok, err, toString } from 'true-myth/result';

  const okA = ok('A');
  const okB = ok('B');
  const anErr = err({ so: 'bad' });

  console.log(toString(and(okB, okA)));  // Ok(B)
  console.log(toString(and(okB, anErr)));  // Err([object Object])
  console.log(toString(and(anErr, okA)));  // Err([object Object])
  console.log(toString(and(anErr, anErr)));  // Err([object Object])
  ```

  @template T     The type of the value wrapped in the `Ok` of the `Result`.
  @template U     The type of the value wrapped in the `Ok` of the `andResult`,
                   i.e. the success type of the `Result` present if the checked
                   `Result` is `Ok`.
  @template E     The type of the value wrapped in the `Err` of the `Result`.
  @param andResult The `Result` instance to return if `result` is `Err`.
  @param result    The `Result` instance to check.
 */
export function and<T, U, E>(andResult: Result<U, E>, result: Result<T, E>): Result<U, E>;
export function and<T, U, E>(andResult: Result<U, E>): (result: Result<T, E>) => Result<U, E>;
export function and<T, U, E>(
  andResult: Result<U, E>,
  result?: Result<T, E>
): Result<U, E> | ((result: Result<T, E>) => Result<U, E>) {
  const op = (r: Result<T, E>) => r.and(andResult);
  return curry1(op, result);
}

/**
  Apply a function to the wrapped value if {@linkcode Ok} and return a new `Ok`
  containing the resulting value; or if it is {@linkcode Err} return it
  unmodified.

  This differs from `map` in that `thenFn` returns another {@linkcode Result}.
  You can use `andThen` to combine two functions which *both* create a `Result`
  from an unwrapped type.

  You may find the `.then` method on an ES6 `Promise` helpful for comparison: if
  you have a `Promise`, you can pass its `then` method a callback which returns
  another `Promise`, and the result will not be a *nested* promise, but a single
  `Promise`. The difference is that `Promise#then` unwraps *all* layers to only
  ever return a single `Promise` value, whereas `Result.andThen` will not unwrap
  nested `Result`s.

  > [!NOTE] This is is sometimes also known as `bind`, but *not* aliased as such
  > because [`bind` already means something in JavaScript][bind].

  [bind]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind

  #### Examples

  ```ts
  import { ok, err, andThen, toString } from 'true-myth/result';

  const toLengthAsResult = (s: string) => ok(s.length);

  const anOk = ok('just a string');
  const lengthAsResult = andThen(toLengthAsResult, anOk);
  console.log(toString(lengthAsResult));  // Ok(13)

  const anErr = err(['srsly', 'whatever']);
  const notLengthAsResult = andThen(toLengthAsResult, anErr);
  console.log(toString(notLengthAsResult));  // Err(srsly,whatever)
  ```

  @template T   The type of the value wrapped in the `Ok` of the `Result`.
  @template U   The type of the value wrapped in the `Ok` of the `Result`
                 returned by the `thenFn`.
  @template E   The type of the value wrapped in the `Err` of the `Result`.
  @param thenFn  The function to apply to the wrapped `T` if `maybe` is `Just`.
  @param result  The `Maybe` to evaluate and possibly apply a function to.
 */
export function andThen<T, E, R extends AnyResult>(
  thenFn: (t: T) => R,
  result: Result<T, E>
): Result<OkFor<R>, E | ErrFor<R>>;
export function andThen<T, E, R extends AnyResult>(
  thenFn: (t: T) => R
): (result: Result<T, E>) => Result<OkFor<R>, E | ErrFor<R>>;
export function andThen<T, E, R extends AnyResult>(
  thenFn: (t: T) => R,
  result?: Result<T, E>
): Result<OkFor<R>, E | ErrFor<R>> | ((result: Result<T, E>) => Result<OkFor<R>, E | ErrFor<R>>) {
  const op = (r: Result<T, E>) => r.andThen(thenFn);
  return curry1(op, result);
}

/**
  Provide a fallback for a given {@linkcode Result}. Behaves like a logical
  `or`: if the `result` value is an {@linkcode Ok}, returns that `result`;
  otherwise, returns the `defaultResult` value.

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
export function or<T, E, F>(defaultResult: Result<T, F>, result: Result<T, E>): Result<T, F>;
export function or<T, E, F>(defaultResult: Result<T, F>): (result: Result<T, E>) => Result<T, F>;
export function or<T, E, F>(
  defaultResult: Result<T, F>,
  result?: Result<T, E>
): Result<T, F> | ((result: Result<T, E>) => Result<T, F>) {
  const op = (r: Result<T, E>) => r.or(defaultResult);
  return curry1(op, result);
}

/**
  Like {@linkcode or}, but using a function to construct the alternative
  {@linkcode Result}.

  Sometimes you need to perform an operation using the `error` value (and
  possibly other data in the environment) to construct the fallback value. In
  these situations, you can pass a function (which may be a closure) as the
  `elseFn` to generate the fallback `Result<T>`. It can then transform the data
  in the `Err` to something usable as an {@linkcode Ok}, or generate a new
  {@linkcode Err} instance as appropriate.

  Useful for transforming failures to usable data.

  @param elseFn The function to apply to the contents of the `Err` if `result`
                is an `Err`, to create a new `Result`.
  @param result The `Result` to use if it is an `Ok`.
  @returns      The `result` if it is `Ok`, or the `Result` returned by `elseFn`
                if `result` is an `Err.
 */
export function orElse<T, E, R extends AnyResult>(
  elseFn: (err: E) => R,
  result: Result<T, E>
): Result<T | OkFor<R>, ErrFor<R>>;
export function orElse<T, E, R extends AnyResult>(
  elseFn: (err: E) => R
): (result: Result<T, E>) => Result<T | OkFor<R>, ErrFor<R>>;
export function orElse<T, E, R extends AnyResult>(
  elseFn: (err: E) => R,
  result?: Result<T, E>
): Result<T | OkFor<R>, ErrFor<R>> | ((result: Result<T, E>) => Result<T | OkFor<R>, ErrFor<R>>) {
  const op = (r: Result<T, E>) => r.orElse(elseFn);
  return curry1(op, result);
}

/**
  Safely get the value out of the {@linkcode Ok} variant of a {@linkcode Result}.

  This is the recommended way to get a value out of a `Result` most of the time.

  ```ts
  import { ok, err, unwrapOr } from 'true-myth/result';

  const anOk = ok<number, string>(12);
  console.log(unwrapOr(0, anOk));  // 12

  const anErr = err<number, string>('nooooo');
  console.log(unwrapOr(0, anErr));  // 0
  ```

  @template T        The value wrapped in the `Ok`.
  @template E        The value wrapped in the `Err`.
  @param defaultValue The value to use if `result` is an `Err`.
  @param result       The `Result` instance to unwrap if it is an `Ok`.
  @returns            The content of `result` if it is an `Ok`, otherwise
                      `defaultValue`.
 */
export function unwrapOr<T, U, E>(defaultValue: U, result: Result<T, E>): U | T;
export function unwrapOr<T, U, E>(defaultValue: U): (result: Result<T, E>) => U | T;
export function unwrapOr<T, U, E>(
  defaultValue: U,
  result?: Result<T, E>
): (T | U) | ((result: Result<T, E>) => T | U) {
  const op = (r: Result<T, E>) => r.unwrapOr(defaultValue);
  return curry1(op, result);
}

/**
  Safely get the value out of a {@linkcode Result} by returning the wrapped
  value if it is {@linkcode Ok}, or by applying `orElseFn` to the value in the
  {@linkcode Err}.

  This is useful when you need to *generate* a value (e.g. by using current
  values in the environment – whether preloaded or by local closure) instead of
  having a single default value available (as in {@linkcode unwrapOr}).

  ```ts
  import { ok, err, unwrapOrElse } from 'true-myth/result';

  // You can imagine that someOtherValue might be dynamic.
  const someOtherValue = 2;
  const handleErr = (errValue: string) => errValue.length + someOtherValue;

  const anOk = ok<number, string>(42);
  console.log(unwrapOrElse(handleErr, anOk));  // 42

  const anErr = err<number, string>('oh teh noes');
  console.log(unwrapOrElse(handleErr, anErr));  // 13
  ```

  @template T    The value wrapped in the `Ok`.
  @template E    The value wrapped in the `Err`.
  @param orElseFn A function applied to the value wrapped in `result` if it is
                  an `Err`, to generate the final value.
  @param result   The `result` to unwrap if it is an `Ok`.
  @returns        The value wrapped in `result` if it is `Ok` or the value
                  returned by `orElseFn` applied to the value in `Err`.
 */
export function unwrapOrElse<T, U, E>(orElseFn: (error: E) => U, result: Result<T, E>): T | U;
export function unwrapOrElse<T, U, E>(orElseFn: (error: E) => U): (result: Result<T, E>) => T | U;
export function unwrapOrElse<T, U, E>(
  orElseFn: (error: E) => U,
  result?: Result<T, E>
): (T | U) | ((result: Result<T, E>) => T | U) {
  const op = (r: Result<T, E>) => r.unwrapOrElse(orElseFn);
  return curry1(op, result);
}

/**
  Create a `String` representation of a {@linkcode Result} instance.

  An {@linkcode Ok} instance will be `Ok(<representation of the value>)`, and an
  {@linkcode Err} instance will be `Err(<representation of the error>)`, where
  the representation of the value or error is simply the value or error's own
  `toString` representation. For example:

                call                |         output
  --------------------------------- | ----------------------
  `toString(ok(42))`                | `Ok(42)`
  `toString(ok([1, 2, 3]))`         | `Ok(1,2,3)`
  `toString(ok({ an: 'object' }))`  | `Ok([object Object])`n
  `toString(err(42))`               | `Err(42)`
  `toString(err([1, 2, 3]))`        | `Err(1,2,3)`
  `toString(err({ an: 'object' }))` | `Err([object Object])`

  @template T   The type of the wrapped value; its own `.toString` will be used
                to print the interior contents of the `Just` variant.
  @param result The value to convert to a string.
  @returns      The string representation of the `Maybe`.
 */
export const toString = <T, E>(result: Result<T, E>): string => {
  return result.toString();
};

/**
 * Create an `Object` representation of a {@linkcode Result} instance.
 *
 * Useful for serialization. `JSON.stringify()` uses it.
 *
 * @param result  The value to convert to JSON
 * @returns       The JSON representation of the `Result`
 */
export const toJSON = <T, E>(result: Result<T, E>): ResultJSON<T, E> => {
  return result.toJSON();
};

/**
  A lightweight object defining how to handle each variant of a
  {@linkcode Result}.
 */
export type Matcher<T, E, A> = {
  Ok: (value: T) => A;
  Err: (error: E) => A;
};

/**
  Performs the same basic functionality as {@linkcode unwrapOrElse}, but instead
  of simply unwrapping the value if it is {@linkcode Ok} and applying a value to
  generate the same default type if it is {@linkcode Err}, lets you supply
  functions which may transform the wrapped type if it is `Ok` or get a default
  value for `Err`.

  This is kind of like a poor man's version of pattern matching, which
  JavaScript currently lacks.

  Instead of code like this:

  ```ts
  import Result, { isOk, match } from 'true-myth/result';

  const logValue = (mightBeANumber: Result<number, string>) => {
    console.log(
      mightBeANumber.isOk
        ? mightBeANumber.value.toString()
        : `There was an error: ${unsafelyGetErr(mightBeANumber)}`
    );
  };
  ```

  ...we can write code like this:

  ```ts
  import Result, { match } from 'true-myth/result';

  const logValue = (mightBeANumber: Result<number, string>) => {
    const value = match(
      {
        Ok: n => n.toString(),
        Err: e => `There was an error: ${e}`,
      },
      mightBeANumber
    );
    console.log(value);
  };
  ```

  This is slightly longer to write, but clearer: the more complex the resulting
  expression, the hairer it is to understand the ternary. Thus, this is
  especially convenient for times when there is a complex result, e.g. when
  rendering part of a React component inline in JSX/TSX.

  @param matcher A lightweight object defining what to do in the case of each
                 variant.
  @param result  The `result` instance to check.
 */
export function match<T, E, A>(matcher: Matcher<T, E, A>, result: Result<T, E>): A;
/**
  Performs the same basic functionality as {@linkcode unwrapOrElse}, but instead
  of simply unwrapping the value if it is {@linkcode Ok} and applying a value to
  generate the same default type if it is {@linkcode Err}, lets you supply
  functions which may transform the wrapped type if it is `Ok` or get a default
  value for `Err`.

  This is kind of like a poor man's version of pattern matching, which
  JavaScript currently lacks.

  Instead of code like this:

  ```ts
  import Result, { isOk, match } from 'true-myth/result';

  const logValue = (mightBeANumber: Result<number, string>) => {
    console.log(
      mightBeANumber.isOk
        ? mightBeANumber.value.toString()
        : `There was an error: ${unsafelyGetErr(mightBeANumber)}`
    );
  };
  ```

  ...we can write code like this:

  ```ts
  import Result, { match } from 'true-myth/result';

  const logValue = (mightBeANumber: Result<number, string>) => {
    const value = match(
      {
        Ok: n => n.toString(),
        Err: e => `There was an error: ${e}`,
      },
      mightBeANumber
    );
    console.log(value);
  };
  ```

  This is slightly longer to write, but clearer: the more complex the resulting
  expression, the hairer it is to understand the ternary. Thus, this is
  especially convenient for times when there is a complex result, e.g. when
  rendering part of a React component inline in JSX/TSX.

  @param matcher A lightweight object defining what to do in the case of each
                 variant.
 */
export function match<T, E, A>(matcher: Matcher<T, E, A>): (result: Result<T, E>) => A;
export function match<T, E, A>(
  matcher: Matcher<T, E, A>,
  result?: Result<T, E>
): A | ((result: Result<T, E>) => A) {
  const op = (r: Result<T, E>) => r.mapOrElse(matcher.Err, matcher.Ok);
  return curry1(op, result);
}

/**
  Allows quick triple-equal equality check between the values inside two
  {@linkcode Result}s without having to unwrap them first.

  ```ts
  const a = Result.of(3)
  const b = Result.of(3)
  const c = Result.of(null)
  const d = Result.nothing()

  Result.equals(a, b) // true
  Result.equals(a, c) // false
  Result.equals(c, d) // true
  ```

  @param resultB A `maybe` to compare to.
  @param resultA A `maybe` instance to check.
 */
export function equals<T, E>(resultB: Result<T, E>, resultA: Result<T, E>): boolean;
export function equals<T, E>(resultB: Result<T, E>): (resultA: Result<T, E>) => boolean;
export function equals<T, E>(
  resultB: Result<T, E>,
  resultA?: Result<T, E>
): boolean | ((a: Result<T, E>) => boolean) {
  const op = (rA: Result<T, E>) => rA.equals(resultB);
  return curry1(op, resultA);
}

/**
  Allows you to *apply* (thus `ap`) a value to a function without having to take
  either out of the context of their {@linkcode Result}s. This does mean that
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

  @param resultFn result of a function from T to U
  @param result result of a T to apply to `fn`
 */
export function ap<A, B, E>(resultFn: Result<(a: A) => B, E>, result: Result<A, E>): Result<B, E>;
export function ap<A, B, E>(
  resultFn: Result<(a: A) => B, E>
): (result: Result<A, E>) => Result<B, E>;
export function ap<A, B, E>(
  resultFn: Result<(a: A) => B, E>,
  result?: Result<A, E>
): Result<B, E> | ((val: Result<A, E>) => Result<B, E>) {
  const op = (r: Result<A, E>) => resultFn.ap(r);
  return curry1(op, result);
}

/**
  Transform a function which may throw an error into one with an identical call
  signature except that it will return a {@linkcode} instead of throwing an
  error.

  This allows you to handle the error locally with all the normal `Result` tools
  rather than having to catch an exception. Where the {@linkcode tryOr} and
  {@linkcode tryOrElse} functions are useful for a single call, this is useful
  to make a new version of a function to be used repeatedly.

  This overload absorbs all exceptions into an {@linkcode Err} with the type
  `unknown`. If you want to transform the error immediately rather than using a
  combinator, see the other overload.

  ## Examples

  The `JSON.parse` method will throw if the string passed to it is invalid. You
  can use this `safe` method to transform it into a form which will *not* throw:

  ```ts
  import { safe } from 'true-myth/task';
  const parse = safe(JSON.parse);

  let result = parse(`"ill-formed gobbledygook'`);
  console.log(result.toString()); // Err(SyntaxError: Unterminated string in JSON at position 25)
  ```

  You could do this once in a utility module and then require that *all* JSON
  parsing operations in your code use this version instead.

  @param fn The function which may throw, which will be wrapped.
*/
export function safe<F extends AnyFunction, P extends Parameters<F>, R extends ReturnType<F>>(
  fn: F
): (...params: P) => Result<R, unknown>;
/**
  Transform a function which may throw an error into one with an identical call
  signature except that it will return a {@linkcode} instead of throwing an
  error.

  This allows you to handle the error locally with all the normal `Result` tools
  rather than having to catch an exception. Where the {@linkcode tryOr} and
  {@linkcode tryOrElse} functions are useful for a single call, this is useful
  to make a new version of a function to be used repeatedly.

  This overload allows you to transform the error immediately, using the second
  argument.

  ## Examples

  The `JSON.parse` method will throw if the string passed to it is invalid. You
  can use this `safe` method to transform it into a form which will *not* throw,
  wrapping it in a custom error :

  ```ts
  import { safe } from 'true-myth/task';

  class ParsingError extends Error {
    name = 'ParsingError';
    constructor(error: unknown) {
      super('Parsing error.', { cause: error });
    }
  }

  const parse = safe(JSON.parse, (error) => {
    return new ParsingError(error);
  });

  let result = parse(`"ill-formed gobbledygook'`);
  console.log(result.toString()); // Err(SyntaxError: Unterminated string in JSON at position 25)
  ```

  You could do this once in a utility module and then require that *all* JSON
  parsing operations in your code use this version instead.

  @param fn The function which may throw, which will be wrapped.
  @param handleErr A function to use to transform an unknown error into a known
    error type.
*/
export function safe<F extends AnyFunction, P extends Parameters<F>, R extends ReturnType<F>, E>(
  fn: F,
  handleErr: (error: unknown) => E
): (...params: P) => Result<R, E>;
export function safe<F extends AnyFunction, P extends Parameters<F>, R extends ReturnType<F>, E>(
  fn: F,
  handleErr?: (error: unknown) => E
): (...params: P) => Result<R, unknown> {
  let errorHandler = handleErr ?? ((e) => e);
  return (...params) => tryOrElse(errorHandler, () => fn(...params) as R);
}

/**
  Determine whether an item is an instance of {@linkcode Result}.

  @param item The item to check.
 */
export function isInstance<T, E>(item: unknown): item is Result<T, E> {
  return item instanceof ResultImpl;
}

/**
  The public interface for the {@linkcode Result} class *as a value*: the static
  constructors `ok` and `err` produce a `Result` with that variant.
 */
export interface ResultConstructor {
  ok: typeof ResultImpl.ok;
  err: typeof ResultImpl.err;
}

/**
  A `Result` represents success ({@linkcode Ok}) or failure ({@linkcode Err}).

  The behavior of this type is checked by TypeScript at compile time, and bears
  no runtime overhead other than the very small cost of the container object.

  @class
 */
export const Result: ResultConstructor = ResultImpl as ResultConstructor;
export type Result<T, E> = Ok<T, E> | Err<T, E>;
export default Result;
