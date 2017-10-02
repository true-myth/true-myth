/**
 * A [`Maybe<T>`](#maybe) represents a value of type `T` which may, or may not,
 * be present.
 * 
 * If the value is present, it is `Just(value)`. If it's absent, it's `Nothing`.
 * This provides a type-safe container for dealing with the possibility that
 * there's nothing here – a container you can do many of the same things you
 * might with an array – so that you can avoid nasty `null` and `undefined`
 * checks throughout your codebase.
 * 
 * The behavior of this type is checked by TypeScript or Flow at compile time,
 * and bears no runtime overhead other than the very small cost of the container
 * object and some lightweight wrap/unwrap functionality.
 * 
 * The `Nothing` variant has a type parameter `<T>` so that type inference works
 * correctly in TypeScript when operating on `Nothing` instances with functions
 * which require a `T` to behave properly, e.g. [`map`](#map), which cannot
 * check that the map function satisies the type constraints for `Maybe<T>`
 * unless `Nothing` has a parameter `T` to constrain it on invocation.
 * 
 * Put simply: if you have a `Nothing` variant of a `Maybe<string>`, and you
 * pass a function to it which does *not* operate on a `string`, it will still
 * type check because TypeScript doesn't have enough information to check it.
 */

/** (keep typedoc from getting confused by the imports) */
import { isVoid } from './utils';
import * as Result from './result';

/**
 * Discriminant for the `Just` and `Nothing` variants.
 * 
 * You can use the discriminant via the `variant` property of `Maybe` instances
 * if you need to match explicitly on it.
 */
export enum Variant {
  Just = 'Just',
  Nothing = 'Nothing',
}

// Someday maybe we'll have `protocol`s and this would just have default
// implementations for nearly everything in the concrete classes below.
export interface IMaybe<T> {
  /** Distinguish between the `Just` and `Nothing` [variants](../enums/_maybe_.variant). */
  variant: Variant;

  /** Method variant for [`Maybe.isJust`](../modules/_maybe_.html#isjust) */
  isJust(this: Maybe<T>): this is Just<T>;

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

  /** Method variant for [`Maybe.chain`](../modules/_maybe_.html#chain) */
  chain<U>(this: Maybe<T>, chainFn: (t: T) => Maybe<U>): Maybe<U>;

  /** Method variant for [`Maybe.flatMap`](../modules/_maybe_.html#flatmap) */
  flatMap<U>(this: Maybe<T>, flatMapFn: (t: T) => Maybe<U>): Maybe<U>;

  /** Method variant for [`Maybe.unwrap`](../modules/_maybe_.html#unwrap) */
  unsafelyUnwrap(): T | never;

  /** Method variant for [`Maybe.unwrapOrElse`](../modules/_maybe_.html#unwraporelse) */
  unwrapOrElse(this: Maybe<T>, elseFn: (...args: any[]) => T): T;

  /** Method variant for [`Maybe.toOkOrErr`](../modules/_maybe_.html#tookorerr) */
  toOkOrErr<E>(this: Maybe<T>, error: E): Result.Result<T, E>;

  /** Method variant for [`Maybe.toOkOrElseErr`](../modules/_maybe_.html#tookorelseerr) */
  toOkOrElseErr<T, E>(this: Maybe<T>, elseFn: (...args: any[]) => E): Result.Result<T, E>;

  /** Method variant for [`Maybe.toString`](../modules/_maybe_.html#tostring) */
  toString<T>(this: Maybe<T>): string;
}

export class Just<T> implements IMaybe<T> {
  private __value: T;

  /** `Just` is always [`Variant.Just`](../enums/_maybe_.variant#just). */
  variant = Variant.Just;

