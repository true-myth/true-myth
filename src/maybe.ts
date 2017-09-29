/**
 * # Maybe
 * 
 * A `Maybe<T>` is a value of type `T` which may or may not be present.
 * 
 * If the value is present, it is `Some(value)`. If it's absent, it's `Nothing`.
 * This provides a type-safe container for dealing with the possibility that
 * there's nothing here – a container you can do many of the same things you
 * might with an array – so that you can avoid nasty `null` and `undefined`
 * checks throughout your codebase.
 */

/** (keep typedoc from getting confused by the imports) */
import { isVoid } from './utils';
import { Result, ok, err } from './result';

/**
 * Discriminant for the `Some` and `Nothing` variants.
 */
export enum Variant {
  Some = 'Some',
  Nothing = 'Nothing',
}

// Someday maybe we'll have `protocol`s and this would just have default
// implementations for nearly everything in the concrete classes below.
export interface IMaybe<T> {
  variant: Variant;

  /** Method variant for [`Maybe.isSome`](../modules/_maybe_.html#issome) */
  isSome(this: Maybe<T>): this is Some<T>;

  /** Method variant for [`Maybe.isNothing`](../modules/_maybe_.html#isnothing) */
  isNothing(this: Maybe<T>): this is Nothing<T>;

  /** Method variant for [`Maybe.map`](../modules/_maybe_.html#map) */
  map<U>(this: Maybe<T>, mapFn: (t: T) => U): Maybe<U>;

  /** Method variant for [`Maybe.mapOr`](../modules/_maybe_.html#mapor) */
  mapOr<U>(this: Maybe<T>, orU: U, mapFn: (t: T) => U): U;

  /** Method variant for [`Maybe.mapOrElse`](../modules/_maybe_.html#maporelse) */
  mapOrElse<U>(this: Maybe<T>, orElseFn: (...args: any[]) => U, mapFn: (t: T) => U): U;

  /** Method variant for [`Maybe.or`](../modules/_maybe_.html#or) */
  or(this: Maybe<T>, mOr: Maybe<T>): Maybe<T>;

  /** Method variant for [`Maybe.orElse`](../modules/_maybe_.html#orelse) */
  orElse(this: Maybe<T>, orElseFn: (...args: any[]) => Maybe<T>): Maybe<T>;

  /** Method variant for [`Maybe.and`](../modules/_maybe_.html#and) */
  and<U>(this: Maybe<T>, mAnd: Maybe<U>): Maybe<U>;

  /** Method variant for [`Maybe.andThen`](../modules/_maybe_.html#andthen) */
  andThen<U>(this: Maybe<T>, andThenFn: (t: T) => Maybe<U>): Maybe<U>;

  /** Method variant for [`Maybe.unwrap`](../modules/_maybe_.html#unwrap) */
  unwrap(): T | never;

  /** Method variant for [`Maybe.unwrapOrElse`](../modules/_maybe_.html#unwraporelse) */
  unwrapOrElse(this: Maybe<T>, elseFn: (...args: any[]) => T): T;

  /** Method variant for [`Maybe.toOkOrErr`](../modules/_maybe_.html#tookorerr) */
  toOkOrErr<E>(this: Maybe<T>, error: E): Result<T, E>;

  /** Method variant for [`Maybe.toOkOrElseErr`](../modules/_maybe_.html#tookorelseerr) */
  toOkOrElseErr<T, E>(this: Maybe<T>, elseFn: (...args: any[]) => E): Result<T, E>;
}

export class Some<T> implements IMaybe<T> {
  private __value: T;

  variant = Variant.Some;

  /**
   * Create an instance of `Maybe.Some` with `new`.
   * 
   * **Note:** While you *may* create the `Some` type via normal JavaScript
   * class construction, it is not recommended for the functional style for
   * which the library is intended. Instead, use Maybe.[[of]] (for the general
   * case) or Maybe.[[some]] for this specific case.
   * 
   * ```ts
   * // Avoid:
   * const aString = new Maybe.Some('characters');
   * 
   * // Prefer:
   * const aString = Maybe.some('characters);
   * ```
   * 
   * @param value
   * The value to wrap in a `Maybe.Some`.
   * 
   * `null` and `undefined` are allowed by the type signature so that the
   * constructor may `throw` on those rather than constructing a type like
   * `Maybe<undefined>`.
   * 
   * @throws      If you pass `null` or `undefined`.
   */
  constructor(value: T | null | undefined) {
    if (isVoid(value)) {
      throw new Error('Tried to construct `Some` with `null` or `undefined`');
    }

    this.__value = value;
  }

