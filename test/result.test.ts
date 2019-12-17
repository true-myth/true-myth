import { just, nothing } from '../src/maybe';
import Result, { Ok, Variant, Err } from '../src/result';
import Unit from '../src/unit';
import { AndThenAliases } from '../src/utils';
import { assertType } from './lib/assert';

const length = (x: { length: number }) => x.length;
const double = (x: number) => x * 2;

describe('`Result` pure functions', () => {
  test('`ok`', () => {
    const theOk = Result.ok(42);
    expect(theOk).toBeInstanceOf(Result.Ok);
    switch (theOk.variant) {
      case Result.Variant.Ok:
        expect(Result.unsafelyUnwrap(theOk)).toBe(42);
        break;
      case Result.Variant.Err:
        expect(false).toBe(true); // because this should never happen
        break;
      default:
        expect(false).toBe(true); // because those are the only cases
    }

    const withUnit = Result.ok();
    assertType<Result<Unit, {}>>(withUnit);
    expect(withUnit).toEqual(Result.ok(Unit));
  });

  test('`err`', () => {
    const reason = 'oh teh noes';
    const theErr = Result.err(reason);
    expect(theErr).toBeInstanceOf(Result.Err);
    switch (theErr.variant) {
      case Result.Variant.Ok:
        expect(true).toBe(false); // because this should never happen
        break;
      case Result.Variant.Err:
        expect(Result.unsafelyUnwrapErr(theErr)).toBe(reason);
        break;
      default:
        expect(false).toBe(true); // because those are the only cases
    }

    const withUnit = Result.err();
    assertType<Result<{}, Unit>>(withUnit);
    expect(withUnit).toEqual(Result.err(Unit));
  });

  test('`tryOr`', () => {
    const message = 'dang';
    const goodOperation = () => 2 + 2;

    expect(Result.tryOr(message, goodOperation)).toEqual(Result.ok(4));
    expect(Result.tryOr(message)(goodOperation)).toEqual(Result.ok(4));

    const badOperation = () => {
      throw new Error('Danger, danger, Will Robinson');
    };

    expect(Result.tryOr(message, badOperation)).toEqual(Result.err(message));
    expect(Result.tryOr(message)(badOperation)).toEqual(Result.err(message));
  });

  test('`tryOrElse`', () => {
    function handleError<E>(e: E): E {
      return e;
    }

    const operation = () => 2 + 2;
    const badOperation = () => {
      throw 'kablooey';
    };

    const res = Result.tryOrElse(handleError, operation);
    expect(res).toBeInstanceOf(Result.Ok);

    const res2 = Result.tryOrElse(handleError, badOperation);
    expect(res2).toBeInstanceOf(Result.Err);
  });

  test('`isOk`', () => {
    const anOk = Result.ok('neat');
    expect(Result.isOk(anOk)).toBe(true);

    const anErr = Result.err('oh no!');
    expect(Result.isOk(anErr)).toBe(false);
  });

  test('`isErr`', () => {
    const anOk = Result.ok('neat');
    expect(Result.isErr(anOk)).toBe(false);

    const anErr = Result.err('oh no!');
    expect(Result.isErr(anErr)).toBe(true);
  });

  test('`map`', () => {
    const theValue = 42;
    const anOk = Result.ok(theValue);
    const doubledOk = Result.ok(double(theValue));
    expect(Result.map(double, anOk)).toEqual(doubledOk);

    const anErr: Result<number, string> = Result.err('some nonsense');
    expect(Result.map(double, anErr)).toEqual(anErr);
  });

  test('`mapOr`', () => {
    const theDefault = 0;

    const theValue = 5;
    const anOk: Result<number, string> = Result.ok(theValue);
    expect(Result.mapOr(theDefault, double, anOk)).toEqual(double(theValue));

    const anErr: Result<number, string> = Result.err('blah');
    expect(Result.mapOr(theDefault, double, anErr)).toEqual(theDefault);

    expect(Result.mapOr<number, number, string>(theDefault)(double)(anOk)).toEqual(
      Result.mapOr(theDefault, double, anOk)
    );
    expect(Result.mapOr(theDefault, double)(anOk)).toEqual(Result.mapOr(theDefault, double, anOk));
  });

  test('`mapOrElse`', () => {
    const description = 'that was not good';
    const getDefault = (reason: number) => `${description}: ${reason}`;

    const anOk: Result<number, number> = Result.ok(5);
    expect(Result.mapOrElse(getDefault, String, anOk)).toEqual(String(5));

    const errValue = 10;
    const anErr = Result.err(10);
    expect(Result.mapOrElse(getDefault, String, anErr)).toEqual(`${description}: ${errValue}`);

    expect(Result.mapOrElse(getDefault)(String)(anErr)).toEqual(
      Result.mapOrElse(getDefault, String, anErr)
    );
    expect(Result.mapOrElse(getDefault, String)(anErr)).toEqual(
      Result.mapOrElse(getDefault, String, anErr)
    );
  });

  test('`match`', () => {
    const nobody = Result.ok('ok');
    const toErrIs = Result.err('human');

    expect(
      Result.match(
        {
          Ok: val => val,
          Err: err => err,
        },
        nobody
      )
    ).toBe('ok');
    expect(
      Result.match(
        {
          Ok: val => val,
          Err: err => err,
        },
        toErrIs
      )
    ).toBe('human');
  });

  test('`mapErr`', () => {
    const anOk: Result<number, number> = Result.ok(10);
    expect(Result.mapErr(double, anOk)).toEqual(anOk);

    const theErrValue = 20;
    const anErr = Result.err(theErrValue);
    const doubledErr = Result.err(double(theErrValue));
    expect(Result.mapErr(double, anErr)).toEqual(doubledErr);
  });

  test('`and`', () => {
    const nextOk = Result.ok('not a number');
    const nextErr = Result.err('not bueno');

    const anOk = Result.ok(0);
    expect(Result.and(nextOk, anOk)).toEqual(nextOk);
    expect(Result.and(nextErr, anOk)).toEqual(nextErr);

    const anErr = Result.err('potatoes');
    expect(Result.and(nextOk, anErr)).toEqual(anErr);
    expect(Result.and(nextErr, anErr)).toEqual(anErr);
  });

  const andThenTest = (fn: AndThenAliases) => () => {
    const theValue = 'a string';
    const toLengthResult = (s: string) => Result.ok<number, string>(length(s));
    const expected = toLengthResult(theValue);

    const anOk = Result.ok(theValue);
    expect(Result[fn](toLengthResult, anOk)).toEqual(expected);

    const anErr: Result<string, string> = Result.err('something wrong');
    expect(Result[fn](toLengthResult, anErr)).toEqual(anErr);
  };

  test('`andThen`', andThenTest('andThen'));
  test('`chain`', andThenTest('chain'));
  test('flatMap', andThenTest('flatMap'));

  test('`or`', () => {
    const orOk: Result<number, string> = Result.ok(0);
    const orErr: Result<number, string> = Result.err('something boring');

    type Err = { [key: string]: string };

    const anOk: Result<number, Err> = Result.ok(42);
    expect(Result.or(orOk, anOk)).toEqual(anOk);
    expect(Result.or(orErr, anOk)).toEqual(anOk);

    const anErr: Result<number, Err> = Result.err({ oh: 'my' });
    expect(Result.or(orOk, anErr)).toEqual(orOk);
    expect(Result.or(orErr, anErr)).toEqual(orErr);
  });

  test('`orElse`', () => {
    const orElseOk: Result<number, string> = Result.ok(1);
    const getAnOk = () => orElseOk;

    const orElseErr: Result<number, string> = Result.err('oh my');
    const getAnErr = () => orElseErr;

    const anOk: Result<number, string> = Result.ok(0);
    expect(Result.orElse(getAnOk, anOk)).toEqual(anOk);
    expect(Result.orElse(getAnErr, anOk)).toEqual(anOk);

    const anErr: Result<number, string> = Result.err('boom');
    expect(Result.orElse(getAnOk, anErr)).toEqual(orElseOk);
    expect(Result.orElse(getAnErr, anErr)).toEqual(orElseErr);
  });

  test('`unsafelyUnwrap`', () => {
    const theValue = 'hooray';
    const anOk = Result.ok(theValue);
    expect(() => Result.unsafelyUnwrap(anOk)).not.toThrow();
    expect(Result.unsafelyUnwrap(anOk)).toBe(theValue);

    const theErrValue = 'oh no';
    const anErr = Result.err(theErrValue);
    expect(() => Result.unsafelyUnwrap(anErr)).toThrow();
  });

  test('`unsafelyUnwrapErr`', () => {
    const theValue = 'hooray';
    const anOk = Result.ok(theValue);
    expect(() => Result.unsafelyUnwrapErr(anOk)).toThrow();

    const theErrValue = 'oh no';
    const anErr = Result.err(theErrValue);
    expect(() => Result.unsafelyUnwrapErr(anErr)).not.toThrow();
    expect(Result.unsafelyUnwrapErr(anErr)).toBe(theErrValue);
  });

  test('`unwrapOr`', () => {
    const defaultValue = 'pancakes are awesome';

    const theValue = 'waffles are tasty';
    const anOk = Result.ok(theValue);
    expect(Result.unwrapOr(defaultValue, anOk)).toBe(theValue);

    const anErr = Result.err('pumpkins are not');
    expect(Result.unwrapOr(defaultValue, anErr)).toBe(defaultValue);
  });

  test('`unwrapOrElse`', () => {
    type LocalError = { reason: string };

    const errToOk = (e: LocalError) => `What went wrong? ${e.reason}`;

    const theValue = 'Red 5';
    const anOk = Result.ok<string, LocalError>(theValue);
    expect(Result.unwrapOrElse(errToOk, anOk)).toBe(theValue);

    const theErrValue = { reason: 'bad thing' };
    const anErr = Result.err<string, LocalError>(theErrValue);
    expect(Result.unwrapOrElse(errToOk, anErr)).toBe(errToOk(theErrValue));
  });

  test('`toMaybe`', () => {
    const theValue = 'huzzah';
    const anOk = Result.ok(theValue);
    expect(Result.toMaybe(anOk)).toEqual(just(theValue));

    const anErr = Result.err('uh uh');
    expect(Result.toMaybe(anErr)).toEqual(nothing());
  });

  test('fromMaybe', () => {
    const theValue = 'something';
    const errValue = 'what happened?';

    const aJust = just(theValue);
    const anOk = Result.ok(theValue);
    expect(Result.fromMaybe(errValue, aJust)).toEqual(anOk);

    const aNothing = nothing();
    const anErr = Result.err(errValue);
    expect(Result.fromMaybe(errValue, aNothing)).toEqual(anErr);
  });

  test('toString', () => {
    const theValue = { thisIsReally: 'something' };
    const anOk = Result.ok(theValue);
    expect(Result.toString(anOk)).toEqual(`Ok(${theValue.toString()})`);

    const errValue = ['oh', 'no'];
    const anErr = Result.err(errValue);
    expect(Result.toString(anErr)).toEqual(`Err(${errValue.toString()})`);
  });

  test('`toJSON`', () => {
    const theValue = { thisIsReally: 'something', b: null };
    const anOk = Result.ok(theValue);
    expect(Result.toJSON(anOk)).toEqual({ variant: Result.Variant.Ok, value: theValue });

    const errValue = ['oh', 'no', null];
    const anErr = Result.err(errValue);
    expect(Result.toJSON(anErr)).toEqual({ variant: Result.Variant.Err, error: errValue });
  });

  test('`toJSON` through serialization', () => {
    const actualSerializedOk = JSON.stringify(Result.ok(42));
    const actualSerializedErr = JSON.stringify(Result.err({ someInfo: 'error' }));
    const actualSerializedUnitErr = JSON.stringify(Result.err(null));
    const expectedSerializedOk = JSON.stringify({ variant: Result.Variant.Ok, value: 42 });
    const expectedSerializedErr = JSON.stringify({
      variant: Result.Variant.Err,
      error: { someInfo: 'error' },
    });
    const expectedSerializedUnitErr = JSON.stringify({ variant: Result.Variant.Err, error: Unit });

    expect(actualSerializedOk).toEqual(expectedSerializedOk);
    expect(actualSerializedErr).toEqual(expectedSerializedErr);
    expect(actualSerializedUnitErr).toEqual(expectedSerializedUnitErr);
  });

  test('`equals`', () => {
    const a = Result.ok<string, string>('a');
    const b = Result.ok<string, string>('a');
    const c = Result.err<string, string>('error');
    const d = Result.err<string, string>('error');
    expect(Result.equals(b, a)).toBe(true);
    expect(Result.equals(b)(a)).toBe(true);
    expect(Result.equals(c, b)).toBe(false);
    expect(Result.equals(c)(b)).toBe(false);
    expect(Result.equals(d, c)).toBe(true);
    expect(Result.equals(d)(c)).toBe(true);
  });

  test('`ap`', () => {
    const add = (a: number) => (b: number) => a + b;
    const okAdd = Result.ok<typeof add, string>(add);

    expect(okAdd.ap(Result.ok(2)).ap(Result.ok(3))).toEqual(Result.ok(5));

    const add3 = add(3);
    const okAdd3 = Result.ok<typeof add3, string>(add(3));

    expect(Result.ap(okAdd3, Result.ok(2))).toEqual(Result.ok(5));
  });

  test('isInstance', () => {
    const ok: any = Result.ok('yay');
    expect(Result.isInstance(ok)).toBe(true);

    const err: any = Result.err('oh no');
    expect(Result.isInstance(err)).toBe(true);

    const nada: any = null;
    expect(Result.isInstance(nada)).toBe(false);

    const obj: any = { random: 'nonsense' };
    expect(Result.isInstance(obj)).toBe(false);
  });
});

