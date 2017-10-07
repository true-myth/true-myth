/**
 * # Either
 * 
 * An `either` is a type representing the value resulting from an operation
 * which may return one of two distinct outcomes, with one outcome being the
 * `Left` outcome, and the other being the `Right` outcome.
 *
 * An `Either` differs from a `Either` in that it does not (necessarily)
 * represent the difference between a *failure* and a *success*, as in
 * `Either`'s `Err` and `Ok` variants. Instead, it simply represents a disjoint
 * pair of possibilities.
 *
 * For example, consider an API where you need to apply one function if a user
 * has swiped left, and a *different* function if the user swipes right. You
 * *could* try to capture this in a `Either`, but it's not as if either of
 * those is actually an *error* state. And trying to handle it with a `Maybe`
 * doesn't make sense either, because you often have a function to return in
 * *both* cases. You need an `Either`.
 *
 * There are of course many scenarios in which you need *more* than just two
 * variants for situations like this. (What if the user swipes up or down on
 * the card?) But the two-variant scenario is extremely common, so having it as
 * option when you need something that isn't a *result* is really nice.
 *
 * The variants of an `Either` are `Left` and `Right`; the standard type
 * parameter names for them are `L` and `R`.
 *
 * **Note:** it is conventional in most languages which have `Either` types 
 * *instead* of `Either` types (unlike here, where we supply *both*) for the
 * `Right` variant to be the equivalent of `Ok`. Here, `Either` and `Either`
 * have different APIs to account for what is most convenient for working with
 * them in TypeScript or Flow, vs. what is most convenient in e.g. Haskell or
 * PureScript. (For those familiar with those languages: since type
 * constructors are Just Functions, they're curryable, which means it's often
 * convenient to create a preloaded type by partially applying a constructor.
 * JavaScript does *not* make it easy to do that, so we don't try!)
 */

/** (keep typedoc from getting confused by the import) */
import { isVoid } from './utils';
import { Maybe, just, nothing, isJust, unsafelyUnwrap as unwrapMaybe } from './maybe';

/**
 * Discriminant for `Right` and `Left` variants of `Either` type.
 * 
 * You can use the discriminant via the `variant` property of `Either` instances
 * if you need to match explicitly on it.
 */
export enum Variant {
  Right = 'Right',
  Left = 'Left',
}

export interface IEither<L, R> {
  /** Distinguish between the `Right` and `Left` variants. */
  variant: Variant;

  /** Method variant for [`Either.isRight`](../modules/_either_.html#isRight) */
  isRight(this: Either<L, R>): this is Right<L, R>;

  /** Method variant for [`Either.isLeft`](../modules/_either_.html#isLeft) */
  isLeft(this: Either<L, R>): this is Left<L, R>;

  /** Method variant for [`Either.map`](../modules/_either_.html#map) */
  map<U>(this: Either<L, R>, mapFn: (t: R) => U): Either<U, E>;

  /** Method variant for [`Either.mapOr`](../modules/_either_.html#mapor) */
  mapOr<U>(this: Either<L, R>, orU: U, mapFn: (t: R) => U): U;

  /** Method variant for [`Either.mapOrElse`](../modules/_either_.html#maporelse) */
  mapOrElse<U>(this: Either<L, R>, orElseFn: (...args: any[]) => U, mapFn: (t: R) => U): U;

  /** Method variant for [`Either.mapLeft`](../modules/_either_.html#mapLeft) */
  mapLeft<M>(this: Either<L, R>, mapLeftFn: (l: L) => M): Either<M, R>;

  /** Method variant for [`Either.or`](../modules/_either_.html#or) */
  or<F>(this: Either<L, R>, orEither: Either<T, F>): Either<T, F>;

  /** Method variant for [`Either.orElse`](../modules/_either_.html#orelse) */
  orElse<F>(this: Either<L, R>, orElseFn: (...args: any[]) => Either<T, F>): Either<T, F>;

