import { assertType } from './lib/assert';
import * as Maybe from '../src/maybe';
import { ok, err } from '../src/result';
import { Aliases } from '../src/utils';

type Neat = { neat: string };

const length = (s: string) => s.length;

describe('`Maybe` pure functions', () => {
  test('`some`', () => {
    const theSome = Maybe.some('string');
    expect(theSome).toBeInstanceOf(Maybe.Some);
    switch (theSome.variant) {
      case Maybe.Variant.Some:
        expect(theSome.unsafelyUnwrap()).toBe('string');
        break;
      case Maybe.Variant.Nothing:
        expect(false).toBe(true); // because this should never happen
        break;
    }

    expect(() => Maybe.some(null)).toThrow();
    expect(() => Maybe.some(undefined)).toThrow();
  });

  test('`nothing`', () => {
    const theNothing = Maybe.nothing();
    expect(theNothing).toBeInstanceOf(Maybe.Nothing);
    switch (theNothing.variant) {
      case Maybe.Variant.Some:
        expect(true).toBe(false); // because this should never happen
        break;
      case Maybe.Variant.Nothing:
        expect(true).toBe(true); // yay
        break;
    }

    const nothingOnType = Maybe.nothing<string>();
    assertType<Maybe.Maybe<string>>(nothingOnType);
  });

  describe('`of`', () => {
    test('with `null', () => {
      const noneFromNull = Maybe.of<string>(null);
      assertType<Maybe.Maybe<string>>(noneFromNull);
      expect(Maybe.isSome(noneFromNull)).toBe(false);
      expect(Maybe.isNothing(noneFromNull)).toBe(true);
      expect(() => Maybe.unsafelyUnwrap(noneFromNull)).toThrow();
    });

    test('with `undefined`', () => {
      const noneFromUndefined = Maybe.of<number>(undefined);
      assertType<Maybe.Maybe<number>>(noneFromUndefined);
      expect(Maybe.isSome(noneFromUndefined)).toBe(false);
      expect(Maybe.isNothing(noneFromUndefined)).toBe(true);
      expect(() => Maybe.unsafelyUnwrap(noneFromUndefined)).toThrow();
    });

    test('with values', () => {
      const aSome = Maybe.of<Neat>({ neat: 'strings' });
      assertType<Maybe.Maybe<Neat>>(aSome);
      const aNothing = Maybe.of<Neat>(null);
      assertType<Maybe.Maybe<Neat>>(aNothing);

      const someNumber = Maybe.some(42);
      assertType<Maybe.Maybe<number>>(someNumber);
      expect(Maybe.isSome(someNumber)).toBe(true);
      expect(Maybe.isNothing(someNumber)).toBe(false);
      expect(Maybe.unsafelyUnwrap(someNumber)).toBe(42);
    });
  });

  test('`map`', () => {
    const someString = Maybe.some('string');
    const itsLength = Maybe.map(length, someString);
    assertType<Maybe.Maybe<number>>(itsLength);
    expect(itsLength).toEqual(Maybe.some('string'.length));

    const none = Maybe.nothing<string>();
    const noLength = Maybe.map(length, none);
    assertType<Maybe.Maybe<string>>(none);
    expect(noLength).toEqual(Maybe.nothing());
  });

  test('`mapOr`', () => {
    expect(Maybe.mapOr(0, x => x.length, Maybe.some('string'))).toEqual('string'.length);
    expect(Maybe.mapOr(0, x => x.length, Maybe.of<string>(null))).toEqual(0);
  });

  test('`mapOrElse`', () => {
    const theValue = 'a string';
    const theDefault = 0;
    const toDefault = () => theDefault;
    const aSome = Maybe.some(theValue);
    const aNothing = Maybe.nothing();
    expect(Maybe.mapOrElse(toDefault, length, aSome)).toBe(theValue.length);
    expect(Maybe.mapOrElse(toDefault, length, aNothing)).toBe(theDefault);
  });

  test('`and`', () => {
    const aSome = Maybe.some(42);
    const anotherSome = Maybe.some('a string');
    const aNothing = Maybe.nothing();
    expect(Maybe.and(anotherSome, aSome)).toBe(anotherSome);

    // Cannot coerce `Nothing<T>` to `Nothing<U>`
    expect(Maybe.and(aNothing, aSome)).toEqual(aNothing);
    expect(Maybe.and(aNothing, aSome)).toEqual(aNothing);
    expect(Maybe.and(aNothing, aNothing)).toEqual(aNothing);
  });

  const andThenTest = (fn: Aliases.AndThen) => () => {
    const toMaybeNumber = (x: string) => Maybe.some(Number(x));
    const toNothing = (x: string) => Maybe.nothing<number>();

    const theValue = '42';
    const theSome = Maybe.some(theValue);
    const theExpectedResult = toMaybeNumber(theValue);
    const noString = Maybe.nothing<string>();
    const noNumber = Maybe.nothing<number>();

    expect(Maybe[fn](toMaybeNumber, theSome)).toEqual(theExpectedResult);
    expect(Maybe[fn](toNothing, theSome)).toEqual(noNumber);
    expect(Maybe[fn](toMaybeNumber, noString)).toEqual(noNumber);
    expect(Maybe[fn](toNothing, noString)).toEqual(noNumber);
  };

  test('`andThen`', andThenTest('andThen'));
  test('`chain`', andThenTest('chain'));
  test('`flatMap`', andThenTest('flatMap'));

  test('`or`', () => {
    const somenswer = Maybe.of('42');
    const someWaffles = Maybe.of('waffles');
    const nothing = Maybe.nothing();

    expect(Maybe.or(somenswer, someWaffles)).toBe(someWaffles);
    expect(Maybe.or(nothing, someWaffles)).toBe(someWaffles);
    expect(Maybe.or(somenswer, nothing)).toBe(somenswer);
    expect(Maybe.or(nothing, nothing)).toBe(nothing);
  });

  test('`orElse`', () => {
    expect(Maybe.orElse(() => Maybe.of('waffles'), Maybe.of('42'))).toEqual(Maybe.some('42'));
    expect(Maybe.orElse(() => Maybe.of('waffles'), Maybe.of(null))).toEqual(Maybe.some('waffles'));
    expect(Maybe.orElse(() => Maybe.of(null), Maybe.of('42'))).toEqual(Maybe.some('42'));
    expect(Maybe.orElse(() => Maybe.of(null), Maybe.of(null))).toEqual(Maybe.nothing());
  });

  test('`unwrap`', () => {
    expect(Maybe.unsafelyUnwrap(Maybe.of('42'))).toBe('42');
    expect(() => Maybe.unsafelyUnwrap(Maybe.nothing())).toThrow();
  });

  test('`unwrapOr`', () => {
    const theValue = [1, 2, 3];
    const theDefaultValue: number[] = [];

    const theSome = Maybe.of(theValue);
    const theNothing = Maybe.nothing();

    expect(Maybe.unwrapOr(theDefaultValue, theSome)).toEqual(theValue);
    expect(Maybe.unwrapOr(theDefaultValue, theNothing)).toEqual(theDefaultValue);
  });

  test('`unwrapOrElse`', () => {
    expect(Maybe.unwrapOrElse(() => 100, Maybe.of(42))).toBe(42);
    expect(Maybe.unwrapOrElse(() => 42, Maybe.nothing())).toBe(42);
  });

  test('`toOkOrErr`', () => {
    const errValue = { reason: 'such badness' };
    expect(Maybe.toOkOrErr(errValue, Maybe.of('string'))).toEqual(ok('string'));
    expect(Maybe.toOkOrErr(errValue, Maybe.nothing())).toEqual(err(errValue));
  });

  test('`toOkOrElseErr`', () => {
    const someValue = Maybe.of(12);
    const errValue = 24;
    const getErrValue = () => errValue;

    expect(Maybe.toOkOrElseErr(getErrValue, someValue)).toEqual(ok(12));
    expect(Maybe.toOkOrElseErr(getErrValue, Maybe.nothing())).toEqual(err(errValue));
  });

  test('`fromResult`', () => {
    const value = 1000;
    const anOk = ok(value);
    expect(Maybe.fromResult(anOk)).toEqual(Maybe.some(value));

    const reason = 'oh teh noes';
    const anErr = err(reason);
    expect(Maybe.fromResult(anErr)).toEqual(Maybe.nothing());
  });

  test('`toString`', () => {
    expect(Maybe.toString(Maybe.of(42))).toEqual('Some(42)');
    expect(Maybe.toString(Maybe.nothing())).toEqual('Nothing');
  });
});

