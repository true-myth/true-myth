/**
  {@include doc/maybe.md}

  @module
 */

import { AnyFunction, curry1, isVoid, safeToString } from './-private/utils.js';

/**
  Discriminant for the {@linkcode Just} and {@linkcode Nothing} type instances.

  You can use the discriminant via the `variant` property of {@linkcode Maybe}
  instances if you need to match explicitly on it.
 */
export const Variant = {
  Just: 'Just',
  Nothing: 'Nothing',
} as const;

export type Variant = keyof typeof Variant;

export interface JustJSON<T> {
  variant: 'Just';
  value: T;
}

export interface NothingJSON {
  variant: 'Nothing';
}

export type MaybeJSON<T> = JustJSON<T> | NothingJSON;

type Repr<T> = [tag: 'Just', value: T] | [tag: 'Nothing'];

declare const IsMaybe: unique symbol;
type AnyMaybe = Maybe<{}>;

type SomeMaybe<T> = { [IsMaybe]: T };
type ValueFor<R extends AnyMaybe> = R extends SomeMaybe<infer T> ? T : never;

/**
  A single instance of the `Nothing` object, to minimize memory usage. No matter
  how many `Maybe`s are floating around, there will always be exactly and only
  one `Nothing`.

  @private
 */
let NOTHING: Nothing<unknown>;

// Defines the *implementation*, but not the *types*. See the exports below.
class MaybeImpl<T> {
  // SAFETY: this is definitely assigned in the constructor for every *actual*
  // instance, but TS cannot see that: it is only set for `Nothing` instances
  // when `NOTHING` does not already exist.
  private repr!: Repr<T>;

  declare readonly [IsMaybe]: T;

