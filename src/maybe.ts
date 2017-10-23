/** [[include:maybe.md]] */

/** (keep typedoc from getting confused by the imports) */
import { isVoid } from './utils';
import * as Result from './result';

/**
  Discriminant for the `Just` and `Nothing` variants.
  
  You can use the discriminant via the `variant` property of `Maybe` instances
  if you need to match explicitly on it.
 */
export enum Variant {
  Just = 'Just',
  Nothing = 'Nothing',
}

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

/**
  A `Just` instance is the *present* variant instance of the
  [`Maybe`](../modules/_maybe_.html#maybe) type, representing the presence of a
  value which may be absent.

  For a full discussion, see [the module docs](../modules/_maybe_.html).

  @typeparam T The type wrapped in this `Just` variant of `Maybe`.
 */
export class Just<T> implements IMaybe<T> {
  private __value: T;

  /** `Just` is always [`Variant.Just`](../enums/_maybe_.variant#just). */
  variant = Variant.Just;

  /**
    Create an instance of `Maybe.Just` with `new`.
    
    **Note:** While you *may* create the `Just` type via normal JavaScript
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

/**
  A `Nothing` instance is the *absent* variant instance of the
  [`Maybe`](../modules/_maybe_.html#maybe) type, representing the presence of a
  value which may be absent.

  For a full discussion, see [the module docs](../modules/_maybe_.html).

  @typeparam T The type which would be wrapped in a `Just` variant of `Maybe`.
 */
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
  Is this result a `Just` instance?
  
  @typeparam T The type of the wrapped value.
  @param maybe The `Maybe` instance to check.
  @returns     `true` if `maybe` is `Just`, `false` otherwise. In TypeScript,
               also narrows the type from `Maybe<T>` to `Just<T>`.
 */
export const isJust = <T>(maybe: Maybe<T>): maybe is Just<T> => maybe.variant === Variant.Just;

/**
  Is this result a `Nothing` instance?
  
  @typeparam T The type of the wrapped value.
  @param maybe The `Maybe` instance to check.
  @returns     `true` if `maybe` is `nothing`, `false` otherwise. In TypeScript,
               also narrows the type from `Maybe<T>` to `Nothing<T>`.
 */
export const isNothing = <T>(maybe: Maybe<T>): maybe is Nothing<T> =>
  maybe.variant === Variant.Nothing;

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
export const just = <T>(value: T | null | undefined): Maybe<T> => new Just<T>(value);

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
export const nothing = <T>(): Maybe<T> => new Nothing<T>();

/** A value which may (`Just<T>`) or may not (`Nothing`) be present. */
export type Maybe<T> = Just<T> | Nothing<T>;

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
export const of = <T>(value: T | undefined | null): Maybe<T> =>
  isVoid(value) ? nothing<T>() : just(value);

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
export const map = <T, U>(mapFn: (t: T) => U, maybe: Maybe<T>): Maybe<U> =>
  isJust(maybe) ? just(mapFn(unwrap(maybe))) : nothing<U>();

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
export const mapOr = <T, U>(orU: U, mapFn: (t: T) => U, maybe: Maybe<T>): U =>
  isJust(maybe) ? mapFn(unwrap(maybe)) : orU;

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
export const mapOrElse = <T, U>(
  orElseFn: (...args: any[]) => U,
  mapFn: (t: T) => U,
  maybe: Maybe<T>
): U => (isJust(maybe) ? mapFn(unwrap(maybe)) : orElseFn());

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
  import { and, just, nothing, Maybe } from 'true-myth/maybe';
  
  const justA = just('A');
  const justB = just('B');
  const nothing: Maybe<number> = nothing();
 
  console.log(and(justB, justA).toString());  // Just(B)
  console.log(and(justB, nothing).toString());  // Nothing
  console.log(and(nothing, justA).toString());  // Nothing
  console.log(and(nothing, nothing).toString());  // Nothing
  ```
  
  @typeparam T    The type of the initial wrapped value.
  @typeparam U    The type of the wrapped value of the returned `Maybe`.
  @param andMaybe The `Maybe` instance to return if `maybe` is `Just`
  @param maybe    The `Maybe` instance to check.
  @return         `Nothing` if the original `maybe` is `Nothing`, or `andMaybe`
                  if the original `maybe` is `Just`.
 */
export const and = <T, U>(andMaybe: Maybe<U>, maybe: Maybe<T>): Maybe<U> =>
  isJust(maybe) ? andMaybe : nothing(); // cannot coerce Nothing<T> to Nothing<U>

/**
  Apply a function to the wrapped value if `Just` and return a new `Just`
  containing the resulting value; or return `Nothing` if `Nothing`.
 
  This differs from `map` in that `thenFn` returns another `Maybe`. You can use
  `andThen` to combine two functions which *both* create a `Maybe` from an
  unwrapped type.
 
  You may find the `.then` method on an ES6 `Promise` helpful for comparison:
  if you have a `Promise`, you can pass its `then` method a callback which
  returns another `Promise`, and the result will not be a *nested* promise, but
  a single `Promise`. The difference is that `Promise#then` unwraps *all*
  layers to only ever return a single `Promise` value, whereas `Maybe.andThen`
  will not unwrap nested `Maybe`s.
  