  /** Method variant for [`Either.and`](../modules/_either_.html#and) */
  and<U>(this: Either<L, R>, mAnd: Either<U, E>): Either<U, E>;

  /** Method variant for [`Either.andThen`](../modules/_either_.html#andthen) */
  andThen<U>(this: Either<L, R>, andThenFn: (t: R) => Either<U, E>): Either<U, E>;

  /** Method variant for [`Either.chain`](../modules/_either_.html#chain) */
  chain<U>(this: Either<L, R>, chainFn: (t: R) => Either<U, E>): Either<U, E>;

  /** Method variant for [`Either.flatMap`](../modules/_either_.html#flatmap) */
  flatMap<U>(this: Either<L, R>, chainFn: (t: R) => Either<U, E>): Either<U, E>;

  /** Method variant for [`Either.unwrap`](../modules/_either_.html#unwrap) */
  unsafelyUnwrapRight(): R | never;

  /** Method variant for [`Either.unwrapLeft`](../modules/_either_.html#unwrapLeft) */
  unsafelyUnwrapLeft(): L | never;

  /** Method variant for [`Either.unwrapOr`](../modules/_either_.html#unwrapor) */
  unwrapOr<E>(this: Either<L, R>, defaultValue: R): R;

  /** Method variant for [`Either.unwrapOrElse`](../modules/_either_.html#unwrapOrElse) */
  unwrapOrElse(this: Either<L, R>, elseFn: (Left: L) => T): R;

  /** Method variant for [`Either.toMaybe`](../modules/_either_.html#tomaybe) */
  toMaybe(this: Either<L, R>): Maybe<T>;
}

/**
 * The `Right` variant for [`Either`].
 * 
 * [`Either`]: ../modules/_either_.html#either
 * 
 * An `Right` instance represents a *successful* `Either`.
 */
export class Right<L, R> implements IEither<L, R> {
  private __value: R;

  /** `Right` is always [`Variant.Right`](../enums/_either_.variant#Right). */
  variant = Variant.Right;

  /**
   * Create an instance of `Either.Right` with `new`.
   * 
   * **Note:** While you *may* create the `Either` type via normal JavaScript
   * class construction, it is not recommended for the functional style for
   * which the library is intended. Instead, use [`Either.right`].
   * 
   * [`Either.Right`]: ../modules/_either_.html#right
   * 
   * ```ts
   * // Avoid:
   * const aString = new Either.Right('characters');
   * 
   * // Prefer:
   * const aString = Either.right('characters);
   * ```
   * 
   * @param value
   * The value to wrap in a `Either.Right`.
   * 
   * `null` and `undefined` are allowed by the type signature so that the
   * constructor may `throw` on those rather than constructing a type like
   * `Either<undefined>`.
   * 
   * @throws      If you pass `null` or `undefined`.
   */
  constructor(value: R | null | undefined) {
    if (isVoid(value)) {
      throw new Error(
        'Tried to construct `Left` with `null` or `undefined`. Maybe you want `Maybe.Nothing`?'
      );
    }

    this.__value = value;
  }

  /** Method variant for [`Either.isRight`](../modules/_either_.html#isRight) */
  isRight(this: Either<L, R>): this is Right<L, R> {
    return isRight(this);
  }

  /** Method variant for [`Either.isLeft`](../modules/_either_.html#isLeft) */
  isLeft(this: Either<L, R>): this is Left<L, R> {
    return isLeft(this);
  }

  /** Method variant for [`Either.map`](../modules/_either_.html#map) */
  map<U>(this: Either<L, R>, mapFn: (t: R) => U): Either<U, E> {
    return map(mapFn, this);
  }

  /** Method variant for [`Either.mapOr`](../modules/_either_.html#mapor) */
  mapOr<U>(this: Either<L, R>, orU: U, mapFn: (t: R) => U): U {
    return mapOr(orU, mapFn, this);
  }