  /**
   * Create an instance of `Maybe.Just` with `new`.
   * 
   * **Note:** While you *may* create the `Just` type via normal JavaScript
   * class construction, it is not recommended for the functional style for
   * which the library is intended. Instead, use [`Maybe.of`] (for the general
   * case) or [`Maybe.just`] for this specific case.
   * 
   * [`Maybe.of`]: ../modules/_maybe_.html#of
   * [`Maybe.just`]: ../modules/_maybe_.html#just
   * 
   * ```ts
   * // Avoid:
   * const aString = new Maybe.Just('characters');
   * 
   * // Prefer:
   * const aString = Maybe.just('characters);
   * ```
   * 
   * @param value
   * The value to wrap in a `Maybe.Just`.
   * 
   * `null` and `undefined` are allowed by the type signature so that the
   * constructor may `throw` on those rather than constructing a type like
   * `Maybe<undefined>`.
   * 
   * @throws      If you pass `null` or `undefined`.
   */
  constructor(value: T | null | undefined) {
    if (isVoid(value)) {
      throw 'Tried to construct `Just` with `null` or `undefined`';
    }

    this.__value = value;
  }

  /** Method variant for [`Maybe.isJust`](../modules/_maybe_.html#isjust) */
  isJust(this: Maybe<T>): this is Just<T> {
    return isJust(this);
  }

  /** Method variant for [`Maybe.isNothing`](../modules/_maybe_.html#isnothing) */
  isNothing(this: Maybe<T>): this is Nothing<T> {
    return isNothing(this);
  }

  /** Method variant for [`Maybe.map`](../modules/_maybe_.html#map) */
  map<U>(this: Maybe<T>, mapFn: (t: T) => U): Maybe<U> {
    return map(mapFn, this);
  }

  /** Method variant for [`Maybe.mapOr`](../modules/_maybe_.html#mapor) */
  mapOr<U>(this: Maybe<T>, orU: U, mapFn: (t: T) => U): U {
    return mapOr(orU, mapFn, this);
  }

  /** Method variant for [`Maybe.mapOrElse`](../modules/_maybe_.html#maporelse) */
  mapOrElse<U>(this: Maybe<T>, orElseFn: (...args: any[]) => U, mapFn: (t: T) => U): U {
    return mapOrElse(orElseFn, mapFn, this);
  }

  /** Method variant for [`Maybe.or`](../modules/_maybe_.html#or) */
  or(this: Maybe<T>, mOr: Maybe<T>): Maybe<T> {
    return or(mOr, this);
  }

  /** Method variant for [`Maybe.orElse`](../modules/_maybe_.html#orelse) */
  orElse(this: Maybe<T>, orElseFn: (...args: any[]) => Maybe<T>): Maybe<T> {
    return orElse(orElseFn, this);
  }

  /** Method variant for [`Maybe.and`](../modules/_maybe_.html#and) */
  and<U>(this: Maybe<T>, mAnd: Maybe<U>): Maybe<U> {
    return and(mAnd, this);
  }

  /** Method variant for [`Maybe.andThen`](../modules/_maybe_.html#andthen) */
  andThen<U>(this: Maybe<T>, andThenFn: (t: T) => Maybe<U>): Maybe<U> {
    return andThen(andThenFn, this);
  }

  /** Method variant for [`Maybe.chain`](../modules/_maybe_.html#chain) */
  chain<U>(this: Maybe<T>, chainFn: (t: T) => Maybe<U>): Maybe<U> {
    return this.andThen(chainFn);
  }

  /** Method variant for [`Maybe.flatMap`](../modules/_maybe_.html#flatmap) */
  flatMap<U>(this: Maybe<T>, flatMapFn: (t: T) => Maybe<U>): Maybe<U> {
    return this.andThen(flatMapFn);
  }

  /** Method variant for [`Maybe.unsafelyUnwrap`](../modules/_maybe_.html#unsafelyunwrap) */
  unsafelyUnwrap(): T {
    return this.__value;
  }

  /** Method variant for [`Maybe.unwrapOr`](../modules/_maybe_.html#unwrapor) */
  unwrapOr(this: Maybe<T>, defaultValue: T): T {
    return unwrapOr(defaultValue, this);
  }

