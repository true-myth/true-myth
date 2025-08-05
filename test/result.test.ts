import { describe, expect, expectTypeOf, test } from 'vitest';

import Result, { Ok, Variant, Err } from 'true-myth/result';
import * as result from 'true-myth/result';
import Unit from 'true-myth/unit';

const length = (x: { length: number }) => x.length;
const double = (x: number) => x * 2;

describe('`Result` pure functions', () => {
  test('`ok`', () => {
    const theOk = result.ok(42);
    expect(theOk).toBeInstanceOf(Result);
    switch (theOk.variant) {
      case Variant.Ok:
        expect(theOk.value).toBe(42);
        break;
      case Variant.Err:
        expect(false).toBe(true); // because this should never happen
        break;
      default:
        expect(false).toBe(true); // because those are the only cases
    }

    const withUnit = result.ok();
    expectTypeOf(withUnit).toEqualTypeOf<Result<Unit, never>>();
    expect(withUnit).toEqual(result.ok(Unit));

    const withUnitFromImport = Result.ok();
    expectTypeOf(withUnitFromImport).toEqualTypeOf<Result<Unit, never>>();
    expect(withUnitFromImport).toEqual(Result.ok(Unit));

    const withUndefined = Result.ok(undefined);
    expectTypeOf(withUndefined).toEqualTypeOf<Result<undefined, never>>();
    expect((withUndefined as Ok<undefined, unknown>).value).toBeUndefined();
  });

  test('`err`', () => {
    const reason = 'oh teh noes';
    const theErr = result.err(reason);
    expect(theErr).toBeInstanceOf(Result);
    switch (theErr.variant) {
      case Variant.Ok:
        expect(true).toBe(false); // because this should never happen
        break;
      case Variant.Err:
        expect(theErr.error).toBe(reason);
        break;
      default:
        expect(false).toBe(true); // because those are the only cases
    }

    const withUnit = result.err();
    expectTypeOf(withUnit).toEqualTypeOf<Result<never, Unit>>();
    expect(withUnit).toEqual(result.err(Unit));
  });

  test('`tryOr`', () => {
    const message = 'dang';
    const goodOperation = () => 2 + 2;

    expect(result.tryOr(message, goodOperation)).toEqual(result.ok(4));
    expect(result.tryOr(message)(goodOperation)).toEqual(result.ok(4));

    const badOperation = () => {
      throw new Error('Danger, danger, Will Robinson');
    };

    expect(result.tryOr(message, badOperation)).toEqual(result.err(message));
    expect(result.tryOr(message)(badOperation)).toEqual(result.err(message));
  });

  test('`tryOrElse`', () => {
    function handleError<E>(e: E): E {
      return e;
    }

    const operation = () => 2 + 2;
    const badOperation = () => {
      throw 'kablooey';
    };

    const res = result.tryOrElse(handleError, operation);
    expect(res).toBeInstanceOf(Result);
    expect(res.variant).toBe(Variant.Ok);

    const res2 = result.tryOrElse(handleError, badOperation);
    expect(res2).toBeInstanceOf(Result);
    expect(res2.variant).toBe(Variant.Err);
  });

  test('`map`', () => {
    const theValue = 42;
    const anOk = result.ok(theValue);
    const doubledOk = result.ok(double(theValue));
    expect(result.map(double, anOk)).toEqual(doubledOk);

    const anErr: Result<number, string> = result.err('some nonsense');
    expect(result.map(double, anErr)).toEqual(anErr);
  });

  test('`mapOr`', () => {
    const theDefault = 0;

    const theValue = 5;
    const anOk: Result<number, string> = result.ok(theValue);
    expect(result.mapOr(theDefault, double, anOk)).toEqual(double(theValue));

    const anErr: Result<number, string> = result.err('blah');
    expect(result.mapOr(theDefault, double, anErr)).toEqual(theDefault);

    expect(result.mapOr<number, number, string>(theDefault)(double)(anOk)).toEqual(
      result.mapOr(theDefault, double, anOk)
    );
    expect(result.mapOr(theDefault, double)(anOk)).toEqual(result.mapOr(theDefault, double, anOk));
  });

  test('`mapOrElse`', () => {
    const description = 'that was not good';
    const getDefault = (reason: number) => `${description}: ${reason}`;

    const anOk: Result<number, number> = result.ok(5);
    expect(result.mapOrElse(getDefault, String, anOk)).toEqual(String(5));

    const errValue = 10;
    const anErr = result.err(10);
    expect(result.mapOrElse(getDefault, String, anErr)).toEqual(`${description}: ${errValue}`);

    expect(result.mapOrElse(getDefault)(String)(anErr)).toEqual(
      result.mapOrElse(getDefault, String, anErr)
    );
    expect(result.mapOrElse(getDefault, String)(anErr)).toEqual(
      result.mapOrElse(getDefault, String, anErr)
    );
  });

  test('`match`', () => {
    const nobody = result.ok('ok');
    const toErrIs = result.err('human');

    expect(
      result.match(
        {
          Ok: (val) => val,
          Err: (err) => err,
        },
        nobody
      )
    ).toBe('ok');
    expect(
      result.match(
        {
          Ok: (val) => val,
          Err: (err) => err,
        },
        toErrIs
      )
    ).toBe('human');
  });

  test('`mapErr`', () => {
    const anOk: Result<number, number> = result.ok(10);
    expect(result.mapErr(double, anOk)).toEqual(anOk);

    const theErrValue = 20;
    const anErr = result.err(theErrValue);
    const doubledErr = result.err(double(theErrValue));
    expect(result.mapErr(double, anErr)).toEqual(doubledErr);
  });

  test('`and`', () => {
    const nextOk = result.ok('not a number');
    const nextErr = result.err('not bueno');

    const anOk = result.ok(0);
    expect(result.and(nextOk, anOk)).toEqual(nextOk);
    expect(result.and(nextErr, anOk)).toEqual(nextErr);

    const anErr = result.err('potatoes');
    expect(result.and(nextOk, anErr)).toEqual(anErr);
    expect(result.and(nextErr, anErr)).toEqual(anErr);
  });

  describe('`andThen`', () => {
    test('basic functionality', () => {
      const theValue = 'a string';
      const toLengthResult = (s: string) => result.ok<number, string>(length(s));
      const expected = toLengthResult(theValue);

      const anOk = result.ok(theValue);
      expect(result.andThen(toLengthResult, anOk)).toEqual(expected);

      const anErr: Result<string, string> = result.err('something wrong');
      expect(result.andThen(toLengthResult, anErr)).toEqual(anErr);
    });

    test('with multiple types in the `Result` returned', () => {
      class Branded<T extends string> {
        constructor(public readonly name: T) {}
      }

      let initial = Result.ok<Branded<'ok'>, Branded<'err'>>(new Branded('ok'));

      let theResult = result.andThen((_) => {
        if (Math.random() < 0.1) {
          return Result.ok(new Branded('ok-a'));
        }

        if (Math.random() < 0.2) {
          return Result.err(new Branded('err-a'));
        }

        if (Math.random() < 0.3) {
          return Result.ok(new Branded('ok-b'));
        }

        return Result.err(new Branded('err-b'));
      }, initial);

      if (theResult.isOk) {
        expectTypeOf(theResult.value).toEqualTypeOf<Branded<'ok-a'> | Branded<'ok-b'>>();
      } else if (theResult.isErr) {
        expectTypeOf(theResult.error).toEqualTypeOf<
          Branded<'err'> | Branded<'err-a'> | Branded<'err-b'>
        >();
      }
    });
  });

  test('`or`', () => {
    const orOk: Result<number, string> = result.ok(0);
    const orErr: Result<number, string> = result.err('something boring');

    type Err = { [key: string]: string };

    const anOk: Result<number, Err> = result.ok(42);
    expect(result.or(orOk, anOk)).toEqual(anOk);
    expect(result.or(orErr, anOk)).toEqual(anOk);

    const anErr: Result<number, Err> = result.err({ oh: 'my' });
    expect(result.or(orOk, anErr)).toEqual(orOk);
    expect(result.or(orErr, anErr)).toEqual(orErr);
  });

  describe('`orElse`', () => {
    test('basic functionality', () => {
      const orElseOk: Result<number, string> = result.ok(1);
      const getAnOk = () => orElseOk;

      const orElseErr: Result<number, string> = result.err('oh my');
      const getAnErr = () => orElseErr;

      const anOk: Result<number, string> = result.ok(0);
      expect(result.orElse(getAnOk, anOk)).toEqual(anOk);
      expect(result.orElse(getAnErr, anOk)).toEqual(anOk);

      const anErr: Result<number, string> = result.err('boom');
      expect(result.orElse(getAnOk, anErr)).toEqual(orElseOk);
      expect(result.orElse(getAnErr, anErr)).toEqual(orElseErr);
    });

    test('with multiple types in the `Result` returned', () => {
      class Branded<T extends string> {
        constructor(public readonly name: T) {}
      }

      let initial = Result.err<Branded<'ok'>, Branded<'err'>>(new Branded('err'));

      let theResult = result.orElse((_) => {
        if (Math.random() < 0.1) {
          return Result.ok(new Branded('ok-a'));
        }

        if (Math.random() < 0.2) {
          return Result.err(new Branded('err-a'));
        }

        if (Math.random() < 0.3) {
          return Result.ok(new Branded('ok-b'));
        }

        return Result.err(new Branded('err-b'));
      }, initial);

      if (theResult.isOk) {
        expectTypeOf(theResult.value).toEqualTypeOf<
          Branded<'ok'> | Branded<'ok-a'> | Branded<'ok-b'>
        >();
      } else if (theResult.isErr) {
        expectTypeOf(theResult.error).toEqualTypeOf<Branded<'err-a'> | Branded<'err-b'>>();
      }
    });
  });

  test('`value` property', () => {
    const theValue = 'hooray';
    const anOk = result.ok(theValue);

    if (anOk.isOk) {
      expect(() => anOk.value).not.toThrow();
      expect(anOk.value).toBe(theValue);
    } else {
      expect.fail('Not an Ok');
    }

    const theErrValue = 'oh no';
    const anErr = result.err(theErrValue);
    if (anErr.isErr) {
      // @ts-expect-error
      expect(() => anErr.value).toThrow();
    } else {
      expect.fail('Not an Err');
    }
  });

  test('`error` property', () => {
    const theValue = 'hooray';
    const anOk = result.ok(theValue);

    if (anOk.isOk) {
      // @ts-expect-error
      expect(() => anOk.error).toThrow();
    } else {
      expect.fail('Not an Ok');
    }

    const theErrValue = 'oh no';
    const anErr = result.err(theErrValue);
    if (anErr.isErr) {
      expect(() => anErr.error).not.toThrow();
      expect(anErr.error).toBe(theErrValue);
    } else {
      expect.fail('Not an Err');
    }
  });

  test('`unwrapOr`', () => {
    const defaultValue = 'pancakes are awesome';

    const theValue = 'waffles are tasty';
    const anOk = result.ok(theValue);
    expect(result.unwrapOr(defaultValue, anOk)).toBe(theValue);

    const anErr = result.err('pumpkins are not');
    expect(result.unwrapOr(defaultValue, anErr)).toBe(defaultValue);
    // make sure you can unwrap to a different type, like undefined
    expectTypeOf(anOk).toEqualTypeOf<Result<string, never>>();
    const anOkOrUndefined = result.unwrapOr(undefined, anOk);
    expectTypeOf(anOkOrUndefined).toEqualTypeOf<string | undefined>();
    expect(anOkOrUndefined).toEqual(theValue);

    expectTypeOf(anErr).toEqualTypeOf<Result<never, string>>();
    const anErrOrUndefined = result.unwrapOr(undefined, anErr);
    expectTypeOf(anErrOrUndefined).toEqualTypeOf<undefined>(); // undefined ≡ never | undefined
    expect(anErrOrUndefined).toEqual(undefined);
  });

  test('`unwrapOrElse`', () => {
    type LocalError = { reason: string };

    const errToOk = (e: LocalError) => `What went wrong? ${e.reason}`;

    const theValue = 'Red 5';
    const anOk = result.ok<string, LocalError>(theValue);
    expect(result.unwrapOrElse(errToOk, anOk)).toBe(theValue);

    const theErrValue = { reason: 'bad thing' };
    const anErr = result.err<string, LocalError>(theErrValue);
    expect(result.unwrapOrElse(errToOk, anErr)).toBe(errToOk(theErrValue));

    // test unwrapping to undefined
    const noop = (): undefined => undefined;

    const anOkOrUndefined = result.unwrapOrElse(noop, anOk);
    expectTypeOf(anOkOrUndefined).toEqualTypeOf<string | undefined>();
    expect(anOkOrUndefined).toEqual(theValue);

    const anErrOrUndefined = result.unwrapOrElse(noop, anErr);
    expectTypeOf(anErrOrUndefined).toEqualTypeOf<string | undefined>();
    expect(anErrOrUndefined).toEqual(undefined);
  });

  describe('toString', () => {
    test('normal cases', () => {
      const theValue = { thisIsReally: 'something' };
      const errValue = ['oh', 'no'];

      const anOk = result.ok<typeof theValue, typeof errValue>(theValue);
      expect(result.toString(anOk)).toEqual(`Ok(${theValue.toString()})`);

      const anErr = result.err<typeof theValue, typeof errValue>(errValue);
      expect(result.toString(anErr)).toEqual(`Err(${errValue.toString()})`);
    });

    test('custom `toString`s', () => {
      const withNotAFunction = {
        whyThough: 'because JS bro',
        toString: '🤨',
      };

      expect(result.toString(Result.ok(withNotAFunction))).toEqual(
        `Ok(${JSON.stringify(withNotAFunction)})`
      );

      const withBadFunction = {
        cueSobbing: true,
        toString() {
          return { lol: 123 };
        },
      };

      expect(result.toString(Result.err(withBadFunction))).toEqual(
        `Err(${JSON.stringify(withBadFunction)})`
      );
    });
  });

  test('`toJSON`', () => {
    const theValue = { thisIsReally: 'something', b: null };
    const anOk = result.ok(theValue);
    expect(result.toJSON(anOk)).toEqual({
      variant: Variant.Ok,
      value: theValue,
    });

    const errValue = ['oh', 'no', null];
    const anErr = result.err(errValue);
    expect(result.toJSON(anErr)).toEqual({
      variant: Variant.Err,
      error: errValue,
    });
  });

  test('`toJSON` through serialization', () => {
    const actualSerializedOk = JSON.stringify(result.ok(42));
    const actualSerializedErr = JSON.stringify(result.err({ someInfo: 'error' }));
    const actualSerializedUnitErr = JSON.stringify(result.err());
    const expectedSerializedOk = JSON.stringify({
      variant: Variant.Ok,
      value: 42,
    });
    const expectedSerializedErr = JSON.stringify({
      variant: Variant.Err,
      error: { someInfo: 'error' },
    });
    const expectedSerializedUnitErr = JSON.stringify({
      variant: Variant.Err,
      error: Unit,
    });

    expect(actualSerializedOk).toEqual(expectedSerializedOk);
    expect(actualSerializedErr).toEqual(expectedSerializedErr);
    expect(actualSerializedUnitErr).toEqual(expectedSerializedUnitErr);
  });

  test('`equals`', () => {
    const a = result.ok<string, string>('a');
    const b = result.ok<string, string>('a');
    const c = result.err<string, string>('error');
    const d = result.err<string, string>('error');
    expect(result.equals(b, a)).toBe(true);
    expect(result.equals(b)(a)).toBe(true);
    expect(result.equals(c, b)).toBe(false);
    expect(result.equals(c)(b)).toBe(false);
    expect(result.equals(d, c)).toBe(true);
    expect(result.equals(d)(c)).toBe(true);
  });

  test('`ap`', () => {
    const add = (a: number) => (b: number) => a + b;
    const okAdd = result.ok<typeof add, string>(add);

    expect(okAdd.ap(result.ok(2)).ap(result.ok(3))).toEqual(result.ok(5));

    const add3 = add(3);
    const okAdd3 = result.ok<typeof add3, string>(add(3));

    expect(result.ap(okAdd3, result.ok(2))).toEqual(result.ok(5));
  });

  test('isInstance', () => {
    const ok: unknown = result.ok('yay');
    expect(result.isInstance(ok)).toBe(true);

    const err: unknown = result.err('oh no');
    expect(result.isInstance(err)).toBe(true);

    const nada: unknown = null;
    expect(result.isInstance(nada)).toBe(false);

    const obj: unknown = { random: 'nonsense' };
    expect(result.isInstance(obj)).toBe(false);
  });

  test('`isOk` with an Ok', () => {
    const testOk: Result<number, string> = result.ok(42);

    if (result.isOk(testOk)) {
      expect(testOk.value).toEqual(42);
    } else {
      expect.fail('Expected an Ok');
    }
  });

  test('`isOk` with an Err', () => {
    const testErr: Result<number, string> = result.err('');

    expect(result.isOk(testErr)).toEqual(false);
  });

  test('`isErr` with an Ok', () => {
    const testOk: Result<number, string> = result.ok(42);

    expect(result.isErr(testOk)).toEqual(false);
  });

  test('`isErr` with an Err', () => {
    const testErr: Result<number, string> = result.err('');

    expect(result.isErr(testErr)).toEqual(true);
  });

  describe('`safe` function', () => {
    const THE_MESSAGE = 'the error message';

    function example(
      value: number,
      { throwErr: shouldThrow = false }: { throwErr?: boolean } = {
        throwErr: false,
      }
    ): string {
      if (shouldThrow) {
        throw new Error(THE_MESSAGE);
      }

      return `value was ${value}`;
    }

    describe('without an error handler', () => {
      let safeExample = result.safe(example);
      expectTypeOf(safeExample).toEqualTypeOf<
        (value: number, should?: { throwErr?: boolean }) => Result<string, unknown>
      >();

      test('when it throws', () => {
        let theResult = safeExample(123, { throwErr: true });
        if (theResult.isErr) {
          expect(theResult.error).toBeInstanceOf(Error);
          expect((theResult.error as Error).message).toBe(THE_MESSAGE);
        } else {
          expect.unreachable();
        }
      });

      test('when it does not throw', () => {
        let theResult = safeExample(123);
        if (theResult.isOk) {
          expect(theResult.value).toBe('value was 123');
        } else {
          expect.unreachable();
        }
      });
    });

    describe('with an error handler', () => {
      let safeExample = result.safe(example, (reason) => JSON.stringify(reason, null, 2));
      expectTypeOf(safeExample).toEqualTypeOf<
        (value: number, should?: { throwErr?: boolean }) => Result<string, string>
      >();

      test('when it throws', () => {
        let theResult = safeExample(123, { throwErr: true });
        if (theResult.isErr) {
          expect(theResult.error).toBe('{}'); // stringify is weird
        } else {
          expect.unreachable();
        }
      });

      test('when it does not throw', () => {
        let theResult = safeExample(123);
        if (theResult.isOk) {
          expect(theResult.value).toBe('value was 123');
        } else {
          expect.unreachable();
        }
      });
    });
  });
});

