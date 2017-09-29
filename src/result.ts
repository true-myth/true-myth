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
import { Maybe, some, nothing } from './maybe';

/**
 * Discriminant for `Ok` or `Error`.
 */
export enum Variant {
  Ok = 'Ok',
  Err = 'Err',
}

// TODO: `mapErr` and friends.

// Someday Result we'll have `protocol`s and this would just have default
// implementations for nearly everything in the concrete classes below.
export interface IResult<T, E> {
  /**
   * Distinguish between the `Ok` and `Error` variants.
   */
  variant: Variant;

  /** Method variant for [`Result.map`](../modules/_result_.html#map) */
  map<U>(this: Result<T, E>, mapFn: (t: T) => U): Result<U, E>;

  /** Method variant for [`Result.mapOr`](../modules/_result_.html#mapor) */
  mapOr<U>(this: Result<T, E>, orU: U, mapFn: (t: T) => U): U;

  /** Method variant for [`Result.mapOrElse`](../modules/_result_.html#maporelse) */
  mapOrElse<U>(this: Result<T, E>, orElseFn: (...args: any[]) => U, mapFn: (t: T) => U): U;

  /** Method variant for [`Result.mapErr`](../modules/_result_.html#maperr) */
  mapErr<F>(this: Result<T, E>, mapErrFn: (e: E) => F): Result<T, F>;

  /** Method variant for [`Result.or`](../modules/_result_.html#or) */
  or(this: Result<T, E>, mOr: Result<T, E>): Result<T, E>;

  /** Method variant for [`Result.orElse`](../modules/_result_.html#orelse) */
  orElse(this: Result<T, E>, orElseFn: (...args: any[]) => Result<T, E>): Result<T, E>;

  /** Method variant for [`Result.and`](../modules/_result_.html#and) */
  and<U>(this: Result<T, E>, mAnd: Result<U, E>): Result<U, E>;

  /** Method variant for [`Result.andThen`](../modules/_result_.html#andthen) */
  andThen<U>(this: Result<T, E>, andThenFn: (t: T) => Result<U, E>): Result<U, E>;

  /** Method variant for [`Result.unwrap`](../modules/_result_.html#unwrap) */
  unwrap(): T | never;

  /** Method variant for [`Result.unwrapErr`](../modules/_result_.html#unwraperr) */
  unwrapErr(): E | never;

  /** Method variant for [`Result.unwrapOrElse`](../modules/_result_.html#unwrapOrElse) */
  unwrapOrElse(this: Result<T, E>, elseFn: (...args: any[]) => T): T;

  /** Method variant for [`Result.toMaybe`](../modules/_result_.html#tomaybe) */
  toMaybe(this: Result<T, E>): Maybe<T>;
}

/**
 * The `Ok` variant for [[Result]].
 * 
 * An `Ok` instance represents a *successful* `Result`.
 */
export class Ok<T, E> implements IResult<T, E> {
  private __value: T;

  variant = Variant.Ok;

