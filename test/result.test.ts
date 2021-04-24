import { expectTypeOf } from 'expect-type';
import Maybe, { just, nothing } from '../src/maybe';
import Result, { Ok, Variant, Err } from '../src/result';
import * as ResultNS from '../src/result';
import Unit from '../src/unit';

const length = (x: { length: number }) => x.length;
const double = (x: number) => x * 2;

describe('`Result` pure functions', () => {
  test('`ok`', () => {
    const theOk = ResultNS.ok(42);
    expect(theOk).toBeInstanceOf(ResultNS.Ok);
    switch (theOk.variant) {
      case ResultNS.Variant.Ok:
        expect(ResultNS.unsafelyUnwrap(theOk)).toBe(42);
        break;
      case ResultNS.Variant.Err:
        expect(false).toBe(true); // because this should never happen
        break;
      default:
        expect(false).toBe(true); // because those are the only cases
    }

    const withUnit = ResultNS.ok();
    expectTypeOf(withUnit).toEqualTypeOf<Result<Unit, unknown>>();
    expect(withUnit).toEqual(ResultNS.ok(Unit));
  });

  test('`err`', () => {
    const reason = 'oh teh noes';
    const theErr = ResultNS.err(reason);
    expect(theErr).toBeInstanceOf(ResultNS.Err);
    switch (theErr.variant) {
      case ResultNS.Variant.Ok:
        expect(true).toBe(false); // because this should never happen
        break;
      case ResultNS.Variant.Err:
        expect(ResultNS.unsafelyUnwrapErr(theErr)).toBe(reason);
        break;
      default:
        expect(false).toBe(true); // because those are the only cases
    }

    const withUnit = ResultNS.err();
    expectTypeOf(withUnit).toEqualTypeOf<Result<unknown, Unit>>();
    expect(withUnit).toEqual(ResultNS.err(Unit));
  });

  test('`tryOr`', () => {
    const message = 'dang';
    const goodOperation = () => 2 + 2;

    expect(ResultNS.tryOr(message, goodOperation)).toEqual(ResultNS.ok(4));
    expect(ResultNS.tryOr(message)(goodOperation)).toEqual(ResultNS.ok(4));

    const badOperation = () => {
      throw new Error('Danger, danger, Will Robinson');
    };

    expect(ResultNS.tryOr(message, badOperation)).toEqual(ResultNS.err(message));
    expect(ResultNS.tryOr(message)(badOperation)).toEqual(ResultNS.err(message));
  });

  test('`tryOrElse`', () => {
    function handleError<E>(e: E): E {
      return e;
    }

    const operation = () => 2 + 2;
    const badOperation = () => {
      throw 'kablooey';
    };

    const res = ResultNS.tryOrElse(handleError, operation);
    expect(res).toBeInstanceOf(ResultNS.Ok);

    const res2 = ResultNS.tryOrElse(handleError, badOperation);
    expect(res2).toBeInstanceOf(ResultNS.Err);
  });

  test('`isOk`', () => {
    const anOk = ResultNS.ok('neat');
    expect(ResultNS.isOk(anOk)).toBe(true);

    const anErr = ResultNS.err('oh no!');
    expect(ResultNS.isOk(anErr)).toBe(false);
  });

  test('`isErr`', () => {
    const anOk = ResultNS.ok('neat');
    expect(ResultNS.isErr(anOk)).toBe(false);

    const anErr = ResultNS.err('oh no!');
    expect(ResultNS.isErr(anErr)).toBe(true);
  });

  test('`map`', () => {
    const theValue = 42;
    const anOk = ResultNS.ok(theValue);
    const doubledOk = ResultNS.ok(double(theValue));
    expect(ResultNS.map(double, anOk)).toEqual(doubledOk);

    const anErr: Result<number, string> = ResultNS.err('some nonsense');
    expect(ResultNS.map(double, anErr)).toEqual(anErr);
  });

  test('`mapOr`', () => {
    const theDefault = 0;

    const theValue = 5;
    const anOk: Result<number, string> = ResultNS.ok(theValue);
    expect(ResultNS.mapOr(theDefault, double, anOk)).toEqual(double(theValue));

    const anErr: Result<number, string> = ResultNS.err('blah');
    expect(ResultNS.mapOr(theDefault, double, anErr)).toEqual(theDefault);

    expect(ResultNS.mapOr<number, number, string>(theDefault)(double)(anOk)).toEqual(
      ResultNS.mapOr(theDefault, double, anOk)
    );
    expect(ResultNS.mapOr(theDefault, double)(anOk)).toEqual(
      ResultNS.mapOr(theDefault, double, anOk)
    );
  });

  test('`mapOrElse`', () => {
    const description = 'that was not good';
    const getDefault = (reason: number) => `${description}: ${reason}`;

    const anOk: Result<number, number> = ResultNS.ok(5);
    expect(ResultNS.mapOrElse(getDefault, String, anOk)).toEqual(String(5));

    const errValue = 10;
    const anErr = ResultNS.err(10);
    expect(ResultNS.mapOrElse(getDefault, String, anErr)).toEqual(`${description}: ${errValue}`);

    expect(ResultNS.mapOrElse(getDefault)(String)(anErr)).toEqual(
      ResultNS.mapOrElse(getDefault, String, anErr)
    );
    expect(ResultNS.mapOrElse(getDefault, String)(anErr)).toEqual(
      ResultNS.mapOrElse(getDefault, String, anErr)
    );
  });

  test('`match`', () => {
    const nobody = ResultNS.ok('ok');
    const toErrIs = ResultNS.err('human');

    expect(
      ResultNS.match(
        {
          Ok: (val) => val,
          Err: (err) => err,
        },
        nobody
      )
    ).toBe('ok');
    expect(
      ResultNS.match(
        {
          Ok: (val) => val,
          Err: (err) => err,
        },
        toErrIs
      )
    ).toBe('human');
  });

  test('`mapErr`', () => {
    const anOk: Result<number, number> = ResultNS.ok(10);
    expect(ResultNS.mapErr(double, anOk)).toEqual(anOk);

    const theErrValue = 20;
    const anErr = ResultNS.err(theErrValue);
    const doubledErr = ResultNS.err(double(theErrValue));
    expect(ResultNS.mapErr(double, anErr)).toEqual(doubledErr);
  });

  test('`and`', () => {
    const nextOk = ResultNS.ok('not a number');
    const nextErr = ResultNS.err('not bueno');

    const anOk = ResultNS.ok(0);
    expect(ResultNS.and(nextOk, anOk)).toEqual(nextOk);
    expect(ResultNS.and(nextErr, anOk)).toEqual(nextErr);

    const anErr = ResultNS.err('potatoes');
    expect(ResultNS.and(nextOk, anErr)).toEqual(anErr);
    expect(ResultNS.and(nextErr, anErr)).toEqual(anErr);
  });

  test('`andThen`', () => {
    const theValue = 'a string';
    const toLengthResult = (s: string) => ResultNS.ok<number, string>(length(s));
    const expected = toLengthResult(theValue);

    const anOk = ResultNS.ok(theValue);
    expect(ResultNS.andThen(toLengthResult, anOk)).toEqual(expected);

    const anErr: Result<string, string> = ResultNS.err('something wrong');
    expect(ResultNS.andThen(toLengthResult, anErr)).toEqual(anErr);
  });

  test('`or`', () => {
    const orOk: Result<number, string> = ResultNS.ok(0);
    const orErr: Result<number, string> = ResultNS.err('something boring');

    type Err = { [key: string]: string };

    const anOk: Result<number, Err> = ResultNS.ok(42);
    expect(ResultNS.or(orOk, anOk)).toEqual(anOk);
    expect(ResultNS.or(orErr, anOk)).toEqual(anOk);

    const anErr: Result<number, Err> = ResultNS.err({ oh: 'my' });
    expect(ResultNS.or(orOk, anErr)).toEqual(orOk);
    expect(ResultNS.or(orErr, anErr)).toEqual(orErr);
  });

  test('`orElse`', () => {
    const orElseOk: Result<number, string> = ResultNS.ok(1);
    const getAnOk = () => orElseOk;

    const orElseErr: Result<number, string> = ResultNS.err('oh my');
    const getAnErr = () => orElseErr;

    const anOk: Result<number, string> = ResultNS.ok(0);
    expect(ResultNS.orElse(getAnOk, anOk)).toEqual(anOk);
    expect(ResultNS.orElse(getAnErr, anOk)).toEqual(anOk);

    const anErr: Result<number, string> = ResultNS.err('boom');
    expect(ResultNS.orElse(getAnOk, anErr)).toEqual(orElseOk);
    expect(ResultNS.orElse(getAnErr, anErr)).toEqual(orElseErr);
  });

  test('`unsafelyUnwrap`', () => {
    const theValue = 'hooray';
    const anOk = ResultNS.ok(theValue);
    expect(() => ResultNS.unsafelyUnwrap(anOk)).not.toThrow();
    expect(ResultNS.unsafelyUnwrap(anOk)).toBe(theValue);

    const theErrValue = 'oh no';
    const anErr = ResultNS.err(theErrValue);
    expect(() => ResultNS.unsafelyUnwrap(anErr)).toThrow();
  });

  test('`unsafelyUnwrapErr`', () => {
    const theValue = 'hooray';
    const anOk = ResultNS.ok(theValue);
    expect(() => ResultNS.unsafelyUnwrapErr(anOk)).toThrow();

    const theErrValue = 'oh no';
    const anErr = ResultNS.err(theErrValue);
    expect(() => ResultNS.unsafelyUnwrapErr(anErr)).not.toThrow();
    expect(ResultNS.unsafelyUnwrapErr(anErr)).toBe(theErrValue);
  });

  test('`unwrapOr`', () => {
    const defaultValue = 'pancakes are awesome';

    const theValue = 'waffles are tasty';
    const anOk = ResultNS.ok(theValue);
    expect(ResultNS.unwrapOr(defaultValue, anOk)).toBe(theValue);

    const anErr = ResultNS.err('pumpkins are not');
    expect(ResultNS.unwrapOr(defaultValue, anErr)).toBe(defaultValue);
    // make sure you can unwrap to a different type, like undefined
    expectTypeOf(anOk).toEqualTypeOf<Result<string, unknown>>();
    const anOkOrUndefined = ResultNS.unwrapOr(undefined, anOk);
    expectTypeOf(anOkOrUndefined).toEqualTypeOf<string | undefined>();
    expect(anOkOrUndefined).toEqual(theValue);
    // test the err variant too, though in this case it's not actually a
    // different type because unknown ≡ unknown | undefined
    expectTypeOf(anErr).toEqualTypeOf<Result<unknown, string>>();
    const anErrOrUndefined = ResultNS.unwrapOr(undefined, anErr);
    expectTypeOf(anErrOrUndefined).toEqualTypeOf<unknown>(); // unknown ≡ unknown | undefined
    expect(anErrOrUndefined).toEqual(undefined);
  });

  test('`unwrapOrElse`', () => {
    type LocalError = { reason: string };

    const errToOk = (e: LocalError) => `What went wrong? ${e.reason}`;

    const theValue = 'Red 5';
    const anOk = ResultNS.ok<string, LocalError>(theValue);
    expect(ResultNS.unwrapOrElse(errToOk, anOk)).toBe(theValue);

    const theErrValue = { reason: 'bad thing' };
    const anErr = ResultNS.err<string, LocalError>(theErrValue);
    expect(ResultNS.unwrapOrElse(errToOk, anErr)).toBe(errToOk(theErrValue));

    // test unwrapping to undefined
    const noop = (): undefined => undefined;

    const anOkOrUndefined = ResultNS.unwrapOrElse(noop, anOk);
    expectTypeOf(anOkOrUndefined).toEqualTypeOf<string | undefined>();
    expect(anOkOrUndefined).toEqual(theValue);

    const anErrOrUndefined = ResultNS.unwrapOrElse(noop, anErr);
    expectTypeOf(anErrOrUndefined).toEqualTypeOf<string | undefined>();
    expect(anErrOrUndefined).toEqual(undefined);
  });

  test('`toMaybe`', () => {
    const theValue = 'huzzah';
    const anOk = ResultNS.ok(theValue);
    expect(ResultNS.toMaybe(anOk)).toEqual(just(theValue));

    const anErr = ResultNS.err('uh uh');
    expect(ResultNS.toMaybe(anErr)).toEqual(nothing());
  });

  test('fromMaybe', () => {
    const theValue = 'something';
    const errValue = 'what happened?';

    const aJust = just(theValue);
    const anOk = ResultNS.ok(theValue);
    expect(ResultNS.fromMaybe(errValue, aJust)).toEqual(anOk);

    const aNothing = nothing();
    const anErr = ResultNS.err(errValue);
    expect(ResultNS.fromMaybe(errValue, aNothing)).toEqual(anErr);
  });

  test('toString', () => {
    const theValue = { thisIsReally: 'something' };
    const errValue = ['oh', 'no'];

    const anOk = ResultNS.ok<typeof theValue, typeof errValue>(theValue);
    expect(ResultNS.toString(anOk)).toEqual(`Ok(${theValue.toString()})`);

    const anErr = ResultNS.err<typeof theValue, typeof errValue>(errValue);
    expect(ResultNS.toString(anErr)).toEqual(`Err(${errValue.toString()})`);
  });

  test('`toJSON`', () => {
    const theValue = { thisIsReally: 'something', b: null };
    const anOk = ResultNS.ok(theValue);
    expect(ResultNS.toJSON(anOk)).toEqual({ variant: ResultNS.Variant.Ok, value: theValue });

    const errValue = ['oh', 'no', null];
    const anErr = ResultNS.err(errValue);
    expect(ResultNS.toJSON(anErr)).toEqual({ variant: ResultNS.Variant.Err, error: errValue });
  });

  test('`toJSON` through serialization', () => {
    const actualSerializedOk = JSON.stringify(ResultNS.ok(42));
    const actualSerializedErr = JSON.stringify(ResultNS.err({ someInfo: 'error' }));
    const actualSerializedUnitErr = JSON.stringify(ResultNS.err(null));
    const expectedSerializedOk = JSON.stringify({ variant: ResultNS.Variant.Ok, value: 42 });
    const expectedSerializedErr = JSON.stringify({
      variant: ResultNS.Variant.Err,
      error: { someInfo: 'error' },
    });
    const expectedSerializedUnitErr = JSON.stringify({
      variant: ResultNS.Variant.Err,
      error: Unit,
    });

    expect(actualSerializedOk).toEqual(expectedSerializedOk);
    expect(actualSerializedErr).toEqual(expectedSerializedErr);
    expect(actualSerializedUnitErr).toEqual(expectedSerializedUnitErr);
  });

  test('`equals`', () => {
    const a = ResultNS.ok<string, string>('a');
    const b = ResultNS.ok<string, string>('a');
    const c = ResultNS.err<string, string>('error');
    const d = ResultNS.err<string, string>('error');
    expect(ResultNS.equals(b, a)).toBe(true);
    expect(ResultNS.equals(b)(a)).toBe(true);
    expect(ResultNS.equals(c, b)).toBe(false);
    expect(ResultNS.equals(c)(b)).toBe(false);
    expect(ResultNS.equals(d, c)).toBe(true);
    expect(ResultNS.equals(d)(c)).toBe(true);
  });

  test('`ap`', () => {
    const add = (a: number) => (b: number) => a + b;
    const okAdd = ResultNS.ok<typeof add, string>(add);

    expect(okAdd.ap(ResultNS.ok(2)).ap(ResultNS.ok(3))).toEqual(ResultNS.ok(5));

    const add3 = add(3);
    const okAdd3 = ResultNS.ok<typeof add3, string>(add(3));

    expect(ResultNS.ap(okAdd3, ResultNS.ok(2))).toEqual(ResultNS.ok(5));
  });

  test('isInstance', () => {
    const ok: unknown = ResultNS.ok('yay');
    expect(ResultNS.isInstance(ok)).toBe(true);

    const err: unknown = ResultNS.err('oh no');
    expect(ResultNS.isInstance(err)).toBe(true);

    const nada: unknown = null;
    expect(ResultNS.isInstance(nada)).toBe(false);

    const obj: unknown = { random: 'nonsense' };
    expect(ResultNS.isInstance(obj)).toBe(false);
  });

  describe('transpose', () => {
    test('Ok(Just(T))', () => {
      let result = ResultNS.ok<Maybe<number>, string>(just(12));
      let transposed = ResultNS.transpose(result);
      expect(transposed).toStrictEqual(just(ResultNS.ok(12)));
      expectTypeOf(transposed).toEqualTypeOf<Maybe<Result<number, string>>>();
    });

    test('Ok(Nothing)', () => {
      let result = ResultNS.ok<Maybe<number>, string>(nothing<number>());
      let transposed = ResultNS.transpose(result);
      expect(transposed).toStrictEqual(nothing());
      expectTypeOf(transposed).toEqualTypeOf<Maybe<Result<number, string>>>();
    });

    test('Err(E)', () => {
      let result = ResultNS.err<Maybe<number>, string>('hello');
      let transposed = ResultNS.transpose(result);
      expect(transposed).toStrictEqual(just(ResultNS.err('hello')));
      expectTypeOf(transposed).toEqualTypeOf<Maybe<Result<number, string>>>();
    });
  });
});

