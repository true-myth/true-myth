/**
 * # Result
 * 
 * A `Result` is a type representing the value result of an operation which may
 * fail, with a successful value of type `T` or an error of type `E`.
 * 
 * If the value is present, it is `Ok(value)`. If it's absent, it's
 * `Error(reason)`. This provides a type-safe container for dealing with the
 * possibility that an error occurred, without needing to scatter `try`/`catch`
 * blocks throughout your codebase. This has two major advantages:
 * 
 * 1.  You *know* when an item may have a failure case, unlike exceptions
 *     (which may be thrown from any function with no warning and no help from
 *     the type system).
 * 2.  The error scenario is a first-class citizen, and the provided helper
 *     functions and methods allow you to deal with the type in much the same
 *     way as you might an array – transforming values if present, or dealing
 *     with errors instead if necessary.
 */

/** (keep typedoc from getting confused by the import) */
import { isVoid } from './utils';
import { Maybe, just, nothing, isJust, unsafelyUnwrap as unwrapMaybe } from './maybe';

/**
 * Discriminant for `Ok` and `Err` variants of `Result` type.
 * 
 * You can use the discriminant via the `variant` property of `Result` instances
 * if you need to match explicitly on it.
 */
export enum Variant {
  Ok = 'Ok',
  Err = 'Err',
}

export interface IResult<T, E> {
  /** Distinguish between the `Ok` and `Error` variants. */
  variant: Variant;

  /** Method variant for [`Result.isOk`](../modules/_result_.html#isok) */
  isOk(this: Result<T, E>): this is Ok<T, E>;

  /** Method variant for [`Result.isErr`](../modules/_result_.html#iserr) */
  isErr(this: Result<T, E>): this is Err<T, E>;

  /** Method variant for [`Result.map`](../modules/_result_.html#map) */
  map<U>(this: Result<T, E>, mapFn: (t: T) => U): Result<U, E>;

  /** Method variant for [`Result.mapOr`](../modules/_result_.html#mapor) */
  mapOr<U>(this: Result<T, E>, orU: U, mapFn: (t: T) => U): U;

  /** Method variant for [`Result.mapOrElse`](../modules/_result_.html#maporelse) */
  mapOrElse<U>(this: Result<T, E>, orElseFn: (...args: any[]) => U, mapFn: (t: T) => U): U;

  /** Method variant for [`Result.mapErr`](../modules/_result_.html#maperr) */
  mapErr<F>(this: Result<T, E>, mapErrFn: (e: E) => F): Result<T, F>;

  /** Method variant for [`Result.or`](../modules/_result_.html#or) */
  or<F>(this: Result<T, E>, orResult: Result<T, F>): Result<T, F>;

  /** Method variant for [`Result.orElse`](../modules/_result_.html#orelse) */
  orElse<F>(this: Result<T, E>, orElseFn: (...args: any[]) => Result<T, F>): Result<T, F>;

  /** Method variant for [`Result.and`](../modules/_result_.html#and) */
  and<U>(this: Result<T, E>, mAnd: Result<U, E>): Result<U, E>;

  /** Method variant for [`Result.andThen`](../modules/_result_.html#andthen) */
  andThen<U>(this: Result<T, E>, andThenFn: (t: T) => Result<U, E>): Result<U, E>;

  /** Method variant for [`Result.chain`](../modules/_result_.html#chain) */
  chain<U>(this: Result<T, E>, chainFn: (t: T) => Result<U, E>): Result<U, E>;

  /** Method variant for [`Result.flatMap`](../modules/_result_.html#flatmap) */
  flatMap<U>(this: Result<T, E>, chainFn: (t: T) => Result<U, E>): Result<U, E>;

  /** Method variant for [`Result.unwrap`](../modules/_result_.html#unwrap) */
  unsafelyUnwrap(): T | never;

  /** Method variant for [`Result.unwrapErr`](../modules/_result_.html#unwraperr) */
  unsafelyUnwrapErr(): E | never;

  /** Method variant for [`Result.unwrapOr`](../modules/_result_.html#unwrapor) */
  unwrapOr<E>(this: Result<T, E>, defaultValue: T): T;

