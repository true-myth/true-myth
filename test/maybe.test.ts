import { assertType } from './lib/assert';
import * as Maybe from '../src/maybe';
import { ok, err } from '../src/result';

type Neat = { neat: string };

const length = (s: string) => s.length;

describe('`Maybe` pure functions', () => {
  test('`just`', () => {
    const aJust: Maybe.Maybe<string> = Maybe.of('string');
    switch (aJust.variant) {
      case Maybe.Variant.Just:
        expect(aJust.unsafelyUnwrap()).toBe('string');
        break;
      case Maybe.Variant.Nothing:
        expect(false).toBe(true); // because this should never happen
        break;
    }

    expect(() => Maybe.just(null)).toThrow();
    expect(() => Maybe.just(undefined)).toThrow();
  });

  test('`nothing`', () => {
    const aNothing = Maybe.nothing();
    switch (aNothing.variant) {
      case Maybe.Variant.Just:
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
      expect(Maybe.isJust(noneFromNull)).toBe(false);
      expect(Maybe.isNothing(noneFromNull)).toBe(true);
      expect(() => Maybe.unsafelyUnwrap(noneFromNull)).toThrow();
    });

    test('with `undefined`', () => {
      const noneFromUndefined = Maybe.of<number>(undefined);
      assertType<Maybe.Maybe<number>>(noneFromUndefined);
      expect(Maybe.isJust(noneFromUndefined)).toBe(false);
      expect(Maybe.isNothing(noneFromUndefined)).toBe(true);
      expect(() => Maybe.unsafelyUnwrap(noneFromUndefined)).toThrow();
    });

    test('with values', () => {
      const aJust = Maybe.of<Neat>({ neat: 'strings' });
      assertType<Maybe.Maybe<Neat>>(aJust);
      const aNothing = Maybe.of<Neat>(null);
      assertType<Maybe.Maybe<Neat>>(aNothing);

      const justANumber = Maybe.just(42);
      assertType<Maybe.Maybe<number>>(justANumber);
      expect(Maybe.isJust(justANumber)).toBe(true);
      expect(Maybe.isNothing(justANumber)).toBe(false);
      expect(Maybe.unsafelyUnwrap(justANumber)).toBe(42);
    });
  });

  test('`map`', () => {
    const justString = Maybe.just('string');
    const itsLength = Maybe.map(length, justString);
    assertType<Maybe.Maybe<number>>(itsLength);
    expect(itsLength).toEqual(Maybe.just('string'.length));

    const none = Maybe.nothing<string>();
    const noLength = Maybe.map(length, none);
    assertType<Maybe.Maybe<string>>(none);
    expect(noLength).toEqual(Maybe.nothing());
  });

  test('`mapOr`', () => {
    expect(Maybe.mapOr(0, x => x.length, Maybe.just('string'))).toEqual('string'.length);
    expect(Maybe.mapOr(0, x => x.length, Maybe.of<string>(null))).toEqual(0);
  });

  test('`mapOrElse`', () => {
    const theValue = 'a string';
    const theDefault = 0;
    const toDefault = () => theDefault;
    const aJust = Maybe.just(theValue);
    const aNothing = Maybe.nothing();
    expect(Maybe.mapOrElse(toDefault, length, aJust)).toBe(theValue.length);
    expect(Maybe.mapOrElse(toDefault, length, aNothing)).toBe(theDefault);
  });

  test('`and`', () => {
    const aJust = Maybe.just(42);
    const anotherJust = Maybe.just('a string');
    const aNothing = Maybe.nothing();
    expect(Maybe.and(anotherJust, aJust)).toBe(anotherJust);

    // Cannot coerce `Nothing<T>` to `Nothing<U>`
    expect(Maybe.and(aNothing, aJust)).toEqual(aNothing);
    expect(Maybe.and(aNothing, aJust)).toEqual(aNothing);
    expect(Maybe.and(aNothing, aNothing)).toEqual(aNothing);
  });

  test('`andThen`', () => {
    const toMaybeNumber = (x: string) => Maybe.just(Number(x));
    const toNothing = (x: string) => Maybe.nothing<number>();

    const theValue = '42';
    const theJust = Maybe.just(theValue);
    const theExpectedResult = toMaybeNumber(theValue);
    const noString = Maybe.nothing<string>();
    const noNumber = Maybe.nothing<number>();

    expect(Maybe.andThen(toMaybeNumber, theJust)).toEqual(theExpectedResult);
    expect(Maybe.andThen(toNothing, theJust)).toEqual(noNumber);
    expect(Maybe.andThen(toMaybeNumber, noString)).toEqual(noNumber);
    expect(Maybe.andThen(toNothing, noString)).toEqual(noNumber);
  });

  test('`or`', () => {
    const someAnswer = Maybe.of('42');
    const someWaffles = Maybe.of('waffles');
    const nothing = Maybe.nothing();

    expect(Maybe.or(someAnswer, someWaffles)).toBe(someWaffles);
    expect(Maybe.or(nothing, someWaffles)).toBe(someWaffles);
    expect(Maybe.or(someAnswer, nothing)).toBe(someAnswer);
    expect(Maybe.or(nothing, nothing)).toBe(nothing);
  });

  test('`orElse`', () => {
    expect(Maybe.orElse(() => Maybe.of('waffles'), Maybe.of('42'))).toEqual(Maybe.just('42'));
    expect(Maybe.orElse(() => Maybe.of('waffles'), Maybe.of(null))).toEqual(Maybe.just('waffles'));
    expect(Maybe.orElse(() => Maybe.of(null), Maybe.of('42'))).toEqual(Maybe.just('42'));
    expect(Maybe.orElse(() => Maybe.of(null), Maybe.of(null))).toEqual(Maybe.nothing());
  });

  test('`unwrap`', () => {
    expect(Maybe.unsafelyUnwrap(Maybe.of('42'))).toBe('42');
    expect(() => Maybe.unsafelyUnwrap(Maybe.nothing())).toThrow();
  });

  test('`unwrapOr`', () => {
    const theValue = [1, 2, 3];
    const theDefaultValue: number[] = [];

    const theJust = Maybe.of(theValue);
    const theNothing = Maybe.nothing();

    expect(Maybe.unwrapOr(theDefaultValue, theJust)).toEqual(theValue);
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

  test('`toString`', () => {
    expect(Maybe.toString(Maybe.of(42))).toEqual('Just(42)');
    expect(Maybe.toString(Maybe.nothing())).toEqual('Nothing');
  });
});

describe('`Maybe.Just` class', () => {
  test('constructor', () => {
    const theJust = new Maybe.Just([]);
    expect(theJust).toBeInstanceOf(Maybe.Just);
  });

  test('`isJust` method', () => {
    const theJust = new Maybe.Just([]);
    expect(theJust.isJust()).toBe(true);
  });

  test('`isNothing` method', () => {
    const theJust = new Maybe.Just([]);
    expect(theJust.isNothing()).toBe(false);
  });

  test('`map` method', () => {
    const plus2 = x => x + 2;
    const theValue = 12;
    const theJust = new Maybe.Just(theValue);
    const theResult = new Maybe.Just(plus2(theValue));

    expect(theJust.map(plus2)).toEqual(theResult);
  });

  test('`mapOr` method', () => {
    const theValue = 42;
    const theJust = new Maybe.Just(42);
    const theDefault = 1;
    const double = x => x * 2;

    expect(theJust.mapOr(theDefault, double)).toEqual(double(theValue));
  });

  test('`mapOrElse` method', () => {
    const theValue = 'this is a string';
    const theJust = new Maybe.Just(theValue);
    const aDefault = () => 0;

    expect(theJust.mapOrElse(aDefault, length)).toEqual(length(theValue));
  });

  test('`or` method', () => {
    const theJust = new Maybe.Just({ neat: 'thing' });
    const anotherJust = new Maybe.Just({ neat: 'waffles' });
    const aNothing = new Maybe.Nothing<Neat>();

    expect(theJust.or(anotherJust)).toEqual(theJust);
    expect(theJust.or(aNothing)).toEqual(theJust);
  });

  test('`orElse` method', () => {
    const theJust = new Maybe.Just(12);
    const getAnotherJust = () => Maybe.just(42);

    expect(theJust.orElse(getAnotherJust)).toEqual(theJust);
  });

  test('`and` method', () => {
    const theJust = new Maybe.Just({ neat: 'thing' });
    const theConsequentJust = new Maybe.Just(['amazing', { tuple: 'thing' }]);
    const aNothing = new Maybe.Nothing();

    expect(theJust.and(theConsequentJust)).toEqual(theConsequentJust);
    expect(theJust.and(aNothing)).toEqual(aNothing);
  });

  test('`andThen` method', () => {
    const theValue = { Jedi: 'Luke Skywalker' };
    const theJust = new Maybe.Just(theValue);
    const toDescription = (dict: { [key: string]: string }) =>
      new Maybe.Just(
        Object.keys(dict)
          .map(key => `${dict[key]} is a ${key}`)
          .join('\n')
      );

    const theExpectedResult = toDescription(theValue);
    expect(theJust.andThen(toDescription)).toEqual(theExpectedResult);
  });

  test('`unwrap` method', () => {
    const theValue = 'value';
    const theJust = new Maybe.Just(theValue);
    expect(theJust.unsafelyUnwrap()).toEqual(theValue);
    expect(() => theJust.unsafelyUnwrap()).not.toThrow();
  });

  test('`unwrapOr` method', () => {
    const theValue = [1, 2, 3];
    const theJust = new Maybe.Just(theValue);
    const theDefaultValue: number[] = [];

    expect(theJust.unwrapOr(theDefaultValue)).toEqual(theValue);
  });

  test('`unwrapOrElse` method', () => {
    const value = 'value';
    const theJust = new Maybe.Just(value);
    expect(theJust.unwrapOrElse(() => 'other value')).toEqual(value);
  });

  test('`toOkOrErr` method', () => {
    const value = 'string';
    const theJust = new Maybe.Just(value);
    const errValue = { reason: 'such badness' };
    expect(theJust.toOkOrErr(errValue)).toEqual(ok(value));
  });

  test('`toOkOrElseErr` method', () => {
    const value = ['neat'];
    const theJust = new Maybe.Just(value);
    const errValue = 24;
    const getErrValue = () => errValue;

    expect(theJust.toOkOrElseErr(getErrValue)).toEqual(ok(value));
  });

  test('`toString` method', () => {
    expect(Maybe.of(42).toString()).toEqual('Just(42)');
  });
});

describe('`Maybe.Nothing` class', () => {
  test('constructor', () => {
    const theNothing = new Maybe.Nothing();
    expect(theNothing).toBeInstanceOf(Maybe.Nothing);
  });

  test('`isJust` method', () => {
    const theNothing = new Maybe.Nothing();
    expect(theNothing.isJust()).toBe(false);
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
    const theDefaultValue = Maybe.just(false);

    expect(theNothing.or(theDefaultValue)).toBe(theDefaultValue);
  });

  test('`orElse` method', () => {
    const theNothing = new Maybe.Nothing<{ here: string[] }>();
    const justTheFallback = Maybe.just({ here: ['to', 'see'] });
    const getTheFallback = () => justTheFallback;

    expect(theNothing.orElse(getTheFallback)).toEqual(justTheFallback);
  });

  test('`and` method', () => {
    const theNothing = new Maybe.Nothing<Array<string>>();
    const theConsequentJust = new Maybe.Just('blaster bolts');
    const anotherNothing = new Maybe.Nothing<string>();
    expect(theNothing.and(theConsequentJust)).toEqual(theNothing);
    expect(theNothing.and(anotherNothing)).toEqual(theNothing);
  });

  test('`andThen` method', () => {
    const theNothing = new Maybe.Nothing();
    const theDefaultValue = 'string';
    const getDefaultValue = () => Maybe.just('string');

    expect(theNothing.andThen(getDefaultValue)).toEqual(theNothing);
  });

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