// We aren't even really concerned with the "runtime" behavior here, which we
// know to be correct from other tests. Instead, this test just checks whether
// the types are narrowed as they should be.
test('narrowing', () => {
  const oneOk = ResultNS.ok();
  if (oneOk.isOk()) {
    expectTypeOf(oneOk).toEqualTypeOf<Ok<Unit, unknown>>();
    expect(oneOk.value).toBeDefined();
  }

  const anotherOk = ResultNS.ok();
  if (anotherOk.variant === Variant.Ok) {
    expectTypeOf(anotherOk).toEqualTypeOf<Ok<Unit, unknown>>();
    expect(anotherOk.value).toBeDefined();
  }

  const oneErr = ResultNS.err();
  if (oneErr.isErr()) {
    expectTypeOf(oneErr).toEqualTypeOf<Err<unknown, Unit>>();
    expect(oneErr.error).toBeDefined();
  }

  const anotherErr = ResultNS.err();
  if (anotherErr.variant === Variant.Err) {
    expectTypeOf(anotherErr).toEqualTypeOf<Err<unknown, Unit>>();
    expect(anotherErr.error).toBeDefined();
  }

  expect('this type checked, hooray').toBeTruthy();
});

describe('`ResultNS.Ok` class', () => {
  test('constructor', () => {
    const fullyQualifiedOk = new ResultNS.Ok<number, string>(42);
    expectTypeOf(fullyQualifiedOk).toMatchTypeOf<Result<number, string>>();

    const unqualifiedOk = new ResultNS.Ok('string');
    expectTypeOf(unqualifiedOk).toMatchTypeOf<Result<string, unknown>>();

    expect(() => new ResultNS.Ok(null)).toThrow();
    expect(() => new ResultNS.Ok(undefined)).toThrow();
  });

  test('`value` property', () => {
    const okValue = 'yay';
    const theOk = new ResultNS.Ok(okValue);
    expect(theOk.value).toEqual(okValue);
  });

  test('`unwrap` static method', () => {
    const okValue = 12;
    const theOk = new ResultNS.Ok(okValue);
    expect(Ok.unwrap(theOk)).toEqual(okValue);
  });

  test('`isOk` method', () => {
    const theOk = new ResultNS.Ok({});
    expect(theOk.isOk()).toBe(true);
  });

  test('`isErr` method', () => {
    const theOk = new ResultNS.Ok([]);
    expect(theOk.isErr()).toBe(false);
  });

  test('`map` method', () => {
    const theValue = 10;
    const theOk = new ResultNS.Ok(theValue);
    const okDoubled = new ResultNS.Ok(double(theValue));
    expect(theOk.map(double)).toEqual(okDoubled);
  });

  test('`mapOr` method', () => {
    const theValue = 'neat';
    const theOk = new ResultNS.Ok(theValue);
    const defaultValue = 0;
    expect(theOk.mapOr(defaultValue, length)).toEqual(length(theValue));
  });

  test('`mapOrElse` method', () => {
    const theValue = ['some', 'things'];
    const theOk: Result<string[], string> = new ResultNS.Ok(theValue);
    const getDefault = (reason: string) => `reason being, ${reason}`;
    const join = (strings: string[]) => strings.join(', ');
    expect(theOk.mapOrElse(getDefault, join)).toEqual(join(theValue));
  });

  test('`match` method', () => {
    const theValue = 'ok';
    const nobody = new ResultNS.Ok(theValue);

    expect(
      nobody.match({
        Ok: (val) => val,
        Err: (err) => err,
      })
    ).toBe('ok');
  });

  test('`mapErr` method', () => {
    const theOk: Result<string, string> = new ResultNS.Ok('hey!');
    const toMoreVerboseErr = (s: string) => `Seriously, ${s} was bad.`;
    expect(theOk.mapErr(toMoreVerboseErr)).toEqual(theOk);
  });

  test('`and` method', () => {
    const theOk = new ResultNS.Ok(100);

    const anotherOk = new ResultNS.Ok({ not: 'a number' });
    expect(theOk.and(anotherOk)).toBe(anotherOk);

    const anErr = new ResultNS.Err(['yikes', 'bad']);
    expect(theOk.and(anErr)).toBe(anErr);
  });

  test('`andThen` method', () => {
    const theValue = 'anything will do';
    const theOk = new ResultNS.Ok(theValue);
    const lengthResult = (s: string) => new ResultNS.Ok(s.length);
    expect(theOk.andThen(lengthResult)).toEqual(lengthResult(theValue));

    const convertToErr = (s: string) => new ResultNS.Err(s.length);
    expect(theOk.andThen(convertToErr)).toEqual(convertToErr(theValue));
  });

  test('`or` method', () => {
    const theValue = 100;
    const theOk = new ResultNS.Ok<number, string>(theValue);
    const anotherOk = new ResultNS.Ok(42);
    expect(theOk.or(anotherOk)).toEqual(theOk);

    const anErr = new ResultNS.Err<number, string>('something wrong');
    expect(theOk.or(anErr)).toEqual(theOk);
  });

  test('`orElse` method', () => {
    const theValue = 1;
    const theOk = new ResultNS.Ok(theValue);
    const theDefault: string[] = [];
    const getTheDefault = () => new ResultNS.Err<number, string[]>(theDefault);
    expect(theOk.orElse(getTheDefault)).toEqual(theOk);
  });

  test('`unsafelyUnwrap` method', () => {
    const theValue = 42;
    const theOk = new ResultNS.Ok(theValue);
    expect(() => theOk.unsafelyUnwrap()).not.toThrow();
    expect(theOk.unsafelyUnwrap()).toEqual(theValue);
  });

  test('`unsafelyUnwrapErr` method', () => {
    const theOk = new ResultNS.Ok('anything');
    expect(() => theOk.unsafelyUnwrapErr()).toThrow();
  });

  test('`unwrapOr` method', () => {
    const theValue = [1, 2, 3];
    const theOk = new ResultNS.Ok(theValue);
    const defaultValue: typeof theValue = [];

    expect(theOk.unwrapOr(defaultValue)).toBe(theValue);
  });

  test('`unwrapOrElse` method', () => {
    const theValue = [1, 2, 3];
    const theOk = new ResultNS.Ok(theValue);
    const defaultValue: typeof theValue = [];
    const getDefault = () => defaultValue;

    expect(theOk.unwrapOrElse(getDefault)).toBe(theValue);
  });

  test('`toMaybe` method', () => {
    const theValue = { something: 'fun' };
    const theOk = new ResultNS.Ok(theValue);
    expect(theOk.toMaybe()).toEqual(just(theValue));
  });

  test('`toString` method', () => {
    const theValue = 42;
    const theOk = new ResultNS.Ok(theValue);
    expect(theOk.toString()).toEqual(`Ok(${theValue.toString()})`);
  });

  test('`toJSON` method', () => {
    const theValue = 42;
    const theOk = new ResultNS.Ok(theValue);
    expect(theOk.toJSON()).toEqual({ variant: ResultNS.Variant.Ok, value: theValue });
  });

  test('`ap` method', () => {
    const fn = new ResultNS.Ok<(val: string) => number, string>((str) => str.length);
    const val = new ResultNS.Ok<string, string>('three');

    const result = fn.ap(val);

    expect(result.toString()).toEqual(`Ok(5)`);
  });
});