  constructor(value?: T | null | undefined) {
    if (isVoid(value)) {
      // SAFETY: there is only a single `Nothing` in the system, because the
      // only difference between `Nothing<string>` and `Nothing<number>` is at
      // the type-checking level.
      if (!NOTHING) {
        this.repr = [Variant.Nothing];
        NOTHING = this as Nothing<unknown>;
      }

      return NOTHING as MaybeImpl<T>;
    } else {
      this.repr = [Variant.Just, value];
    }
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

    @template T The type of the item contained in the `Maybe`.
    @param value The value to wrap in a `Maybe`. If it is `undefined` or `null`,
                the result will be `Nothing`; otherwise it will be the type of
                the value passed.
  */
  // When dealing with function types, only allow functions which return a
  // non-null, non-undefined value, so that we do not produce nonsensical types
  // later when using `.ap()` or similar.
  static of<F extends (...args: any) => {}>(value: F): Maybe<F>;
  static of<T extends {}, F extends (...args: any) => T | null | undefined>(value: F): never;
  static of<F extends (...args: any) => null | undefined>(value: F): never;
  // For all other types, allow `null | undefined`, since in those cases we will
  // produce `Nothing`.
  static of<T>(value: T | null | undefined): Maybe<T>;
  // Then the implementation signature is simply the same as the final overload,
  // because we do not *and cannot* prevent the undesired function types from
  // appearing here at runtime: doing so would require having a value on which
  // to (maybe) apply the function!
  static of<T>(value: T | null | undefined): Maybe<T> {
    return new Maybe(value);
  }

  /**
    Create an instance of `Maybe.Just`.

    @template T The type of the item contained in the `Maybe`.
    @param value The value to wrap in a `Maybe.Just`.
    @returns     An instance of `Maybe.Just<T>`.
    @throws      If you pass `null` or `undefined`.
   */
  // The rules for accepting function types are identical with those for the
  // `Maybe.of` constructor.
  static just<F extends (...args: any) => {}>(value: F): Maybe<F>;
  static just<T extends {}, F extends (...args: any) => T | null | undefined>(value: F): never;
  static just<F extends (...args: any) => null | undefined>(value: F): never;
  // The public signature otherwise only allows non-null values.
  static just<T extends {}>(value: T): Maybe<T>;
  // The runtime signature *does* allow null and undefined values so that the
  // body can correctly throw at runtime in the case where a caller passes data
  // whose type lies about the contained value.
  static just<T>(value: T | null | undefined): Maybe<T> {
    if (isVoid(value)) {
      throw new Error(`attempted to call "just" with ${value}`);
    }

    return new Maybe(value);
  }

  /**
    Create an instance of `Maybe.Nothing`.

    If you want to create an instance with a specific type, e.g. for use in a
    function which expects a `Maybe<T>` where the `<T>` is known but you have no
    value to give it, you can use a type parameter:

    ```ts
    const notString = Maybe.nothing<string>();
    ```

    @template T The type of the item contained in the `Maybe`.
    @returns     An instance of `Maybe.Nothing<T>`.
   */
  static nothing<T>(_?: null): Nothing<T> {
    return new MaybeImpl() as Nothing<T>;
  }

  /** Distinguish between the `Just` and `Nothing` {@link Variant variants}. */
  get variant(): Variant {
    return this.repr[0];
  }

  /**
    The wrapped value.

    @warning throws if you access this from a {@linkcode Just}
   */
  get value(): T {
    if (this.repr[0] === Variant.Nothing) {
      throw new Error('Cannot get the value of `Nothing`');
    }

    return this.repr[1];
  }

  /** Is the {@linkcode Maybe} a {@linkcode Just}? */
  get isJust(): boolean {
    return this.repr[0] === Variant.Just;
  }

  /** Is the {@linkcode Maybe} a {@linkcode Nothing}? */
  get isNothing(): boolean {
    return this.repr[0] === Variant.Nothing;
  }

  /** Method variant for {@linkcode map} */
  map<U extends {}>(mapFn: (t: T) => U): Maybe<U> {
    return (this.repr[0] === 'Just' ? Maybe.just(mapFn(this.repr[1])) : this) as Maybe<U>;
  }

  /** Method variant for {@link mapOr|`mapOr`} */
  mapOr<U>(orU: U, mapFn: (t: T) => U): U {
    return this.repr[0] === 'Just' ? mapFn(this.repr[1]) : orU;
  }

  /** Method variant for {@linkcode mapOrElse} */
  mapOrElse<U>(orElseFn: () => U, mapFn: (t: T) => U): U {
    return this.repr[0] === 'Just' ? mapFn(this.repr[1]) : orElseFn();
  }

  /** Method variant for {@linkcode match} */
  match<U>(matcher: Matcher<T, U>): U {
    return this.repr[0] === 'Just' ? matcher.Just(this.repr[1]) : matcher.Nothing();
  }

  /** Method variant for {@linkcode or} */
  or(mOr: Maybe<T>): Maybe<T> {
    return this.repr[0] === 'Just' ? (this as Maybe<T>) : mOr;
  }

  /** Method variant for {@linkcode orElse} */
  orElse(orElseFn: () => Maybe<T>): Maybe<T>;
  orElse<R extends AnyMaybe>(orElseFn: () => R): Maybe<ValueFor<R>>;
  orElse(orElseFn: () => Maybe<T>): Maybe<T> {
    return (this.repr[0] === 'Just' ? this : orElseFn()) as Maybe<T>;
  }

  /** Method variant for {@linkcode and} */
  and<U>(mAnd: Maybe<U>): Maybe<U> {
    return (this.repr[0] === 'Just' ? mAnd : this) as Maybe<U>;
  }

  /** Method variant for {@linkcode andThen} */
  andThen<U>(andThenFn: (t: T) => Maybe<U>): Maybe<U>;
  andThen<R extends AnyMaybe>(andThenFn: (t: T) => R): Maybe<ValueFor<R>>;
  andThen<U>(andThenFn: (t: T) => Maybe<U>): Maybe<U> {
    return (this.repr[0] === 'Just' ? andThenFn(this.repr[1]) : this) as Maybe<U>;
  }

  /** Method variant for {@linkcode unwrapOr} */
  unwrapOr<U>(defaultValue: U): T | U {
    return this.repr[0] === 'Just' ? this.repr[1] : defaultValue;
  }

  /** Method variant for {@linkcode unwrapOrElse} */
  unwrapOrElse<U>(elseFn: () => U): T | U {
    return this.repr[0] === 'Just' ? this.repr[1] : elseFn();
  }

  /** Method variant for {@linkcode toString} */
  toString(): string {
    return this.repr[0] === 'Just' ? `Just(${safeToString(this.repr[1])})` : 'Nothing';
  }

  /** Method variant for {@linkcode toJSON} */
  toJSON(): MaybeJSON<unknown> {
    const variant = this.repr[0];

    if (variant === 'Just') {
      // Handle nested Maybes
      let value = isInstance(this.repr[1]) ? this.repr[1].toJSON() : this.repr[1];
      return { variant, value };
    } else {
      return { variant };
    }
  }

  /** Method variant for {@linkcode equals} */
  equals(comparison: Maybe<T>): boolean {
    return (
      this.repr[0] === (comparison as MaybeImpl<T>).repr[0] &&
      this.repr[1] === (comparison as MaybeImpl<T>).repr[1]
    );
  }

  /** Method variant for {@linkcode ap} */
  ap<A, B extends {}>(this: Maybe<(val: A) => B>, val: Maybe<A>): Maybe<B> {
    return val.andThen((val) => this.map((fn) => fn(val)));
  }

  /**
    Method variant for {@linkcode get}

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
  get<K extends keyof T>(key: K): Maybe<NonNullable<T[K]>> {
    return this.andThen(property(key));
  }
}

/**
  A `Just` instance is the *present* variant instance of the
  {@linkcode Maybe} type, representing the presence of a
  value which may be absent. For a full discussion, see the module docs.

  @template T The type wrapped in this `Just` variant of `Maybe`.
 */
export interface Just<T> extends MaybeImpl<T> {
  /** `Just` is always {@linkcode Variant.Just}. */
  readonly variant: 'Just';
  /** The wrapped value. */
  value: T;
  isJust: true;
  isNothing: false;
}

/**
  A `Nothing` instance is the *absent* variant instance of the {@linkcode Maybe}
  type, representing the presence of a value which may be absent. For a full
  discussion, see the module docs.

  @template T The type which would be wrapped in a {@linkcode Just} variant of
    the {@linkcode Maybe}.
 */
export interface Nothing<T> extends Omit<MaybeImpl<T>, 'value'> {
  /** `Nothing` is always {@linkcode Variant.Nothing}. */
  readonly variant: 'Nothing';

  isJust: false;
  isNothing: true;
}

/**
  Create a {@linkcode Maybe} instance which is a {@linkcode Just}.

  `null` and `undefined` are allowed by the type signature so that the
  function may `throw` on those rather than constructing a type like
  `Maybe<undefined>`.

  @template T The type of the item contained in the `Maybe`.
  @param value The value to wrap in a `Maybe.Just`.
  @returns     An instance of `Maybe.Just<T>`.
  @throws      If you pass `null` or `undefined`.
 */
export const just = MaybeImpl.just;

/**
  Is the {@linkcode Maybe} a {@linkcode Just}?

  @template T The type of the item contained in the `Maybe`.
  @param maybe The `Maybe` to check.
  @returns A type guarded `Just`.
 */
export function isJust<T>(maybe: Maybe<T>): maybe is Just<T> {
  return maybe.isJust;
}

/**
  Is the {@linkcode Maybe} a {@linkcode Nothing}?

  @template T The type of the item contained in the `Maybe`.
  @param maybe The `Maybe` to check.
  @returns A type guarded `Nothing`.
*/
export function isNothing<T>(maybe: Maybe<T>): maybe is Nothing<T> {
  return maybe.isNothing;
}

/**
  Create a {@linkcode Maybe} instance which is a {@linkcode Nothing}.

  If you want to create an instance with a specific type, e.g. for use in a
  function which expects a `Maybe<T>` where the `<T>` is known but you have no
  value to give it, you can use a type parameter:

  ```ts
  const notString = Maybe.nothing<string>();
  ```

  @template T The type of the item contained in the `Maybe`.
  @returns     An instance of `Maybe.Nothing<T>`.
 */
export const nothing = MaybeImpl.nothing;

/**
  Create a {@linkcode Maybe} from any value.

  To specify that the result should be interpreted as a specific type, you may
  invoke `Maybe.of` with an explicit type parameter:

  ```ts
  import * as Maybe from 'true-myth/maybe';
  const foo = Maybe.of<string>(null);
  ```

  This is usually only important in two cases:

  1.  If you are intentionally constructing a `Nothing` from a known `null` or
      undefined value *which is untyped*.
  2.  If you are specifying that the type is more general than the value passed
      (since TypeScript can define types as literals).

  @template T The type of the item contained in the `Maybe`.
  @param value The value to wrap in a `Maybe`. If it is `undefined` or `null`,
               the result will be `Nothing`; otherwise it will be the type of
               the value passed.
 */
export const of = MaybeImpl.of;

/**
  Map over a {@linkcode Maybe} instance: apply the function to the wrapped value
  if the instance is {@linkcode Just}, and return {@linkcode Nothing} if the
  instance is `Nothing`.

  `map` works a lot like `Array.prototype.map`: `Maybe` and `Array` are both
  *containers* for other things. If you have no items in an array of numbers
  named `foo` and call `foo.map(x => x + 1)`, you'll still just have an array
  with nothing in it. But if you have any items in the array (`[2, 3]`), and you
  call `foo.map(x => x + 1)` on it, you'll get a new array with each of those
  items inside the array "container" transformed (`[3, 4]`).

  That's exactly what's happening with `map`. If the container is *empty* – the
  `Nothing` variant – you just get back an empty container. If the container has
  something in it – the `Just` variant – you get back a container with the item
  inside transformed.

  (So... why not just use an array? The biggest reason is that an array can be
  any length. With a `Maybe`, we're capturing the idea of "something or nothing"
  rather than "0 to n" items. And this lets us implement a whole set of *other*
  interfaces, like those in this module.)

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

  @template T The type of the wrapped value.
  @template U The type of the wrapped value of the returned `Maybe`.
  @param mapFn The function to apply the value to if `Maybe` is `Just`.
  @returns     A function accepting a `Maybe<T>`, which will produce `Maybe<U>`
               after applying `mapFn`.
 */
export function map<T, U extends {}>(mapFn: (t: T) => U): (maybe: Maybe<T>) => Maybe<U>;
/**
  Map over a {@linkcode Maybe} instance: apply the function to the wrapped value
  if the instance is {@linkcode Just}, and return {@linkcode Nothing} if the
  instance is `Nothing`.

  `map` works a lot like `Array.prototype.map`: `Maybe` and `Array` are both
  *containers* for other things. If you have no items in an array of numbers
  named `foo` and call `foo.map(x => x + 1)`, you'll still just have an array
  with nothing in it. But if you have any items in the array (`[2, 3]`), and you
  call `foo.map(x => x + 1)` on it, you'll get a new array with each of those
  items inside the array "container" transformed (`[3, 4]`).

  That's exactly what's happening with `map`. If the container is *empty* – the
  `Nothing` variant – you just get back an empty container. If the container has
  something in it – the `Just` variant – you get back a container with the item
  inside transformed.

  (So... why not just use an array? The biggest reason is that an array can be
  any length. With a `Maybe`, we're capturing the idea of "something or nothing"
  rather than "0 to n" items. And this lets us implement a whole set of *other*
  interfaces, like those in this module.)

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

  @template T The type of the wrapped value.
  @template U The type of the wrapped value of the returned `Maybe`.
  @param mapFn The function to apply the value to if `Maybe` is `Just`.
  @param maybe The `Maybe` instance to map over.
  @returns     A new `Maybe` with the result of applying `mapFn` to the value in
               a `Just`, or `Nothing` if `maybe` is `Nothing`.
 */
export function map<T, U extends {}>(mapFn: (t: T) => U, maybe: Maybe<T>): Maybe<U>;
export function map<T, U extends {}>(
  mapFn: (t: T) => U,
  maybe?: Maybe<T>
): Maybe<U> | ((maybe: Maybe<T>) => Maybe<U>) {
  const op = (m: Maybe<T>) => m.map(mapFn);
  return curry1(op, maybe);
}

/**
  Map over a {@linkcode Maybe} instance and get out the value if `maybe` is a
  {@linkcode Just}, or return a default value if `maybe` is a
  {@linkcode Nothing}.

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

  @template T The type of the wrapped value.
  @template U The type of the wrapped value of the returned `Maybe`.
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
    return m.mapOr(orU, fn);
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
  Map over a {@linkcode Maybe} instance and get out the value if `maybe` is a
  {@linkcode Just}, or use a function to construct a default value if `maybe` is
  {@linkcode Nothing}.

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

  @template T    The type of the wrapped value.
  @template U    The type of the wrapped value of the returned `Maybe`.
  @param orElseFn The function to apply if `maybe` is `Nothing`.
  @param mapFn    The function to apply to the wrapped value if `maybe` is
  `Just`
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
    return m.mapOrElse(orElseFn, fn);
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
  {@linkcode Maybe} type. If `maybe` is {@linkcode just}, then the result is the
  `andMaybe`. If `maybe` is {@linkcode Nothing}, the result is `Nothing`.

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

  @template T    The type of the initial wrapped value.
  @template U    The type of the wrapped value of the returned `Maybe`.
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
  const op = (m: Maybe<T>) => m.and(andMaybe);
  return curry1(op, maybe);
}

/**
  Apply a function to the wrapped value if {@linkcode Just} and return a new
  `Just` containing the resulting value; or return {@linkcode Nothing} if
  `Nothing`.

  This differs from {@linkcode map} in that `thenFn` returns another `Maybe`.
  You can use `andThen` to combine two functions which *both* create a `Maybe`
  from an unwrapped type.

  You may find the `.then` method on an ES6 `Promise` helpful for comparison: if
  you have a `Promise`, you can pass its `then` method a callback which returns
  another `Promise`, and the result will not be a *nested* promise, but a single
  `Promise`. The difference is that `Promise#then` unwraps *all* layers to only
  ever return a single `Promise` value, whereas `Maybe.andThen` will not unwrap
  nested `Maybe`s.

  > [!NOTE] This is sometimes also known as `bind`, but *not* aliased as such
  > because [`bind` already means something in JavaScript][bind].

  [bind]:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind

  #### Example

  (This is a somewhat contrived example, but it serves to show the way the
  function behaves.)

  ```ts
  import Maybe, { andThen, toString } from 'true-myth/maybe';

  // string -> Maybe<number>
  const toMaybeLength = (s: string) => Maybe.of(s.length);

  // Maybe<string>
  const aMaybeString = Maybe.of('Hello, there!');

  // Maybe<number>
  const resultingLength = andThen(toMaybeLength, aMaybeString);
  console.log(toString(resultingLength)); // 13
  ```

  Note that the result is not `Just(Just(13))`, but `Just(13)`!

  @template T  The type of the wrapped value.
  @template U  The type of the wrapped value in the resulting `Maybe`.
  @param thenFn The function to apply to the wrapped `T` if `maybe` is `Just`.
  @param maybe  The `Maybe` to evaluate and possibly apply a function to the
                contents of.
  @returns      The result of the `thenFn` (a new `Maybe`) if `maybe` is a
                `Just`, otherwise `Nothing` if `maybe` is a `Nothing`.
 */
export function andThen<T, U>(thenFn: (t: T) => Maybe<U>, maybe: Maybe<T>): Maybe<U>;
export function andThen<T, R extends AnyMaybe>(
  thenFn: (t: T) => R,
  maybe: Maybe<T>
): Maybe<ValueFor<R>>;
export function andThen<T, U>(thenFn: (t: T) => Maybe<U>): (maybe: Maybe<T>) => Maybe<U>;
export function andThen<T, R extends AnyMaybe>(
  thenFn: (t: T) => R
): (maybe: Maybe<T>) => Maybe<ValueFor<R>>;
export function andThen<T, U>(
  thenFn: (t: T) => Maybe<U>,
  maybe?: Maybe<T>
): Maybe<U> | ((maybe: Maybe<T>) => Maybe<U>) {
  const op = (m: Maybe<T>) => m.andThen(thenFn);
  return maybe !== undefined ? op(maybe) : op;
}

/**
  Provide a fallback for a given {@linkcode Maybe}. Behaves like a logical `or`:
  if the `maybe` value is a {@linkcode Just}, returns that `maybe`; otherwise,
  returns the `defaultMaybe` value.

  This is useful when you want to make sure that something which takes a `Maybe`
  always ends up getting a `Just` variant, by supplying a default value for the
  case that you currently have a nothing.

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

  @template T        The type of the wrapped value.
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
  const op = (m: Maybe<T>) => m.or(defaultMaybe);
  return maybe !== undefined ? op(maybe) : op;
}

/**
  Like {@linkcode or}, but using a function to construct the alternative
  {@linkcode Maybe}.

  Sometimes you need to perform an operation using other data in the environment
  to construct the fallback value. In these situations, you can pass a function
  (which may be a closure) as the `elseFn` to generate the fallback `Maybe<T>`.

  Useful for transforming empty scenarios based on values in context.

  @template T  The type of the wrapped value.
  @param elseFn The function to apply if `maybe` is `Nothing`
  @param maybe  The `maybe` to use if it is `Just`.
  @returns      The `maybe` if it is `Just`, or the `Maybe` returned by `elseFn`
                if the `maybe` is `Nothing`.
 */
export function orElse<T, R extends AnyMaybe>(
  elseFn: () => R,
  maybe: Maybe<T>
): Maybe<ValueFor<R>>;
export function orElse<T, R extends AnyMaybe>(
  elseFn: () => R
): (maybe: Maybe<T>) => Maybe<ValueFor<R>>;
export function orElse<T, R extends AnyMaybe>(
  elseFn: () => R,
  maybe?: Maybe<T>
): Maybe<ValueFor<R>> | ((maybe: Maybe<T>) => Maybe<ValueFor<R>>) {
  const op = (m: Maybe<T>) => m.orElse(elseFn);
  return curry1(op, maybe);
}

/**
  Safely get the value out of a {@linkcode Maybe}.

  Returns the content of a {@linkcode Just} or `defaultValue` if
  {@linkcode Nothing}. This is the recommended way to get a value out of a
  `Maybe` most of the time.

  ```ts
  import Maybe from 'true-myth/maybe';

  const notAString = Maybe.nothing<string>();
  const isAString = Maybe.just('look ma! some characters!');

  console.log(Maybe.unwrapOr('<empty>', notAString));  // "<empty>"
  console.log(Maybe.unwrapOr('<empty>', isAString));  // "look ma! some characters!"
  ```

  @template T        The type of the wrapped value.
  @param defaultValue The value to return if `maybe` is a `Nothing`.
  @param maybe        The `Maybe` instance to unwrap if it is a `Just`.
  @returns            The content of `maybe` if it is a `Just`, otherwise
                      `defaultValue`.
 */
export function unwrapOr<T, U>(defaultValue: U, maybe: Maybe<T>): T | U;
export function unwrapOr<T, U>(defaultValue: U): (maybe: Maybe<T>) => T | U;
export function unwrapOr<T, U>(defaultValue: U, maybe?: Maybe<T>) {
  const op = (m: Maybe<T>) => m.unwrapOr(defaultValue);
  return curry1(op, maybe);
}

/**
  Safely get the value out of a {@linkcode Maybe} by returning the wrapped value
  if it is {@linkcode Just}, or by applying `orElseFn` if it is
  {@linkcode Nothing}.

  This is useful when you need to *generate* a value (e.g. by using current
  values in the environment – whether preloaded or by local closure) instead of
  having a single default value available (as in {@linkcode unwrapOr}).

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

  @template T  The wrapped value.
  @param orElseFn A function used to generate a valid value if `maybe` is a
                  `Nothing`.
  @param maybe    The `Maybe` instance to unwrap if it is a `Just`
  @returns        Either the content of `maybe` or the value returned from
                  `orElseFn`.
 */
export function unwrapOrElse<T, U>(orElseFn: () => U, maybe: Maybe<T>): T | U;
export function unwrapOrElse<T, U>(orElseFn: () => U): (maybe: Maybe<T>) => T | U;
export function unwrapOrElse<T, U>(
  orElseFn: () => U,
  maybe?: Maybe<T>
): (T | U) | ((maybe: Maybe<T>) => T | U) {
  const op = (m: Maybe<T>) => m.unwrapOrElse(orElseFn);
  return curry1(op, maybe);
}

/**
  Create a `String` representation of a {@linkcode Maybe} instance.

  A {@linkcode Just} instance will be `Just(<representation of the value>)`,
  where the representation of the value is simply the value's own `toString`
  representation. For example:

  | call                                   | output                  |
  |----------------------------------------|-------------------------|
  | `toString(Maybe.of(42))`               | `Just(42)`              |
  | `toString(Maybe.of([1, 2, 3]))`        | `Just(1,2,3)`           |
  | `toString(Maybe.of({ an: 'object' }))` | `Just([object Object])` |
  | `toString(Maybe.nothing())`            | `Nothing`               |

  @template T The type of the wrapped value; its own `.toString` will be used
               to print the interior contents of the `Just` variant.
  @param maybe The value to convert to a string.
  @returns     The string representation of the `Maybe`.
 */
export function toString<T>(maybe: Maybe<T>): string {
  return maybe.toString();
}

/**
 * Create an `Object` representation of a {@linkcode Maybe} instance.
 *
 * Useful for serialization. `JSON.stringify()` uses it.
 *
 * @param maybe The value to convert to JSON
 * @returns     The JSON representation of the `Maybe`
 */
export function toJSON<T>(maybe: Maybe<T>): MaybeJSON<unknown> {
  return maybe.toJSON();
}

/**
  A lightweight object defining how to handle each variant of a {@linkcode Maybe}.
 */
export type Matcher<T, A> = {
  Just: (value: T) => A;
  Nothing: () => A;
};

/**
  Performs the same basic functionality as {@linkcode unwrapOrElse}, but instead
  of simply unwrapping the value if it is {@linkcode Just} and applying a value
  to generate the same default type if it is {@linkcode Nothing}, lets you
  supply functions which may transform the wrapped type if it is `Just` or get a
  default value for `Nothing`.

  This is kind of like a poor man's version of pattern matching, which
  JavaScript currently lacks.

  Instead of code like this:

  ```ts
  import Maybe from 'true-myth/maybe';

  const logValue = (mightBeANumber: Maybe<number>) => {
    const valueToLog = Maybe.mightBeANumber.isJust
      ? mightBeANumber.value.toString()
      : 'Nothing to log.';

    console.log(valueToLog);
  };
  ```

  ...we can write code like this:

  ```ts
  import { match } from 'true-myth/maybe';

  const logValue = (mightBeANumber: Maybe<number>) => {
    const value = match(
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
  const op = (curriedMaybe: Maybe<T>) => curriedMaybe.match(matcher);
  return curry1(op, maybe);
}

/**
  Allows quick triple-equal equality check between the values inside two
  {@linkcode Maybe maybe} instances without having to unwrap them first.

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
  const op = (maybeA: Maybe<T>) => maybeA.equals(mb);
  return curry1(op, ma);
}

/**
  Allows you to *apply* (thus `ap`) a value to a function without having to take
  either out of the context of their {@linkcode Maybe}s. This does mean that the
  transforming function is itself within a `Maybe`, which can be hard to grok at
  first but lets you do some very elegant things. For example, `ap` allows you
  to this:

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

  Without `ap`, you'd need to do something like a nested `match`:

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
  import { is as immutableIs, Set } from 'immutable';

  const is = (first: unknown) =>  (second: unknown) =>
    immutableIs(first, second);

  const x = Maybe.of(Set.of(1, 2, 3));
  const y = Maybe.of(Set.of(2, 3, 4));

  Maybe.of(is).ap(x).ap(y); // Just(false)
  ```

  Without `ap`, we're back to that gnarly nested `match`:

  ```ts
  import Maybe, { just, nothing } from 'true-myth/maybe';
  import { is, Set } from 'immutable';

  const x = Maybe.of(Set.of(1, 2, 3));
  const y = Maybe.of(Set.of(2, 3, 4));

  x.match({
    Just: iX => y.match({
      Just: iY => Maybe.just(is(iX, iY)),
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

      const maybeAdd = just(add3); // Just((a: number) => (b: number) => (c: number) => a + b + c)
      const maybeAdd1 = maybeAdd.ap(just(1)); // Just((b: number) => (c: number) => 1 + b + c)
      const maybeAdd1And2 = maybeAdd1.ap(just(2)) // Just((c: number) => 1 + 2 + c)
      const final = maybeAdd1.ap(just(3)); // Just(4)
      ```

      So for `toString`, which just takes a single argument, you would only need
      to call `ap` once.

      ```ts
      const toStr = (v: { toString(): string }) => v.toString();
      just(toStr).ap(12); // Just("12")
      ```

  One other scenario which doesn't come up *quite* as often but is conceivable
  is where you have something that may or may not actually construct a function
  for handling a specific `Maybe` scenario. In that case, you can wrap the
  possibly-present in `ap` and then wrap the values to apply to the function to
  in `Maybe` themselves.

  __Aside:__ `ap` is not named `apply` because of the overlap with JavaScript's
  existing [`apply`] function – and although strictly speaking, there isn't any
  direct overlap (`Maybe.apply` and `Function.prototype.apply` don't intersect
  at all) it's useful to have a different name to avoid implying that they're
  the same.

  [`apply`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply

  @param maybeFn maybe a function from T to U
  @param maybe maybe a T to apply to `fn`
 */
export function ap<T, U extends {}>(maybeFn: Maybe<(t: T) => U>, maybe: Maybe<T>): Maybe<T | U>;
export function ap<T, U extends {}>(maybeFn: Maybe<(t: T) => U>): (maybe: Maybe<T>) => Maybe<T | U>;
export function ap<T, U extends {}>(
  maybeFn: Maybe<(t: T) => U>,
  maybe?: Maybe<T>
): Maybe<T | U> | ((val: Maybe<T>) => Maybe<T | U>) {
  const op = (m: Maybe<T>) => maybeFn.ap(m);
  return curry1(op, maybe);
}

/**
  Determine whether an item is an instance of {@linkcode Maybe}.

  @param item The item to check.
 */
export function isInstance<T>(item: unknown): item is Maybe<T> {
  return item instanceof Maybe;
}

export type Predicate<T> = (element: T, index: number, array: AnyArray<T>) => boolean;

export type NarrowingPredicate<T, U extends T> = (
  element: T,
  index: number,
  array: AnyArray<T>
) => element is U;

/** An array or a readonly array. */
export type AnyArray<T> = Array<T> | ReadonlyArray<T>;

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
      if (found.isJust) {
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
export function find<T, U extends T>(
  predicate: NarrowingPredicate<T, U>,
  array: AnyArray<T>
): Maybe<U>;
export function find<T, U extends T>(
  predicate: NarrowingPredicate<T, U>
): (array: AnyArray<T>) => Maybe<U>;
export function find<T>(predicate: Predicate<T>, array: AnyArray<T>): Maybe<T>;
export function find<T>(predicate: Predicate<T>): (array: AnyArray<T>) => Maybe<T>;
export function find<T, U extends T>(
  predicate: NarrowingPredicate<T, U> | Predicate<T>,
  array?: AnyArray<T>
): Maybe<T> | ((array: AnyArray<T>) => Maybe<T>) {
  const op = (a: AnyArray<T>) => Maybe.of(a.find(predicate));
  return curry1(op, array);
}

/**
  Safely get the first item from a list, returning {@linkcode Just} the first
  item if the array has at least one item in it, or {@linkcode Nothing} if it is
  empty.

  ## Examples

  ```ts
  let empty = [];
  Maybe.head(empty); // => Nothing

  let full = [1, 2, 3];
  Maybe.head(full); // => Just(1)
  ```

  @param array The array to get the first item from.
 */
export function first<T>(array: AnyArray<T | null | undefined>): Maybe<T> {
  return Maybe.of(array[0]);
}

/**
  Safely get the last item from a list, returning {@linkcode Just} the last item
  if the array has at least one item in it, or {@linkcode Nothing} if it is
  empty.

  ## Examples

  ```ts
  let empty = [];
  Maybe.last(empty); // => Nothing

  let full = [1, 2, 3];
  Maybe.last(full); // => Just(3)
  ```

  @param array The array to get the first item from.
 */
export function last<T>(array: AnyArray<T | null | undefined>): Maybe<T> {
  return Maybe.of(array[array.length - 1]);
}

/**
  Given an array or tuple of {@linkcode Maybe}s, return a `Maybe` of the array
  or tuple values.

  -   Given an array of type `Array<Maybe<A> | Maybe<B>>`, the resulting type is
      `Maybe<Array<A | B>>`.
  -   Given a tuple of type `[Maybe<A>, Maybe<B>]`, the resulting type is
      `Maybe<[A, B]>`.

  If any of the items in the array or tuple are {@linkcode Nothing}, the whole
  result is `Nothing`. If all items in the array or tuple are {@linkcode Just},
  the whole result is `Just`.

  ## Examples

  Given an array with a mix of `Maybe` types in it, both `allJust` and `mixed`
  here will have the type `Maybe<Array<string | number>>`, but will be `Just`
  and `Nothing` respectively.

  ```ts
  import Maybe, { transposeArray } from 'true-myth/maybe';

  let valid = [Maybe.just(2), Maybe.just('three')];
  let allJust = transposeArray(valid); // => Just([2, 'three']);

  let invalid = [Maybe.just(2), Maybe.nothing<string>()];
  let mixed = transposeArray(invalid); // => Nothing
  ```

  When working with a tuple type, the structure of the tuple is preserved. Here,
  for example, `result` has the type `Maybe<[string, number]>` and will be
  `Nothing`:

  ```ts
  import Maybe, { transposeArray } from 'true-myth/maybe';

  type Tuple = [Maybe<string>, Maybe<number>];

  let invalid: Tuple = [Maybe.just('wat'), Maybe.nothing()];
  let result = transposeArray(invalid);  // => Nothing
  ```

  If all of the items in the tuple are `Just`, the result is `Just` wrapping the
  tuple of the values of the items. Here, for example, `result` again has the
  type `Maybe<[string, number]>` and will be `Just(['hey', 12]`:

  ```ts
  import Maybe, { transposeArray } from 'true-myth/maybe';

  type Tuple = [Maybe<string>, Maybe<number>];

  let valid: Tuple = [Maybe.just('hey'), Maybe.just(12)];
  let result = transposeArray(valid);  // => Just(['hey', 12])
  ```

  @param maybes The `Maybe`s to resolve to a single `Maybe`.
 */
export function transposeArray<T extends ReadonlyArray<Maybe<unknown>>>(
  maybes: T
): TransposedArray<T> {
  // The slightly odd-seeming use of `[...ms, m]` here instead of `concat` is
  // necessary to preserve the structure of the value passed in. The goal is for
  // `[Maybe<string>, [Maybe<number>, Maybe<boolean>]]` not to be flattened into
  // `Maybe<[string, number, boolean]>` (as `concat` would do) but instead to
  // produce `Maybe<[string, [number, boolean]]>`.
  return maybes.reduce(
    (acc: Maybe<readonly unknown[]>, m) => acc.andThen((ms) => m.map((m) => [...ms, m])),
    just([])
  ) as TransposedArray<T>;
}

export type Unwrapped<T> = T extends Maybe<infer U> ? U : T;

export type TransposedArray<T extends ReadonlyArray<Maybe<unknown>>> =
  // Array only extends T when the item is *not* `readonly`.
  Array<unknown> extends T
  ? Maybe<{ -readonly [K in keyof T]: Unwrapped<T[K]> }>
  : Maybe<{ [K in keyof T]: Unwrapped<T[K]> }>;

/**
  Safely extract a key from an object, returning {@linkcode Just} if the key has
  a value on the object and {@linkcode Nothing} if it does not.

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
  const op = (t: T) => Maybe.of(t[key]) as Maybe<NonNullable<T[K]>>;
  return curry1(op, obj);
}

/**
  Safely extract a key from a {@linkcode Maybe} of an object, returning
  {@linkcode Just} if the key has a value on the object and
  {@linkcode Nothing} if it does not. (Like {@linkcode property} but
  operating on a `Maybe<T>` rather than directly on a `T`.)

  The check is type-safe: you won't even be able to compile if you try to look
  up a property that TypeScript *knows* doesn't exist on the object.

  ```ts
  import { get, just, nothing } from 'true-myth/maybe';

  type Person = { name?: string };

  const me: Maybe<Person> = just({ name: 'Chris' });
  console.log(get('name', me)); // Just('Chris')

  const nobody = nothing<Person>();
  console.log(get('name', nobody)); // Nothing
  ```

  However, it also works correctly with dictionary types:

  ```ts
  import { get, just } from 'true-myth/maybe';

  type Dict<T> = { [key: string]: T };

  const score: Maybe<Dict<number>> = just({
    player1: 0,
    player2: 1
  });

  console.log(get('player1', score)); // Just(0)
  console.log(get('player2', score)); // Just(1)
  console.log(get('player3', score)); // Nothing
  ```

  The order of keys is so that it can be partially applied:

  ```ts
  import { get, just } from 'true-myth/maybe';

  type Person = { name?: string };

  const lookupName = get('name');

  const me: Person = { name: 'Chris' };
  console.log(lookupName(me)); // Just('Chris')

  const nobody: Person = {};
  console.log(lookupName(nobody)); // Nothing
  ```

  @param key The key to pull out of the object.
  @param maybeObj The object to look up the key from.
 */
export function get<T extends { [key: string]: unknown }, K extends keyof T>(
  key: K,
  maybeObj: Maybe<T>
): Maybe<NonNullable<T[K]>>;
export function get<T extends { [key: string]: unknown }, K extends keyof T>(
  key: K
): (maybeObj: Maybe<T>) => Maybe<NonNullable<T[K]>>;
export function get<T extends { [key: string]: unknown }, K extends keyof T>(
  key: K,
  maybeObj?: Maybe<T>
): Maybe<NonNullable<T[K]>> | ((maybeObj: Maybe<T>) => Maybe<NonNullable<T[K]>>) {
  return curry1(andThen(property<T, K>(key)), maybeObj);
}

/**
  Transform a function from a normal JS function which may return `null` or
  `undefined` to a function which returns a {@linkcode Maybe} instead.

  For example, dealing with the `Document#querySelector` DOM API involves a
  *lot* of things which can be `null`:

  ```ts
  const foo = document.querySelector('#foo');
  let width: number;
  if (foo !== null) {
    width = foo.getBoundingClientRect().width;
  } else {
    width = 0;
  }

  const getStyle = (el: HTMLElement, rule: string) => el.style[rule];
  const bar = document.querySelector('.bar');
  let color: string;
  if (bar != null) {
    let possibleColor = getStyle(bar, 'color');
    if (possibleColor !== null) {
      color = possibleColor;
    } else {
      color = 'black';
    }
  }
  ```

  (Imagine in this example that there were more than two options: the
  simplifying workarounds you commonly use to make this terser in JS, like the
  ternary operator or the short-circuiting `||` or `??` operators, eventually
  become very confusing with more complicated flows.)

  We can work around this with `Maybe`, always wrapping each layer in
  {@linkcode Maybe.of} invocations, and this is *somewhat* better:

  ```ts
  import Maybe from 'true-myth/maybe';

  const aWidth = Maybe.of(document.querySelector('#foo'))
    .map(el => el.getBoundingClientRect().width)
    .unwrapOr(0);

  const aColor = Maybe.of(document.querySelector('.bar'))
    .andThen(el => Maybe.of(getStyle(el, 'color'))
    .unwrapOr('black');
  ```

  With `wrapReturn`, though, you can create a transformed version of a function
  *once* and then be able to use it freely throughout your codebase, *always*
  getting back a `Maybe`:

  ```ts
  import { wrapReturn } from 'true-myth/maybe';

  const querySelector = wrapReturn(document.querySelector.bind(document));
  const safelyGetStyle = wrapReturn(getStyle);

  const aWidth = querySelector('#foo')
    .map(el => el.getBoundingClientRect().width)
    .unwrapOr(0);

  const aColor = querySelector('.bar')
    .andThen(el => safelyGetStyle(el, 'color'))
    .unwrapOr('black');
  ```

  @param fn The function to transform; the resulting function will have the
            exact same signature except for its return type.
 */
export function safe<
  F extends AnyFunction,
  P extends Parameters<F>,
  R extends NonNullable<ReturnType<F>>,
  >(fn: F): (...params: P) => Maybe<R> {
  return (...params) => Maybe.of(fn(...params) as R);
}

/**
  @alias for {@linkcode safe}.
  @deprecated Switch to using {@linkcode safe} instead. This will be removed at
    9.0.
 */
export const wrapReturn = safe;

/**
  The public interface for the {@linkcode Maybe} class *as a value*: a
  constructor and the associated static properties.
 */
export interface MaybeConstructor {
  new <T>(value?: T | null | undefined): Maybe<T>;
  of: typeof MaybeImpl.of;
  just: typeof MaybeImpl.just;
  nothing: typeof MaybeImpl.nothing;
}

/**
 * `Maybe` represents a value which may ({@linkcode Just `Just<T>`}) or may not
 * ({@linkcode Nothing}) be present.
 *
 * @class
 */
export const Maybe: MaybeConstructor = MaybeImpl as MaybeConstructor;
export type Maybe<T> = Just<T> | Nothing<T>;
export default Maybe;
