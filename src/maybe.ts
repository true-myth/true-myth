/** [[include:doc/maybe.md]] */

/** (keep typedoc from getting confused by the imports) */
import Result, { err, ok } from './result';
import { curry1, isVoid } from './utils';

/**
  Discriminant for the `Just` and `Nothing` variants.

  You can use the discriminant via the `variant` property of `Maybe` instances
  if you need to match explicitly on it.
 */
export enum Variant {
  Just = 'Just',
  Nothing = 'Nothing',
}

/** Simply defines the common shape for `Just` and `Nothing`. */
export interface MaybeShape<T> {
  /** Distinguish between the `Just` and `Nothing` [variants](../enums/_maybe_.variant). */
  readonly variant: Variant;

  /** Method variant for [`Maybe.isJust`](../modules/_maybe_.html#isjust) */
  isJust(this: Maybe<T>): this is Just<T>;

  /** Method variant for [`Maybe.isNothing`](../modules/_maybe_.html#isnothing) */
  isNothing(this: Maybe<T>): this is Nothing<T>;

  /** Method variant for [`Maybe.map`](../modules/_maybe_.html#map) */
  map<U>(this: Maybe<T>, mapFn: (t: T) => U): Maybe<U>;

  /** Method variant for [`Maybe.mapOr`](../modules/_maybe_.html#mapor) */
  mapOr<U>(this: Maybe<T>, orU: U, mapFn: (t: T) => U): U;

  /** Method variant for [`Maybe.mapOrElse`](../modules/_maybe_.html#maporelse) */
  mapOrElse<U>(this: Maybe<T>, orElseFn: () => U, mapFn: (t: T) => U): U;

  /** Method variant for [`Maybe.match`](../modules/_maybe_.html#match) */
  match<U>(this: Maybe<T>, matcher: Matcher<T, U>): U;

  /** Method variant for [`Maybe.or`](../modules/_maybe_.html#or) */
  or(this: Maybe<T>, mOr: Maybe<T>): Maybe<T>;

  /** Method variant for [`Maybe.orElse`](../modules/_maybe_.html#orelse) */
  orElse(this: Maybe<T>, orElseFn: () => Maybe<T>): Maybe<T>;

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
  unwrapOrElse(this: Maybe<T>, elseFn: () => T): T;

  /** Method variant for [`Maybe.toOkOrErr`](../modules/_maybe_.html#tookorerr) */
  toOkOrErr<E>(this: Maybe<T>, error: E): Result<T, E>;

  /** Method variant for [`Maybe.toOkOrElseErr`](../modules/_maybe_.html#tookorelseerr) */
  toOkOrElseErr<E>(this: Maybe<T>, elseFn: () => E): Result<T, E>;

  /** Method variant for [`Maybe.toString`](../modules/_maybe_.html#tostring) */
  toString(this: Maybe<T>): string;

  /** Method variant for [`Maybe.equals`](../modules/_maybe_.html#equals) */
  equals(this: Maybe<T>, comparison: Maybe<T>): boolean;

  /** Method variant for [`Maybe.ap`](../modules/_maybe_.html#ap) */
  ap<U>(this: Maybe<(val: T) => U>, val: Maybe<T>): Maybe<U>;

  /**
    Method variant for [`Maybe.get`](../modules/_maybe_.html#prop)

        If you have a `Maybe` of an object type, you can do `thatMaybe.get('a key')`
    to look up the next layer down in the object.

    ```ts
    type DeepOptionalType = {
      something?: {
        with?: {
          deeperKeys?: string;
        }
      }
    };

    const fullySet: DeepType = {
      something: {
        with: {
          deeperKeys: 'like this'
        }
      }
    };

    const deepJust = Maybe.of(fullySet)
      .get('something')
      .get('with')
      .get('deeperKeys');

    console.log(deepJust); // Just('like this');

    const partiallyUnset: DeepType = { something: { } };

    const deepEmpty = Maybe.of(partiallyUnset)
      .get('something')
      .get('with')
      .get('deeperKeys');

    console.log(deepEmpty); // Nothing
    ```
   */
  get<K extends keyof T>(this: Maybe<T>, key: K): Maybe<NonNullable<T[K]>>;
}

/**
  A `Just` instance is the *present* variant instance of the
  [`Maybe`](../modules/_maybe_.html#maybe) type, representing the presence of a
  value which may be absent. For a full discussion, see [the module
  docs](../modules/_maybe_.html).

  @typeparam T The type wrapped in this `Just` variant of `Maybe`.
 */
export class Just<T> implements MaybeShape<T> {
  /**
    Unwrap the contained value. A convenience method for functional idioms.

    A common scenario where you might want to use this is in a pipeline of
    functions:

    ```ts
    import Maybe, { Just } from 'true-myth/maybe';

    function getLengths(maybeStrings: Array<Maybe<string>>): Array<number> {
      return maybeStrings
        .filter(Maybe.isJust)
        .map(Just.unwrap)
        .map(s => s.length);
    }
    ```
   */
  static unwrap<J>(theJust: Just<J>): J {
    return theJust.value;
  }

  /** `Just` is always [`Variant.Just`](../enums/_maybe_.variant#just). */
  readonly variant: Variant.Just = Variant.Just;

  /** The wrapped value. */
  readonly value: T;

  /**
    Create an instance of `Maybe.Just` with `new`.

    @note While you *may* create the `Just` type via normal JavaScript
    class construction, it is not recommended for the functional style for
    which the library is intended. Instead, use [`Maybe.of`] (for the general
    case) or [`Maybe.just`] for this specific case.

    [`Maybe.of`]: ../modules/_maybe_.html#of
    [`Maybe.just`]: ../modules/_maybe_.html#just

    ```ts
    // Avoid:
    const aString = new Maybe.Just('characters');

    // Prefer:
    const aString = Maybe.just('characters);
    ```

    @param value
    The value to wrap in a `Maybe.Just`.

    `null` and `undefined` are allowed by the type signature so that the
    constructor may `throw` on those rather than constructing a type like
    `Maybe<undefined>`.

    @throws      If you pass `null` or `undefined`.
   */
  constructor(value?: T | null) {
    if (isVoid(value)) {
      throw new Error('Tried to construct `Just` with `null` or `undefined`');
    }

    this.value = value;
  }

  /** Method variant for [`Maybe.isJust`](../modules/_maybe_.html#isjust) */
  isJust(this: Maybe<T>): this is Just<T> {
    return true;
  }