describe('`ResultNS.Err` class', () => {
  test('constructor', () => {
    const fullyQualifiedErr = new ResultNS.Err<string, number>(42);
    expectTypeOf(fullyQualifiedErr).toMatchTypeOf<Result<string, number>>();

    const unqualifiedErr = new ResultNS.Err('string');
    expectTypeOf(unqualifiedErr).toMatchTypeOf<Result<unknown, string>>();

    expect(() => new ResultNS.Err(null)).toThrow();
    expect(() => new ResultNS.Err(undefined)).toThrow();
  });

  test('`error` property', () => {
    const errValue = 'boo';
    const theErr = new ResultNS.Err(errValue);
    expect(theErr.error).toBe(errValue);
  });

  test('`unwrap` static method', () => {
    const errValue = 12;
    const theErr = new ResultNS.Err(errValue);
    expect(Err.unwrapErr(theErr)).toEqual(errValue);
  });

  test('`isOk` method', () => {
    const theErr = new ResultNS.Err('oh my!');
    expect(theErr.isOk()).toBe(false);
  });

  test('`isErr` method', () => {
    const theErr = new ResultNS.Err('oh my!');
    expect(theErr.isErr()).toBe(true);
  });

  test('`map` method', () => {
    const errValue = '1 billion things wrong';
    const theErr = new ResultNS.Err<number, string>(errValue);
    expect(theErr.map((n) => n + 2)).toEqual(theErr);
  });

  test('`mapOr` method', () => {
    const errValue: number = 42;
    const theErr: Result<number, number> = new ResultNS.Err(errValue);
    const theDefault = 'victory!';
    const describe = (code: number) => `The error code was ${code}`;

    expect(theErr.mapOr(theDefault, describe)).toEqual(theDefault);
  });

  test('`mapOrElse` method', () => {
    const errValue: number = 42;
    const theErr: Result<number, number> = new ResultNS.Err(errValue);
    const getDefault = (valueFromErr: typeof errValue) => `whoa: ${valueFromErr}`;
    const describe = (code: number) => `The error code was ${code}`;

    expect(theErr.mapOrElse(getDefault, describe)).toEqual(`whoa: ${errValue}`);
  });

  test('`match` method', () => {
    const human = 'human';
    const toErrIs = new ResultNS.Err(human);

    expect(
      toErrIs.match({
        Ok: (val) => val,
        Err: (err) => err,
      })
    ).toBe(human);
  });

  test('`mapErr` method', () => {
    const errValue: string = 'fubar';
    const theErr = new ResultNS.Err(errValue);
    const elaborate = (reason: typeof errValue) => `The problem was: ${reason}`;
    const expected = new ResultNS.Err(elaborate(errValue));

    expect(theErr.mapErr(elaborate)).toEqual(expected);
  });

  test('`and` method', () => {
    const theErr = new ResultNS.Err('blarg');

    const anOk = ResultNS.ok<string, string>('neat');
    expect(theErr.and(anOk)).toEqual(theErr);

    const anotherErr = ResultNS.err('oh no');
    expect(theErr.and(anotherErr)).toEqual(theErr);
  });

  test('`andThen` method', () => {
    const theErr = new ResultNS.Err<string[], number>(42);

    const getAnOk = (strings: string[]) => ResultNS.ok<number, number>(length(strings));
    expect(theErr.andThen(getAnOk)).toEqual(theErr);

    const getAnErr = (_: unknown) => ResultNS.err(0);
    expect(theErr.andThen(getAnErr)).toEqual(theErr);
  });

  test('`or` method', () => {
    const theErr: Result<number, string> = new ResultNS.Err('a shame');
    const anOk: Result<number, string> = ResultNS.ok(42);
    expect(theErr.or(anOk)).toBe(anOk);

    const anotherErr = ResultNS.err<number, number>(10);
    expect(theErr.or(anotherErr)).toBe(anotherErr);
  });

  test('`orElse` method', () => {
    const theErr = new ResultNS.Err<string, string>('what sorrow');
    const theOk = ResultNS.ok<string, string>('neat!');
    const getOk = () => theOk;
    expect(theErr.orElse(getOk)).toBe(theOk);

    const anotherErr = ResultNS.err<string, string>('even worse');
    const getAnotherErr = () => anotherErr;
    expect(theErr.orElse(getAnotherErr)).toBe(anotherErr);
  });

  test('`unsafelyUnwrap` method', () => {
    const theErr = new ResultNS.Err('a pity');
    expect(() => theErr.unsafelyUnwrap()).toThrow();
  });

  test('`unsafelyUnwrapErr` method', () => {
    const theReason = 'phooey';
    const theErr = new ResultNS.Err(theReason);
    expect(() => theErr.unsafelyUnwrapErr()).not.toThrow();
    expect(theErr.unsafelyUnwrapErr()).toBe(theReason);
  });

  test('`unwrapOr` method', () => {
    const theErr = new ResultNS.Err<number, string>('whatever');
    const theDefault = 0;
    expect(theErr.unwrapOr(theDefault)).toBe(theDefault);
  });

  test('`unwrapOrElse` method', () => {
    const theReason = 'alas';
    const theErr = new ResultNS.Err<number, string>(theReason);
    expect(theErr.unwrapOrElse(length)).toEqual(length(theReason));
  });

  test('`toMaybe` method', () => {
    const theErr = new ResultNS.Err('so sad');
    expect(theErr.toMaybe()).toEqual(nothing());
  });

  test('`toString` method', () => {
    const theErrValue = { something: 'sad' };
    const theErr = new ResultNS.Err(theErrValue);
    expect(theErr.toString()).toEqual(`Err(${theErrValue.toString()})`);
  });

  test('`toJSON` method', () => {
    const theError = 'test';
    const theErr = new ResultNS.Err(theError);
    expect(theErr.toJSON()).toEqual({ variant: ResultNS.Variant.Err, error: theError });
  });

  test('`equals` method', () => {
    const a = new ResultNS.Ok('a');
    const b = new ResultNS.Ok<string, string>('a');
    const c = new ResultNS.Err<string, string>('err');
    const d = new ResultNS.Err<string, string>('err');
    expect(a.equals(b)).toBe(true);
    expect(b.equals(c)).toBe(false);
    expect(c.equals(d)).toBe(true);
  });

  test('`ap` method', () => {
    const fn: Result<(val: string) => number, string> = new ResultNS.Err<
      (val: string) => number,
      string
    >('ERR_THESYSTEMISDOWN');
    const val: Result<string, string> = new ResultNS.Err('ERR_ALLURBASE');

    const result = fn.ap(val);

    expect(result.toString()).toEqual(`Err(ERR_ALLURBASE)`);
  });
});