describe('`Maybe.Some` class', () => {
  test('constructor', () => {
    const theSome = new Maybe.Some([]);
    expect(theSome).toBeInstanceOf(Maybe.Some);
  });

  test('`isSome` method', () => {
    const theSome = new Maybe.Some([]);
    expect(theSome.isSome()).toBe(true);
  });

  test('`isNothing` method', () => {
    const theSome = new Maybe.Some([]);
    expect(theSome.isNothing()).toBe(false);
  });

  test('`map` method', () => {
    const plus2 = x => x + 2;
    const theValue = 12;
    const theSome = new Maybe.Some(theValue);
    const theResult = new Maybe.Some(plus2(theValue));

    expect(theSome.map(plus2)).toEqual(theResult);
  });

  test('`mapOr` method', () => {
    const theValue = 42;
    const theSome = new Maybe.Some(42);
    const theDefault = 1;
    const double = x => x * 2;

    expect(theSome.mapOr(theDefault, double)).toEqual(double(theValue));
  });

  test('`mapOrElse` method', () => {
    const theValue = 'this is a string';
    const theSome = new Maybe.Some(theValue);
    const aDefault = () => 0;

    expect(theSome.mapOrElse(aDefault, length)).toEqual(length(theValue));
  });

  test('`or` method', () => {
    const theSome = new Maybe.Some({ neat: 'thing' });
    const anotherSome = new Maybe.Some({ neat: 'waffles' });
    const aNothing = new Maybe.Nothing<Neat>();

    expect(theSome.or(anotherSome)).toEqual(theSome);
    expect(theSome.or(aNothing)).toEqual(theSome);
  });

  test('`orElse` method', () => {
    const theSome = new Maybe.Some(12);
    const getAnotherSome = () => Maybe.some(42);

    expect(theSome.orElse(getAnotherSome)).toEqual(theSome);
  });

  test('`and` method', () => {
    const theSome = new Maybe.Some({ neat: 'thing' });
    const theConsequentSome = new Maybe.Some(['amazing', { tuple: 'thing' }]);
    const aNothing = new Maybe.Nothing();

    expect(theSome.and(theConsequentSome)).toEqual(theConsequentSome);
    expect(theSome.and(aNothing)).toEqual(aNothing);
  });

  const andThenMethodTest = (method: Aliases.AndThen) => () => {
    const theValue = { Jedi: 'Luke Skywalker' };
    const theSome = new Maybe.Some(theValue);
    const toDescription = (dict: { [key: string]: string }) =>
      new Maybe.Some(
        Object.keys(dict)
          .map(key => `${dict[key]} is a ${key}`)
          .join('\n')
      );

    const theExpectedResult = toDescription(theValue);
    expect(theSome[method](toDescription)).toEqual(theExpectedResult);
  };

  test('`andThen` method', andThenMethodTest('andThen'));
  test('`chain` method', andThenMethodTest('chain'));
  test('`flatMap` method', andThenMethodTest('flatMap'));

  test('`unwrap` method', () => {
    const theValue = 'value';
    const theSome = new Maybe.Some(theValue);
    expect(theSome.unsafelyUnwrap()).toEqual(theValue);
    expect(() => theSome.unsafelyUnwrap()).not.toThrow();
  });

  test('`unwrapOr` method', () => {
    const theValue = [1, 2, 3];
    const theSome = new Maybe.Some(theValue);
    const theDefaultValue: number[] = [];

    expect(theSome.unwrapOr(theDefaultValue)).toEqual(theValue);
  });

  test('`unwrapOrElse` method', () => {
    const value = 'value';
    const theSome = new Maybe.Some(value);
    expect(theSome.unwrapOrElse(() => 'other value')).toEqual(value);
  });

  test('`toOkOrErr` method', () => {
    const value = 'string';
    const theSome = new Maybe.Some(value);
    const errValue = { reason: 'such badness' };
    expect(theSome.toOkOrErr(errValue)).toEqual(ok(value));
  });

  test('`toOkOrElseErr` method', () => {
    const value = ['neat'];
    const theSome = new Maybe.Some(value);
    const errValue = 24;
    const getErrValue = () => errValue;

    expect(theSome.toOkOrElseErr(getErrValue)).toEqual(ok(value));
  });

  test('`toString` method', () => {
    expect(Maybe.of(42).toString()).toEqual('Some(42)');
  });
});