  /** Method variant for [`Either.mapOrElse`](../modules/_either_.html#maporelse) */
  mapOrElse<U>(this: Either<L, R>, orElseFn: (...args: any[]) => U, mapFn: (t: R) => U): U {
    return mapOrElse(orElseFn, mapFn, this);
  }

  /** Method variant for [`Either.mapLeft`](../modules/_either_.html#mapLeft) */
  mapLeft<F>(this: Either<L, R>, mapLeftFn: (e: L) => F): Either<T, F> {
    return mapLeft(mapLeftFn, this);
  }

  /** Method variant for [`Either.or`](../modules/_either_.html#or) */
  or<F>(this: Either<L, R>, orEither: Either<T, F>): Either<T, F> {
    return or(orEither, this);
  }

  /** Method variant for [`Either.orElse`](../modules/_either_.html#orelse) */
  orElse<F>(this: Either<L, R>, orElseFn: (...args: any[]) => Either<T, F>): Either<T, F> {
    return orElse(orElseFn, this);
  }

  /** Method variant for [`Either.and`](../modules/_either_.html#and) */
  and<U>(this: Either<L, R>, mAnd: Either<U, E>): Either<U, E> {
    return and(mAnd, this);
  }

  /** Method variant for [`Either.andThen`](../modules/_either_.html#andthen) */
  andThen<U>(this: Either<L, R>, andThenFn: (t: R) => Either<U, E>): Either<U, E> {
    return andThen(andThenFn, this);
  }

  /** Method variant for [`Either.chain`](../modules/_either_.html#chain) */
  chain<U>(this: Either<L, R>, chainFn: (t: R) => Either<U, E>): Either<U, E> {
    return chain(chainFn, this);
  }

  /** Method variant for [`Either.flatMap`](../modules/_either_.html#flatmap) */
  flatMap<U>(this: Either<L, R>, flatMapFn: (t: R) => Either<U, E>): Either<U, E> {
    return flatMap(flatMapFn, this);
  }

  /** Method variant for [`Either.unwrap`](../modules/_either_.html#unwrap) */
  unsafelyUnwrapRight(): R {
    return this.__value;
  }

  /** Method variant for [`Either.unwrapLeft`](../modules/_either_.html#unwrapLeft) */
  unsafelyUnwrapLeft(): never {
    throw 'Tried to `unsafelyUnwrapLeft` a `Right`';
  }

  /** Method variant for [`Either.unwrapOr`](../modules/_either_.html#unwrapor) */
  unwrapOr<E>(this: Either<L, R>, defaultValue: R): R {
    return unwrapOr(defaultValue, this);
  }

  /** Method variant for [`Either.unwrapOrElse`](../modules/_either_.html#unwrapOrElse) */
  unwrapOrElse(this: Either<L, R>, elseFn: (Left: L) => T): R {
    return unwrapOrElse(elseFn, this);
  }

  /** Method variant for [`Either.toMaybe`](../modules/_either_.html#lefttomaybe) */
  leftToMaybe(this: Either<L, R>): Maybe<L> {
    return leftToMaybe(this);
  }

  /** Method variant for [`Either.toMaybe`](../modules/_either_.html#righttomaybe) */
  rightToMaybe(this: Either<L, R>): Maybe<R> {
    return rightToMaybe(this);
  }
}

export class Left<L, R> implements IEither<L, R> {
  /** `Left` is always [`Variant.Left`](../enums/_either_.variant#Left). */
  variant = Variant.Left;

  private __value: L;

  constructor(value: L) {
    if (isVoid(value)) {
      throw new Error(
        'Tried to construct `Err` with `null` or `undefined`. Maybe you want `Maybe.Nothing`?'
      );
    }

    this.__value = value;
  }

  /** Method variant for [`Either.isRight`](../modules/_either_.html#isRight) */
  isRight(this: Either<L, R>): this is Right<L, R> {
    return isRight(this);
  }

  /** Method variant for [`Either.isLeft`](../modules/_either_.html#isLeft) */
  isLeft(this: Either<L, R>): this is Left<L, R> {
    return isLeft(this);
  }