  This is also commonly known as (and therefore aliased as) [`flatMap`] or
  [`chain`]. It is sometimes also known as `bind`, but *not* aliased as such
  because [`bind` already means something in JavaScript][bind].
  
  [`flatMap`]: #flatmap
  [`chain`]: #chain
  [bind]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
 
  #### Example
  
  (This is a somewhat contrived example, but it serves to show the way the
  function behaves.)
 
  ```ts
  import * as Maybe from 'true-myth/maybe';
  
  // string -> Maybe<number>
  const toMaybeLength = (s: string): Maybe.Maybe<number> => Maybe.of(s.length);

  // Maybe<string>
  const aMaybeString = Maybe.of('Hello, there!');

  // Maybe<number>
  const resultingLength = Maybe.andThen(toMaybeLength, aMaybeString);
  console.log(toString(resultingLength)); // 13
  ```
  
  Note that the result is not `(Just(13))`, but `13`!
  
  @typeparam T  The type of the wrapped value.
  @typeparam T  The type of the wrapped value in the resulting `Maybe`.
  @param thenFn The function to apply to the wrapped `T` if `maybe` is `Just`.
  @param maybe  The `Maybe` to evaluate and possibly apply a function to the
                contents of.
  @returns      The result of the `thenFn` (a new `Maybe`) if `maybe` is a
                `Just`, otherwise `Nothing` if `maybe` is a `Nothing`.
 */
export const andThen = <T, U>(thenFn: (t: T) => Maybe<U>, maybe: Maybe<T>): Maybe<U> =>
  isJust(maybe) ? thenFn(unwrap(maybe)) : nothing();

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
  import { or, just, nothing, Maybe } from 'true-utils/maybe';
  
  const justA = just("a");
  const justB = just("b");
  const aNothing: Maybe<string> = nothing();
  