  /**
   * Create an instance of `Result.Ok` with `new`.
   * 
   * **Note:** While you *may* create the `Result` type via normal JavaScript
   * class construction, it is not recommended for the functional style for
   * which the library is intended. Instead, use Result.[[ok]].
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
      throw 'Tried to construct `Ok` with `null` or `undefined`';
    }

    this.__value = value;
  }

  map<U>(this: Result<T, E>, mapFn: (t: T) => U): Result<U, E> {
    return map(mapFn, this);
  }

  mapOr<U>(this: Result<T, E>, orU: U, mapFn: (t: T) => U): U {
    return mapOr(orU, mapFn, this);
  }

  mapOrElse<U>(this: Result<T, E>, orElseFn: (...args: any[]) => U, mapFn: (t: T) => U): U {
    return mapOrElse(orElseFn, mapFn, this);
  }

  mapErr<F>(this: Result<T, E>, mapErrFn: (e: E) => F): Result<T, F> {
    return mapErr(mapErrFn, this);
  }

  or(this: Result<T, E>, mOr: Result<T, E>): Result<T, E> {
    return or(mOr, this);
  }

  orElse(this: Result<T, E>, orElseFn: (...args: any[]) => Result<T, E>): Result<T, E> {
    return orElse(orElseFn, this);
  }

  and<U>(this: Result<T, E>, mAnd: Result<U, E>): Result<U, E> {
    return and(mAnd, this);
  }

  andThen<U>(this: Result<T, E>, andThenFn: (t: T) => Result<U, E>): Result<U, E> {
    return andThen(andThenFn, this);
  }

  unwrap(): T {
    return this.__value;
  }

  unwrapErr(): E | never {
    throw 'Tried to `unwrapErr` an `Ok`';
  }

  unwrapOrElse(this: Result<T, E>, elseFn: (...args: any[]) => T): T {
    return unwrapOrElse(elseFn, this);
  }

  toMaybe(this: Result<T, E>): Maybe<T> {
    return toMaybe(this);
  }
}

export class Err<T, E> implements IResult<T, E> {
  variant = Variant.Err;

  private __error: E;

  constructor(error: E) {
    this.__error = error;
  }

  map<U>(this: Result<T, E>, mapFn: (t: T) => U): Result<U, E> {
    return map(mapFn, this);
  }

  mapOr<U>(this: Result<T, E>, orU: U, mapFn: (t: T) => U): U {
    return mapOr(orU, mapFn, this);
  }

  mapOrElse<U>(this: Result<T, E>, orElseFn: (...args: any[]) => U, mapFn: (t: T) => U): U {
    return mapOrElse(orElseFn, mapFn, this);
  }

  mapErr<F>(this: Result<T, E>, mapErrFn: (e: E) => F): Result<T, F> {
    return mapErr(mapErrFn, this);
  }

  or(this: Result<T, E>, mOr: Result<T, E>): Result<T, E> {
    return or(mOr, this);
  }

  orElse(this: Result<T, E>, orElseFn: (...args: any[]) => Result<T, E>): Result<T, E> {
    return orElse(orElseFn, this);
  }

  and<U>(this: Result<T, E>, mAnd: Result<U, E>): Result<U, E> {
    return and(mAnd, this);
  }

  andThen<U>(this: Result<T, E>, andThenFn: (t: T) => Result<U, E>): Result<U, E> {
    return andThen(andThenFn, this);
  }

  unwrap(): never {
    throw 'Tried to `unwrap(Nothing)`';
  }

  unwrapErr(): E {
    return this.__error;
  }

  unwrapOrElse(this: Result<T, E>, elseFn: (...args: any[]) => T): T {
    return unwrapOrElse(elseFn, this);
  }

  toMaybe(this: Result<T, E>): Maybe<T> {
    return toMaybe(this);
  }
}

/**
 * Is this result an `Ok` instance?
 * 
 * In TypeScript, narrows the type from `Result<T, E>` to `Ok<T, E>`.
 * 
 * @param result The `Result` instance to check.
 */
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T, E> =>
  result.variant === Variant.Ok;

/**
 * Is this result an `Err` instance?
 * 
 * In TypeScript, narrows the type from `Result<T, E>` to `Err<T, E>`.
 * 
 * @param result The `Result` instance to check.
 */
export const isError = <T, E>(result: Result<T, E>): result is Err<T, E> =>
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

export const mapOr = <T, U, E>(orU: U, mapFn: (t: T) => U, mt: Result<T, E>): U =>
  isOk(mt) ? mapFn(unwrap(mt)) : orU;

export const mapOrElse = <T, U, E>(
  orElseFn: (...args: any[]) => U,
  mapFn: (t: T) => U,
  mt: Result<T, E>
): U => (isOk(mt) ? mapFn(unwrap(mt)) : orElseFn());

export const mapErr = <T, E, F>(mapErrFn: (e: E) => F, result: Result<T, E>): Result<T, F> =>
  isOk(result) ? ok(unwrap(result)) : err(mapErrFn(unwrapErr(result)));

export const and = <T, U, E>(ru: Result<U, E>, rt: Result<T, E>): Result<U, E> =>
  isOk(rt) ? ru : err(unwrapErr(rt));

export const andThen = <T, U, E>(
  thenFn: (t: T) => Result<U, E>,
  result: Result<T, E>
): Result<U, E> => (isOk(result) ? thenFn(unwrap(result)) : err(unwrapErr(result)));

export const or = <T, E>(orResult: Result<T, E>, result: Result<T, E>): Result<T, E> =>
  isOk(result) ? result : orResult;

export const orElse = <T, E>(
  elseFn: (...args: any[]) => Result<T, E>,
  mt: Result<T, E>
): Result<T, E> => (isOk(mt) ? mt : elseFn());

export const unwrap = <T, E>(mt: Result<T, E>): T => {
  return mt.unwrap();
};

export const unwrapErr = <T, E>(result: Result<T, E>): E => {
  return result.unwrapErr();
};

export const unwrapOrElse = <T, E>(orElseFn: (...args: any[]) => T, mt: Result<T, E>): T =>
  isOk(mt) ? unwrap(mt) : orElseFn();

/**
 * Convert a [[Result]] to a [[Maybe]].
 * 
 * The converted type will be [[Some]] if the `Result` is [[Ok]] or [[Nothing]]
 * if the `Result` is [[Err]]; the wrapped error value will be discarded.
 */
export const toMaybe = <T, E>(result: Result<T, E>): Maybe<T> =>
  isOk(result) ? some(unwrap(result)) : nothing();