  /** Method variant for [`Either.map`](../modules/_either_.html#map) */
  map<U>(this: Either<L, R>, mapFn: (t: R) => U): Either<U, E> {
    return map(mapFn, this);
  }

  /** Method variant for [`Either.mapOr`](../modules/_either_.html#mapor) */
  mapOr<U>(this: Either<L, R>, orU: U, mapFn: (t: R) => U): U {
    return mapOr(orU, mapFn, this);
  }

  /** Method variant for [`Either.mapOrElse`](../modules/_either_.html#maporelse) */
  mapOrElse<U>(this: Either<L, R>, orElseFn: (...args: any[]) => U, mapFn: (t: R) => U): U {
    return mapOrElse(orElseFn, mapFn, this);
  }

  /** Method variant for [`Either.mapLeft`](../modules/_either_.html#mapLeft) */
  mapLeft<F>(this: Either<L, R>, mapLeftFn: (e: L) => F): Either<T, F> {
    return mapLeft(mapLeftFn, this);
  }

  /** Method variant for [`Either.or`](../modules/_either_.html#or) */
  or<F>(this: Either<L, R>, orEither: Either<T, F>): Either<T, F> {
    return or(orEither, this);
  }

  /** Method variant for [`Either.orElse`](../modules/_either_.html#orelse) */
  orElse<F>(this: Either<L, R>, orElseFn: (...args: any[]) => Either<T, F>): Either<T, F> {
    return orElse(orElseFn, this);
  }

  /** Method variant for [`Either.and`](../modules/_either_.html#and) */
  and<U>(this: Either<L, R>, mAnd: Either<U, E>): Either<U, E> {
    return and(mAnd, this);
  }

  /** Method variant for [`Either.andThen`](../modules/_either_.html#andthen) */
  andThen<U>(this: Either<L, R>, andThenFn: (t: R) => Either<U, E>): Either<U, E> {
    return andThen(andThenFn, this);
  }

  /** Method variant for [`Either.chain`](../modules/_either_.html#chain) */
  chain<U>(this: Either<L, R>, chainFn: (t: R) => Either<U, E>): Either<U, E> {
    return this.andThen(chainFn);
  }

  /** Method variant for [`Either.flatMap`](../modules/_either_.html#flatmap) */
  flatMap<U>(this: Either<L, R>, flatMapFn: (t: R) => Either<U, E>): Either<U, E> {
    return this.andThen(flatMapFn);
  }

  /** Method variant for [`Either.unsafelyUnwrap`](../modules/_either_.html#unsafelyunwrap) */
  unsafelyUnwrapRight(): never {
    throw 'Tried to `unsafelyUnwrapRight` a `Left`';
  }

  /** Method variant for [`Either.unsafelyUnwrapL`](../modules/_either_.html#unsafelyunwrapLeft) */
  unsafelyUnwrapLeft(): L {
    return this.__value;
  }

  /** Method variant for [`Either.unwrapOr`](../modules/_either_.html#unwrapor) */
  unwrapOr<E>(this: Either<L, R>, defaultValue: R): R {
    return unwrapOr(defaultValue, this);
  }

  /** Method variant for [`Either.unwrapOrElse`](../modules/_either_.html#unwraporelse) */
  unwrapOrElse(this: Either<L, R>, elseFn: (Left: L) => T): R {
    return unwrapOrElse(elseFn, this);
  }
  
  /** Method variant for [`Either.toMaybe`](../modules/_either_.html#lefttomaybe) */
  leftToMaybe(this: Either<L, R>): Maybe<L> {
    return leftToMaybe(this);
  }

  /** Method variant for [`Either.toMaybe`](../modules/_either_.html#righttomaybe) */
  rightToMaybe(this: Either<L, R>): Maybe<R> {
    return rightToMaybe(this);
  }
}

/**
 * Is this result an `Right` instance?
 * 
 * In TypeScript, narrows the type from `Either<L, R>` to `Right<L, R>`.
 */