  /** Method variant for [`Result.unwrapOrElse`](../modules/_result_.html#unwrapOrElse) */
  unwrapOrElse(this: Result<T, E>, elseFn: (error: E) => T): T;

  /** Method variant for [`Result.toMaybe`](../modules/_result_.html#tomaybe) */
  toMaybe(this: Result<T, E>): Maybe<T>;
}

/**
 * The `Ok` variant for [`Result`].
 * 
 * [`Result`]: ../modules/_result_.html#result
 * 
 * An `Ok` instance represents a *successful* `Result`.
 */
export class Ok<T, E> implements IResult<T, E> {
  private __value: T;

  /** `Ok` is always [`Variant.Ok`](../enums/_result_.variant#ok). */
  variant = Variant.Ok;

  /**
   * Create an instance of `Result.Ok` with `new`.
   * 
   * **Note:** While you *may* create the `Result` type via normal JavaScript
   * class construction, it is not recommended for the functional style for
   * which the library is intended. Instead, use [`Result.ok`].
   * 
   * [`Result.ok`]: ../modules/_result_.html#ok
   * 
   * ```ts
   * // Avoid:
   * const aString = new Result.Ok('characters');
   * 
   * // Prefer:
   * const aString = Result.ok('characters);
   * ```
   * 
   * @param value
   * The value to wrap in a `Result.Ok`.
   * 
   * `null` and `undefined` are allowed by the type signature so that the
   * constructor may `throw` on those rather than constructing a type like
   * `Result<undefined>`.
   * 
   * @throws      If you pass `null` or `undefined`.
   */
  constructor(value: T | null | undefined) {
    if (isVoid(value)) {
      throw new Error(
        'Tried to construct `Err` with `null` or `undefined`. Maybe you want `Maybe.Nothing`?'
      );
    }

    this.__value = value;
  }

  /** Method variant for [`Result.isOk`](../modules/_result_.html#isok) */
  isOk(this: Result<T, E>): this is Ok<T, E> {
    return isOk(this);
  }

  /** Method variant for [`Result.isErr`](../modules/_result_.html#iserr) */
  isErr(this: Result<T, E>): this is Err<T, E> {
    return isErr(this);
  }

  /** Method variant for [`Result.map`](../modules/_result_.html#map) */
  map<U>(this: Result<T, E>, mapFn: (t: T) => U): Result<U, E> {
    return map(mapFn, this);
  }

  /** Method variant for [`Result.mapOr`](../modules/_result_.html#mapor) */
  mapOr<U>(this: Result<T, E>, orU: U, mapFn: (t: T) => U): U {
    return mapOr(orU, mapFn, this);
  }

  /** Method variant for [`Result.mapOrElse`](../modules/_result_.html#maporelse) */
  mapOrElse<U>(this: Result<T, E>, orElseFn: (...args: any[]) => U, mapFn: (t: T) => U): U {
    return mapOrElse(orElseFn, mapFn, this);
  }

  /** Method variant for [`Result.mapErr`](../modules/_result_.html#maperr) */
  mapErr<F>(this: Result<T, E>, mapErrFn: (e: E) => F): Result<T, F> {
    return mapErr(mapErrFn, this);
  }

  /** Method variant for [`Result.or`](../modules/_result_.html#or) */
  or<F>(this: Result<T, E>, orResult: Result<T, F>): Result<T, F> {
    return or(orResult, this);
  }

  /** Method variant for [`Result.orElse`](../modules/_result_.html#orelse) */
  orElse<F>(this: Result<T, E>, orElseFn: (...args: any[]) => Result<T, F>): Result<T, F> {
    return orElse(orElseFn, this);
  }

  /** Method variant for [`Result.and`](../modules/_result_.html#and) */
  and<U>(this: Result<T, E>, mAnd: Result<U, E>): Result<U, E> {
    return and(mAnd, this);
  }

  /** Method variant for [`Result.andThen`](../modules/_result_.html#andthen) */
  andThen<U>(this: Result<T, E>, andThenFn: (t: T) => Result<U, E>): Result<U, E> {
    return andThen(andThenFn, this);
  }

  /** Method variant for [`Result.chain`](../modules/_result_.html#chain) */
  chain<U>(this: Result<T, E>, chainFn: (t: T) => Result<U, E>): Result<U, E> {
    return chain(chainFn, this);
  }

