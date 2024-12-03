/**
  Helpers to make it easier to test `Maybe` and `Result`.

  @module
 */

import Maybe, { type Just, isInstance as isMaybe } from './maybe.js';
import Result, { type Err, type Ok } from './result.js';

/** Unwrap the contained `Just` value. Throws if `maybe` is `Nothing`. */
export function unwrap<T>(maybe: Maybe<T>): T;
/** Unwrap the contained `Ok` value. Throws if `result` is `Err`. */
export function unwrap<T, E>(result: Result<T, E>): T;
export function unwrap<T>(wrapped: Maybe<T> | Result<T, unknown>): T {
  if (isMaybe(wrapped)) {
    return (wrapped as Just<T>).value;
  } else {
    return (wrapped as Ok<T, unknown>).value;
  }
}

/** Unwrap the contained `Err` error. Throws if `result` is `Ok`. */
export function unwrapErr<E>(result: Result<unknown, E>): E {
  return (result as Err<unknown, E>).error;
}