export const isRight = <L, R>(either: Either<L, R>): result is Right<L, R> =>
  result.variant === Variant.Right;

/**
 * Is this result an `Left` instance?
 * 
 * In TypeScript, narrows the type from `Either<L, R>` to `Left<L, R>`.
 */
export const isLeft = <L, R>(either: Either<L, R>): result is Left<L, R> =>
  result.variant === Variant.Left;

/**
 * Create an instance of `Either.Right`.
 * 
 * `null` and `undefined` are allowed by the type signature so that the
 * function may `throw` on those rather than constructing a type like
 * `Either<undefined, null>`.
 * 
 * @typeparam L The type of the item contained in the `Left` variant of
 *              the `Either`.
 * @typeparam R The type of the item contained in the `Right` variant of
 *              the `Either`.
 * @param value The value to wrap in a `Either.Right`.
 * @throws      If you pass `null` or `undefined`.
 */
export const right = <L, R>(value: R | null | undefined): Either<L, R> => new Right<L, R>(value);

/**
 * Create an instance of `Either.Left`.
 * 
 * `null` and `undefined` are allowed by the type signature so that the
 * function may `throw` on those rather than constructing a type like
 * `Either<undefined, null>`.
 * 
 * @typeparam L The type of the item contained in the `Left` variant of
 *              the `Either`.
 * @typeparam R The type of the item contained in the `Right` variant of
 *              the `Either`.
 * @param value The value to wrap in a `Either.Right`.
 * @throws      If you pass `null` or `undefined`.
 */
export const left = <L, R>(Left: L | null | undefined): Either<L, R> => new Left<L, R>(Left);

/**
 * A value which may be one of two variants: `Left` or `Right`.
 * 
 * The behavior of this type is checked by TypeScript at compile time, and bears
 * no runtime overhead other than the very small cost of the container object.
 */
export type Either<L, R> = Right<L, R> | Left<L, R>;

export default Either;

export const mapLeft = <L, M, R>(mapFn: (l: L) => M, either: Either<L, R>): Either<M, R> =>
  isLeft(either) ? left(mapFn(unwrapL(either))) : right(unwrapR(either));

export const mapLeftOr = <L, M, R>(orM: M, mapFn: (l: L) => M, either: Either<L, R>): M =>
  isLeft(either) ? mapFn(unwrapL(either)) : orM;

export const mapLeftOrElse = <L, M, R>(
  elseFn: (r: R) => M,
  mapFn: (l: L) => M,
  either: Either<L, R>
): M => (isLeft(either) ? mapFn(unwrapL(either)) : elseFn(unwrapR(either)));

export const mapRight = <L, R, S>(mapFn: (r: R) => S, either: Either<L, R>): Either<L, S> =>
  isRight(result) ? right(mapFn(unwrapR(either))) : left(unwrapL(either));

export const mapRightOr = <L, R, S>(orS: S, mapFn: (r: R) => S, either: Either<L, R>): S =>
  isRight(result) ? mapFn(unwrapR(either)) : orS;

export const mapRightOrElse = <L, R, S>(
  elseFn: (l: L) => S,
  mapFn: (r: R) => S,
  either: Either<L, R>
): S => (isRight(either) ? mapFn(unwrapR(either)) : elseFn(unwrapL(either)) )

export const leftAnd = <L, M, R>(eitherM: Either<M, R>, either: Either<L, R>): Either<M, R> =>
  isLeft(either) ? eitherM : right(unwrapR(either));

export const rightAnd = <L, R, S>(eitherS: Either<L, S>, either: Either<L, R>): Either<L, S> =>
  isRight(either) ? eitherS : left(unwrapL(either));

/**
 * Apply a function to the wrapped value if `Left` and return a new `Left`
 * containing the resulting value; or if it is `Right` return it unmodified.
 * 
 * This is also commonly known as (and therefore aliased as) [`flatMap`] or
 * [`chain`]. It is sometimes also known as `bind`, but *not* aliased as such
 * because [`bind` already means something in JavaScript][bind].
 * 
 * [`flatMap`]: #flatmap
 * [`chain`]: #chain
 * [bind]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
 * 
 * @param thenFn The function to apply to the wrapped `L` if `Either` is
 *               `Left`.
 * @param maybe  The `Maybe` to evaluate and possibly apply a function to.
 */