  /** Method variant for [`Maybe.isSome`](../modules/_maybe_.html#issome) */
  isSome(this: Maybe<T>): this is Some<T> {
    return isSome(this);
  }

  /** Method variant for [`Maybe.isNothing`](../modules/_maybe_.html#isnothing) */
  isNothing(this: Maybe<T>): this is Nothing<T> {
    return isNothing(this);
  }

  map<U>(this: Maybe<T>, mapFn: (t: T) => U): Maybe<U> {
    return map(mapFn, this);
  }

  mapOr<U>(this: Maybe<T>, orU: U, mapFn: (t: T) => U): U {
    return mapOr(orU, mapFn, this);
  }

  mapOrElse<U>(this: Maybe<T>, orElseFn: (...args: any[]) => U, mapFn: (t: T) => U): U {
    return mapOrElse(orElseFn, mapFn, this);
  }

  or(this: Maybe<T>, mOr: Maybe<T>): Maybe<T> {
    return or(mOr, this);
  }

  orElse(this: Maybe<T>, orElseFn: (...args: any[]) => Maybe<T>): Maybe<T> {
    return orElse(orElseFn, this);
  }

  and<U>(this: Maybe<T>, mAnd: Maybe<U>): Maybe<U> {
    return and(mAnd, this);
  }

  andThen<U>(this: Maybe<T>, andThenFn: (t: T) => Maybe<U>): Maybe<U> {
    return andThen(andThenFn, this);
  }

  unwrap(): T {
    return this.__value;
  }

  unwrapOrElse(this: Maybe<T>, elseFn: (...args: any[]) => T): T {
    return unwrapOrElse(elseFn, this);
  }

  toOkOrErr<E>(this: Maybe<T>, error: E): Result<T, E> {
    return toOkOrErr(error, this);
  }

  toOkOrElseErr<T, E>(this: Maybe<T>, elseFn: (...args: any[]) => E): Result<T, E> {
    return toOkOrElseErr(elseFn, this);
  }
}

export class Nothing<T> implements IMaybe<T> {
  variant = Variant.Nothing;

  /** Method variant for [`Maybe.isSome`](../modules/_maybe_.html#issome) */
  isSome(this: Maybe<T>): this is Some<T> {
    return isSome(this);
  }

  /** Method variant for [`Maybe.isNothing`](../modules/_maybe_.html#isnothing) */
  isNothing(this: Maybe<T>): this is Nothing<T> {
    return isNothing(this);
  }

  map<U>(this: Maybe<T>, mapFn: (t: T) => U): Maybe<U> {
    return map(mapFn, this);
  }

  mapOr<U>(this: Maybe<T>, orU: U, mapFn: (t: T) => U): U {
    return mapOr(orU, mapFn, this);
  }

  mapOrElse<U>(this: Maybe<T>, orElseFn: (...args: any[]) => U, mapFn: (t: T) => U): U {
    return mapOrElse(orElseFn, mapFn, this);
  }

  or(this: Maybe<T>, mOr: Maybe<T>): Maybe<T> {
    return or(mOr, this);
  }

  orElse(this: Maybe<T>, orElseFn: (...args: any[]) => Maybe<T>): Maybe<T> {
    return orElse(orElseFn, this);
  }

  and<U>(this: Maybe<T>, mAnd: Maybe<U>): Maybe<U> {
    return and(mAnd, this);
  }

  andThen<U>(this: Maybe<T>, andThenFn: (t: T) => Maybe<U>): Maybe<U> {
    return andThen(andThenFn, this);
  }

  unwrap(): never {
    throw new Error('Tried to `unwrap(Nothing)`');
  }

  unwrapOrElse(this: Maybe<T>, elseFn: (...args: any[]) => T): T {
    return unwrapOrElse(elseFn, this);
  }

  toOkOrErr<E>(this: Maybe<T>, error: E): Result<T, E> {
    return toOkOrErr(error, this);
  }

  toOkOrElseErr<T, E>(this: Maybe<T>, elseFn: (...args: any[]) => E): Result<T, E> {
    return toOkOrElseErr(elseFn, this);
  }
}

export const isSome = <T>(m: Maybe<T>): m is Some<T> => m.variant === Variant.Some;
export const isNothing = <T>(m: Maybe<T>): m is Nothing<T> => m.variant === Variant.Nothing;

/**
 * Create an instance of `Maybe.Some`.
 * 
 * `null` and `undefined` are allowed by the type signature so that the
 * function may `throw` on those rather than constructing a type like
 * `Maybe<undefined>`.
 * 
 * @typeparam T The type of the item contained in the `Maybe`.
 * @param value The value to wrap in a `Maybe.Some`.
 * @throws      If you pass `null` or `undefined`.
*/
export const some = <T>(value: T | null | undefined): Maybe<T> => new Some<T>(value);