  /** Method variant for [`Maybe.unwrapOrElse`](../modules/_maybe_.html#unwraporelse) */
  unwrapOrElse(this: Maybe<T>, elseFn: (...args: any[]) => T): T {
    return unwrapOrElse(elseFn, this);
  }

  /** Method variant for [`Maybe.toOkOrErr`](../modules/_maybe_.html#tookorerr) */
  toOkOrErr<E>(this: Maybe<T>, error: E): Result.Result<T, E> {
    return toOkOrErr(error, this);
  }

  /** Method variant for [`Maybe.toOkOrElseErr`](../modules/_maybe_.html#tookorelseerr) */
  toOkOrElseErr<T, E>(this: Maybe<T>, elseFn: (...args: any[]) => E): Result.Result<T, E> {
    return toOkOrElseErr(elseFn, this);
  }

  /** Method variant for [`Maybe.toString`](../modules/_maybe_.html#tostring) */
  toString<T>(this: Maybe<T>): string {
    return toString(this);
  }
}

export class Nothing<T> implements IMaybe<T> {
  /** `Nothing` is always [`Variant.Nothing`](../enums/_maybe_.variant#nothing). */
  variant = Variant.Nothing;

  /** Method variant for [`Maybe.isJust`](../modules/_maybe_.html#isjust) */
  isJust(this: Maybe<T>): this is Just<T> {
    return isJust(this);
  }

  /** Method variant for [`Maybe.isNothing`](../modules/_maybe_.html#isnothing) */
  isNothing(this: Maybe<T>): this is Nothing<T> {
    return isNothing(this);
  }

  /** Method variant for [`Maybe.map`](../modules/_maybe_.html#map) */
  map<U>(this: Maybe<T>, mapFn: (t: T) => U): Maybe<U> {
    return map(mapFn, this);
  }

  /** Method variant for [`Maybe.mapOr`](../modules/_maybe_.html#mapor) */
  mapOr<U>(this: Maybe<T>, orU: U, mapFn: (t: T) => U): U {
    return mapOr(orU, mapFn, this);
  }

  /** Method variant for [`Maybe.mapOrElse`](../modules/_maybe_.html#maporelse) */
  mapOrElse<U>(this: Maybe<T>, orElseFn: (...args: any[]) => U, mapFn: (t: T) => U): U {
    return mapOrElse(orElseFn, mapFn, this);
  }

  /** Method variant for [`Maybe.or`](../modules/_maybe_.html#or) */
  or(this: Maybe<T>, mOr: Maybe<T>): Maybe<T> {
    return or(mOr, this);
  }

  /** Method variant for [`Maybe.orElse`](../modules/_maybe_.html#orelse) */
  orElse(this: Maybe<T>, orElseFn: (...args: any[]) => Maybe<T>): Maybe<T> {
    return orElse(orElseFn, this);
  }

  /** Method variant for [`Maybe.and`](../modules/_maybe_.html#and) */
  and<U>(this: Maybe<T>, mAnd: Maybe<U>): Maybe<U> {
    return and(mAnd, this);
  }

  /** Method variant for [`Maybe.andThen`](../modules/_maybe_.html#andthen) */
  andThen<U>(this: Maybe<T>, andThenFn: (t: T) => Maybe<U>): Maybe<U> {
    return andThen(andThenFn, this);
  }

  /** Method variant for [`Maybe.chain`](../modules/_maybe_.html#chain) */
  chain<U>(this: Maybe<T>, chainFn: (t: T) => Maybe<U>): Maybe<U> {
    return this.andThen(chainFn);
  }

  /** Method variant for [`Maybe.flatMap`](../modules/_maybe_.html#flatmap) */
  flatMap<U>(this: Maybe<T>, flatMapFn: (t: T) => Maybe<U>): Maybe<U> {
    return this.andThen(flatMapFn);
  }