// We aren't even really concerned with the "runtime" behavior here, which we
// know to be correct from other tests. Instead, this test just checks whether
// the types are narrowed as they should be.
test('narrowing', () => {
  const oneOk = result.ok();
  if (oneOk.isOk) {
    expectTypeOf(oneOk).toEqualTypeOf<Ok<Unit, never>>();
    expect(oneOk.value).toBeDefined();
  }

  const anotherOk = result.ok();
  if (anotherOk.variant === Variant.Ok) {
    expectTypeOf(anotherOk).toEqualTypeOf<Ok<Unit, never>>();
    expect(anotherOk.value).toBeDefined();
  }

  const oneErr = result.err();
  if (oneErr.isErr) {
    expectTypeOf(oneErr).toEqualTypeOf<Err<never, Unit>>();
    expect(oneErr.error).toBeDefined();
  }

  const anotherErr = result.err();
  if (anotherErr.variant === Variant.Err) {
    expectTypeOf(anotherErr).toEqualTypeOf<Err<never, Unit>>();
    expect(anotherErr.error).toBeDefined();
  }

  expect('this type checked, hooray').toBeTruthy();
});

describe('`Ok` instance', () => {
  test('constructor', () => {
    const fullyQualifiedOk = Result.ok<number, string>(42);
    expectTypeOf(fullyQualifiedOk).toMatchTypeOf<Result<number, string>>();

    const unqualifiedOk = Result.ok('string');
    expectTypeOf(unqualifiedOk).toMatchTypeOf<Result<string, unknown>>();

    expect(() => Result.ok(null)).not.toThrow();
    expect(() => Result.ok(undefined)).not.toThrow();
  });

  test('`value` property', () => {
    const okValue = 'yay';
    const theOk = Result.ok(okValue);

    if (theOk.isOk) {
      expect(theOk.value).toEqual(okValue);
    } else {
      expect.fail('Not an Ok');
    }
  });

  test('`error` property', () => {
    let result = Result.ok('yeat');

    if (result.isErr) {
      expectTypeOf<(typeof result)['error']>().toBeNever();
    }
    if (result.isOk) {
      // @ts-expect-error
      expect(() => result.error).toThrow();
    } else {
      expect('wrong branch').toEqual(true);
    }
  });

  test('`isOk` method', () => {
    const theOk = Result.ok({});
    expect(theOk.isOk).toBe(true);
  });

  test('`isErr` method', () => {
    const theOk = Result.ok([]);
    expect(theOk.isErr).toBe(false);
  });

  test('`map` method', () => {
    const theValue = 10;
    const theOk = Result.ok(theValue);
    const okDoubled = Result.ok(double(theValue));
    expect(theOk.map(double)).toEqual(okDoubled);
  });

  test('`mapOr` method', () => {
    const theValue = 'neat';
    const theOk = Result.ok(theValue);
    const defaultValue = 0;
    expect(theOk.mapOr(defaultValue, length)).toEqual(length(theValue));
  });

  test('`mapOrElse` method', () => {
    const theValue = ['some', 'things'];
    const theOk: Result<string[], string> = Result.ok(theValue);
    const getDefault = (reason: string) => `reason being, ${reason}`;
    const join = (strings: string[]) => strings.join(', ');
    expect(theOk.mapOrElse(getDefault, join)).toEqual(join(theValue));
  });

  test('`match` method', () => {
    const theValue = 'ok';
    const nobody = Result.ok(theValue);

    expect(
      nobody.match({
        Ok: (val) => val,
        Err: (err) => err,
      })
    ).toBe('ok');
  });

  test('`mapErr` method', () => {
    const theOk: Result<string, string> = Result.ok('hey!');
    const toMoreVerboseErr = (s: string) => `Seriously, ${s} was bad.`;
    expect(theOk.mapErr(toMoreVerboseErr)).toEqual(theOk);
  });

  test('`and` method', () => {
    const theOk = Result.ok<number, string[]>(100);

    const anotherOk = Result.ok({ not: 'a number' });
    expect(theOk.and(anotherOk)).toBe(anotherOk);

    const anErr = Result.err(['yikes', 'bad']);
    expect(theOk.and(anErr)).toBe(anErr);
  });

  describe('`andThen` method', () => {
    test('basic functionality', () => {
      const theValue = 'anything will do';
      const theOk = Result.ok<string, number>(theValue);
      const lengthResult = (s: string) => Result.ok(s.length);
      expect(theOk.andThen(lengthResult)).toEqual(lengthResult(theValue));

      const convertToErr = (s: string) => Result.err(s.length);
      expect(theOk.andThen(convertToErr)).toEqual(convertToErr(theValue));
    });

    test('with multiple types in the `Result` returned', () => {
      class Branded<T extends string> {
        constructor(public readonly name: T) {}
      }

      let theResult = Result.ok<Branded<'ok'>, Branded<'err'>>(new Branded('ok')).andThen((_) => {
        if (Math.random() < 0.1) {
          return Result.ok(new Branded('ok-a'));
        }

        if (Math.random() < 0.2) {
          return Result.err(new Branded('err-a'));
        }

        if (Math.random() < 0.3) {
          return Result.ok(new Branded('ok-b'));
        }

        return Result.err(new Branded('err-b'));
      });

      if (theResult.isOk) {
        expectTypeOf(theResult.value).toEqualTypeOf<Branded<'ok-a'> | Branded<'ok-b'>>();
      } else if (theResult.isErr) {
        expectTypeOf(theResult.error).toEqualTypeOf<
          Branded<'err'> | Branded<'err-a'> | Branded<'err-b'>
        >();
      }
    });
  });

  test('`or` method', () => {
    const theValue = 100;
    const theOk = Result.ok<number, string>(theValue);
    const anotherOk = Result.ok(42);
    expect(theOk.or(anotherOk)).toEqual(theOk);

    const anErr = Result.err<number, string>('something wrong');
    expect(theOk.or(anErr)).toEqual(theOk);
  });

  describe('`orElse` method', () => {
    test('basic functionality', () => {
      const theValue = 1;
      const theOk = Result.ok(theValue);
      const theDefault: string[] = [];
      const getTheDefault = () => Result.err<number, string[]>(theDefault);
      expect(theOk.orElse(getTheDefault)).toEqual(theOk);
    });

    test('with multiple types in the `Result` returned', () => {
      class Branded<T extends string> {
        constructor(public readonly name: T) {}
      }

      let theResult = Result.err<Branded<'ok'>, Branded<'err'>>(new Branded('err')).orElse((_) => {
        if (Math.random() < 0.1) {
          return Result.ok(new Branded('ok-a'));
        }

        if (Math.random() < 0.2) {
          return Result.err(new Branded('err-a'));
        }

        if (Math.random() < 0.3) {
          return Result.ok(new Branded('ok-b'));
        }

        return Result.err(new Branded('err-b'));
      });

      if (theResult.isOk) {
        expectTypeOf(theResult.value).toEqualTypeOf<
          Branded<'ok'> | Branded<'ok-a'> | Branded<'ok-b'>
        >();
      } else if (theResult.isErr) {
        expectTypeOf(theResult.error).toEqualTypeOf<Branded<'err-a'> | Branded<'err-b'>>();
      }
    });
  });

  test('`value` property', () => {
    const theValue = 42;
    const theOk = Result.ok(theValue);

    if (theOk.isOk) {
      expect(() => theOk.value).not.toThrow();
      expect(theOk.value).toEqual(theValue);
    } else {
      expect.fail('Not an Ok');
    }
  });

  test('`error` property', () => {
    const theOk = Result.ok('anything');

    if (theOk.isOk) {
      // @ts-expect-error
      expect(() => theOk.error).toThrow();
    } else {
      expect.fail('Not an Ok');
    }
  });

  test('`unwrapOr` method', () => {
    const theValue = [1, 2, 3];
    const theOk = Result.ok(theValue);
    const defaultValue: typeof theValue = [];

    expect(theOk.unwrapOr(defaultValue)).toBe(theValue);
  });

  test('`unwrapOrElse` method', () => {
    const theValue = [1, 2, 3];
    const theOk = Result.ok(theValue);
    const defaultValue: typeof theValue = [];
    const getDefault = () => defaultValue;

    expect(theOk.unwrapOrElse(getDefault)).toBe(theValue);
  });

  test('`toString` method', () => {
    const theValue = 42;
    const theOk = Result.ok(theValue);
    expect(theOk.toString()).toEqual(`Ok(${theValue.toString()})`);
  });

  test('`toJSON` method', () => {
    const theValue = 42;
    const theOk = Result.ok(theValue);
    expect(theOk.toJSON()).toEqual({ variant: Variant.Ok, value: theValue });
  });

  test('`ap` method', () => {
    const fn = Result.ok<(val: string) => number, string>((str) => str.length);
    const val = Result.ok<string, string>('three');

    const result = fn.ap(val);

    expect(result.toString()).toEqual(`Ok(5)`);
  });

  test('`cast` method', () => {
    const val = Result.ok<string, string>('hello');

    // In the fully general `.cast()` case, we expect both sides to end up as
    // `unknown`, though in a bit of a surprising way:
    //
    // - `Ok<string, string>.cast()` -> `Result<string, unknown>`
    // - `Err<string, string>.cast()` -> `Result<unknown, string>`
    //
    // The net is that it is impossible to recover the original underlying type,
    // and this is therefore not something you would use!
    let throwAwayAllData = val.cast();
    if (throwAwayAllData.isOk) {
      expectTypeOf(throwAwayAllData.value).toBeUnknown();
    } else {
      expectTypeOf(throwAwayAllData.error).toBeUnknown();
    }

    // But if we narrow *first*, we can produce

    function castOk(result: Result<string, string>): Result<string, number> {
      return result.isErr ? Result.err(result.error.length) : result.cast();
    }
    function castErr(result: Result<string, string>): Result<number, string> {
      return result.isOk ? Result.ok(result.value.length) : result.cast();
    }

    let anOk = Result.ok<string, string>('true');
    let anErr = Result.err<string, string>('false');

    expect(castOk(anOk)).toBe(anOk);
    expect(castOk(anErr)).not.toBe(anErr);

    expect(castErr(anOk)).not.toBe(anOk);
    expect(castErr(anErr)).toBe(anErr);
  });
});