/**
 * Create an instance of `Maybe.Nothing`.
 * 
 * If you want to create an instance with a specific type, e.g. for use in a
 * function which expects a `Maybe<T>` where the `<T>` is known but you have no
 * value to give it, you can use a type parameter:
 * 
 * ```ts
 * const notString = Maybe.nothing<string>();
 * ```
 * 
 * @typeparam T The type of the item contained in the `Maybe`.
 */
export const nothing = <T>(): Maybe<T> => new Nothing<T>();

/**
 * A value which may (`Some<T>`) or may not (`Nothing`) be present.
 * 
 * The behavior of this type is checked by TypeScript at compile time, and bears
 * no runtime overhead other than the very small cost of the container object.
 */
export type Maybe<T> = Some<T> | Nothing<T>;

/**
 * Create a `Maybe` from any value.
 * 
 * To specify that the result should be interpreted as a specific type, you may
 * invoke `Maybe.of` with an explicit type parameter:
 * 
 * ```ts
 * const foo = Maybe.of<string>(null);
 * ```
 * 
 * This is usually only important in two cases:
 * 
 * 1.  If you are intentionally constructing a `Nothing` from a known `null` or
 *     undefined value.
 * 2.  If you are specifying that the type is more general than the value passed
 *     (since TypeScript can define types as literals).
 * 
 * @typeparam T The type of the item contained in the `Maybe`.
 * @param value The value to wrap in a `Maybe`. If it is `undefined` or `null`,
 *              the result will be `Nothing`; otherwise it will be the type of
 *              the value passed.
 */
export const of = <T>(value: T | undefined | null): Maybe<T> =>
  isVoid(value) ? nothing<T>() : some(value);

export default Maybe;

export const map = <T, U>(mapFn: (t: T) => U, mt: Maybe<T>): Maybe<U> =>
  isSome(mt) ? some(mapFn(unwrap(mt))) : nothing<U>();

export const mapOr = <T, U>(orU: U, mapFn: (t: T) => U, mt: Maybe<T>): U =>
  isSome(mt) ? mapFn(unwrap(mt)) : orU;

export const mapOrElse = <T, U>(
  orElseFn: (...args: any[]) => U,
  mapFn: (t: T) => U,
  mt: Maybe<T>
): U => (isSome(mt) ? mapFn(unwrap(mt)) : orElseFn());

export const and = <T, U>(mu: Maybe<U>, mt: Maybe<T>): Maybe<U> => (isSome(mt) ? mu : nothing());

export const andThen = <T, U>(thenFn: (t: T) => Maybe<U>, mt: Maybe<T>): Maybe<U> =>
  isSome(mt) ? thenFn(unwrap(mt)) : nothing();

export const or = <T>(mDef: Maybe<T>, mt: Maybe<T>): Maybe<T> => (isSome(mt) ? mt : mDef);

export const orElse = <T>(elseFn: (...args: any[]) => Maybe<T>, mt: Maybe<T>): Maybe<T> =>
  isSome(mt) ? mt : elseFn();

export const unwrap = <T>(mt: Maybe<T>): T => {
  return mt.unwrap();
};

export const unwrapOrElse = <T>(orElseFn: (...args: any[]) => T, mt: Maybe<T>): T =>
  isSome(mt) ? unwrap(mt) : orElseFn();

/**
 * Transform the [[Maybe]] into a [[Result]], using the wrapped value as the
 * `Ok` value if `Some`; otherwise using the supplied `error` value for `Err`.
 * 
 * @typeparam T The wrapped value.
 * @typeparam E The error type to in the `Result`.
 * @param error The function which generates an error of type `E`.
 * @param maybe The `Maybe` instance to convert.
 */
export const toOkOrErr = <T, E>(error: E, maybe: Maybe<T>): Result<T, E> =>
  isSome(maybe) ? ok(unwrap(maybe)) : err(error);

/**
 * Transform the [[Maybe]] into a [[Result]], using the wrapped value as the
 * `Ok` value if `Some`; otherwise using `elseFn` to generate `Err`.
 * 
 * @typeparam T  The wrapped value.
 * @typeparam E  The error type to in the `Result`.
 * @param elseFn The function which generates an error of type `E`.
 * @param maybe  The `Maybe` instance to convert.
 */
export const toOkOrElseErr = <T, E>(elseFn: (...args: any[]) => E, maybe: Maybe<T>): Result<T, E> =>
  isSome(maybe) ? ok(unwrap(maybe)) : err(elseFn());