  /** Method variant for [`Maybe.unsafelyUnwrap`](../modules/_maybe_.html#unsafelyunwrap) */
  unsafelyUnwrap(): never {
    throw 'Tried to `unsafelyUnwrap(Nothing)`';
  }

  /** Method variant for [`Maybe.unwrapOr`](../modules/_maybe_.html#unwrapor) */
  unwrapOr(this: Maybe<T>, defaultValue: T): T {
    return unwrapOr(defaultValue, this);
  }

  /** Method variant for [`Maybe.unwrapOrElse`](../modules/_maybe_.html#unwraporelse) */
  unwrapOrElse(this: Maybe<T>, elseFn: (...args: any[]) => T): T {
    return unwrapOrElse(elseFn, this);
  }

  /** Method variant for [`Maybe.toOkOrErr`](../modules/_maybe_.html#tookorerr) */
  toOkOrErr<E>(this: Maybe<T>, error: E): Result.Result<T, E> {
    return toOkOrErr(error, this);
  }

  /** Method variant for [`Maybe.toOkOrElseErr`](../modules/_maybe_.html#tookorelseerr) */
  toOkOrElseErr<T, E>(this: Maybe<T>, elseFn: (...args: any[]) => E): Result.Result<T, E> {
    return toOkOrElseErr(elseFn, this);
  }

  /** Method variant for [`Maybe.toString`](../modules/_maybe_.html#tostring) */
  toString<T>(this: Maybe<T>): string {
    return toString(this);
  }
}

/**
 * Is this result a `Just` instance?
 * 
 * In TypeScript, narrows the type from `Maybe<T>` to `Just<T>`.
 */
export const isJust = <T>(maybe: Maybe<T>): maybe is Just<T> => maybe.variant === Variant.Just;

/**
 * Is this result a `Nothing` instance?
 * 
 * In TypeScript, narrows the type from `Maybe<T>` to `Nothing<T>`.
 */
export const isNothing = <T>(maybe: Maybe<T>): maybe is Nothing<T> =>
  maybe.variant === Variant.Nothing;

/**
 * Create an instance of `Maybe.Just`.
 * 
 * `null` and `undefined` are allowed by the type signature so that the
 * function may `throw` on those rather than constructing a type like
 * `Maybe<undefined>`.
 * 
 * @typeparam T The type of the item contained in the `Maybe`.
 * @param value The value to wrap in a `Maybe.Just`.
 * @throws      If you pass `null` or `undefined`.
 */
export const just = <T>(value: T | null | undefined): Maybe<T> => new Just<T>(value);

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

/** A value which may (`Just<T>`) or may not (`Nothing`) be present. */
export type Maybe<T> = Just<T> | Nothing<T>;

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
 *     undefined value *which is untyped*.
 * 2.  If you are specifying that the type is more general than the value passed
 *     (since TypeScript can define types as literals).
 * 
 * @typeparam T The type of the item contained in the `Maybe`.
 * @param value The value to wrap in a `Maybe`. If it is `undefined` or `null`,
 *              the result will be `Nothing`; otherwise it will be the type of
 *              the value passed.
 */
export const of = <T>(value: T | undefined | null): Maybe<T> =>
  isVoid(value) ? nothing<T>() : just(value);

/**
 * Map over a `Maybe` instance: apply the function to the wrapped value if the
 * instance is `Just`, and return `Nothing` if the instance is `Nothing`.
 * 
 * #### Examples
 * 
 * ```ts
 * const length = (s: string) => s.length;
 * 
 * const justAString = Maybe.just('string');
 * const justTheStringLength = map(length, justAString);
 * console.log(justTheStringLength.toString()); // "Just(6)"
 * 
 * const notAString = Maybe.nothing<string>();
 * const notAStringLength = map(length, notAString);
 * console.log(notAStringLength.toString()); // "Nothing"
 * ```
 * 
 * @typeparam T The wrapped value.
 * @typeparam U The wrapped value of the returned `Maybe`.
 * @param mapFn The function to apply the value to if `Maybe` is `Just`.
 * @param maybe The `Maybe` instance to map over.
 * @returns     A new `Maybe` with the result of applying `mapFn` to the value
 *              in a `Just`, or `Nothing` if `maybe` is `Nothing`.
 */