export const leftAndThen = <L, M, R>(
  thenFn: (l: L) => Either<M, R>,
  either: Either<L, R>
): Either<M, R> => (isLeft(either) ? thenFn(unwrapL(either)) : right(unwrapR(either)));

/** Alias for [`andThen`](#rightandthen). */
export const chainLeft = leftAndThen;

/** Alias for [`andThen`](#leftandthen). */
export const flatMapLeft = leftAndThen;

/**
 * Apply a function to the wrapped value if `Right` and return a new `Right`
 * containing the resulting value; or if it is `Left` return it unmodified.
 * 
 * This is also commonly known as (and therefore aliased as) [`flatMap`] or
 * [`chain`]. It is sometimes also known as `bind`, but *not* aliased as such
 * because [`bind` already means something in JavaScript][bind].
 * 
 * [`flatMap`]: #flatmap
 * [`chain`]: #chain
 * [bind]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
 * 
 * @param thenFn The function to apply to the wrapped `R` if `Either` is
 *               `Right`.
 * @param maybe  The `Maybe` to evaluate and possibly apply a function to.
 */
export const rightAndThen = <L, R, S>(
  thenFn: (r: R) => Either<L, S>,
  either: Either<L, R>
): Either<L, S> => (isRight(either) ? thenFn(unwrapR(either)) : left(unwrapL(either)));

/** Alias for [`andThen`](#rightandthen). */
export const chainRight = rightAndThen;

/** Alias for [`andThen`](#rightandthen). */
export const flatMapRight = rightAndThen;

/**
 * Return the `Right` value if `Either` is `Right`; otherwise the `orLeft`.
 */
export const leftOr = <L, R, S>(orRight: Either<L, S>, either: Either<L, R>): Either<M, R> =>
  isLeft(either) ? left(unwrapL(either)) : orRight;

/**
 * Return the `Left` value if `Either` is `Left`; otherwise apply the `elseFn`
 * to the value in the `Right` to create a new `Either`.
 */
export const leftOrElse = <L, R, S>(
  elseFn: (r: R) => Either<L, S>
  either: Either<L, R>
): Either<L, S> => (isLeft(either) ? left(unwrapL(either)) : elseFn(unwrapR(either)));

/**
 * Return the `Right` value if `Either` is `Right`; otherwise the `orLeft`.
 */
export const rightOr = <L, M, R>(orLeft: Either<M, R>, either: Either<L, R>): Either<M, R> =>
  isRight(either) ? right(unwrapR(either)) : orLeft;

/**
 * Return the `Right` value if `Either` is `Right`; otherwise apply the
 * `elseFn` to the value in the `Left` to create a new `Either`.
 */
export const rightOrElse = <L, M, R>(
  elseFn: (l: L) => Either<M, R>,
  either: Either<L, R>
): Either<M, R> => (isRight(either) ? right(unwrapR(either)) : elseFn(unwrapL(either)));

/**
 * Get the Left value out of the `Either`.
 * 
 * Returns the content of an `Left`, but **throws if the `Either` is `Right`**.
 * Prefer to use [`unwrapOrElse`](#unwraporelse).
 *
 * @param result
 * @throws Error If the `Either` instance is `Right`.
 */
export const unsafelyUnwrapLeft = <L, R>(either: Either<L, R>): L => either.unsafelyUnwrapLeft();

/** Alias for [`unsafelyUnwrapLeft`](#unsafelyunwrapleft) */
export const unsafelyGetLeft = unsafelyUnwrapLeft;

// For internal use; but not exported because we want to emphasize that this is
// a bad idea via the name.
const unwrapL = unsafelyUnwrapLeft;

/**
 * Safely unwrap 
 */
