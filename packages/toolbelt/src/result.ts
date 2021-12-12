import Result, { ok, err } from '@true-myth/result';
import Maybe, { just, nothing } from '@true-myth/maybe';
import { curry1 } from '@true-myth/utils';

/**
  Convert a {@linkcode Result} to a {@linkcode Maybe.Maybe Maybe}.

  The converted type will be {@linkcode Maybe.Just Just} if the `Result` is
  {@linkcode Ok} or {@linkcode Maybe.Nothing Nothing} if the `Result` is
  {@linkcode Err}; the wrapped error value will be discarded.

  @param result The `Result` to convert to a `Maybe`
  @returns      `Just` the value in `result` if it is `Ok`; otherwise `Nothing`
 */
export function toMaybe<T>(result: Result<T, unknown>): Maybe<T> {
  return result.isOk ? just(result.value) : nothing();
}

/**
  Transform a {@linkcode Maybe.Maybe Maybe} into a {@linkcode Result}.

  If the `Maybe` is a {@linkcode Maybe.Just Just}, its value will be wrapped in
  the {@linkcode Ok} variant; if it is a {@linkcode Maybe.Nothing Nothing} the
  `errValue` will be wrapped in the {@linkcode Err} variant.

  @param errValue A value to wrap in an `Err` if `maybe` is a `Nothing`.
  @param maybe    The `Maybe` to convert to a `Result`.
 */
export function fromMaybe<T, E>(errValue: E, maybe: Maybe<T>): Result<T, E>;
export function fromMaybe<T, E>(errValue: E): (maybe: Maybe<T>) => Result<T, E>;
export function fromMaybe<T, E>(
  errValue: E,
  maybe?: Maybe<T>
): Result<T, E> | ((maybe: Maybe<T>) => Result<T, E>) {
  const op = (m: Maybe<T>): Result<T, E> => (m.isJust ? ok(m.value) : err(errValue));
  return curry1(op, maybe);
}

/**
  Transposes a {@linkcode Maybe.Maybe Maybe} of a {@linkcode Result} into a
  `Result` of a `Maybe`.

  | Input          | Output        |
  | -------------- | ------------- |
  | `Just(Ok(T))`  | `Ok(Just(T))` |
  | `Just(Err(E))` | `Err(E)`      |
  | `Nothing`      | `Ok(Nothing)` |

  @param maybe a `Maybe<Result<T, E>>` to transform to a `Result<Maybe<T>, E>>`.
 */
export function transposeMaybe<T, E>(maybe: Maybe<Result<T, E>>): Result<Maybe<T>, E> {
  return maybe.match({
    Just: result =>
      result.match({
        Ok: v => Result.ok(Maybe.just(v)),
        Err: e => Result.err(e),
      }),
    Nothing: () => Result.ok(Maybe.nothing()),
  });
}