  console.log(or(justB, justA).toString());  // Just(A)
  console.log(or(aNothing, justA).toString());  // Just(A)
  console.log(or(justB, aNothing).toString());  // Just(B)
  console.log(or(aNothing, aNothing).toString());  // Nothing
  ```
  
  @typeparam T        The type of the wrapped value.
  @param defaultMaybe The `Maybe` to use if `maybe` is a `Nothing`.
  @param maybe        The `Maybe` instance to evaluate.
  @returns            `maybe` if it is a `Just`, otherwise `defaultMaybe`.
 */
export const or = <T>(defaultMaybe: Maybe<T>, maybe: Maybe<T>): Maybe<T> =>
  isJust(maybe) ? maybe : defaultMaybe;

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
                `elseFn` if the `maybe` is `Nothing.
 */
export const orElse = <T>(elseFn: (...args: any[]) => Maybe<T>, maybe: Maybe<T>): Maybe<T> =>
  isJust(maybe) ? maybe : elseFn();

/**
  Get the value out of the `Maybe`.
 
  Returns the content of a `Just`, but **throws if the `Maybe` is `Nothing`**.
  Prefer to use [`unwrapOr`](#unwrapor) or [`unwrapOrElse`](#unwraporelse).
 
  @typeparam T The type of the wrapped value.
  @param maybe The value to unwrap
  @returns     The unwrapped value if the `Maybe` instance is `Just`.
  @throws      If the `maybe` is `Nothing`.
 */
export const unsafelyUnwrap = <T>(maybe: Maybe<T>): T => maybe.unsafelyUnwrap();

/** Alias for [`unsafelyUnwrap`](#unsafelyunwrap) */
export const unsafelyGet = unsafelyUnwrap;

/** Alias for [`unsafelyUnwrap`](#unsafelyunwrap) */
export const unsafeGet = unsafelyUnwrap;

// For internal use; but not exported because we want to emphasize that this is
// a bad idea via the name.
const unwrap = unsafelyUnwrap;

/**
  Safely get the value out of a `Maybe`.
 
  Returns the content of a `Just` or `defaultValue` if `Nothing`. This is the
  recommended way to get a value out of a `Maybe` most of the time.
  
  ```ts
  import { just, nothing, unwrapOr } from 'true-myth/maybe';
  
  const notAString = nothing<string>();
  const isAString = just('look ma! some characters!');
  
  console.log(unwrapOr('<empty>', notAString));  // "<empty>"
  console.log(unwrapOr('<empty>', isAString));  // "look ma! some characters!"
  ```
  
  @typeparam T        The type of the wrapped value.
  @param defaultValue The value to return if `maybe` is a `Nothing`.
  @param maybe        The `Maybe` instance to unwrap if it is a `Just`.
  @returns            The content of `maybe` if it is a `Just`, otherwise
                      `defaultValue`.
 */
export const unwrapOr = <T>(defaultValue: T, maybe: Maybe<T>): T =>
  isJust(maybe) ? unwrap(maybe) : defaultValue;

/** Alias for [`unwrapOr`](#unwrapor) */
export const getOr = unwrapOr;

/**
  Safely get the value out of a [`Maybe`](#maybe) by returning the wrapped
  value if it is `Just`, or by applying `orElseFn` if it is `Nothing`.

  This is useful when you need to *generate* a value (e.g. by using current
  values in the environment – whether preloaded or by local closure) instead of
  having a single default value available (as in [`unwrapOr`](#unwrapor)).

  ```ts
  import { just, nothing, unwrapOrElse } from 'true-myth/maybe';

  // You can imagine that someOtherValue might be dynamic.
  const someOtherValue = 99;
  const handleNothing = () => someOtherValue;
  
  const aJust = just(42);
  console.log(unwrapOrElse(handleNothing, aJust));  // 42

  const aNothing = nothing<number>();
  console.log(unwrapOrElse(handleNothing, aNothing)); // 99
  ```
  
  @typeparam T  The wrapped value.
  @param orElseFn A function used to generate a valid value if `maybe` is a
                  `Nothing`.
  @param maybe    The `Maybe` instance to unwrap if it is a `Just`
  @returns        Either the content of `maybe` or the value returned from
                  `orElseFn`.
 */
export const unwrapOrElse = <T>(orElseFn: (...args: any[]) => T, maybe: Maybe<T>): T =>
  isJust(maybe) ? unwrap(maybe) : orElseFn();

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
export const toOkOrErr = <T, E>(error: E, maybe: Maybe<T>): Result.Result<T, E> =>
  isJust(maybe) ? Result.ok(unwrap(maybe)) : Result.err(error);

/**
  Transform the [`Maybe`](#maybe) into a
  [`Result`](../modules/_result_.html#result), using the wrapped value as the
  `Ok` value if `Just`; otherwise using `elseFn` to generate `Err`.
  
  @typeparam T  The wrapped value.
  @typeparam E  The error type to in the `Result`.
  @param elseFn The function which generates an error of type `E`.
  @param maybe  The `Maybe` instance to convert.
  @returns     A `Result` containing the value wrapped in `maybe` in an `Ok`,
               or `the value generated by `elseFn` in an `Err`.
 */
export const toOkOrElseErr = <T, E>(
  elseFn: (...args: any[]) => E,
  maybe: Maybe<T>
): Result.Result<T, E> => (isJust(maybe) ? Result.ok(unwrap(maybe)) : Result.err(elseFn()));

/**
  Construct a `Maybe<T>` from a `Result<T, E>`.
  
  If the `Result` is an `Ok`, wrap its value in `Just`. If the `Result` is an
  `Err`, throw away the wrapped `E` and transform to a `Nothing`.
  
  @typeparam T  The type of the value wrapped in a `Result.Ok` and in the `Just`
                of the resulting `Maybe`.
  @typeparam E  The type of the value wrapped in a `Result.Err`; thrown away in
                the resulting `Maybe`.
  @param result The `Result` to construct a `Maybe` from.
  @returns      `Just` if `result` was `Ok` or `Nothing` if it was `Err`.
 */
export const fromResult = <T, E>(result: Result.Result<T, E>): Maybe<T> =>
  Result.isOk(result) ? just(Result.unsafelyUnwrap(result)) : nothing();

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
export const toString = <T>(maybe: Maybe<T>): string => {
  const body = isJust(maybe) ? `(${unwrap(maybe).toString()})` : '';
  return `${maybe.variant}${body}`;
};

export default Maybe;
