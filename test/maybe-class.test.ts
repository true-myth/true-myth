import { assertType } from './lib/assert';
import * as Maybe from '../src/maybe-class';

type Neat = { neat: string };

test('`Maybe.some`', () => {
  const shouldBeFine = Maybe.of({ neat: 'string' });
  assertType<Maybe.Maybe<Neat>>(shouldBeFine);
  const shouldBeNeat = Maybe.of<Neat>(undefined);
  assertType<Maybe.Maybe<Neat>>(shouldBeNeat);

  const someString: Maybe.Maybe<string> = Maybe.of('string');
  switch (someString.variant) {
    case Maybe.Variant.Some:
      expect(someString.unwrap()).toBe('string');
      break;
    case Maybe.Variant.Nothing:
      expect(false).toBe(true); // because this should never happen
      break;
  }

  expect(() => Maybe.some(null)).toThrow();
  expect(() => Maybe.some(undefined)).toThrow();
});

test('`Maybe.nothing`', () => {
  const nothing: Maybe.Maybe<number> = Maybe.nothing();
  switch (nothing.variant) {
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

test('`Maybe.of` with `null', () => {
  const noneFromNull = Maybe.of<string>(null);
  assertType<Maybe.Maybe<string>>(noneFromNull);
  expect(Maybe.isSome(noneFromNull)).toBe(false);
  expect(Maybe.isNothing(noneFromNull)).toBe(true);
  expect(() => Maybe.unwrap(noneFromNull)).toThrow();
});

test('`Maybe.of` with `undefined`', () => {
  const noneFromUndefined = Maybe.of<number>(undefined);
  assertType<Maybe.Maybe<number>>(noneFromUndefined);
  expect(Maybe.isSome(noneFromUndefined)).toBe(false);
  expect(Maybe.isNothing(noneFromUndefined)).toBe(true);
  expect(() => Maybe.unwrap(noneFromUndefined)).toThrow();
});

test('`Maybe.of` with values', () => {
  const alsoNeat = Maybe.of<Neat>({ neat: 'strings' });
  assertType<Maybe.Maybe<Neat>>(alsoNeat);
  const andThisToo = Maybe.of<Neat>(null);
  assertType<Maybe.Maybe<Neat>>(andThisToo);

  const maybeNumber = Maybe.of(42);
  assertType<Maybe.Maybe<number>>(maybeNumber);
  expect(Maybe.isSome(maybeNumber)).toBe(true);
  expect(Maybe.isNothing(maybeNumber)).toBe(false);
  expect(Maybe.unwrap(maybeNumber)).toBe(42);
});

test('`Maybe.map`', () => {
  const length = (s: string) => s.length;

  const someString = Maybe.of('string');
  const itsLength = Maybe.map(length, someString);
  assertType<Maybe.Maybe<number>>(itsLength);
  expect(itsLength).toEqual(Maybe.some('string'.length));

  const none = Maybe.of<string>(null);
  const noLength = Maybe.map(length, none);
  assertType<Maybe.Maybe<string>>(none);
  expect(noLength).toEqual(Maybe.nothing());
});

test('`Maybe.mapOr`', () => {
  expect(Maybe.mapOr(0, x => x.length, Maybe.some('string'))).toEqual('string'.length);
  expect(Maybe.mapOr(0, x => x.length, Maybe.of<string>(null))).toEqual(0);
});

test('`Maybe.mapOrElse`', () => {
  const length = (s: { length: number }) => s.length;
  const string = 'a string';
  expect(Maybe.mapOrElse(() => 0, length, Maybe.of('a string'))).toBe(string.length);
  expect(Maybe.mapOrElse(() => 0, length, Maybe.nothing())).toBe(0);
});

test('`Maybe.and`', () => {
  expect(Maybe.and(Maybe.of(42), Maybe.of('string'))).toEqual(Maybe.some(42));
  expect(Maybe.and(Maybe.nothing(), Maybe.of('string'))).toEqual(Maybe.nothing());
  expect(Maybe.and(Maybe.nothing(), Maybe.of(42))).toEqual(Maybe.nothing());
  expect(Maybe.and(Maybe.nothing(), Maybe.nothing())).toEqual(Maybe.nothing());
});

test('`Maybe.andThen`', () => {
  const strNum = Maybe.of('42');
  const number = Maybe.of(42);
  const toNumber = (x: string) => Maybe.of(Number(x));
  const toNothing = (x: string) => Maybe.nothing<number>();
  const noString = Maybe.nothing<string>();
  const noNumber = Maybe.nothing<number>();

  expect(Maybe.andThen(toNumber, strNum)).toEqual(number);
  expect(Maybe.andThen(toNothing, strNum)).toEqual(noNumber);
  expect(Maybe.andThen(toNumber, noString)).toEqual(noNumber);
  expect(Maybe.andThen(toNothing, noString)).toEqual(noNumber);
});

test('`Maybe.or`', () => {
  const someAnswer = Maybe.of('42');
  const someWaffles = Maybe.of('waffles');
  const nothing = Maybe.nothing();

  expect(Maybe.or(someAnswer, someWaffles)).toBe(someWaffles);
  expect(Maybe.or(nothing, someWaffles)).toBe(someWaffles);
  expect(Maybe.or(someAnswer, nothing)).toBe(someAnswer);
  expect(Maybe.or(nothing, nothing)).toBe(nothing);
});

test('`Maybe.orElse`', () => {
  expect(Maybe.orElse(() => Maybe.of('waffles'), Maybe.of('42'))).toEqual(Maybe.some('42'));
  expect(Maybe.orElse(() => Maybe.of('waffles'), Maybe.of(null))).toEqual(Maybe.some('waffles'));
  expect(Maybe.orElse(() => Maybe.of(null), Maybe.of('42'))).toEqual(Maybe.some('42'));
  expect(Maybe.orElse(() => Maybe.of(null), Maybe.of(null))).toEqual(Maybe.nothing());
});

test('`Maybe.unwrap`', () => {
  expect(Maybe.unwrap(Maybe.of('42'))).toBe('42');
  expect(() => Maybe.unwrap(Maybe.nothing())).toThrow();
});

test('`Maybe.unwrapOrElse`', () => {
  expect(Maybe.unwrapOrElse(() => 100, Maybe.of(42))).toBe(42);
  expect(Maybe.unwrapOrElse(() => 42, Maybe.nothing())).toBe(42);
});

test('`Some.map`', () => {});
test('`Some.mapOr`', () => {});
test('`Some.mapOrElse`', () => {});
test('`Some.or`', () => {});
test('`Some.orElse`', () => {});
test('`Some.and`', () => {});
test('`Some.andThen`', () => {});
test('`Some.unwrap`', () => {});
test('`Some.unwrapOrElse`', () => {});

test('`Nothing.map`', () => {});
test('`Nothing.mapOr`', () => {});
test('`Nothing.mapOrElse`', () => {});
test('`Nothing.or`', () => {});
test('`Nothing.orElse`', () => {});
test('`Nothing.and`', () => {});
test('`Nothing.andThen`', () => {});
test('`Nothing.unwrap`', () => {});
test('`Nothing.unwrapOrElse`', () => {});