export const map = <T, U>(mapFn: (t: T) => U, maybe: Maybe<T>): Maybe<U> =>
  isJust(maybe) ? just(mapFn(unwrap(maybe))) : nothing<U>();

/**
 * Map over a `Maybe` instance and get out the value if `maybe` is a `Just`, or
 * return a default value if `maybe` is a `Nothing`.
 * 
 * #### Examples
 * 
 * ```ts
 * const length = (s: string) => s.length;
 * 
 * const justAString = Maybe.just('string');
 * const theStringLength = mapOr(0, length, justAString);
 * console.log(theStringLength); // 6
 * 
 * const notAString = Maybe.nothing<string>();
 * const notAStringLength = mapOr(0, length, notAString)
 * console.log(notAStringLength); // 0
 * ```
 * 
 * @typeparam T The wrapped value.
 * @typeparam U The wrapped value of the returned `Maybe`.
 * @param orU   The default value to use if `maybe` is `Nothing`
 * @param mapFn The function to apply the value to if `Maybe` is `Just`
 * @param maybe The `Maybe` instance to map over.
 */
export const mapOr = <T, U>(orU: U, mapFn: (t: T) => U, maybe: Maybe<T>): U =>
  isJust(maybe) ? mapFn(unwrap(maybe)) : orU;

/**
 * Map over a `Maybe` instance and get out the value if `maybe` is a `Just`,
 * or use a function to construct a default value if `maybe` is `Nothing`.
 * 
 * #### Examples
 * 
 * ```ts
 * const length = (s: string) => s.length;
 * const getDefault = () => 0;
 * 
 * const justAString = Maybe.just('string');
 * const theStringLength = mapOrElse(getDefault, length, justAString);
 * console.log(theStringLength); // 6
 * 
 * const notAString = Maybe.nothing<string>();
 * const notAStringLength = mapOrElse(getDefault, length, notAString)
 * console.log(notAStringLength); // 0
 * ```
 * 
 * @typeparam T    The wrapped value.
 * @typeparam U    The wrapped value of the returned `Maybe`.
 * @param orElseFn The function to apply if `maybe` is `Nothing`.
 * @param mapFn    The function to apply to the wrapped value if `maybe` is `Just`
 * @param maybe    The `Maybe` instance to map over.
 */
export const mapOrElse = <T, U>(
  orElseFn: (...args: any[]) => U,
  mapFn: (t: T) => U,
  maybe: Maybe<T>
): U => (isJust(maybe) ? mapFn(unwrap(maybe)) : orElseFn());

/**
 * You can think of this like a short-circuiting logical "and" operation on a
 * `Maybe` type. If `maybe` is `Just`, then the result is the `andMaybe`. If
 * `maybe` is `Nothing`, the result is `Nothing`. 
 *
 * ```ts
 * const justA = Maybe.just('A');
 * const justB = Maybe.just('B');
 * const nothing = Maybe.nothing<number>();
 *
 * console.log(and(justB, justA).toString());  // 'Just("B")'
 * console.log(and(justB, nothing).toString());  // 'Nothing'
 * console.log(and(nothing, justA).toString());  // 'Nothing'
 * console.log(and(nothing, nothing).toString());  // 'Nothing'
 * ```
 * 
 * @typeparam T    The wrapped value.
 * @typeparam U    The wrapped value of the returned `Maybe`.
 * @param andMaybe The `Maybe` instance to return if `maybe` is `Just`
 * @param maybe    The `Maybe` instance to check.
 * @return         `Nothing` if the original `maybe` is `Nothing`, or `andMaybe`
 *                 if the original `maybe` is `Just`.
 */
export const and = <T, U>(andMaybe: Maybe<U>, maybe: Maybe<T>): Maybe<U> =>
  isJust(maybe) ? andMaybe : nothing(); // cannot coerce Nothing<T> to Nothing<U>