  /** Method variant for [`Result.flatMap`](../modules/_result_.html#flatmap) */
  flatMap<U>(this: Result<T, E>, flatMapFn: (t: T) => Result<U, E>): Result<U, E> {
    return flatMap(flatMapFn, this);
  }

  /** Method variant for [`Result.unwrap`](../modules/_result_.html#unwrap) */
  unsafelyUnwrap(): T {
    return this.__value;
  }

  /** Method variant for [`Result.unwrapErr`](../modules/_result_.html#unwraperr) */
  unsafelyUnwrapErr(): E | never {
    throw 'Tried to `unwrapErr` an `Ok`';
  }

  /** Method variant for [`Result.unwrapOr`](../modules/_result_.html#unwrapor) */
  unwrapOr<E>(this: Result<T, E>, defaultValue: T): T {
    return unwrapOr(defaultValue, this);
  }

  /** Method variant for [`Result.unwrapOrElse`](../modules/_result_.html#unwrapOrElse) */
  unwrapOrElse(this: Result<T, E>, elseFn: (error: E) => T): T {
    return unwrapOrElse(elseFn, this);
  }

  /** Method variant for [`Result.toMaybe`](../modules/_result_.html#tomaybe) */
  toMaybe(this: Result<T, E>): Maybe<T> {
    return toMaybe(this);
  }
}

export class Err<T, E> implements IResult<T, E> {
  /** `Err` is always [`Variant.Err`](../enums/_result_.variant#err). */
  variant = Variant.Err;

  private __error: E;

  constructor(error: E) {
    if (isVoid(error)) {
      throw new Error(
        'Tried to construct `Err` with `null` or `undefined`. Maybe you want `Maybe.Nothing`?'
      );
    }

    this.__error = error;
  }

  /** Method variant for [`Result.isOk`](../modules/_result_.html#isok) */
  isOk(this: Result<T, E>): this is Ok<T, E> {
    return isOk(this);
  }

  /** Method variant for [`Result.isErr`](../modules/_result_.html#iserr) */
  isErr(this: Result<T, E>): this is Err<T, E> {
    return isErr(this);
  }

  /** Method variant for [`Result.map`](../modules/_result_.html#map) */
  map<U>(this: Result<T, E>, mapFn: (t: T) => U): Result<U, E> {
    return map(mapFn, this);
  }

  /** Method variant for [`Result.mapOr`](../modules/_result_.html#mapor) */
  mapOr<U>(this: Result<T, E>, orU: U, mapFn: (t: T) => U): U {
    return mapOr(orU, mapFn, this);
  }

  /** Method variant for [`Result.mapOrElse`](../modules/_result_.html#maporelse) */
  mapOrElse<U>(this: Result<T, E>, orElseFn: (...args: any[]) => U, mapFn: (t: T) => U): U {
    return mapOrElse(orElseFn, mapFn, this);
  }

  /** Method variant for [`Result.mapErr`](../modules/_result_.html#maperr) */
  mapErr<F>(this: Result<T, E>, mapErrFn: (e: E) => F): Result<T, F> {
    return mapErr(mapErrFn, this);
  }

  /** Method variant for [`Result.or`](../modules/_result_.html#or) */
  or<F>(this: Result<T, E>, orResult: Result<T, F>): Result<T, F> {
    return or(orResult, this);
  }

  /** Method variant for [`Result.orElse`](../modules/_result_.html#orelse) */
  orElse<F>(this: Result<T, E>, orElseFn: (...args: any[]) => Result<T, F>): Result<T, F> {
    return orElse(orElseFn, this);
  }

  /** Method variant for [`Result.and`](../modules/_result_.html#and) */
  and<U>(this: Result<T, E>, mAnd: Result<U, E>): Result<U, E> {
    return and(mAnd, this);
  }

  /** Method variant for [`Result.andThen`](../modules/_result_.html#andthen) */
  andThen<U>(this: Result<T, E>, andThenFn: (t: T) => Result<U, E>): Result<U, E> {
    return andThen(andThenFn, this);
  }

