/**
 * # `Maybe`
 * 
 * A `Maybe<T>` is a value of type `T` which may or may not be present.
 * 
 * If the value is present, it is `Some(value)`. If it's absent, it's `Nothing`.
 * This provides a type-safe container for dealing with the possibility that
 * there's nothing here – a container you can do many of the same things you
 * might with an array – so that you can avoid nasty `null` and `undefined`
 * checks throughout your codebase.
 */

/**
 * Check if the value here is an all-consuming monstrosity which will consume
 * everything in its transdimensional rage. A.k.a. `null` or `undefined`.
 */
const isCthulhu = (value: any): value is undefined | null =>
  typeof value === 'undefined' || value === null;

export enum Variant {
  Some = 'Some',
  Nothing = 'Nothing',
}

// Someday maybe we'll have `protocol`s and this would just have default
// implementations for nearly everything in the concrete classes below.
export interface IMaybe<T> {
  /**
   * Distinguish between the `Some` and `Nothing` variants.
   */
  variant: Variant;

  map<U>(this: Maybe<T>, mapFn: (t: T) => U): Maybe<U>;
  mapOr<U>(this: Maybe<T>, orU: U, mapFn: (t: T) => U): U;
  mapOrElse<U>(this: Maybe<T>, orElseFn: (...args: any[]) => U, mapFn: (t: T) => U): U;
  or(this: Maybe<T>, mOr: Maybe<T>): Maybe<T>;
  orElse(this: Maybe<T>, orElseFn: (...args: any[]) => Maybe<T>): Maybe<T>;
  and<U>(this: Maybe<T>, mAnd: Maybe<U>): Maybe<U>;
  andThen<U>(this: Maybe<T>, andThenFn: (t: T) => Maybe<U>): Maybe<U>;
  unwrap(): T | never;
  unwrapOrElse(this: Maybe<T>, elseFn: (...args: any[]) => T): T;
}

export class Some<T> implements IMaybe<T> {
  private __value: T;

  variant = Variant.Some;

  /**
   * Directly create a `Maybe.Some` instance.
   * 
   * **Note:** While you *may* create the `Some` type via normal JavaScript
   * class construction, it is not recommended for the functional style for
   * which the library is intended. Instead, use [[of]] (for the general case)
   * or [[some]] for this specific case.
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
   * `null` and `undefined` are allowed by the type signature so 
   * that the constructor may `throw` on those rather than
   * constructing a type like `Maybe<undefined>`.
   * 
   * @throws      If you pass `null` or `undefined`.
   */
  constructor(value: T | null | undefined) {
    if (isCthulhu(value)) {
      throw new Error('Tried to construct `Some` with `null` or `undefined`');
    }

    this.__value = value;
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
}

export class Nothing<T> implements IMaybe<T> {
  variant = Variant.Nothing;

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
}

export const isSome = <T>(m: Maybe<T>): m is Some<T> => m.variant === Variant.Some;
export const isNothing = <T>(m: Maybe<T>): m is Nothing<T> => m.variant === Variant.Nothing;

export const some = <T>(value: T) => new Some<T>(value);
export const nothing = <T>() => new Nothing<T>();

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
 * @typeparam T The type of the item contained in the `Maybe`.
 * @param value The value to wrap in a `Maybe`. If it is `undefined` or `null`,
 *              the result will be `Nothing`; otherwise it will be the type of
 *              the value passed.
 * 
 * To specify that the result should be interpreted as a specific type, you may
 * invoke of with a type parameter:
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
 */
export const of = <T>(value: T | undefined | null): Maybe<T> =>
  isCthulhu(value) ? nothing<T>() : some(value);

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