  /** Method variant for [`Maybe.isNothing`](../modules/_maybe_.html#isnothing) */
  isNothing(this: Maybe<T>): this is Nothing<T> {
    return false;
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
  mapOrElse<U>(this: Maybe<T>, orElseFn: () => U, mapFn: (t: T) => U): U {
    return mapOrElse(orElseFn, mapFn, this);
  }

  /** Method variant for [`Maybe.match`](../modules/_maybe_.html#match) */
  match<U>(this: Maybe<T>, matcher: Matcher<T, U>): U {
    return match(matcher, this);
  }

  /** Method variant for [`Maybe.or`](../modules/_maybe_.html#or) */
  or(this: Maybe<T>, mOr: Maybe<T>): Maybe<T> {
    return or(mOr, this);
  }

  /** Method variant for [`Maybe.orElse`](../modules/_maybe_.html#orelse) */
  orElse(this: Maybe<T>, orElseFn: () => Maybe<T>): Maybe<T> {
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
    return this.value;
  }

  /** Method variant for [`Maybe.unwrapOr`](../modules/_maybe_.html#unwrapor) */
  unwrapOr(this: Maybe<T>, defaultValue: T): T {
    return unwrapOr(defaultValue, this);
  }

  /** Method variant for [`Maybe.unwrapOrElse`](../modules/_maybe_.html#unwraporelse) */
  unwrapOrElse(this: Maybe<T>, elseFn: () => T): T {
    return unwrapOrElse(elseFn, this);
  }

  /** Method variant for [`Maybe.toOkOrErr`](../modules/_maybe_.html#tookorerr) */
  toOkOrErr<E>(this: Maybe<T>, error: E): Result<T, E> {
    return toOkOrErr(error, this);
  }

  /** Method variant for [`Maybe.toOkOrElseErr`](../modules/_maybe_.html#tookorelseerr) */
  toOkOrElseErr<E>(this: Maybe<T>, elseFn: () => E): Result<T, E> {
    return toOkOrElseErr(elseFn, this);
  }

  /** Method variant for [`Maybe.toString`](../modules/_maybe_.html#tostring) */
  toString(this: Maybe<T>): string {
    return toString(this);
  }

  /** Method variant for [`Maybe.equals`](../modules/_maybe_.html#equals) */
  equals(this: Maybe<T>, comparison: Maybe<T>): boolean {
    return equals(comparison, this);
  }

  /** Method variant for [`Maybe.ap`](../modules/_maybe_.html#ap) */
  ap<A, B>(this: Maybe<(val: A) => B>, val: Maybe<A>): Maybe<B> {
    return ap(this, val);
  }

  /**
    Method variant for [`Maybe.get`](../modules/_maybe_.html#prop)

        If you have a `Maybe` of an object type, you can do `thatMaybe.get('a key')`
    to look up the next layer down in the object.

    ```ts
    type DeepOptionalType = {
      something?: {
        with?: {
          deeperKeys?: string;
        }
      }
    };

    const fullySet: DeepType = {
      something: {
        with: {
          deeperKeys: 'like this'
        }
      }
    };

    const deepJust = Maybe.of(fullySet)
      .get('something')
      .get('with')
      .get('deeperKeys');

    console.log(deepJust); // Just('like this');

    const partiallyUnset: DeepType = { something: { } };

    const deepEmpty = Maybe.of(partiallyUnset)
      .get('something')
      .get('with')
      .get('deeperKeys');

    console.log(deepEmpty); // Nothing
    ```
   */
  get<K extends keyof T>(this: Maybe<T>, key: K): Maybe<NonNullable<T[K]>> {
    return this.andThen(property(key));
  }
}

/**
  A `Nothing` instance is the *absent* variant instance of the
  [`Maybe`](../modules/_maybe_.html#maybe) type, representing the presence of a
  value which may be absent. For a full discussion, see [the module
  docs](../modules/_maybe_.html).

  @typeparam T The type which would be wrapped in a `Just` variant of `Maybe`.
 */
export class Nothing<T> implements MaybeShape<T> {
  /** `Nothing` is always [`Variant.Nothing`](../enums/_maybe_.variant#nothing). */
  readonly variant: Variant.Nothing = Variant.Nothing;

  /**
    Create an instance of `Maybe.Nothing` with `new`.

    @note While you *may* create the `Nothing` type via normal JavaScript
    class construction, it is not recommended for the functional style for
    which the library is intended. Instead, use [`Maybe.of`] (for the general
    case) or [`Maybe.nothing`] for this specific case.

    [`Maybe.of`]: ../modules/_maybe_.html#of
    [`Maybe.nothing`]: ../modules/_maybe_.html#nothing

    ```ts
    // Avoid:
    const aNothing = new Maybe.Err();

    // Prefer:
    const aNothing = Maybe.nothing();
    ```

    `null` and `undefined` are allowed so that you may explicitly construct the
    `Err` type with a known `null` or `undefined` value. (This maybe helpful
    primarily when transitioning a codebase to the use of `Maybe`.)

    @throws      If you pass `null` or `undefined`.
   */
  constructor(_?: null) {
    /* nothing to do */
  }

  /** Method variant for [`Maybe.isJust`](../modules/_maybe_.html#isjust) */
  isJust(this: Maybe<T>): this is Just<T> {
    return false;
  }