  /** Method variant for [`Result.chain`](../modules/_result_.html#chain) */
  chain<U>(this: Result<T, E>, chainFn: (t: T) => Result<U, E>): Result<U, E> {
    return this.andThen(chainFn);
  }

  /** Method variant for [`Result.flatMap`](../modules/_result_.html#flatmap) */
  flatMap<U>(this: Result<T, E>, flatMapFn: (t: T) => Result<U, E>): Result<U, E> {
    return this.andThen(flatMapFn);
  }

  /** Method variant for [`Result.unsafelyUnwrap`](../modules/_result_.html#unsafelyunwrap) */
  unsafelyUnwrap(): never {
    throw 'Tried to `unwrap(Nothing)`';
  }

  /** Method variant for [`Result.unsafelyUnwrapErr`](../modules/_result_.html#unsafelyunwraperr) */
  unsafelyUnwrapErr(): E {
    return this.__error;
  }

  /** Method variant for [`Result.unwrapOr`](../modules/_result_.html#unwrapor) */
  unwrapOr<E>(this: Result<T, E>, defaultValue: T): T {
    return unwrapOr(defaultValue, this);
  }

  /** Method variant for [`Result.unwrapOrElse`](../modules/_result_.html#unwraporelse) */
  unwrapOrElse(this: Result<T, E>, elseFn: (error: E) => T): T {
    return unwrapOrElse(elseFn, this);
  }

  /** Method variant for [`Result.toMaybe`](../modules/_result_.html#tomaybe) */
  toMaybe(this: Result<T, E>): Maybe<T> {
    return toMaybe(this);
  }
}

/**
 * Is this result an `Ok` instance?
 * 
 * In TypeScript, narrows the type from `Result<T, E>` to `Ok<T, E>`.
 */
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T, E> =>
  result.variant === Variant.Ok;

/**
 * Is this result an `Err` instance?
 * 
 * In TypeScript, narrows the type from `Result<T, E>` to `Err<T, E>`.
 */
export const isErr = <T, E>(result: Result<T, E>): result is Err<T, E> =>
  result.variant === Variant.Err;

/**
* Create an instance of `Result.Ok`.
* 
* `null` and `undefined` are allowed by the type signature so that the
* function may `throw` on those rather than constructing a type like
* `Result<undefined>`.
* 
* @typeparam T The type of the item contained in the `Result`.
* @param value The value to wrap in a `Result.Ok`.
* @throws      If you pass `null` or `undefined`.
*/
export const ok = <T, E>(value: T | null | undefined): Result<T, E> => new Ok<T, E>(value);

/**
* Create an instance of `Result.Error`.
* 
* If you want to create an instance with a specific type, e.g. for use in a
* function which expects a `Result<T, E>` where the `<T, E>` is known but you have no
* value to give it, you can use a type parameter:
* 
* ```ts
* const notString = Result.error<string>();
* ```
* 
* @typeparam T The type of the item contained in the `Result`.
*/
export const err = <T, E>(error: E): Result<T, E> => new Err<T, E>(error);

/**
* A value which may (`Ok`) or may not (`Error`) be present.
* 
* The behavior of this type is checked by TypeScript at compile time, and bears
* no runtime overhead other than the very small cost of the container object.
*/
export type Result<T, E> = Ok<T, E> | Err<T, E>;

export default Result;

export const map = <T, U, E>(mapFn: (t: T) => U, result: Result<T, E>): Result<U, E> =>
  isOk(result) ? ok(mapFn(unwrap(result))) : err<U, E>(unwrapErr(result));

export const mapOr = <T, U, E>(orU: U, mapFn: (t: T) => U, result: Result<T, E>): U =>
  isOk(result) ? mapFn(unwrap(result)) : orU;

export const mapOrElse = <T, U, E>(
  orElseFn: (...args: any[]) => U,
  mapFn: (t: T) => U,
  result: Result<T, E>
): U => (isOk(result) ? mapFn(unwrap(result)) : orElseFn());

export const mapErr = <T, E, F>(mapErrFn: (e: E) => F, result: Result<T, E>): Result<T, F> =>
  isOk(result) ? ok(unwrap(result)) : err(mapErrFn(unwrapErr(result)));