/**
 * Apply a function to the wrapped value if `Just` and return a new `Just`
 * containing the resulting value; or return `Nothing` if `Nothing`.
 * 
 * This is also commonly known as (and therefore aliased as) [`flatMap`] or
 * [`chain`]. It is sometimes also known as `bind`, but *not* aliased as such
 * because [`bind` already means something in JavaScript][bind].
 * 
 * [`flatMap`]: #flatmap
 * [`chain`]: #chain
 * [bind]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
 * 
 * @typeparam T  The wrapped value.
 * @param thenFn The function to apply to the wrapped `T` if `maybe` is `Just`.
 * @param maybe  The `Maybe` to evaluate and possibly apply a function to.
 * @returns      The result of the `thenFn` (a new `Maybe`) if `maybe` is a
 *               `Just`, otherwise `Nothing` if `maybe` is a `Nothing`.
 */
export const andThen = <T, U>(thenFn: (t: T) => Maybe<U>, maybe: Maybe<T>): Maybe<U> =>
  isJust(maybe) ? thenFn(unwrap(maybe)) : nothing();

/** Alias for [`andThen`](#andthen). */
export const chain = andThen;

/** Alias for [`andThen`](#andthen). */
export const flatMap = andThen;

/**
 * Provide a fallback for a given `Maybe`. Behaves like a logical `or`: if the
 * `maybe` value is a `Just`, returns that `maybe`; otherwise, returns the
 * `defaultMaybe` value.
 * 
 * @typeparam T        The wrapped value.
 * @param defaultMaybe The `Maybe` to use if `maybe` is a `Nothing`.
 * @param maybe        The `Maybe` instance to evaluate.
 * @returns            `maybe` if it is a `Just`, otherwise `defaultMaybe`.
 */
export const or = <T>(defaultMaybe: Maybe<T>, maybe: Maybe<T>): Maybe<T> =>
  isJust(maybe) ? maybe : defaultMaybe;

/**
 * Like `or`, but using a function to construct the alternative `Maybe`.
 * 
 * Sometimes you need to perform an operation using other data in the
 * environment to construct the fallback value. In these situations, you can
 * pass a function (which may be a closure) as the `elseFn` to generate the
 * fallback `Maybe<T>`.
 * 
 * Useful for handling failures/empty situations.
 * 
 * @typeparam T  The wrapped value.
 * @param elseFn The function to apply if `maybe` is `Nothing`
 * @param maybe  The `maybe` to use if it is `Just`.
 * @returns      The `maybe` if it is `Just`, or the `Maybe` returned by
 *               `elseFn` if the `maybe` is `Nothing.
 */
export const orElse = <T>(elseFn: (...args: any[]) => Maybe<T>, maybe: Maybe<T>): Maybe<T> =>
  isJust(maybe) ? maybe : elseFn();

/**
 * Get the value out of the `Maybe`.
 *
 * Returns the content of a `Just`, but **throws if the `Maybe` is `Nothing`**.
 * Prefer to use [`unwrapOr`](#unwrapor) or [`unwrapOrElse`](#unwraporelse).
 *
 * @typeparam T The wrapped value.
 * @param maybe The value to unwrap
 * @returns     The unwrapped value if the `Maybe` instance is `Just`.
 * @throws      If the `maybe` is `Nothing`.
 */
export const unsafelyUnwrap = <T>(maybe: Maybe<T>): T => maybe.unsafelyUnwrap();

// For internal use; but not exported because we want to emphasize that this is
// a bad idea via the name.
const unwrap = unsafelyUnwrap;

/**
 * Safely get the value out of a `Maybe`.
 *
 * Returns the content of a `Just` or `defaultValue` if `Nothing`.
 * 
 * @typeparam T        The wrapped value.
 * @param defaultValue The value to return if `maybe` is a `Nothing`.
 * @param maybe        The `Maybe` instance to unwrap if it is a `Just`.
 * @returns            The content of `maybe` if it is a `Just`, otherwise
 *                     `defaultValue`.
 */