  /** Method variant for [`Maybe.isNothing`](../modules/_maybe_.html#isnothing) */
  isNothing(this: Maybe<T>): this is Nothing<T> {
    return true;
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
  mapOrElse<U>(this: Maybe<T>, orElseFn: () => U, mapFn: (t: T) => U): U {
    return mapOrElse(orElseFn, mapFn, this);
  }

  /** Method variant for [`Maybe.match`](../modules/_maybe_.html#match) */
  match<U>(this: Maybe<T>, matcher: Matcher<T, U>): U {
    return match(matcher, this);
  }

  /** Method variant for [`Maybe.or`](../modules/_maybe_.html#or) */
  or(this: Maybe<T>, mOr: Maybe<T>): Maybe<T> {
    return or(mOr, this);
  }

  /** Method variant for [`Maybe.orElse`](../modules/_maybe_.html#orelse) */
  orElse(this: Maybe<T>, orElseFn: () => Maybe<T>): Maybe<T> {
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
    throw new Error('Tried to `unsafelyUnwrap(Nothing)`');
  }

  /** Method variant for [`Maybe.unwrapOr`](../modules/_maybe_.html#unwrapor) */
  unwrapOr(this: Maybe<T>, defaultValue: T): T {
    return unwrapOr(defaultValue, this);
  }

  /** Method variant for [`Maybe.unwrapOrElse`](../modules/_maybe_.html#unwraporelse) */
  unwrapOrElse(this: Maybe<T>, elseFn: () => T): T {
    return unwrapOrElse(elseFn, this);
  }

  /** Method variant for [`Maybe.toOkOrErr`](../modules/_maybe_.html#tookorerr) */
  toOkOrErr<E>(this: Maybe<T>, error: E): Result<T, E> {
    return toOkOrErr(error, this);
  }

  /** Method variant for [`Maybe.toOkOrElseErr`](../modules/_maybe_.html#tookorelseerr) */
  toOkOrElseErr<E>(this: Maybe<T>, elseFn: () => E): Result<T, E> {
    return toOkOrElseErr(elseFn, this);
  }

  /** Method variant for [`Maybe.toString`](../modules/_maybe_.html#tostring) */
  toString(this: Maybe<T>): string {
    return toString(this);
  }

  /** Method variant for [`Maybe.equals`](../modules/_maybe_.html#equals) */
  equals(this: Maybe<T>, comparison: Maybe<T>): boolean {
    return equals(comparison, this);
  }

  /** Method variant for [`Maybe.ap`](../modules/_maybe_.html#ap) */
  ap<A, B>(this: Maybe<(val: A) => B>, val: Maybe<A>): Maybe<B> {
    return ap(this, val);
  }

  /**
    Method variant for [`Maybe.get`](../modules/_maybe_.html#prop)

        If you have a `Maybe` of an object type, you can do `thatMaybe.get('a key')`
    to look up the next layer down in the object.

    ```ts
    type DeepOptionalType = {
      something?: {
        with?: {
          deeperKeys?: string;
        }
      }
    };

    const fullySet: DeepType = {
      something: {
        with: {
          deeperKeys: 'like this'
        }
      }
    };

    const deepJust = Maybe.of(fullySet)
      .get('something')
      .get('with')
      .get('deeperKeys');

    console.log(deepJust); // Just('like this');

    const partiallyUnset: DeepType = { something: { } };

    const deepEmpty = Maybe.of(partiallyUnset)
      .get('something')
      .get('with')
      .get('deeperKeys');

    console.log(deepEmpty); // Nothing
    ```
   */
  get<K extends keyof T>(this: Maybe<T>, key: K): Maybe<NonNullable<T[K]>> {
    return this.andThen(property(key));
  }
}

/**
  Is this result a `Just` instance?

  @typeparam T The type of the wrapped value.
  @param maybe The `Maybe` instance to check.
  @returns     `true` if `maybe` is `Just`, `false` otherwise. In TypeScript,
               also narrows the type from `Maybe<T>` to `Just<T>`.
 */
export function isJust<T>(maybe: Maybe<T>): maybe is Just<T> {
  return maybe.variant === Variant.Just;
}

/**
  Is this result a `Nothing` instance?

  @typeparam T The type of the wrapped value.
  @param maybe The `Maybe` instance to check.
  @returns     `true` if `maybe` is `nothing`, `false` otherwise. In TypeScript,
               also narrows the type from `Maybe<T>` to `Nothing<T>`.
 */
export function isNothing<T>(maybe: Maybe<T>): maybe is Nothing<T> {
  return maybe.variant === Variant.Nothing;
}

/**
  Create an instance of `Maybe.Just`.

  `null` and `undefined` are allowed by the type signature so that the
  function may `throw` on those rather than constructing a type like
  `Maybe<undefined>`.

  @typeparam T The type of the item contained in the `Maybe`.
  @param value The value to wrap in a `Maybe.Just`.
  @returns     An instance of `Maybe.Just<T>`.
  @throws      If you pass `null` or `undefined`.
 */
export function just<T>(value?: T | null): Maybe<T> {
  return new Just<T>(value);
}

/**
  Create an instance of `Maybe.Nothing`.

  If you want to create an instance with a specific type, e.g. for use in a
  function which expects a `Maybe<T>` where the `<T>` is known but you have no
  value to give it, you can use a type parameter:

  ```ts
  const notString = Maybe.nothing<string>();
  ```

  @typeparam T The type of the item contained in the `Maybe`.
  @returns     An instance of `Maybe.Nothing<T>`.
 */
export function nothing<T>(_?: null): Maybe<T> {
  return new Nothing<T>(_);
}

/**
  Create a `Maybe` from any value.

  To specify that the result should be interpreted as a specific type, you may
  invoke `Maybe.of` with an explicit type parameter:

  ```ts
  const foo = Maybe.of<string>(null);
  ```

  This is usually only important in two cases:

  1.  If you are intentionally constructing a `Nothing` from a known `null` or
      undefined value *which is untyped*.
  2.  If you are specifying that the type is more general than the value passed
      (since TypeScript can define types as literals).

  @typeparam T The type of the item contained in the `Maybe`.
  @param value The value to wrap in a `Maybe`. If it is `undefined` or `null`,
               the result will be `Nothing`; otherwise it will be the type of
               the value passed.
 */
export function of<T>(value?: T | null): Maybe<T> {
  return isVoid(value) ? nothing<T>() : just(value);
}

/** Alias for [`of`](#of), primarily for compatibility with Folktale. */
export const fromNullable = of;

/**
  Map over a `Maybe` instance: apply the function to the wrapped value if the
  instance is `Just`, and return `Nothing` if the instance is `Nothing`.

  `Maybe.map` works a lot like `Array.prototype.map`: `Maybe` and `Array` are
  both *containers* for other things. If you have no items in an array of
  numbers named `foo` and call `foo.map(x => x + 1)`, you'll still just have an
  array with nothing in it. But if you have any items in the array (`[2, 3]`),
  and you call `foo.map(x => x + 1)` on it, you'll get a new array with each of
  those items inside the array "container" transformed (`[3, 4]`).

  That's exactly what's happening with `Maybe.map`. If the container is *empty*
  – the `Nothing` variant – you just get back an empty container. If the
  container has something in it – the `Just` variant – you get back a container
  with the item inside transformed.

  (So... why not just use an array? The biggest reason is that an array can be
  any length. With a `Maybe`, we're capturing the idea of "something or
  nothing" rather than "0 to n" items. And this lets us implement a whole set
  of *other* interfaces, like those in this module.)

  #### Examples

  ```ts
  const length = (s: string) => s.length;

  const justAString = Maybe.just('string');
  const justTheStringLength = map(length, justAString);
  console.log(justTheStringLength.toString()); // Just(6)

  const notAString = Maybe.nothing<string>();
  const notAStringLength = map(length, notAString);
  console.log(notAStringLength.toString()); // "Nothing"
  ```

  @typeparam T The type of the wrapped value.
  @typeparam U The type of the wrapped value of the returned `Maybe`.
  @param mapFn The function to apply the value to if `Maybe` is `Just`.
  @param maybe The `Maybe` instance to map over.
  @returns     A new `Maybe` with the result of applying `mapFn` to the value
               in a `Just`, or `Nothing` if `maybe` is `Nothing`.
 */
export function map<T, U>(mapFn: (t: T) => U): (maybe: Maybe<T>) => Maybe<U>;
export function map<T, U>(mapFn: (t: T) => U, maybe: Maybe<T>): Maybe<U>;
export function map<T, U>(
  mapFn: (t: T) => U,
  maybe?: Maybe<T>
): Maybe<U> | ((maybe: Maybe<T>) => Maybe<U>) {
  const op = (m: Maybe<T>) => (m.isJust() ? just(mapFn(m.value)) : nothing<U>());
  return curry1(op, maybe);
}

/**
  Map over a `Maybe` instance and get out the value if `maybe` is a `Just`, or
  return a default value if `maybe` is a `Nothing`.

  #### Examples

  ```ts
  const length = (s: string) => s.length;

  const justAString = Maybe.just('string');
  const theStringLength = mapOr(0, length, justAString);
  console.log(theStringLength); // 6

  const notAString = Maybe.nothing<string>();
  const notAStringLength = mapOr(0, length, notAString)
  console.log(notAStringLength); // 0
  ```

  @typeparam T The type of the wrapped value.
  @typeparam U The type of the wrapped value of the returned `Maybe`.
  @param orU   The default value to use if `maybe` is `Nothing`
  @param mapFn The function to apply the value to if `Maybe` is `Just`
  @param maybe The `Maybe` instance to map over.
 */
export function mapOr<T, U>(orU: U, mapFn: (t: T) => U, maybe: Maybe<T>): U;
export function mapOr<T, U>(orU: U, mapFn: (t: T) => U): (maybe: Maybe<T>) => U;
export function mapOr<T, U>(orU: U): (mapFn: (t: T) => U) => (maybe: Maybe<T>) => U;
export function mapOr<T, U>(
  orU: U,
  mapFn?: (t: T) => U,
  maybe?: Maybe<T>
): U | ((maybe: Maybe<T>) => U) | ((mapFn: (t: T) => U) => (maybe: Maybe<T>) => U) {
  function fullOp(fn: (t: T) => U, m: Maybe<T>) {
    return m.isJust() ? fn(m.value) : orU;
  }

  function partialOp(fn: (t: T) => U): (maybe: Maybe<T>) => U;
  function partialOp(fn: (t: T) => U, curriedMaybe: Maybe<T>): U;
  function partialOp(fn: (t: T) => U, curriedMaybe?: Maybe<T>): U | ((maybe: Maybe<T>) => U) {
    return curriedMaybe !== undefined
      ? fullOp(fn, curriedMaybe)
      : (extraCurriedMaybe: Maybe<T>) => fullOp(fn, extraCurriedMaybe);
  }

  return mapFn === undefined
    ? partialOp
    : maybe === undefined
      ? partialOp(mapFn)
      : partialOp(mapFn, maybe);
}

/**
  Map over a `Maybe` instance and get out the value if `maybe` is a `Just`,
  or use a function to construct a default value if `maybe` is `Nothing`.

  #### Examples

  ```ts
  const length = (s: string) => s.length;
  const getDefault = () => 0;

  const justAString = Maybe.just('string');
  const theStringLength = mapOrElse(getDefault, length, justAString);
  console.log(theStringLength); // 6

  const notAString = Maybe.nothing<string>();
  const notAStringLength = mapOrElse(getDefault, length, notAString)
  console.log(notAStringLength); // 0
  ```

  @typeparam T    The type of the wrapped value.
  @typeparam U    The type of the wrapped value of the returned `Maybe`.
  @param orElseFn The function to apply if `maybe` is `Nothing`.
  @param mapFn    The function to apply to the wrapped value if `maybe` is `Just`
  @param maybe    The `Maybe` instance to map over.
 */
export function mapOrElse<T, U>(orElseFn: () => U, mapFn: (t: T) => U, maybe: Maybe<T>): U;
export function mapOrElse<T, U>(orElseFn: () => U, mapFn: (t: T) => U): (maybe: Maybe<T>) => U;
export function mapOrElse<T, U>(orElseFn: () => U): (mapFn: (t: T) => U) => (maybe: Maybe<T>) => U;
export function mapOrElse<T, U>(
  orElseFn: () => U,
  mapFn?: (t: T) => U,
  maybe?: Maybe<T>
): U | ((maybe: Maybe<T>) => U) | ((mapFn: (t: T) => U) => (maybe: Maybe<T>) => U) {
  function fullOp(fn: (t: T) => U, m: Maybe<T>) {
    return m.isJust() ? fn(m.value) : orElseFn();
  }

  function partialOp(fn: (t: T) => U): (maybe: Maybe<T>) => U;
  function partialOp(fn: (t: T) => U, curriedMaybe: Maybe<T>): U;
  function partialOp(fn: (t: T) => U, curriedMaybe?: Maybe<T>): U | ((maybe: Maybe<T>) => U) {
    return curriedMaybe !== undefined
      ? fullOp(fn, curriedMaybe)
      : (extraCurriedMaybe: Maybe<T>) => fullOp(fn, extraCurriedMaybe);
  }

  if (mapFn === undefined) {
    return partialOp;
  } else if (maybe === undefined) {
    return partialOp(mapFn);
  } else {
    return partialOp(mapFn, maybe);
  }
}

/**
  You can think of this like a short-circuiting logical "and" operation on a
  `Maybe` type. If `maybe` is `Just`, then the result is the `andMaybe`. If
  `maybe` is `Nothing`, the result is `Nothing`.

  This is useful when you have another `Maybe` value you want to provide if and
  *only if* you have a `Just` – that is, when you need to make sure that if you
  `Nothing`, whatever else you're handing a `Maybe` to *also* gets a `Nothing`.

  Notice that, unlike in [`map`](#map) or its variants, the original `maybe` is
  not involved in constructing the new `Maybe`.

  #### Examples

  ```ts
  import Maybe from 'true-myth/maybe';

  const justA = Maybe.just('A');
  const justB = Maybe.just('B');
  const nothing: Maybe<number> = nothing();

  console.log(Maybe.and(justB, justA).toString());  // Just(B)
  console.log(Maybe.and(justB, nothing).toString());  // Nothing
  console.log(Maybe.and(nothing, justA).toString());  // Nothing
  console.log(Maybe.and(nothing, nothing).toString());  // Nothing
  ```

  @typeparam T    The type of the initial wrapped value.
  @typeparam U    The type of the wrapped value of the returned `Maybe`.
  @param andMaybe The `Maybe` instance to return if `maybe` is `Just`
  @param maybe    The `Maybe` instance to check.
  @return         `Nothing` if the original `maybe` is `Nothing`, or `andMaybe`
                  if the original `maybe` is `Just`.
 */
export function and<T, U>(andMaybe: Maybe<U>, maybe: Maybe<T>): Maybe<U>;
export function and<T, U>(andMaybe: Maybe<U>): (maybe: Maybe<T>) => Maybe<U>;
export function and<T, U>(
  andMaybe: Maybe<U>,
  maybe?: Maybe<T>
): Maybe<U> | ((maybe: Maybe<T>) => Maybe<U>) {
  const op = (m: Maybe<T>) => (m.isJust() ? andMaybe : nothing<U>());
  return curry1(op, maybe);
}

/**
  Apply a function to the wrapped value if `Just` and return a new `Just`
  containing the resulting value; or return `Nothing` if `Nothing`.

  This differs from `map` in that `thenFn` returns another `Maybe`. You can use
  `andThen` to combine two functions which *both* create a `Maybe` from an
  unwrapped type.

  You may find the `.then` method on an ES6 `Promise` helpful for b:
  if you have a `Promise`, you can pass its `then` method a callback which
  returns another `Promise`, and the result will not be a *nested* promise, but
  a single `Promise`. The difference is that `Promise#then` unwraps *all*
  layers to only ever return a single `Promise` value, whereas `Maybe.andThen`
  will not unwrap nested `Maybe`s.

  This is also commonly known as (and therefore aliased as) [`flatMap`][flatMap]
  or [`chain`][chain]. It is sometimes also known as `bind`, but *not* aliased as such
  because [`bind` already means something in JavaScript][bind].

  [flatMap]: #flatmap
  [chain]: #chain
  [bind]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind

  #### Example

  (This is a somewhat contrived example, but it serves to show the way the
  function behaves.)

  ```ts
  import Maybe from 'true-myth/maybe';

  // string -> Maybe<number>
  const toMaybeLength = (s: string): Maybe<number> => Maybe.of(s.length);

  // Maybe<string>
  const aMaybeString = Maybe.of('Hello, there!');

  // Maybe<number>
  const resultingLength = Maybe.andThen(toMaybeLength, aMaybeString);
  console.log(Maybe.toString(resultingLength)); // 13
  ```

  Note that the result is not `(Just(13))`, but `13`!

  @typeparam T  The type of the wrapped value.
  @typeparam U  The type of the wrapped value in the resulting `Maybe`.
  @param thenFn The function to apply to the wrapped `T` if `maybe` is `Just`.
  @param maybe  The `Maybe` to evaluate and possibly apply a function to the
                contents of.
  @returns      The result of the `thenFn` (a new `Maybe`) if `maybe` is a
                `Just`, otherwise `Nothing` if `maybe` is a `Nothing`.
 */
export function andThen<T, U>(thenFn: (t: T) => Maybe<U>, maybe: Maybe<T>): Maybe<U>;
export function andThen<T, U>(thenFn: (t: T) => Maybe<U>): (maybe: Maybe<T>) => Maybe<U>;
export function andThen<T, U>(
  thenFn: (t: T) => Maybe<U>,
  maybe?: Maybe<T>
): Maybe<U> | ((maybe: Maybe<T>) => Maybe<U>) {
  const op = (m: Maybe<T>) => (m.isJust() ? thenFn(m.value) : nothing<U>());
  return maybe !== undefined ? op(maybe) : op;
}

/** Alias for [`andThen`](#andthen). */
export const chain = andThen;

/** Alias for [`andThen`](#andthen). */
export const flatMap = andThen;

/**
  Provide a fallback for a given `Maybe`. Behaves like a logical `or`: if the
  `maybe` value is a `Just`, returns that `maybe`; otherwise, returns the
  `defaultMaybe` value.

  This is useful when you want to make sure that something which takes a
  `Maybe` always ends up getting a `Just` variant, by supplying a default value
  for the case that you currently have a nothing.

  ```ts
  import Maybe from 'true-utils/maybe';

  const justA = Maybe.just("a");
  const justB = Maybe.just("b");
  const aNothing: Maybe<string> = nothing();

  console.log(Maybe.or(justB, justA).toString());  // Just(A)
  console.log(Maybe.or(aNothing, justA).toString());  // Just(A)
  console.log(Maybe.or(justB, aNothing).toString());  // Just(B)
  console.log(Maybe.or(aNothing, aNothing).toString());  // Nothing
  ```

  @typeparam T        The type of the wrapped value.
  @param defaultMaybe The `Maybe` to use if `maybe` is a `Nothing`.
  @param maybe        The `Maybe` instance to evaluate.
  @returns            `maybe` if it is a `Just`, otherwise `defaultMaybe`.
 */
export function or<T>(defaultMaybe: Maybe<T>, maybe: Maybe<T>): Maybe<T>;
export function or<T>(defaultMaybe: Maybe<T>): (maybe: Maybe<T>) => Maybe<T>;
export function or<T>(
  defaultMaybe: Maybe<T>,
  maybe?: Maybe<T>
): Maybe<T> | ((maybe: Maybe<T>) => Maybe<T>) {
  const op = (m: Maybe<T>) => (m.isJust() ? m : defaultMaybe);
  return maybe !== undefined ? op(maybe) : op;
}

/**
  Like `or`, but using a function to construct the alternative `Maybe`.

  Sometimes you need to perform an operation using other data in the
  environment to construct the fallback value. In these situations, you can
  pass a function (which may be a closure) as the `elseFn` to generate the
  fallback `Maybe<T>`.

  Useful for transforming empty scenarios based on values in context.

  @typeparam T  The type of the wrapped value.
  @param elseFn The function to apply if `maybe` is `Nothing`
  @param maybe  The `maybe` to use if it is `Just`.
  @returns      The `maybe` if it is `Just`, or the `Maybe` returned by
                `elseFn` if the `maybe` is `Nothing`.
 */
export function orElse<T>(elseFn: () => Maybe<T>, maybe: Maybe<T>): Maybe<T>;
export function orElse<T>(elseFn: () => Maybe<T>): (maybe: Maybe<T>) => Maybe<T>;
export function orElse<T>(
  elseFn: () => Maybe<T>,
  maybe?: Maybe<T>
): Maybe<T> | ((maybe: Maybe<T>) => Maybe<T>) {
  const op = (m: Maybe<T>) => (m.isJust() ? m : elseFn());
  return curry1(op, maybe);
}

/**
  Get the value out of the `Maybe`.

  Returns the content of a `Just`, but **throws if the `Maybe` is `Nothing`**.
  Prefer to use [`unwrapOr`](#unwrapor) or [`unwrapOrElse`](#unwraporelse).

  @typeparam T The type of the wrapped value.
  @param maybe The value to unwrap
  @returns     The unwrapped value if the `Maybe` instance is `Just`.
  @throws      If the `maybe` is `Nothing`.
 */
export function unsafelyUnwrap<T>(maybe: Maybe<T>): T {
  return maybe.unsafelyUnwrap();
}

/** Alias for [`unsafelyUnwrap`](#unsafelyunwrap) */
export const unsafelyGet = unsafelyUnwrap;

/** Alias for [`unsafelyUnwrap`](#unsafelyunwrap) */
export const unsafeGet = unsafelyUnwrap;

/**
  Safely get the value out of a `Maybe`.

  Returns the content of a `Just` or `defaultValue` if `Nothing`. This is the
  recommended way to get a value out of a `Maybe` most of the time.

  ```ts
  import Maybe from 'true-myth/maybe';

  const notAString = Maybe.nothing<string>();
  const isAString = Maybe.just('look ma! some characters!');

  console.log(Maybe.unwrapOr('<empty>', notAString));  // "<empty>"
  console.log(Maybe.unwrapOr('<empty>', isAString));  // "look ma! some characters!"
  ```

  @typeparam T        The type of the wrapped value.
  @param defaultValue The value to return if `maybe` is a `Nothing`.
  @param maybe        The `Maybe` instance to unwrap if it is a `Just`.
  @returns            The content of `maybe` if it is a `Just`, otherwise
                      `defaultValue`.
 */
export function unwrapOr<T>(defaultValue: T, maybe: Maybe<T>): T;
export function unwrapOr<T>(defaultValue: T): (maybe: Maybe<T>) => T;
export function unwrapOr<T>(defaultValue: T, maybe?: Maybe<T>) {
  const op = (m: Maybe<T>) => (m.isJust() ? m.value : defaultValue);
  return curry1(op, maybe);
}

/** Alias for [`unwrapOr`](#unwrapor) */
export const getOr = unwrapOr;

/**
  Safely get the value out of a [`Maybe`](#maybe) by returning the wrapped
  value if it is `Just`, or by applying `orElseFn` if it is `Nothing`.

  This is useful when you need to *generate* a value (e.g. by using current
  values in the environment – whether preloaded or by local closure) instead of
  having a single default value available (as in [`unwrapOr`](#unwrapor)).

  ```ts
  import Maybe from 'true-myth/maybe';

  // You can imagine that someOtherValue might be dynamic.
  const someOtherValue = 99;
  const handleNothing = () => someOtherValue;

  const aJust = Maybe.just(42);
  console.log(Maybe.unwrapOrElse(handleNothing, aJust));  // 42

  const aNothing = nothing<number>();
  console.log(Maybe.unwrapOrElse(handleNothing, aNothing)); // 99
  ```

  @typeparam T  The wrapped value.
  @param orElseFn A function used to generate a valid value if `maybe` is a
                  `Nothing`.
  @param maybe    The `Maybe` instance to unwrap if it is a `Just`
  @returns        Either the content of `maybe` or the value returned from
                  `orElseFn`.
 */
export function unwrapOrElse<T>(orElseFn: () => T, maybe: Maybe<T>): T;
export function unwrapOrElse<T>(orElseFn: () => T): (maybe: Maybe<T>) => T;
export function unwrapOrElse<T>(orElseFn: () => T, maybe?: Maybe<T>): T | ((maybe: Maybe<T>) => T) {
  const op = (m: Maybe<T>) => (m.isJust() ? m.value : orElseFn());
  return curry1(op, maybe);
}

/** Alias for [`unwrapOrElse`](#unwraporelse) */
export const getOrElse = unwrapOrElse;

/**
  Transform the [`Maybe`](#maybe) into a
  [`Result`](../modules/_result_.html#result), using the wrapped value as the
  `Ok` value if `Just`; otherwise using the supplied `error` value for `Err`.

  @typeparam T  The wrapped value.
  @typeparam E  The error type to in the `Result`.
  @param error The error value to use if the `Maybe` is `Nothing`.
  @param maybe The `Maybe` instance to convert.
  @returns     A `Result` containing the value wrapped in `maybe` in an `Ok`,
               or `error` in an `Err`.
 */
export function toOkOrErr<T, E>(error: E, maybe: Maybe<T>): Result<T, E>;
export function toOkOrErr<T, E>(error: E): (maybe: Maybe<T>) => Result<T, E>;
export function toOkOrErr<T, E>(
  error: E,
  maybe?: Maybe<T>
): Result<T, E> | ((maybe: Maybe<T>) => Result<T, E>) {
  const op = (m: Maybe<T>) => (m.isJust() ? ok<T, E>(m.value) : err<T, E>(error));
  return maybe !== undefined ? op(maybe) : op;
}

/**
  Transform the [`Maybe`](#maybe) into a
  [`Result`](../modules/_result_.html#result), using the wrapped value as the
  `Ok` value if `Just`; otherwise using `elseFn` to generate `Err`.

  @typeparam T  The wrapped value.
  @typeparam E  The error type to in the `Result`.
  @param elseFn The function which generates an error of type `E`.
  @param maybe  The `Maybe` instance to convert.
  @returns     A `Result` containing the value wrapped in `maybe` in an `Ok`,
               or the value generated by `elseFn` in an `Err`.
 */
export function toOkOrElseErr<T, E>(elseFn: () => E, maybe: Maybe<T>): Result<T, E>;
export function toOkOrElseErr<T, E>(elseFn: () => E): (maybe: Maybe<T>) => Result<T, E>;
export function toOkOrElseErr<T, E>(
  elseFn: () => E,
  maybe?: Maybe<T>
): Result<T, E> | ((maybe: Maybe<T>) => Result<T, E>) {
  const op = (m: Maybe<T>) => (m.isJust() ? ok<T, E>(m.value) : err<T, E>(elseFn()));
  return curry1(op, maybe);
}

/**
  Construct a `Maybe<T>` from a `Result<T, E>`.

  If the `Result` is an `Ok`, wrap its value in `Just`. If the `Result` is an
  `Err`, throw away the wrapped `E` and transform to a `Nothing`.

  @typeparam T  The type of the value wrapped in a `Result.Ok` and in the `Just`
                of the resulting `Maybe`.
  @param result The `Result` to construct a `Maybe` from.
  @returns      `Just` if `result` was `Ok` or `Nothing` if it was `Err`.
 */
export function fromResult<T>(result: Result<T, any>): Maybe<T> {
  return result.isOk() ? just(result.value) : nothing<T>();
}

/**
  Create a `String` representation of a `Maybe` instance.

  A `Just` instance will be printed as `Just(<representation of the value>)`,
  where the representation of the value is simply the value's own `toString`
  representation. For example:

  | call                                   | output                  |
  |----------------------------------------|-------------------------|
  | `toString(Maybe.of(42))`               | `Just(42)`              |
  | `toString(Maybe.of([1, 2, 3]))`        | `Just(1,2,3)`           |
  | `toString(Maybe.of({ an: 'object' }))` | `Just([object Object])` |
  | `toString(Maybe.nothing())`            | `Nothing`               |

  @typeparam T The type of the wrapped value; its own `.toString` will be used
               to print the interior contents of the `Just` variant.
  @param maybe The value to convert to a string.
  @returns     The string representation of the `Maybe`.
 */
export function toString<T>(maybe: Maybe<T>): string {
  const body = maybe.isJust() ? `(${maybe.value.toString()})` : '';
  return `${maybe.variant}${body}`;
}

/** A lightweight object defining how to handle each variant of a Maybe. */
export type Matcher<T, A> = {
  Just: (value: T) => A;
  Nothing: () => A;
};

/**
  Performs the same basic functionality as `getOrElse`, but instead of simply
  unwrapping the value if it is `Just` and applying a value to generate the same
  default type if it is `Nothing`, lets you supply functions which may transform
  the wrapped type if it is `Just` or get a default value for `Nothing`.

  This is kind of like a poor man's version of pattern matching, which
  JavaScript currently lacks.

  Instead of code like this:

  ```ts
  import Maybe from 'true-myth/maybe';

  const logValue = (mightBeANumber: Maybe<number>) => {
    const valueToLog = Maybe.mightBeANumber.isJust()
      ? Maybe.unsafelyUnwrap(mightBeANumber).toString()
      : 'Nothing to log.';

    console.log(valueToLog);
  };
  ```

  ...we can write code like this:

  ```ts
  import Maybe from 'true-myth/maybe';

  const logValue = (mightBeANumber: Maybe<number>) => {
    const value = Maybe.match(
      {
        Just: n => n.toString(),
        Nothing: () => 'Nothing to log.',
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
  @param maybe   The `maybe` instance to check.
 */
export function match<T, A>(matcher: Matcher<T, A>, maybe: Maybe<T>): A;
export function match<T, A>(matcher: Matcher<T, A>): (m: Maybe<T>) => A;
export function match<T, A>(matcher: Matcher<T, A>, maybe?: Maybe<T>): A | ((m: Maybe<T>) => A) {
  return maybe !== undefined
    ? mapOrElse(matcher.Nothing, matcher.Just, maybe)
    : (curriedMaybe: Maybe<T>) => mapOrElse(matcher.Nothing, matcher.Just, curriedMaybe);
}

/** Alias for [`match`](#match) */
export const cata = match;

/**
  Allows quick triple-equal equality check between the values inside two `maybe`s
  without having to unwrap them first.

  ```ts
  const a = Maybe.of(3);
  const b = Maybe.of(3);
  const c = Maybe.of(null);
  const d = Maybe.nothing();

  Maybe.equals(a, b); // true
  Maybe.equals(a, c); // false
  Maybe.equals(c, d); // true
  ```

  @param mb A `maybe` to compare to.
  @param ma A `maybe` instance to check.
 */
export function equals<T>(mb: Maybe<T>, ma: Maybe<T>): boolean;
export function equals<T>(mb: Maybe<T>): (ma: Maybe<T>) => boolean;
export function equals<T>(mb: Maybe<T>, ma?: Maybe<T>): boolean | ((a: Maybe<T>) => boolean) {
  return ma !== undefined
    ? ma.match({
        Just: aVal => mb.isJust() && mb.unsafelyUnwrap() === aVal,
        Nothing: () => isNothing(mb),
      })
    : (maybeA: Maybe<T>) =>
        maybeA.match({
          Nothing: () => isNothing(mb),
          Just: aVal => mb.isJust() && mb.unsafelyUnwrap() === aVal,
        });
}

/**
  Allows you to *apply* (thus `ap`) a value to a function without having to
  take either out of the context of their `Maybe`s. This does mean that the
  transforming function is itself within a `Maybe`, which can be hard to grok
  at first but lets you do some very elegant things. For example, `ap` allows
  you to this:

  ```ts
  import { just, nothing } from 'true-myth/maybe';

  const one = just(1);
  const five = just(5);
  const none = nothing();

  const add = (a: number) => (b: number) => a + b;
  const maybeAdd = just(add);

  maybeAdd.ap(one).ap(five); // Just(6)
  maybeAdd.ap(one).ap(none); // Nothing
  maybeAdd.ap(none).ap(five) // Nothing
  ```

  Without `Maybe.ap`, you'd need to do something like a nested `Maybe.match`:

  ```ts
  import { just, nothing } from 'true-myth/maybe';

  const one = just(1);
  const five = just(5);
  const none = nothing();

  one.match({
    Just: n => five.match({
      Just: o => just(n + o),
      Nothing: () => nothing(),
    }),
    Nothing: ()  => nothing(),
  }); // Just(6)

  one.match({
    Just: n => none.match({
      Just: o => just(n + o),
      Nothing: () => nothing(),
    }),
    Nothing: ()  => nothing(),
  }); // Nothing

  none.match({
    Just: n => five.match({
      Just: o => just(n + o),
      Nothing: () => nothing(),
    }),
    Nothing: ()  => nothing(),
  }); // Nothing
  ```

  And this kind of thing comes up quite often once you're using `Maybe` to
  handle optionality throughout your application.

  For another example, imagine you need to compare the equality of two
  ImmutableJS data structures, where a `===` comparison won't work. With `ap`,
  that's as simple as this:

  ```ts
  import Maybe from 'true-myth/maybe';
  import Immutable from 'immutable';
  import { curry } from 'lodash'

  const is = curry(Immutable.is);

  const x = Maybe.of(Immutable.Set.of(1, 2, 3));
  const y = Maybe.of(Immutable.Set.of(2, 3, 4));

  Maybe.of(is).ap(x).ap(y); // Just(false)
  ```

  Without `ap`, we're back to that gnarly nested `match`:

  ```ts
   * import Maybe, { just, nothing } from 'true-myth/maybe';
  import Immutable from 'immutable';
  import { curry } from 'lodash'

  const is = curry(Immutable.is);

  const x = Maybe.of(Immutable.Set.of(1, 2, 3));
  const y = Maybe.of(Immutable.Set.of(2, 3, 4));

  x.match({
    Just: iX => y.match({
      Just: iY => Maybe.just(Immutable.is(iX, iY)),
      Nothing: () => Maybe.nothing(),
    })
    Nothing: () => Maybe.nothing(),
  }); // Just(false)
  ```

  In summary: anywhere you have two `Maybe` instances and need to perform an
  operation that uses both of them, `ap` is your friend.

  Two things to note, both regarding *currying*:

  1.  All functions passed to `ap` must be curried. That is, they must be of the
      form (for add) `(a: number) => (b: number) => a + b`, *not* the more usual
      `(a: number, b: number) => a + b` you see in JavaScript more generally.

      For convenience, you may want to look at Lodash's `_.curry` or Ramda's
      `R.curry`, which allow you to create curried versions of functions
      whenever you want:

      ```
      import Maybe from 'true-myth/maybe';
      import { curry } from 'lodash';

      const normalAdd = (a: number, b: number) => a + b;
      const curriedAdd = curry(normalAdd); // (a: number) => (b: number) => a + b;

      Maybe.of(curriedAdd).ap(Maybe.of(1)).ap(Maybe.of(5)); // Just(6)
      ```

  2.  You will need to call `ap` as many times as there are arguments to the
      function you're dealing with. So in the case of `add`, which has the
      "arity" (function argument count) of 2 (`a` and `b`), you'll need to call
      `ap` twice: once for `a`, and once for `b`. To see why, let's look at what
      the result in each phase is:

      ```ts
      const add = (a: number) => (b: number) => a + b;

      const maybeAdd = Maybe.of(add); // Just((a: number) => (b: number) => a + b)
      const maybeAdd1 = maybeAdd.ap(Maybe.of(1)); // Just((b: number) => 1 + b)
      const final = maybeAdd1.ap(Maybe.of(3)); // Just(4)
      ```

      So for `toString`, which just takes a single argument, you would only need
      to call `ap` once.

      ```ts
      const toStr = (v: { toString(): string }) => v.toString();
      Maybe.of(toStr).ap(12); // Just("12")
      ```

  One other scenario which doesn't come up *quite* as often but is conceivable
  is where you have something that may or may not actually construct a function
  for handling a specific `Maybe` scenario. In that case, you can wrap the
  possibly-present in `ap` and then wrap the values to apply to the function to
  in `Maybe` themselves.

  **Aside:** `ap` is not named `apply` because of the overlap with JavaScript's
  existing [`apply`] function – and although strictly speaking, there isn't any
  direct overlap (`Maybe.apply` and `Function.prototype.apply` don't intersect
  at all) it's useful to have a different name to avoid implying that they're
  the same.

  [`apply`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply

  @param maybeFn maybe a function from T to U
  @param maybe maybe a T to apply to `fn`
 */
export function ap<T, U>(maybeFn: Maybe<(t: T) => U>, maybe: Maybe<T>): Maybe<U>;
export function ap<T, U>(maybeFn: Maybe<(t: T) => U>): (maybe: Maybe<T>) => Maybe<U>;
export function ap<T, U>(
  maybeFn: Maybe<(val: T) => U>,
  maybe?: Maybe<T>
): Maybe<U> | ((val: Maybe<T>) => Maybe<U>) {
  const op = (m: Maybe<T>) =>
    m.match({
      Just: val => maybeFn.map(fn => fn(val)),
      Nothing: () => Maybe.nothing<U>(),
    });

  return curry1(op, maybe);
}

/**
  Determine whether an item is an instance of `Just` or `Nothing`.

  @param item The item to check.
 */
export function isInstance<T = any>(item: any): item is Maybe<T> {
  return item instanceof Just || item instanceof Nothing;
}

type Predicate<T> = (element: T, index: number, array: T[]) => boolean;

// NOTE: documentation is lightly adapted from the MDN and TypeScript docs for
// `Array.prototype.find`.
/**
  Safely search for an element in an array.
  
  This function behaves like `Array.prototype.find`, but returns `Maybe<T>`
  instead of `T | undefined`.
  
  ## Examples

  The basic form is:

  ```ts
  import Maybe from 'true-myth/maybe';

  let array = [1, 2, 3];
  Maybe.find(v => v > 1, array); // Just(2)
  Maybe.find(v => v < 1, array); // Nothing
  ```

  The function is curried so you can use it in a functional chain. For example
  (leaving aside error handling on a bad response for simplicity), suppose the
  url `https://arrays.example.com` returned a JSON payload with the type
  `Array<{ count: number, name: string }>`, and we wanted to get the first
  of these where `count` was at least 100. We could write this:

  ```ts
  import Maybe from 'true-myth/maybe';

  type Item = { count: number; name: string };
  type Response = Array<Item>;

  // curried variant!
  const findAtLeast100 = Maybe.find(({ count }: Item) => count > 100);

  fetch('https://arrays.example.com')
    .then(response => response.json() as Response)
    .then(findAtLeast100)
    .then(found => {
      if (found.isJust()) {
        console.log(`The matching value is ${found.value.name}!`);
      }
    });
  ```
  
  @param predicate  A function to execute on each value in the array, returning
                    `true` when the item in the array matches the condition. The
                    signature for `predicate` is identical to the signature for
                    the first argument to `Array.prototype.find`. The function
                    is called once for each element of the array, in ascending
                    order, until it finds one where predicate returns true. If
                    such an element is found, find immediately returns that
                    element value wrapped in `Just`. Otherwise, `Maybe.find`
                    returns `Nothing`.
 * @param array     The array to search using the predicate.
 */
export function find<T>(predicate: Predicate<T>, array: T[]): Maybe<T>;
export function find<T>(predicate: Predicate<T>): (array: T[]) => Maybe<T>;
export function find<T>(
  predicate: Predicate<T>,
  array?: T[]
): Maybe<T> | ((array: T[]) => Maybe<T>) {
  const op = (a: T[]) => Maybe.of(a.find(predicate));
  return curry1(op, array);
}

/**
  Safely get the first item from a list, returning `Just` the first item if the
  array has at least one item in it, or `Nothing` if it is empty.

  ## Examples

  ```ts
  let empty = [];
  Maybe.head(empty); // => Nothing

  let full = [1, 2, 3];
  Maybe.head(full); // => Just(1)
  ```

  @param array The array to get the first item from.
 */
export function head<T>(array: Array<T | null | undefined>): Maybe<T> {
  return Maybe.of(array[0]);
}

/** A convenience alias for `Maybe.head`. */
export const first = head;

/**
  Safely get the last item from a list, returning `Just` the last item if the
  array has at least one item in it, or `Nothing` if it is empty.

  ## Examples

  ```ts
  let empty = [];
  Maybe.last(empty); // => Nothing

  let full = [1, 2, 3];
  Maybe.last(full); // => Just(3)
  ```

  @param array The array to get the first item from.
 */
export function last<T>(array: Array<T | null | undefined>): Maybe<T> {
  return Maybe.of(array[array.length - 1]);
}

/**
  Convert the arguments to a single `Maybe`. Useful for dealing with arrays of
  `Maybe`s, via the spread operator.

  ## Examples

  ```ts
  import Maybe from 'true-myth/maybe';

  let valid = [Maybe.just(2), Maybe.just('three')];
  Maybe.all(...valid); // => Just([2, 'three']);

  let invalid = [Maybe.just(2), Maybe.nothing<string>()];
  Maybe.all(...invalid); // => Nothing
  ```

  ## Note on Spread

  This requires the use of the spread operator because (at least as of
  TypeScript 3.0), the type inference falls down when attempting to build this
  same type with an array directly. Moreover, this spread-based approach handles
  heteregenous arrays; TS *also* fails to infer correctly for anything but
  homogeneous arrays when using that approach.

  @param maybes The `Maybe`s to resolve to a single `Maybe`.
 */
export function all<T extends Array<Maybe<any>>>(...maybes: T): All<T> {
  let result: All<T> = Maybe.just([] as Maybe<any>[]) as All<T>;
  maybes.forEach(maybe => {
    result = result.andThen(accumulatedMaybes =>
      maybe.map(m => {
        accumulatedMaybes.push(m);
        return accumulatedMaybes;
      })
    ) as All<T>;
  });

  return result;
}

type All<T extends Array<Maybe<any>>> = T extends Array<Maybe<infer U>> ? Maybe<Array<U>> : never;

/**
  Given a tuple of `Maybe`s, return a `Maybe` of the tuple values.

  Given a tuple of type `[Maybe<A>, Maybe<B>]`, the resulting type is
  `Maybe<[A, B]>`. Works with up to a 5-tuple. (If you're doing more than a
  5-tuple, what are you doing???)

  ## Examples

  If any of the items in the tuple are `Nothing`, the whole result is `Nothing`.
  Here, for example, `result` has the type `Maybe<[string, number]>` and will be
  `Nothing`:

  ```ts
  import Maybe from 'true-myth/maybe';

  type Tuple = [Maybe<string>, Maybe<number>];

  let invalid: Tuple = [Maybe.just('wat'), Maybe.nothing()];
  let result = Maybe.tuple(invalid);  // => Nothing
  ```

  If all of the items in the tuple are `Just`, the result is `Just` wrapping the
  tuple of the values of the items. Here, for example, `result` again has the
  type `Maybe<[string, number]>` and will be `Just(['hey', 12]`:

  ```ts
  import Maybe from 'true-myth/maybe';

  type Tuple = [Maybe<string>, Maybe<number>];

  let valid: Tuple = [Maybe.just('hey'), Maybe.just(12)];
  let result = Maybe.tuple(valid);  // => Just(['hey', 12])
  ```

  @param maybes: the tuple of `Maybe`s to convert to a `Maybe` of tuple values.
 */
// @ts-ignore -- this doesn't type-check, but it is correct!
export function tuple<T>(maybes: [Maybe<T>]): Maybe<[T]>;
export function tuple<T, U>(maybes: [Maybe<T>, Maybe<U>]): Maybe<[T, U]>;
export function tuple<T, U, V>(maybes: [Maybe<T>, Maybe<U>, Maybe<V>]): Maybe<[T, U, V]>;
export function tuple<T, U, V, W>(
  maybes: [Maybe<T>, Maybe<U>, Maybe<V>, Maybe<W>]
): Maybe<[T, U, V, W]>;
export function tuple<T, U, V, W, X>(
  maybes: [Maybe<T>, Maybe<U>, Maybe<V>, Maybe<W>, Maybe<X>]
): Maybe<[T, U, V, W, X]> {
  // @ts-ignore -- this doesn't type-check, but it works correctly.
  return all(...maybes);
}

/**
  Safely extract a key from an object, returning `Just` if the key has a value
  on the object and `Nothing` if it does not.

  The check is type-safe: you won't even be able to compile if you try to look
  up a property that TypeScript *knows* doesn't exist on the object.

  ```ts
  type Person = { name?: string };

  const me: Person = { name: 'Chris' };
  console.log(Maybe.property('name', me)); // Just('Chris')

  const nobody: Person = {};
  console.log(Maybe.property('name', nobody)); // Nothing
  ```

  However, it also works correctly with dictionary types:

  ```ts
  type Dict<T> = { [key: string]: T };

  const score: Dict<number> = {
    player1: 0,
    player2: 1
  };

  console.log(Maybe.property('player1', score)); // Just(0)
  console.log(Maybe.property('player2', score)); // Just(1)
  console.log(Maybe.property('player3', score)); // Nothing
  ```

  The order of keys is so that it can be partially applied:

  ```ts
  type Person = { name?: string };
  
  const lookupName = Maybe.property('name');
  
  const me: Person = { name: 'Chris' };
  console.log(lookupName(me)); // Just('Chris')

  const nobody: Person = {};
  console.log(lookupName(nobody)); // Nothing
  ```
  
  @param key The key to pull out of the object.
  @param obj The object to look up the key from.
 */
export function property<T, K extends keyof T>(key: K, obj: T): Maybe<NonNullable<T[K]>>;
export function property<T, K extends keyof T>(key: K): (obj: T) => Maybe<NonNullable<T[K]>>;
export function property<T, K extends keyof T>(
  key: K,
  obj?: T
): Maybe<NonNullable<T[K]>> | ((obj: T) => Maybe<NonNullable<T[K]>>) {
  const op = (a: T) => (Maybe.of(a[key]) as unknown) as Maybe<NonNullable<T[K]>>;
  return curry1(op, obj);
}

/**
  Safely extract a key from a Maybe of an object, returning `Just` if the key
  has a value on the object and `Nothing` if it does not. (Like `Maybe.property`
  but operating on a `Maybe<T>` rather than directly on a `T`.)

  The check is type-safe: you won't even be able to compile if you try to look
  up a property that TypeScript *knows* doesn't exist on the object.

  ```ts
  type Person = { name?: string };

  const me: Maybe<Person> = Maybe.just({ name: 'Chris' });
  console.log(Maybe.get('name', me)); // Just('Chris')

  const nobody = Maybe.nothing<Person>();
  console.log(Maybe.get('name', nobody)); // Nothing
  ```

  However, it also works correctly with dictionary types:

  ```ts
  type Dict<T> = { [key: string]: T };

  const score: Maybe<Dict<number>> = Maybe.just({
    player1: 0,
    player2: 1
  });

  console.log(Maybe.get('player1', score)); // Just(0)
  console.log(Maybe.get('player2', score)); // Just(1)
  console.log(Maybe.get('player3', score)); // Nothing
  ```

  The order of keys is so that it can be partially applied:

  ```ts
  type Person = { name?: string };
  
  const lookupName = Maybe.get('name');
  
  const me: Person = { name: 'Chris' };
  console.log(lookupName(me)); // Just('Chris')

  const nobody: Person = {};
  console.log(lookupName(nobody)); // Nothing
  ```
  
  @param key The key to pull out of the object.
  @param obj The object to look up the key from.
 */
export function get<T, K extends keyof T>(key: K, maybeObj: Maybe<T>): Maybe<NonNullable<T[K]>>;
export function get<T, K extends keyof T>(key: K): (maybeObj: Maybe<T>) => Maybe<NonNullable<T[K]>>;
export function get<T, K extends keyof T>(
  key: K,
  maybeObj?: Maybe<T>
): Maybe<NonNullable<T[K]>> | ((maybeObj: Maybe<T>) => Maybe<NonNullable<T[K]>>) {
  return curry1(Maybe.andThen(property<T, K>(key)), maybeObj);
}

/** A value which may (`Just<T>`) or may not (`Nothing`) be present. */
export type Maybe<T> = Just<T> | Nothing<T>;
export const Maybe = {
  Variant,
  Just,
  Nothing,
  all,
  isJust,
  isNothing,
  just,
  nothing,
  of,
  find,
  first,
  fromNullable,
  head,
  last,
  map,
  mapOr,
  mapOrElse,
  and,
  andThen,
  chain,
  flatMap,
  or,
  orElse,
  unsafelyUnwrap,
  unsafelyGet,
  unsafeGet,
  unwrapOr,
  getOr,
  unwrapOrElse,
  getOrElse,
  toOkOrErr,
  toOkOrElseErr,
  fromResult,
  toString,
  tuple,
  match,
  cata,
  equals,
  ap,
  isInstance,
  property,
  get,
};

export default Maybe;