export const and = <T, U, E>(ru: Result<U, E>, rt: Result<T, E>): Result<U, E> =>
  isOk(rt) ? ru : err(unwrapErr(rt));

/**
 * Apply a function to the wrapped value if `Ok` and return a new `Ok`
 * containing the resulting value; or if it is `Err` return it unmodified.
 * 
 * This is also commonly known as (and therefore aliased as) [`flatMap`] or
 * [`chain`]. It is sometimes also known as `bind`, but *not* aliased as such
 * because [`bind` already means something in JavaScript][bind].
 * 
 * [`flatMap`]: #flatmap
 * [`chain`]: #chain
 * [bind]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
 * 
 * @param thenFn The function to apply to the wrapped `T` if `maybe` is `Just`.
 * @param maybe  The `Maybe` to evaluate and possibly apply a function to.
 */
export const andThen = <T, U, E>(
  thenFn: (t: T) => Result<U, E>,
  result: Result<T, E>
): Result<U, E> => (isOk(result) ? thenFn(unwrap(result)) : err(unwrapErr(result)));

/** Alias for [`andThen`](#andthen). */
export const chain = andThen;

/** Alias for [`andThen`](#andthen). */
export const flatMap = andThen;

export const or = <T, E, F>(orResult: Result<T, F>, result: Result<T, E>): Result<T, F> =>
  isOk(result) ? ok(unwrap(result)) : orResult;

export const orElse = <T, E, F>(
  elseFn: (...args: any[]) => Result<T, F>,
  result: Result<T, E>
): Result<T, F> => (isOk(result) ? ok(unwrap(result)) : elseFn());

/**
 * Get the value out of the `Result`.
 * 
 * Returns the content of an `Ok`, but **throws if the `Result` is `Err`.**
 * Prefer to use [`unwrapOr`](#unwrapor) or [`unwrapOrElse`](#unwraporelse).
 *
 * @throws If the `Result` instance is `Nothing`.
 */
export const unsafelyUnwrap = <T, E>(result: Result<T, E>): T => result.unsafelyUnwrap();

// For internal use; but not exported because we want to emphasize that this is
// a bad idea via the name.
const unwrap = unsafelyUnwrap;

/**
 * Get the error value out of the `Result`.
 * 
 * Returns the content of an `Err`, but **throws if the `Result` is `Ok`**.
 * Prefer to use [`unwrapOrElse`](#unwraporelse).
 *
 * @param result
 * @throws Error If the `Result` instance is `Nothing`.
 */
export const unsafelyUnwrapErr = <T, E>(result: Result<T, E>): E => result.unsafelyUnwrapErr();

// For internal use; but not exported because we want to emphasize that this is
// a bad idea via the name.
const unwrapErr = unsafelyUnwrapErr;

export const unwrapOr = <T, E>(defaultValue: T, result: Result<T, E>): T =>
  isOk(result) ? unwrap(result) : defaultValue;

export const unwrapOrElse = <T, E>(orElseFn: (error: E) => T, result: Result<T, E>): T =>
  isOk(result) ? unwrap(result) : orElseFn(unwrapErr(result));

/**
 * Convert a [`Result`](#result) to a [`Maybe`](#../modules/_maybe_.html#maybe).
 * 
 * The converted type will be [`Just`] if the `Result` is [`Ok`] or [`Nothing`]
 * if the `Result` is [`Err`]; the wrapped error value will be discarded.
 * 
 * [`Result`]: #result
 * [`Just`]: ../classes/_maybe_.just.html
 * [`Nothing`]: ../classes/_maybe_.nothing.html
 * [`Ok`]: ../classes/_result_.ok.html
 * [`Err`]: ../classes/_result_.err.html
 * 
 * @param result The `Result` to convert to a `Maybe`
 * @returns      `Just` the value in `result` if it is `Ok`; otherwise `Nothing`
 */
export const toMaybe = <T, E>(result: Result<T, E>): Maybe<T> =>
  isOk(result) ? just(unwrap(result)) : nothing();

export const fromMaybe = <T, E>(errValue: E, maybe: Maybe<T>): Result<T, E> =>
  isJust(maybe) ? ok<T, E>(unwrapMaybe(maybe)) : err<T, E>(errValue);