describe('`result.Err` class', () => {
  test('constructor', () => {
    const fullyQualifiedErr = Result.err<string, number>(42);
    expectTypeOf(fullyQualifiedErr).toMatchTypeOf<Result<string, number>>();

    const unqualifiedErr = Result.err('string');
    expectTypeOf(unqualifiedErr).toMatchTypeOf<Result<unknown, string>>();
    expectTypeOf(unqualifiedErr).toMatchTypeOf<Result<never, string>>();

    expect(() => Result.err(null)).not.toThrow();
    expect(() => Result.err(undefined)).not.toThrow();
  });

  test('`error` property', () => {
    const errValue = 'boo';
    const theErr = Result.err(errValue);

    if (theErr.isErr) {
      expect(theErr.error).toBe(errValue);
    } else {
      expect.fail('Not an Err');
    }
  });

  test('`isOk` method', () => {
    const theErr = Result.err('oh my!');
    expect(theErr.isOk).toBe(false);
  });

  test('`isErr` method', () => {
    const theErr = Result.err('oh my!');
    expect(theErr.isErr).toBe(true);
  });

  test('`map` method', () => {
    const errValue = '1 billion things wrong';
    const theErr = Result.err<number, string>(errValue);
    expect(theErr.map((n) => n + 2)).toEqual(theErr);
  });

  test('`mapOr` method', () => {
    const errValue: number = 42;
    const theErr: Result<number, number> = Result.err(errValue);
    const theDefault = 'victory!';
    const describe = (code: number) => `The error code was ${code}`;

    expect(theErr.mapOr(theDefault, describe)).toEqual(theDefault);
  });

  test('`mapOrElse` method', () => {
    const errValue: number = 42;
    const theErr: Result<number, number> = Result.err(errValue);
    const getDefault = (valueFromErr: typeof errValue) => `whoa: ${valueFromErr}`;
    const describe = (code: number) => `The error code was ${code}`;

    expect(theErr.mapOrElse(getDefault, describe)).toEqual(`whoa: ${errValue}`);
  });

  test('`match` method', () => {
    const human = 'human';
    const toErrIs = Result.err(human);

    expect(
      toErrIs.match({
        Ok: (val) => val,
        Err: (err) => err,
      })
    ).toBe(human);
  });

  test('`mapErr` method', () => {
    const errValue: string = 'fubar';
    const theErr = Result.err(errValue);
    const elaborate = (reason: typeof errValue) => `The problem was: ${reason}`;
    const expected = Result.err(elaborate(errValue));

    expect(theErr.mapErr(elaborate)).toEqual(expected);
  });

  test('`and` method', () => {
    const theErr = Result.err('blarg');

    const anOk = result.ok<string, string>('neat');
    expect(theErr.and(anOk)).toEqual(theErr);

    const anotherErr = result.err('oh no');
    expect(theErr.and(anotherErr)).toEqual(theErr);
  });

  describe('`andThen` method', () => {
    test('basic functionality', () => {
      const theErr = Result.err<string[], number>(42);

      const getAnOk = (strings: string[]) => result.ok<number, number>(length(strings));
      expect(theErr.andThen(getAnOk)).toEqual(theErr);

      const getAnErr = (_: unknown) => result.err(0);
      expect(theErr.andThen(getAnErr)).toEqual(theErr);
    });

    test('with multiple types in the `Result` returned', () => {
      class Branded<T extends string> {
        constructor(public readonly name: T) {}
      }

      let theResult = Result.ok<Branded<'ok'>, Branded<'err'>>(new Branded('ok')).andThen((_) => {
        if (Math.random() < 0.1) {
          return Result.ok(new Branded('ok-a'));
        }

        if (Math.random() < 0.2) {
          return Result.err(new Branded('err-a'));
        }

        if (Math.random() < 0.3) {
          return Result.ok(new Branded('ok-b'));
        }

        return Result.err(new Branded('err-b'));
      });

      if (theResult.isOk) {
        expectTypeOf(theResult.value).toEqualTypeOf<Branded<'ok-a'> | Branded<'ok-b'>>();
      } else if (theResult.isErr) {
        expectTypeOf(theResult.error).toEqualTypeOf<
          Branded<'err'> | Branded<'err-a'> | Branded<'err-b'>
        >();
      }
    });
  });

  test('`or` method', () => {
    const theErr: Result<number, string> = Result.err('a shame');
    const anOk: Result<number, string> = result.ok(42);
    expect(theErr.or(anOk)).toBe(anOk);

    const anotherErr = result.err<number, number>(10);
    expect(theErr.or(anotherErr)).toBe(anotherErr);
  });

  describe('`orElse` method', () => {
    test('basic functionality', () => {
      const theErr = Result.err<string, string>('what sorrow');
      const theOk = result.ok<string, string>('neat!');
      const getOk = () => theOk;
      expect(theErr.orElse(getOk)).toBe(theOk);

      const anotherErr = result.err<string, string>('even worse');
      const getAnotherErr = () => anotherErr;
      expect(theErr.orElse(getAnotherErr)).toBe(anotherErr);
    });

    test('with multiple types in the `Result` returned', () => {
      class Branded<T extends string> {
        constructor(public readonly name: T) {}
      }

      let theResult = Result.err<Branded<'ok'>, Branded<'err'>>(new Branded('err')).orElse((_) => {
        if (Math.random() < 0.1) {
          return Result.ok(new Branded('ok-a'));
        }

        if (Math.random() < 0.2) {
          return Result.err(new Branded('err-a'));
        }

        if (Math.random() < 0.3) {
          return Result.ok(new Branded('ok-b'));
        }

        return Result.err(new Branded('err-b'));
      });

      if (theResult.isOk) {
        expectTypeOf(theResult.value).toEqualTypeOf<
          Branded<'ok'> | Branded<'ok-a'> | Branded<'ok-b'>
        >();
      } else if (theResult.isErr) {
        expectTypeOf(theResult.error).toEqualTypeOf<Branded<'err-a'> | Branded<'err-b'>>();
      }
    });
  });

  test('`value` property', () => {
    const theErr = Result.err('a pity');

    if (theErr.isErr) {
      // @ts-expect-error
      expect(() => theErr.value).toThrow();
    } else {
      expect.fail('Not an Err');
    }
  });

  test('`error` property', () => {
    const theReason = 'phooey';
    const theErr = Result.err(theReason);
    if (theErr.isErr) {
      expect(() => theErr.error).not.toThrow();
      expect(theErr.error).toBe(theReason);
    } else {
      expect.fail('Not an Err');
    }
  });

  test('`unwrapOr` method', () => {
    const theErr = Result.err<number, string>('whatever');
    const theDefault = 0;
    expect(theErr.unwrapOr(theDefault)).toBe(theDefault);
  });

  test('`unwrapOrElse` method', () => {
    const theReason = 'alas';
    const theErr = Result.err<number, string>(theReason);
    expect(theErr.unwrapOrElse(length)).toEqual(length(theReason));
  });

  test('`toString` method', () => {
    const theErrValue = { something: 'sad' };
    const theErr = Result.err(theErrValue);
    expect(theErr.toString()).toEqual(`Err(${theErrValue.toString()})`);
  });

  test('`toJSON` method', () => {
    const theError = 'test';
    const theErr = Result.err(theError);
    expect(theErr.toJSON()).toEqual({ variant: Variant.Err, error: theError });
  });

  test('`equals` method', () => {
    const a = Result.ok('a');
    const b = Result.ok<string, string>('a');
    const c = Result.err<string, string>('err');
    const d = Result.err<string, string>('err');
    expect(b.equals(a)).toBe(true);
    expect(b.equals(c)).toBe(false);
    expect(c.equals(d)).toBe(true);
  });

  test('`ap` method', () => {
    const fn: Result<(val: string) => number, string> = Result.err<(val: string) => number, string>(
      'ERR_THESYSTEMISDOWN'
    );
    const val: Result<string, string> = Result.err('ERR_ALLURBASE');

    const result = fn.ap(val);

    expect(result.toString()).toEqual(`Err("ERR_ALLURBASE")`);
  });
});
