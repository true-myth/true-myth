import { safeToString } from "true-myth/-private/utils";
import { Maybe, safe as maybeSafe } from "true-myth/maybe";
import { Result, safe as resultSafe } from "true-myth/result";
import { describe, expect, expectTypeOf, test } from "vitest";

describe("nested Result and Maybe", () => {
  test("Result of Maybe", () => {
    function inferenceFun(): Result<Maybe<string>, number> {
      return Result.ok(Maybe.nothing());
    }
    expect(inferenceFun()).toBeInstanceOf(Result);
  });
});

describe("composing safe", () => {
  const ERR_MESSAGE = "lol, too high";

  function print(value: number): string {
    return `you win! ${value}, yay`;
  }

  function fnThatMayThrow(input: number): string | null {
    if (input > 0.75) {
      throw new Error(ERR_MESSAGE);
    } else if (input < 0.25) {
      return null;
    } else {
      return print(input);
    }
  }

  test("with a handler with Result", () => {
    let safe = resultSafe(maybeSafe(fnThatMayThrow));
    expectTypeOf(safe).toEqualTypeOf<
      (input: number) => Result<Maybe<string>, unknown>
    >();

    expect(safe(1)).toEqual(Result.err(new Error(ERR_MESSAGE)));
    expect(safe(0)).toEqual(Result.ok(Maybe.nothing()));
    expect(safe(0.5)).toEqual(Result.ok(Maybe.just(print(0.5))));
  });

  test("without a handler with Result", () => {
    const onError = (err: unknown) => safeToString(err);

    let safe = resultSafe(maybeSafe(fnThatMayThrow), onError);
    expectTypeOf(safe).toEqualTypeOf<
      (input: number) => Result<Maybe<string>, string>
    >();

    expect(safe(1)).toEqual(Result.err(onError(new Error(ERR_MESSAGE))));
    expect(safe(0)).toEqual(Result.ok(Maybe.nothing()));
    expect(safe(0.5)).toEqual(Result.ok(Maybe.just(print(0.5))));
  });
});