describe('`Maybe.Nothing` class', () => {
  test('constructor', () => {
    const theNothing = new Maybe.Nothing();
    expect(theNothing).toBeInstanceOf(Maybe.Nothing);
  });

  test('`isSome` method', () => {
    const theNothing = new Maybe.Nothing();
    expect(theNothing.isSome()).toBe(false);
  });

  test('`isNothing` method', () => {
    const theNothing = new Maybe.Nothing();
    expect(theNothing.isNothing()).toBe(true);
  });

  test('`map` method', () => {
    const theNothing = new Maybe.Nothing<string>();
    expect(theNothing.map(length)).toEqual(theNothing);
  });

  test('`mapOr` method', () => {
    const theNothing = new Maybe.Nothing<number>();
    const theDefaultValue = 'yay';
    expect(theNothing.mapOr(theDefaultValue, String)).toEqual(theDefaultValue);
  });

  test('`mapOrElse` method', () => {
    const theDefaultValue = 'potatoes';
    const getDefaultValue = () => theDefaultValue;
    const getNeat = (x: Neat) => x.neat;
    const theNothing = new Maybe.Nothing<Neat>();
    expect(theNothing.mapOrElse(getDefaultValue, getNeat)).toBe(theDefaultValue);
  });

  test('`or` method', () => {
    const theNothing = new Maybe.Nothing<boolean>(); // the worst: optional booleans!
    const theDefaultValue = Maybe.some(false);

    expect(theNothing.or(theDefaultValue)).toBe(theDefaultValue);
  });

  test('`orElse` method', () => {
    const theNothing = new Maybe.Nothing<{ here: string[] }>();
    const someTheFallback = Maybe.some({ here: ['to', 'see'] });
    const getTheFallback = () => someTheFallback;

    expect(theNothing.orElse(getTheFallback)).toEqual(someTheFallback);
  });

  test('`and` method', () => {
    const theNothing = new Maybe.Nothing<Array<string>>();
    const theConsequentSome = new Maybe.Some('blaster bolts');
    const anotherNothing = new Maybe.Nothing<string>();
    expect(theNothing.and(theConsequentSome)).toEqual(theNothing);
    expect(theNothing.and(anotherNothing)).toEqual(theNothing);
  });

  const andThenMethodTest = (method: Aliases.AndThen) => () => {
    const theNothing = new Maybe.Nothing();
    const theDefaultValue = 'string';
    const getDefaultValue = () => Maybe.some(theDefaultValue);

    expect(theNothing[method](getDefaultValue)).toEqual(theNothing);
  };

  test('`andThen` method', andThenMethodTest('andThen'));
  test('`chain` method', andThenMethodTest('chain'));
  test('`flatMap` method', andThenMethodTest('flatMap'));

  test('`unsafelyUnwrap` method', () => {
    const noStuffAtAll = new Maybe.Nothing();
    expect(() => noStuffAtAll.unsafelyUnwrap()).toThrow();
  });

  test('`unwrapOr` method', () => {
    const theNothing = new Maybe.Nothing<number[]>();
    const theDefaultValue: number[] = [];
    expect(theNothing.unwrapOr(theDefaultValue)).toEqual(theDefaultValue);
  });

  test('`unwrapOrElse` method', () => {
    const theNothing = new Maybe.Nothing();
    const theDefaultValue = 'it be all fine tho';
    expect(theNothing.unwrapOrElse(() => theDefaultValue)).toEqual(theDefaultValue);
  });

  test('`toOkOrErr` method', () => {
    const theNothing = new Maybe.Nothing();
    const errValue = { reason: 'such badness' };
    expect(theNothing.toOkOrErr(errValue)).toEqual(err(errValue));
  });

  test('`toOkOrElseErr` method', () => {
    const theNothing = new Maybe.Nothing();
    const errValue = 24;
    const getErrValue = () => errValue;

    expect(theNothing.toOkOrElseErr(getErrValue)).toEqual(err(errValue));
  });

  test('`toString` method', () => {
    expect(Maybe.nothing().toString()).toEqual('Nothing');
  });
});

test('`Maybe` classes interacting', () => {
  const aMaybe: Maybe.Maybe<string> = Maybe.nothing();
  const mapped = aMaybe.map(length);
  expect(mapped).toBeInstanceOf(Maybe.Nothing);
  expect(mapped).not.toBeInstanceOf(Maybe.Some);

  const anotherMaybe: Maybe.Maybe<number> = Maybe.some(10);
  const anotherMapped = anotherMaybe.mapOr('nada', n => `The number was ${n}`);
  expect(anotherMapped).toEqual('The number was 10');
});