export const unwrapOr = <T>(defaultValue: T, maybe: Maybe<T>): T =>
  isJust(maybe) ? unwrap(maybe) : defaultValue;

/**
 * Safely get the value out of a [`Maybe`](#maybe).
 *
 * Returns the content of a `Just` or `defaultValue` if `Nothing`.
 * 
 * @typeparam T  The wrapped value.
 * @param orElseFn A function used to generate a valid value if `maybe` is a
 *                 `Nothing`.
 * @param maybe    The `Maybe` instance to unwrap if it is a `Just`
 * @returns        Either the content of `maybe` or the value returned from
 *                 `orElseFn`.
 */
export const unwrapOrElse = <T>(orElseFn: (...args: any[]) => T, maybe: Maybe<T>): T =>
  isJust(maybe) ? unwrap(maybe) : orElseFn();

/**
 * Transform the [`Maybe`](#maybe) into a
 * [`Result`](../modules/_result_.html#result), using the wrapped value as the
 * `Ok` value if `Just`; otherwise using the supplied `error` value for `Err`.
 * 
 * @typeparam T  The wrapped value.
 * @typeparam E  The error type to in the `Result`.
 * @param error The error value to use if the `Maybe` is `Nothing`.
 * @param maybe The `Maybe` instance to convert.
 * @returns     A `Result` containing the value wrapped in `maybe` in an `Ok`,
 *              or `error` in an `Err`.
 */
export const toOkOrErr = <T, E>(error: E, maybe: Maybe<T>): Result.Result<T, E> =>
  isJust(maybe) ? Result.ok(unwrap(maybe)) : Result.err(error);

/**
 * Transform the [`Maybe`](#maybe) into a
 * [`Result`](../modules/_result_.html#result), using the wrapped value as the
 * `Ok` value if `Just`; otherwise using `elseFn` to generate `Err`.
 * 
 * @typeparam T  The wrapped value.
 * @typeparam E  The error type to in the `Result`.
 * @param elseFn The function which generates an error of type `E`.
 * @param maybe  The `Maybe` instance to convert.
 * @returns     A `Result` containing the value wrapped in `maybe` in an `Ok`,
 *              or `the value generated by `elseFn` in an `Err`.
 */
export const toOkOrElseErr = <T, E>(
  elseFn: (...args: any[]) => E,
  maybe: Maybe<T>
): Result.Result<T, E> => (isJust(maybe) ? Result.ok(unwrap(maybe)) : Result.err(elseFn()));

/**
 * Construct a `Maybe` from a `Result<T, E>`, keeping the value of an `Ok` as
 * the `Just` term and throwing away the `Err` value for a `Nothing.
 * 
 * @param result The `Result` to construct a `Maybe` from.
 * @returns      `Just` if `result` was `Ok` or `Nothing` if it was `Err`.
 */
export const fromResult = <T, E>(result: Result.Result<T, E>): Maybe<T> =>
  Result.isOk(result) ? just(Result.unsafelyUnwrap(result)) : nothing();

/**
   * Create a `String` representation of a `Maybe` instance.
   * 
   * `Just` will print out as `"Just(<the value>)"`, where `<the value>` will be
   * printed as its own `toString` representation. For example:
   * 
   * -   `toString(Maybe.of(42))` is `"Just(42)"`
   * -   `toString(Maybe.of([1, 2, 3]))` is `"Just(1,2,3)"`
   * -   `toString(Maybe.of({ an: 'object' }))` is `"Just([object Object])"`
   * 
   * `Nothing` instances will always be printed as `"Nothing"`.
   * 
   * @param maybe 
   * @returns 
   */
export const toString = <T>(maybe: Maybe<T>): string =>
  isJust(maybe) ? `Just(${unwrap(maybe).toString()})` : `Nothing`;

export default Maybe;