// We aren't even really concerned with the "runtime" behavior here, which we
// know to be correct from other tests. Instead, this test just checks whether
// the types are narrowed as they should be.
test('narrowing', () => {
  const oneOk = Result.ok();
  if (oneOk.isOk()) {
    assertType<Ok<Unit, any>>(oneOk);
    expect(oneOk.value).toBeDefined();
  }

  const anotherOk = Result.ok();
  if (anotherOk.variant === Variant.Ok) {
    assertType<Ok<Unit, any>>(anotherOk);
    expect(anotherOk.value).toBeDefined();
  }

  const oneErr = Result.err();
  if (oneErr.isErr()) {
    assertType<Err<any, Unit>>(oneErr);
    expect(oneErr.error).toBeDefined();
  }

  const anotherErr = Result.err();
  if (anotherErr.variant === Variant.Err) {
    assertType<Err<any, Unit>>(anotherErr);
    expect(anotherErr.error).toBeDefined();
  }

  expect('this type checked, hooray').toBeTruthy();
});

describe('`Result.Ok` class', () => {
  test('constructor', () => {
    const fullyQualifiedOk = new Result.Ok<number, string>(42);
    assertType<Result<number, string>>(fullyQualifiedOk);

    const unqualifiedOk = new Result.Ok('string');
    assertType<Result<string, any>>(unqualifiedOk);

    expect(() => new Result.Ok(null)).toThrow();
    expect(() => new Result.Ok(undefined)).toThrow();
  });

  test('`value` property', () => {
    const okValue = 'yay';
    const theOk = new Result.Ok(okValue);
    expect(theOk.value).toEqual(okValue);
  });

  test('`unwrap` static method', () => {
    const okValue = 12;
    const theOk = new Result.Ok(okValue);
    expect(Ok.unwrap(theOk)).toEqual(okValue);
  });

  test('`isOk` method', () => {
    const theOk = new Result.Ok({});
    expect(theOk.isOk()).toBe(true);
  });

  test('`isErr` method', () => {
    const theOk = new Result.Ok([]);
    expect(theOk.isErr()).toBe(false);
  });

  test('`map` method', () => {
    const theValue = 10;
    const theOk = new Result.Ok(theValue);
    const okDoubled = new Result.Ok(double(theValue));
    expect(theOk.map(double)).toEqual(okDoubled);
  });

  test('`mapOr` method', () => {
    const theValue = 'neat';
    const theOk = new Result.Ok(theValue);
    const defaultValue = 0;
    expect(theOk.mapOr(defaultValue, length)).toEqual(length(theValue));
  });

  test('`mapOrElse` method', () => {
    const theValue = ['some', 'things'];
    const theOk: Result<string[], string> = new Result.Ok(theValue);
    const getDefault = (reason: string) => `reason being, ${reason}`;
    const join = (strings: string[]) => strings.join(', ');
    expect(theOk.mapOrElse(getDefault, join)).toEqual(join(theValue));
  });

  test('`match` method', () => {
    const theValue = 'ok';
    const nobody = new Result.Ok(theValue);

    expect(
      nobody.match({
        Ok: val => val,
        Err: err => err,
      })
    ).toBe('ok');
  });

  test('`mapErr` method', () => {
    const theOk: Result<string, string> = new Result.Ok('hey!');
    const toMoreVerboseErr = (s: string) => `Seriously, ${s} was bad.`;
    expect(theOk.mapErr(toMoreVerboseErr)).toEqual(theOk);
  });

  test('`and` method', () => {
    const theOk = new Result.Ok(100);

    const anotherOk = new Result.Ok({ not: 'a number' });
    expect(theOk.and(anotherOk)).toBe(anotherOk);

    const anErr = new Result.Err(['yikes', 'bad']);
    expect(theOk.and(anErr)).toBe(anErr);
  });

  const andThenMethodTest = (method: AndThenAliases) => () => {
    const theValue = 'anything will do';
    const theOk = new Result.Ok(theValue);
    const lengthResult = (s: string) => new Result.Ok(s.length);
    expect(theOk[method](lengthResult)).toEqual(lengthResult(theValue));

    const convertToErr = (s: string) => new Result.Err(s.length);
    expect(theOk[method](convertToErr)).toEqual(convertToErr(theValue));
  };

  test('`andThen` method', andThenMethodTest('andThen'));
  test('`chain` method', andThenMethodTest('chain'));
  test('`flatMap` method', andThenMethodTest('flatMap'));

  test('`or` method', () => {
    const theValue = 100;
    const theOk = new Result.Ok<number, string>(theValue);
    const anotherOk = new Result.Ok(42);
    expect(theOk.or(anotherOk)).toEqual(theOk);

    const anErr = new Result.Err<number, string>('something wrong');
    expect(theOk.or(anErr)).toEqual(theOk);
  });

  test('`orElse` method', () => {
    const theValue = 1;
    const theOk = new Result.Ok(theValue);
    const theDefault: string[] = [];
    const getTheDefault = () => new Result.Err<number, string[]>(theDefault);
    expect(theOk.orElse(getTheDefault)).toEqual(theOk);
  });

  test('`unsafelyUnwrap` method', () => {
    const theValue = 42;
    const theOk = new Result.Ok(theValue);
    expect(() => theOk.unsafelyUnwrap()).not.toThrow();
    expect(theOk.unsafelyUnwrap()).toEqual(theValue);
  });

  test('`unsafelyUnwrapErr` method', () => {
    const theOk = new Result.Ok('anything');
    expect(() => theOk.unsafelyUnwrapErr()).toThrow();
  });

  test('`unwrapOr` method', () => {
    const theValue = [1, 2, 3];
    const theOk = new Result.Ok(theValue);
    const defaultValue: typeof theValue = [];

    expect(theOk.unwrapOr(defaultValue)).toBe(theValue);
  });

  test('`unwrapOrElse` method', () => {
    const theValue = [1, 2, 3];
    const theOk = new Result.Ok(theValue);
    const defaultValue: typeof theValue = [];
    const getDefault = () => defaultValue;

    expect(theOk.unwrapOrElse(getDefault)).toBe(theValue);
  });

  test('`toMaybe` method', () => {
    const theValue = { something: 'fun' };
    const theOk = new Result.Ok(theValue);
    expect(theOk.toMaybe()).toEqual(just(theValue));
  });

  test('`toString` method', () => {
    const theValue = 42;
    const theOk = new Result.Ok(theValue);
    expect(theOk.toString()).toEqual(`Ok(${theValue.toString()})`);
  });

  test('`toJSON` method', () => {
    const theValue = 42;
    const theOk = new Result.Ok(theValue);
    expect(theOk.toJSON()).toEqual({ variant: Result.Variant.Ok, value: theValue });
  });

  test('`ap` method', () => {
    const fn = new Result.Ok<(val: string) => number, string>(str => str.length);
    const val = new Result.Ok<string, string>('three');

    const result = fn.ap(val);

    expect(result.toString()).toEqual(`Ok(5)`);
  });
});

