import Maybe, { just } from '@true-myth/maybe';
import { curry1 } from '@true-myth/utils';

export type Predicate<T> = (element: T, index: number, array: T[]) => boolean;

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
export function head<T>(array: Array<T | null | undefined>): Maybe<T> {
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
export function last<T>(array: Array<T | null | undefined>): Maybe<T> {
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
  import Maybe from 'true-myth/maybe';

  let valid = [Maybe.just(2), Maybe.just('three')];
  let allJust = Maybe.arrayTranspose(valid); // => Just([2, 'three']);

  let invalid = [Maybe.just(2), Maybe.nothing<string>()];
  let mixed = Maybe.arrayTranspose(invalid); // => Nothing
  ```

  When working with a tuple type, the structure of the tuple is preserved. Here,
  for example, `result` has the type `Maybe<[string, number]>` and will be
  `Nothing`:

  ```ts
  import Maybe from 'true-myth/maybe';

  type Tuple = [Maybe<string>, Maybe<number>];

  let invalid: Tuple = [Maybe.just('wat'), Maybe.nothing()];
  let result = Maybe.arrayTranspose(invalid);  // => Nothing
  ```

  If all of the items in the tuple are `Just`, the result is `Just` wrapping the
  tuple of the values of the items. Here, for example, `result` again has the
  type `Maybe<[string, number]>` and will be `Just(['hey', 12]`:

  ```ts
  import Maybe from 'true-myth/maybe';

  type Tuple = [Maybe<string>, Maybe<number>];

  let valid: Tuple = [Maybe.just('hey'), Maybe.just(12)];
  let result = Maybe.arrayTranspose(valid);  // => Just(['hey', 12])
  ```

  __Note:__ this does not work with `ReadonlyArray`. If you have a
  `ReadonlyArray` you wish to operate on, you must cast it to `Array` insetad.
  This cast is always safe here, because `Array` is a *wider* type than
  `ReadonlyArray`.

  @param maybes The `Maybe`s to resolve to a single `Maybe`.
 */
export function transposeArray<T extends Array<Maybe<unknown>>>(maybes: T): TransposedArray<T> {
  // The slightly odd-seeming use of `[...ms, m]` here instead of `concat` is
  // necessary to preserve the structure of the value passed in. The goal is for
  // `[Maybe<string>, [Maybe<number>, Maybe<boolean>]]` not to be flattened into
  // `Maybe<[string, number, boolean]>` (as `concat` would do) but instead to
  // produce `Maybe<[string, [number, boolean]]>`.
  return maybes.reduce(
    (acc: Maybe<unknown[]>, m) => acc.andThen(ms => m.map(m => [...ms, m])),
    just([] as unknown[]) as TransposedArray<T>
  ) as TransposedArray<T>;
}

export type Unwrapped<T> = T extends Maybe<infer U> ? U : T;

export type TransposedArray<T extends Array<Maybe<unknown>>> = Maybe<
  {
    [K in keyof T]: Unwrapped<T[K]>;
  }
>;