export const unwrapLeftOr = <L, R>(defaultValue: L, either: Either<L, R>): L =>
  isLeft(either) ? unwrapL(either) : defaultValue;

/** Alias for [`unwrapLeftOr`](#unwrapleftor) */
export const getLeftOr = unwrapLeftOr;

export const unwrapLeftOrElse = <L, R>(orElseFn: (value: R) => L, either: Either<L, R>): L =>
  unwrapLeftOr(elseFn(unwrapR(either)));
  
/** Alias for [`unwrapLeftOr`](#unwrapleftor) */
export const getLeftOrElse = unwrapLeftOrElse;

/**
 * Get the value out of the `Either`.
 * 
 * Returns the content of an `Right`, but **throws if the `Either` is `Left`.**
 * Prefer to use [`unwrapOr`](#unwrapor) or [`unwrapOrElse`](#unwraporelse).
 *
 * @throws If the `Either` instance is `Left`.
 */
export const unsafelyUnwrapRight = <L, R>(either: Either<L, R>): R => either.unsafelyUnwrapRight();

/** Alias for [`unsafelyUnwrapRight`](#unsafelyunwrapright) */
export const unsafelyGetRight = unsafelyUnwrapRight;

// For internal use; but not exported because we want to emphasize that this is
// a bad idea via the name.
const unwrapR = unsafelyUnwrapRight;

export const unwrapRightOr = <L, R>(defaultValue: R, either: Either<L, R>): R =>
  isRight(either) ? unwrapR(result) : defaultValue;

export const unwrapRightOrElse = <L, R>(orElseFn: (value: L) => R, either: Either<L, R>): R =>
  unwrapRightOr(elseFn(unwrapR(either)));

/**
 * Convert an [`Either`](#either) to a [`Maybe`](#../modules/_maybe_.html#maybe).
 * 
 * The converted type will be [`Just`] if the `Either` is [`Right`] or [`Nothing`]
 * if the `Either` is [`Left`]; the wrapped error value will be discarded.
 * 
 * [`Either`]: #either
 * [`Just`]: ../classes/_maybe_.just.html
 * [`Nothing`]: ../classes/_maybe_.nothing.html
 * [`Right`]: ../classes/_either_.Right.html
 * [`Left`]: ../classes/_either_.Left.html
 * 
 * @param result The `Either` to convert to a `Maybe`
 * @returns      `Just` the value in `result` if it is `Right`; otherwise `Nothing`
 */
export const leftToMaybe = <L, R>(either: Either<L, R>): Maybe<L> =>
  isRight(either) ? just(unwrapL(either)) : nothing();

export const leftFromMaybe = <L, R>(rightValue: R, maybe: Maybe<L>): Either<L, R> =>
  isJust(maybe) ? left<L, R>(unwrapMaybe(maybe)) : right<L, R>(rightValue);

/**
 * Convert an [`Either`](#either) to a [`Maybe`](#../modules/_maybe_.html#maybe).
 * 
 * The converted type will be [`Just`] if the `Either` is [`Right`] or [`Nothing`]
 * if the `Either` is [`Left`]; the wrapped error value will be discarded.
 * 
 * [`Either`]: #either
 * [`Just`]: ../classes/_maybe_.just.html
 * [`Nothing`]: ../classes/_maybe_.nothing.html
 * [`Right`]: ../classes/_either_.Right.html
 * [`Left`]: ../classes/_either_.Left.html
 * 
 * @param result The `Either` to convert to a `Maybe`
 * @returns      `Just` the value in `result` if it is `Right`; otherwise `Nothing`
 */
export const rightToMaybe = <L, R>(either: Either<L, R>): Maybe<R> =>
  isRight(result) ? just(unwrapR(either)) : nothing();

export const rightFromMaybe = <L, R>(leftValue: L, maybe: Maybe<R>): Either<L, R> =>
  isJust(maybe) ? right<L, R>(unwrapMaybe(maybe)) : left<L, R>(leftValue);