describe('`Result.Err` class', () => {
  test('constructor', () => {
    const fullyQualifiedErr = new Result.Err<string, number>(42);
    assertType<Result<string, number>>(fullyQualifiedErr);

    const unqualifiedErr = new Result.Err('string');
    assertType<Result<any, string>>(unqualifiedErr);

    expect(() => new Result.Err(null)).toThrow();
    expect(() => new Result.Err(undefined)).toThrow();
  });

  test('`error` property', () => {
    const errValue = 'boo';
    const theErr = new Result.Err(errValue);
    expect(theErr.error).toBe(errValue);
  });

  test('`unwrap` static method', () => {
    const errValue = 12;
    const theErr = new Result.Err(errValue);
    expect(Err.unwrapErr(theErr)).toEqual(errValue);
  });

  test('`isOk` method', () => {
    const theErr = new Result.Err('oh my!');
    expect(theErr.isOk()).toBe(false);
  });

  test('`isErr` method', () => {
    const theErr = new Result.Err('oh my!');
    expect(theErr.isErr()).toBe(true);
  });

  test('`map` method', () => {
    const errValue = '1 billion things wrong';
    const theErr = new Result.Err<number, string>(errValue);
    expect(theErr.map(n => n + 2)).toEqual(theErr);
  });

  test('`mapOr` method', () => {
    const errValue: number = 42;
    const theErr: Result<number, number> = new Result.Err(errValue);
    const theDefault = 'victory!';
    const describe = (code: number) => `The error code was ${code}`;

    expect(theErr.mapOr(theDefault, describe)).toEqual(theDefault);
  });

  test('`mapOrElse` method', () => {
    const errValue: number = 42;
    const theErr: Result<number, number> = new Result.Err(errValue);
    const getDefault = (valueFromErr: typeof errValue) => `whoa: ${valueFromErr}`;
    const describe = (code: number) => `The error code was ${code}`;

    expect(theErr.mapOrElse(getDefault, describe)).toEqual(`whoa: ${errValue}`);
  });

  test('`match` method', () => {
    const human = 'human';
    const toErrIs = new Result.Err(human);

    expect(
      toErrIs.match({
        Ok: val => val,
        Err: err => err,
      })
    ).toBe(human);
  });

  test('`mapErr` method', () => {
    const errValue: string = 'fubar';
    const theErr = new Result.Err(errValue);
    const elaborate = (reason: typeof errValue) => `The problem was: ${reason}`;
    const expected = new Result.Err(elaborate(errValue));

    expect(theErr.mapErr(elaborate)).toEqual(expected);
  });

  test('`and` method', () => {
    const theErr = new Result.Err('blarg');

    const anOk = Result.ok<string, string>('neat');
    expect(theErr.and(anOk)).toEqual(theErr);

    const anotherErr = Result.err('oh no');
    expect(theErr.and(anotherErr)).toEqual(theErr);
  });

  const andThenMethodTest = (method: AndThenAliases) => () => {
    const theErr = new Result.Err<string[], number>(42);

    const getAnOk = (strings: string[]) => Result.ok<number, number>(length(strings));
    expect(theErr[method](getAnOk)).toEqual(theErr);

    const getAnErr = (_: any) => Result.err(0);
    expect(theErr[method](getAnErr)).toEqual(theErr);
  };

  test('`andThen` method', andThenMethodTest('andThen'));
  test('`chain` method', andThenMethodTest('chain'));
  test('`flatMap` method', andThenMethodTest('flatMap'));

  test('`chain` method', () => {
    const theErr = new Result.Err<string[], number>(42);

    const getAnOk = (strings: string[]) => Result.ok<number, number>(length(strings));
    expect(theErr.chain(getAnOk)).toEqual(theErr);

    const getAnErr = () => Result.err(0);
    expect(theErr.chain(getAnErr)).toEqual(theErr);
  });

  test('`or` method', () => {
    const theErr: Result<number, string> = new Result.Err('a shame');
    const anOk: Result<number, string> = Result.ok(42);
    expect(theErr.or(anOk)).toBe(anOk);

    const anotherErr = Result.err<number, number>(10);
    expect(theErr.or(anotherErr)).toBe(anotherErr);
  });

  test('`orElse` method', () => {
    const theErr = new Result.Err<string, string>('what sorrow');
    const theOk = Result.ok<string, string>('neat!');
    const getOk = () => theOk;
    expect(theErr.orElse(getOk)).toBe(theOk);

    const anotherErr = Result.err<string, string>('even worse');
    const getAnotherErr = () => anotherErr;
    expect(theErr.orElse(getAnotherErr)).toBe(anotherErr);
  });

  test('`unsafelyUnwrap` method', () => {
    const theErr = new Result.Err('a pity');
    expect(() => theErr.unsafelyUnwrap()).toThrow();
  });

  test('`unsafelyUnwrapErr` method', () => {
    const theReason = 'phooey';
    const theErr = new Result.Err(theReason);
    expect(() => theErr.unsafelyUnwrapErr()).not.toThrow();
    expect(theErr.unsafelyUnwrapErr()).toBe(theReason);
  });

  test('`unwrapOr` method', () => {
    const theErr = new Result.Err<number, string>('whatever');
    const theDefault = 0;
    expect(theErr.unwrapOr(theDefault)).toBe(theDefault);
  });

  test('`unwrapOrElse` method', () => {
    const theReason = 'alas';
    const theErr = new Result.Err<number, string>(theReason);
    expect(theErr.unwrapOrElse(length)).toEqual(length(theReason));
  });

  test('`toMaybe` method', () => {
    const theErr = new Result.Err('so sad');
    expect(theErr.toMaybe()).toEqual(nothing());
  });

  test('`toString` method', () => {
    const theErrValue = { something: 'sad' };
    const theErr = new Result.Err(theErrValue);
    expect(theErr.toString()).toEqual(`Err(${theErrValue.toString()})`);
  });

  test('`toJSON` method', () => {
    const theError = 'test';
    const theErr = new Result.Err(theError);
    expect(theErr.toJSON()).toEqual({ variant: Result.Variant.Err, error: theError });
  });

  test('`equals` method', () => {
    const a = new Result.Ok('a');
    const b = new Result.Ok<string, string>('a');
    const c = new Result.Err<string, string>('err');
    const d = new Result.Err<string, string>('err');
    expect(a.equals(b)).toBe(true);
    expect(b.equals(c)).toBe(false);
    expect(c.equals(d)).toBe(true);
  });

  test('`ap` method', () => {
    const fn: Result<(val: string) => number, string> = new Result.Err<
      (val: string) => number,
      string
    >('ERR_THESYSTEMISDOWN');
    const val: Result<string, string> = new Result.Err('ERR_ALLURBASE');

    const result = fn.ap(val);

    expect(result.toString()).toEqual(`Err(ERR_ALLURBASE)`);
  });
});
