import { assertType } from './lib/assert';
import * as Maybe from '../src/maybe';

type Neat = { neat: string };

test('`Maybe.Some`', () => {
  const shouldBeFine = Maybe.Maybe({ neat: 'string' });
  assertType<Maybe.Maybe<Neat>>(shouldBeFine);
  const shouldBeNeat = Maybe.Maybe<Neat>(undefined);
  assertType<Maybe.Maybe<Neat>>(shouldBeNeat);

  const someString: Maybe.Maybe<string> = Maybe.Some('string');
  switch (someString.variant) {
    case Maybe.Variant.Some:
      expect(someString.value).toBe('string');
      break;
    case Maybe.Variant.Nothing:
      expect(false).toBe(true); // because this should never happen
      break;
  }

  expect(() => Maybe.Some(null)).toThrow();
  expect(() => Maybe.Some(undefined)).toThrow();
});

test('`Maybe.Nothing`', () => {
  const nothing: Maybe.Maybe<number> = Maybe.Nothing();
  switch (nothing.variant) {
    case Maybe.Variant.Some:
      expect(true).toBe(false); // because this should never happen
      break;
    case Maybe.Variant.Nothing:
      expect(true).toBe(true); // yay
      break;
  }

  const nothingOnType = Maybe.Nothing<string>();
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
  expect(itsLength).toEqual(Maybe.Some('string'.length));

  const none = Maybe.of<string>(null);
  const noLength = Maybe.map(length, none);
  assertType<Maybe.Maybe<string>>(none);
  expect(noLength).toEqual(Maybe.Nothing());
});

test('`Maybe.mapOr`', () => {
  expect(Maybe.mapOr(x => x.length, 0, Maybe.Some('string'))).toEqual(Maybe.Some('string'.length));
  expect(Maybe.mapOr(x => x.length, 0, Maybe.of<string>(null))).toEqual(Maybe.Some(0));
});

test('`Maybe.mapOrElse`', () => {
  const length = (s: { length: number }) => s.length;
  const string = 'a string';
  expect(Maybe.mapOrElse(length, () => 0, Maybe.of('a string'))).toBe(string.length);
  expect(Maybe.mapOrElse(length, () => 0, Maybe.Nothing())).toBe(0);
});

test('`Maybe.and`', () => {
  expect(Maybe.and(Maybe.of(42), Maybe.of('string'))).toEqual(Maybe.Some(42));
  expect(Maybe.and(Maybe.Nothing(), Maybe.of('string'))).toEqual(Maybe.Nothing());
  expect(Maybe.and(Maybe.Nothing(), Maybe.of(42))).toEqual(Maybe.Nothing());
  expect(Maybe.and(Maybe.Nothing(), Maybe.Nothing())).toEqual(Maybe.Nothing());
});

test('`Maybe.andThen`', () => {
  expect(Maybe.andThen(x => Maybe.of(Number(x)), Maybe.of('42'))).toEqual(Maybe.Some(42));
  expect(Maybe.andThen(() => Maybe.of(null), Maybe.of('42'))).toEqual(Maybe.Nothing());
  expect(Maybe.andThen(x => Maybe.of(Number(x)), Maybe.of(null))).toEqual(Maybe.Nothing());
  expect(Maybe.andThen(() => Maybe.of(null), Maybe.of(null))).toEqual(Maybe.Nothing());
});

test('`Maybe.or`', () => {
  expect(Maybe.or(Maybe.of('42'), Maybe.of('string'))).toEqual(Maybe.Some('string'));
  expect(Maybe.or(Maybe.Nothing(), Maybe.of('string'))).toEqual(Maybe.Some('string'));
  expect(Maybe.or(Maybe.Nothing(), Maybe.of('42'))).toEqual(Maybe.Some('42'));
  expect(Maybe.or(Maybe.Nothing(), Maybe.Nothing())).toEqual(Maybe.Nothing());
});

test('`Maybe.orElse`', () => {
  expect(Maybe.orElse(() => Maybe.of('waffles'), Maybe.of('42'))).toEqual(Maybe.Some('42'));
  expect(Maybe.orElse(() => Maybe.of('waffles'), Maybe.of(null))).toEqual(Maybe.Some('waffles'));
  expect(Maybe.orElse(() => Maybe.of(null), Maybe.of('42'))).toEqual(Maybe.Some('42'));
  expect(Maybe.orElse(() => Maybe.of(null), Maybe.of(null))).toEqual(Maybe.Nothing());
});

test('`Maybe.unwrap`', () => {
  expect(Maybe.unwrap(Maybe.of('42'))).toBe('42');
  expect(() => Maybe.unwrap(Maybe.Nothing())).toThrow();
});

test('`Maybe.unwrapOrElse`', () => {
  expect(Maybe.unwrapOrElse(Maybe.of(42), () => 100)).toBe(42);
  expect(Maybe.unwrapOrElse(Maybe.Nothing(), () => 42)).toBe(42);
});
