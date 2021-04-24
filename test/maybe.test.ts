import { expectTypeOf } from 'expect-type';
import Maybe, { Variant, Nothing, Just, Matcher, unwrap } from '../src/maybe';
import * as MaybeNS from '../src/maybe';
import Result, { err, ok } from '../src/result';
import { Unit } from '../src/unit';

type Neat = { neat: string };

const length = (s: string) => s.length;

describe('`Maybe` pure functions', () => {
  test('`just`', () => {
    const theJust = MaybeNS.just('string');
    expect(theJust).toBeInstanceOf(Maybe);
    switch (theJust.variant) {
      case MaybeNS.Variant.Just:
        expect(theJust.unsafelyUnwrap()).toBe('string');
        break;
      case MaybeNS.Variant.Nothing:
        expect(false).toBe(true); // because this should never happen
        break;
      default:
        expect(false).toBe(true); // because those are the only cases
    }

    expect(() => MaybeNS.just(null)).toThrow();
    expect(() => MaybeNS.just(undefined)).toThrow();
  });

  test('`nothing`', () => {
    const theNothing = MaybeNS.nothing();
    expect(theNothing).toBeInstanceOf(Maybe);
    switch (theNothing.variant) {
      case MaybeNS.Variant.Just:
        expect(true).toBe(false); // because this should never happen
        break;
      case MaybeNS.Variant.Nothing:
        expect(true).toBe(true); // yay
        break;
      default:
        expect(false).toBe(true); // because those are the only cases
    }

    const nothingOnType = MaybeNS.nothing<string>();
    expectTypeOf(nothingOnType).toEqualTypeOf<Maybe<string>>();
  });

  describe('`of`', () => {
    test('with `null', () => {
      const nothingFromNull = MaybeNS.of<string>(null);
      expectTypeOf(nothingFromNull).toEqualTypeOf<Maybe<string>>();
      expect(MaybeNS.isJust(nothingFromNull)).toBe(false);
      expect(MaybeNS.isNothing(nothingFromNull)).toBe(true);
      expect(() => MaybeNS.unsafelyUnwrap(nothingFromNull)).toThrow();
    });

    test('with `undefined`', () => {
      const nothingFromUndefined = MaybeNS.of<number>(undefined);
      expectTypeOf(nothingFromUndefined).toEqualTypeOf<Maybe<number>>();
      expect(MaybeNS.isJust(nothingFromUndefined)).toBe(false);
      expect(MaybeNS.isNothing(nothingFromUndefined)).toBe(true);
      expect(() => MaybeNS.unsafelyUnwrap(nothingFromUndefined)).toThrow();
    });

    test('with values', () => {
      const aJust = MaybeNS.of<Neat>({ neat: 'strings' });
      expectTypeOf(aJust).toEqualTypeOf<Maybe<Neat>>();
      const aNothing = MaybeNS.of<Neat>(null);
      expectTypeOf(aNothing).toEqualTypeOf<Maybe<Neat>>();

      const justANumber = MaybeNS.of(42);
      expectTypeOf(justANumber).toEqualTypeOf<Maybe<number>>();
      expect(MaybeNS.isJust(justANumber)).toBe(true);
      expect(MaybeNS.isNothing(justANumber)).toBe(false);
      expect(MaybeNS.unsafelyUnwrap(justANumber)).toBe(42);
    });
  });

  describe('`fromNullable`', () => {
    test('with `null', () => {
      const nothingFromNull = MaybeNS.fromNullable<string>(null);
      expectTypeOf(nothingFromNull).toEqualTypeOf<Maybe<string>>();
      expect(MaybeNS.isJust(nothingFromNull)).toBe(false);
      expect(MaybeNS.isNothing(nothingFromNull)).toBe(true);
      expect(() => MaybeNS.unsafelyUnwrap(nothingFromNull)).toThrow();
    });

    test('with `undefined`', () => {
      const nothingFromUndefined = MaybeNS.fromNullable<number>(undefined);
      expectTypeOf(nothingFromUndefined).toEqualTypeOf<Maybe<number>>();
      expect(MaybeNS.isJust(nothingFromUndefined)).toBe(false);
      expect(MaybeNS.isNothing(nothingFromUndefined)).toBe(true);
      expect(() => MaybeNS.unsafelyUnwrap(nothingFromUndefined)).toThrow();
    });

    test('with values', () => {
      const aJust = MaybeNS.fromNullable<Neat>({ neat: 'strings' });
      expectTypeOf(aJust).toEqualTypeOf<Maybe<Neat>>();
      const aNothing = MaybeNS.fromNullable<Neat>(null);
      expectTypeOf(aNothing).toEqualTypeOf<Maybe<Neat>>();

      const justANumber = MaybeNS.fromNullable(42);
      expectTypeOf(justANumber).toEqualTypeOf<Maybe<number>>();
      expect(MaybeNS.isJust(justANumber)).toBe(true);
      expect(MaybeNS.isNothing(justANumber)).toBe(false);
      expect(MaybeNS.unsafelyUnwrap(justANumber)).toBe(42);
    });
  });

  test('`map`', () => {
    const justAString = MaybeNS.just('string');
    const itsLength = MaybeNS.map(length, justAString);
    expectTypeOf(itsLength).toEqualTypeOf<Maybe<number>>();
    expect(itsLength).toEqual(MaybeNS.just('string'.length));

    const none = MaybeNS.nothing<string>();
    const noLength = MaybeNS.map(length, none);
    expectTypeOf(none).toEqualTypeOf<Maybe<string>>();
    expect(noLength).toEqual(MaybeNS.nothing());
  });

  test('`mapOr`', () => {
    const justAString = MaybeNS.of('string');

    expect(MaybeNS.mapOr(0, length, justAString)).toEqual('string'.length);
    expect(MaybeNS.mapOr(0, length, MaybeNS.of<string>(null))).toEqual(0);

    expect(MaybeNS.mapOr<string, number>(0)(length)(justAString)).toEqual(
      MaybeNS.mapOr(0, length, justAString)
    );
    expect(MaybeNS.mapOr(0, length)(justAString)).toEqual(MaybeNS.mapOr(0, length, justAString));
  });

  test('`mapOrElse`', () => {
    const theValue = 'a string';
    const theDefault = 0;
    const toDefault = () => theDefault;
    const aJust = MaybeNS.just(theValue);
    const aNothing: Maybe<string> = MaybeNS.nothing();

    expect(MaybeNS.mapOrElse(toDefault, length, aJust)).toBe(theValue.length);
    expect(MaybeNS.mapOrElse(toDefault, length, aNothing)).toBe(theDefault);

    expect(MaybeNS.mapOrElse<string, number>(toDefault)(length)(aJust)).toEqual(
      MaybeNS.mapOrElse(toDefault, length, aJust)
    );
    expect(MaybeNS.mapOrElse(toDefault, length)(aJust)).toEqual(
      MaybeNS.mapOrElse(toDefault, length, aJust)
    );
  });

  test('`match`', () => {
    const theValue = 'a string';
    const aJust = MaybeNS.just(theValue);
    const aNothing: Maybe<string> = MaybeNS.nothing();

    const matcher: Matcher<string, string> = {
      Just: (val) => val + ', yo',
      Nothing: () => 'rats, nothing',
    };

    expect(MaybeNS.match(matcher, aJust)).toEqual('a string, yo');
    expect(MaybeNS.match(matcher, aNothing)).toEqual('rats, nothing');

    expect(MaybeNS.match(matcher)(aJust)).toEqual(MaybeNS.match(matcher, aJust));
  });

  test('`and`', () => {
    const aJust = MaybeNS.just(42);
    const anotherJust = MaybeNS.just('a string');
    const aNothing: Maybe<{}> = MaybeNS.nothing();
    expect(MaybeNS.and(anotherJust, aJust)).toBe(anotherJust);

    expect(MaybeNS.and(aNothing, aJust)).toEqual(aNothing);
    expect(MaybeNS.and(aNothing, aJust)).toEqual(aNothing);
    expect(MaybeNS.and(aNothing, aNothing)).toEqual(aNothing);

    expect(MaybeNS.and<number, {}>(aNothing)(aJust)).toEqual(MaybeNS.and(aNothing, aJust));
  });

  test('`andThen`', () => {
    const toMaybeNumber = (x: string) => MaybeNS.just(Number(x));
    const toNothing = (_: string) => MaybeNS.nothing<number>();

    const theValue = '42';
    const theJust = MaybeNS.just(theValue);
    const theExpectedResult = toMaybeNumber(theValue);
    const noString = MaybeNS.nothing<string>();
    const noNumber = MaybeNS.nothing<number>();

    expect(MaybeNS.andThen(toMaybeNumber, theJust)).toEqual(theExpectedResult);
    expect(MaybeNS.andThen(toNothing, theJust)).toEqual(noNumber);
    expect(MaybeNS.andThen(toMaybeNumber, noString)).toEqual(noNumber);
    expect(MaybeNS.andThen(toNothing, noString)).toEqual(noNumber);

    expect(MaybeNS.andThen(toMaybeNumber)(theJust)).toEqual(
      MaybeNS.andThen(toMaybeNumber, theJust)
    );
  });

  test('`or`', () => {
    const justAnswer = MaybeNS.of('42');
    const justWaffles = MaybeNS.of('waffles');
    const nothing: Maybe<string> = MaybeNS.nothing();

    expect(MaybeNS.or(justAnswer, justWaffles)).toBe(justWaffles);
    expect(MaybeNS.or(nothing, justWaffles)).toBe(justWaffles);
    expect(MaybeNS.or(justAnswer, nothing)).toBe(justAnswer);
    expect(MaybeNS.or(nothing, nothing)).toBe(nothing);

    expect(MaybeNS.or(justAnswer)(justWaffles)).toEqual(MaybeNS.or(justAnswer, justWaffles));
  });

  test('`orElse`', () => {
    const getWaffles = () => MaybeNS.of('waffles');
    const just42 = MaybeNS.of('42');
    expect(MaybeNS.orElse(getWaffles, just42)).toEqual(MaybeNS.just('42'));
    expect(MaybeNS.orElse(getWaffles, MaybeNS.of(null as string | null))).toEqual(
      MaybeNS.just('waffles')
    );
    expect(MaybeNS.orElse(() => MaybeNS.of(null as string | null), just42)).toEqual(
      MaybeNS.just('42')
    );
    expect(
      MaybeNS.orElse(() => MaybeNS.of(null as string | null), MaybeNS.of(null as string | null))
    ).toEqual(MaybeNS.nothing());

    expect(MaybeNS.orElse(getWaffles)(just42)).toEqual(MaybeNS.orElse(getWaffles, just42));
  });

  test('`unwrap`', () => {
    expect(MaybeNS.unsafelyUnwrap(MaybeNS.of('42'))).toBe('42');
    expect(() => MaybeNS.unsafelyUnwrap(MaybeNS.nothing())).toThrow();
  });

  test('`unwrapOr`', () => {
    const theValue = [1, 2, 3];
    const theDefaultValue: number[] = [];

    const theJust = MaybeNS.of(theValue);
    const theNothing = MaybeNS.nothing();

    expect(MaybeNS.unwrapOr(theDefaultValue, theJust)).toEqual(theValue);
    expect(MaybeNS.unwrapOr(theDefaultValue, theNothing)).toEqual(theDefaultValue);

    expect(MaybeNS.unwrapOr(theDefaultValue)(theJust)).toEqual(
      MaybeNS.unwrapOr(theDefaultValue, theJust)
    );

    // Make sure you can unwrap to a different type, like undefined
    // For interop with "regular" code
    expectTypeOf(theJust).toEqualTypeOf<Maybe<number[]>>();
    const theJustOrUndefined = theJust.unwrapOr(undefined);
    expectTypeOf(theJustOrUndefined).toEqualTypeOf<number[] | undefined>();
    expect(theJustOrUndefined).toEqual(theValue);
  });

  test('`unwrapOrElse`', () => {
    const val = 100;
    const getVal = () => val;
    const just42 = MaybeNS.of(42);

    expect(MaybeNS.unwrapOrElse(getVal, just42)).toBe(42);
    expect(MaybeNS.unwrapOrElse(getVal, MaybeNS.nothing())).toBe(val);

    expect(MaybeNS.unwrapOrElse(getVal)(just42)).toEqual(MaybeNS.unwrapOrElse(getVal, just42));

    // test unwrapping to undefined
    const noop = (): undefined => undefined;
    const undefinedOr42 = MaybeNS.unwrapOrElse(noop, just42);
    expectTypeOf(undefinedOr42).toEqualTypeOf<number | undefined>();
    expect(undefinedOr42).toEqual(42);
  });

  test('`toOkOrErr`', () => {
    const theValue = 'string';
    const theJust = MaybeNS.of(theValue);
    const errValue = { reason: 'such badness' };

    expect(MaybeNS.toOkOrErr(errValue, theJust)).toEqual(ok(theValue));
    expect(MaybeNS.toOkOrErr(errValue, MaybeNS.nothing())).toEqual(err(errValue));

    expect(MaybeNS.toOkOrErr<string, typeof errValue>(errValue)(theJust)).toEqual(
      MaybeNS.toOkOrErr(errValue, theJust)
    );
  });

  test('`toOkOrElseErr`', () => {
    const theJust = MaybeNS.of(12);
    const errValue = 24;
    const getErrValue = () => errValue;

    expect(MaybeNS.toOkOrElseErr(getErrValue, theJust)).toEqual(ok(12));
    expect(MaybeNS.toOkOrElseErr(getErrValue, MaybeNS.nothing())).toEqual(err(errValue));

    expect(MaybeNS.toOkOrElseErr<number, number>(getErrValue)(theJust)).toEqual(
      MaybeNS.toOkOrElseErr(getErrValue, theJust)
    );
  });

  test('`fromResult`', () => {
    const value = 1000;
    const anOk = ok(value);
    expect(MaybeNS.fromResult(anOk)).toEqual(MaybeNS.just(value));

    const reason = 'oh teh noes';
    const anErr = err(reason);
    expect(MaybeNS.fromResult(anErr)).toEqual(MaybeNS.nothing());
  });

  test('`toString`', () => {
    expect(MaybeNS.toString(MaybeNS.of(42))).toEqual('Just(42)');
    expect(MaybeNS.toString(MaybeNS.nothing<string>())).toEqual('Nothing');
  });

  test('`toJSON`', () => {
    expect(MaybeNS.toJSON(MaybeNS.of(42))).toEqual({ variant: MaybeNS.Variant.Just, value: 42 });
    expect(MaybeNS.toJSON(MaybeNS.nothing())).toEqual({ variant: MaybeNS.Variant.Nothing });
    expect(MaybeNS.toJSON(MaybeNS.of({ a: 42, b: null }))).toEqual({
      variant: MaybeNS.Variant.Just,
      value: { a: 42, b: null },
    });
  });

  test('`toJSON` through serialization', () => {
    const actualSerializedJust = JSON.stringify(MaybeNS.of(42));
    const actualSerializedNothing = JSON.stringify(MaybeNS.nothing());
    const expectedSerializedJust = JSON.stringify({ variant: MaybeNS.Variant.Just, value: 42 });
    const expectedSerializedNothing = JSON.stringify({ variant: MaybeNS.Variant.Nothing });

    expect(actualSerializedJust).toEqual(expectedSerializedJust);
    expect(actualSerializedNothing).toEqual(expectedSerializedNothing);
  });

  test('`equals`', () => {
    const a = MaybeNS.of<string>('a');
    const b = MaybeNS.of<string>('a');
    const c = MaybeNS.nothing<string>();
    const d = MaybeNS.nothing<string>();
    expect(MaybeNS.equals(b, a)).toBe(true);
    expect(MaybeNS.equals(b)(a)).toBe(true);
    expect(MaybeNS.equals(c, b)).toBe(false);
    expect(MaybeNS.equals(c)(b)).toBe(false);
    expect(MaybeNS.equals(d, c)).toBe(true);
    expect(MaybeNS.equals(d)(c)).toBe(true);
  });

  test('`ap`', () => {
    const add = (a: number) => (b: number) => a + b;
    const maybeAdd = MaybeNS.of(add);

    expect(maybeAdd.ap(MaybeNS.of(1)).ap(MaybeNS.of(5))).toEqual(MaybeNS.of(6));

    const maybeAdd3 = MaybeNS.of<(val: number) => number>(add(3));
    const val = MaybeNS.of(2);
    const nada: Maybe<number> = MaybeNS.of(null as number | null | undefined);

    expect(MaybeNS.ap(maybeAdd3, val)).toEqual(MaybeNS.just(5));
    expect(MaybeNS.ap(maybeAdd3)(nada)).toEqual(MaybeNS.nothing());
  });

  test('isInstance', () => {
    const something: unknown = MaybeNS.just('yay');
    expect(MaybeNS.isInstance(something)).toBe(true);

    const nothing = MaybeNS.nothing();
    expect(MaybeNS.isInstance(nothing)).toBe(true);

    const nada = null;
    expect(MaybeNS.isInstance(nada)).toBe(false);

    const obj = { random: 'nonsense' };
    expect(MaybeNS.isInstance(obj)).toBe(false);
  });

  describe('transpose', () => {
    test('Just(Ok(T))', () => {
      let maybe = MaybeNS.just(ok<number, string>(12));
      let transposed = MaybeNS.transpose(maybe);
      expect(transposed).toStrictEqual(ok(MaybeNS.just(12)));
      expectTypeOf(transposed).toEqualTypeOf<Result<Maybe<number>, string>>();
    });

    test('Just(Err(E))', () => {
      let maybe = MaybeNS.just(err<number, string>('whoops'));
      let transposed = MaybeNS.transpose(maybe);
      expect(transposed).toStrictEqual(err('whoops'));
      expectTypeOf(transposed).toEqualTypeOf<Result<Maybe<number>, string>>();
    });

    test('Nothing', () => {
      let maybe = MaybeNS.nothing<Result<number, string>>();
      let transposed = MaybeNS.transpose(maybe);
      expect(transposed).toStrictEqual(ok(MaybeNS.nothing()));
      expectTypeOf(transposed).toEqualTypeOf<Result<Maybe<number>, string>>();
    });
  });

  test('`property`', () => {
    type Person = { name?: string };
    let chris: Person = { name: 'chris' };
    expect(MaybeNS.property('name', chris)).toEqual(MaybeNS.just(chris.name));

    let nobody: Person = {};
    expect(MaybeNS.property('name', nobody)).toEqual(MaybeNS.nothing());

    type Dict<T> = { [key: string]: T };
    let dict: Dict<string> = { quux: 'warble' };
    expect(MaybeNS.property('quux', dict)).toEqual(MaybeNS.just('warble'));
    expect(MaybeNS.property('wat', dict)).toEqual(MaybeNS.nothing());
  });

  test('`get`', () => {
    type Person = { name?: string };
    let chris: Person = { name: 'chris' };
    let justChris: Maybe<Person> = MaybeNS.just(chris);
    expect(MaybeNS.get('name', justChris)).toEqual(MaybeNS.just(chris.name));

    let nobody: Maybe<Person> = MaybeNS.nothing();
    expect(MaybeNS.get('name', nobody)).toEqual(MaybeNS.nothing());

    type Dict<T> = { [key: string]: T };
    let dict = MaybeNS.just({ quux: 'warble' } as Dict<string>);
    expect(MaybeNS.get('quux', dict)).toEqual(MaybeNS.just('warble'));
    expect(MaybeNS.get('wat', dict)).toEqual(MaybeNS.nothing());
  });

  test('`wrapReturn`', () => {
    const empty = '';
    const emptyResult = MaybeNS.nothing();

    const full = 'hello';
    const fullResult = MaybeNS.just(full.length);

    const mayBeNull = (s: string): number | null => (s.length > 0 ? s.length : null);
    const mayNotBeNull = MaybeNS.wrapReturn(mayBeNull);

    expect(mayNotBeNull(empty)).toEqual(emptyResult);
    expect(mayNotBeNull(full)).toEqual(fullResult);

    const mayBeUndefined = (s: string): number | undefined => (s.length > 0 ? s.length : undefined);
    const mayNotBeUndefined = MaybeNS.wrapReturn(mayBeUndefined);

    expect(mayNotBeUndefined(empty)).toEqual(emptyResult);
    expect(mayNotBeUndefined(full)).toEqual(fullResult);

    const returnsNullable = (): string | null => null;

    const querySelector = MaybeNS.wrapReturn(returnsNullable);
    expectTypeOf(querySelector).toEqualTypeOf<() => Maybe<string>>();
  });
});

// We aren't even really concerned with the "runtime" behavior here, which we
// know to be correct from other tests. Instead, this test just checks whether
// the types are narrowed as they should be.
test('narrowing', () => {
  const oneJust = MaybeNS.of(Unit);
  if (oneJust.isJust) {
    expectTypeOf(oneJust).toEqualTypeOf<Just<Unit>>();
    expect(oneJust.value).toBeDefined();
  }

  // As above, narrowing directly on the type rather than with the lookup.
  const anotherJust = MaybeNS.of(Unit);
  if (anotherJust.variant === Variant.Just) {
    expectTypeOf(anotherJust).toEqualTypeOf<Just<Unit>>();
    expect(anotherJust.value).toBeDefined();
  }

  const oneNothing = MaybeNS.nothing();
  if (oneNothing.isNothing) {
    expectTypeOf(oneNothing).toEqualTypeOf<Nothing<unknown>>();
  }

  const anotherNothing = MaybeNS.nothing();
  if (anotherNothing.variant === Variant.Nothing) {
    expectTypeOf(anotherNothing).toEqualTypeOf<Nothing<unknown>>();
  }

  expect('this type checked, hooray').toBeTruthy();
});

describe('`Maybe` class', () => {
  test('basic types', () => {
    let maybe = Maybe.of('hello');
    expectTypeOf(maybe);
    expectTypeOf(maybe).toHaveProperty('isJust');
    expectTypeOf(maybe).toHaveProperty('isJust');
    expectTypeOf(maybe).toHaveProperty('isNothing');
    expectTypeOf(maybe).not.toHaveProperty('value');
    expectTypeOf(Maybe).constructorParameters.toEqualTypeOf<[value?: unknown] | []>();
  });

  describe('Just instance', () => {
    test('constructor', () => {
      const theJust = new Maybe([]);
      expect(theJust.variant).toEqual(Variant.Just);
    });

    test('`value` property', () => {
      const val = 'hallo';
      const theJust = new Maybe(val);
      if (theJust.isJust) {
        expectTypeOf(theJust.isJust).toEqualTypeOf<true>();
        expectTypeOf(theJust).toHaveProperty('value');
        expectTypeOf(theJust.value).toEqualTypeOf(val);
        expect(theJust.value).toBe(val);
      } else {
        expect('wrongly instantiated').toBe(true);
      }
    });

    test('`unwrap` static method', () => {
      const val = 42;
      const theJust = new Maybe(42) as Just<number>;
      expect(unwrap(theJust)).toEqual(val);
    });

    test('`isJust` property', () => {
      const theJust = new Maybe([]);
      expect(theJust.isJust).toBe(true);
    });

    test('`isNothing` property', () => {
      const theJust = new Maybe([]);
      expect(theJust.isNothing).toBe(false);
    });

    test('`map` method', () => {
      const plus2 = (x: number) => x + 2;
      const theValue = 12;
      const theJust = new Maybe(theValue);
      const theResult = new Maybe(plus2(theValue));

      expect(theJust.map(plus2)).toEqual(theResult);
    });

    test('`mapOr` method', () => {
      const theValue = 42;
      const theJust = new Maybe(42);
      const theDefault = 1;
      const double = (n: number) => n * 2;

      expect(theJust.mapOr(theDefault, double)).toEqual(double(theValue));
    });

    test('`mapOrElse` method', () => {
      const theValue = 'this is a string';
      const theJust = new Maybe(theValue);
      const aDefault = () => 0;

      expect(theJust.mapOrElse(aDefault, length)).toEqual(length(theValue));
    });

    test('`match` method', () => {
      const theValue = 'this is a string';
      const theJust = new Maybe(theValue);

      expect(
        theJust.match({
          Just: (val) => val + ', yo',
          Nothing: () => 'rats, nothing',
        })
      ).toEqual('this is a string, yo');
    });

    test('`or` method', () => {
      const theJust = new Maybe({ neat: 'thing' });
      const anotherJust = new Maybe({ neat: 'waffles' });
      const aNothing = new Maybe<Neat>();

      expect(theJust.or(anotherJust)).toEqual(theJust);
      expect(theJust.or(aNothing)).toEqual(theJust);
    });

    test('`orElse` method', () => {
      const theJust = new Maybe(12);
      const getAnotherJust = () => MaybeNS.just(42);

      expect(theJust.orElse(getAnotherJust)).toEqual(theJust);
    });

    test('`and` method', () => {
      const theJust = new Maybe({ neat: 'thing' });
      const theConsequentJust = new Maybe(['amazing', { tuple: 'thing' }]);
      const aNothing = new Maybe();

      expect(theJust.and(theConsequentJust)).toEqual(theConsequentJust);
      expect(theJust.and(aNothing)).toEqual(aNothing);
    });

    test('`andThen` method', () => {
      const theValue = { Jedi: 'Luke Skywalker' };
      const theJust = new Maybe(theValue);
      const toDescription = (dict: { [key: string]: string }) =>
        new Maybe(
          Object.keys(dict)
            .map((key) => `${dict[key]} is a ${key}`)
            .join('\n')
        );

      const theExpectedResult = toDescription(theValue);
      expect(theJust.andThen(toDescription)).toEqual(theExpectedResult);
    });

    test('`unwrap` method', () => {
      const theValue = 'value';
      const theJust = new Maybe(theValue);
      expect(theJust.unsafelyUnwrap()).toEqual(theValue);
      expect(() => theJust.unsafelyUnwrap()).not.toThrow();
    });

    test('`unwrapOr` method', () => {
      const theValue = [1, 2, 3];
      const theJust = new Maybe(theValue);
      const theDefaultValue: number[] = [];

      expect(theJust.unwrapOr(theDefaultValue)).toEqual(theValue);
    });

    test('`unwrapOrElse` method', () => {
      const value = 'value';
      const theJust = new Maybe(value);
      expect(theJust.unwrapOrElse(() => 'other value')).toEqual(value);
    });

    test('`toOkOrErr` method', () => {
      const value = 'string';
      const theJust = new Maybe(value);
      const errValue = { reason: 'such badness' };
      expect(theJust.toOkOrErr(errValue)).toEqual(ok(value));
    });

    test('`toOkOrElseErr` method', () => {
      const value = ['neat'];
      const theJust = new Maybe(value);
      const errValue = 24;
      const getErrValue = () => errValue;

      expect(theJust.toOkOrElseErr(getErrValue)).toEqual(ok(value));
    });

    test('`toString` method', () => {
      expect(MaybeNS.of(42).toString()).toEqual('Just(42)');
    });

    test('`toJSON` method', () => {
      expect(MaybeNS.of({ x: 42 }).toJSON()).toEqual({
        variant: MaybeNS.Variant.Just,
        value: { x: 42 },
      });
      expect(MaybeNS.of(MaybeNS.of(42)).toJSON()).toEqual({
        variant: MaybeNS.Variant.Just,
        value: { variant: MaybeNS.Variant.Just, value: 42 },
      });
    });

    test('`equals` method', () => {
      const a = new Maybe('a');
      const b = new Maybe('a');
      const c = new Maybe('b');
      const d = new Maybe<string>();
      expect(a.equals(b)).toBe(true);
      expect(b.equals(c)).toBe(false);
      expect(c.equals(d)).toBe(false);
    });

    test('`ap` method', () => {
      const toString = (a: number) => a.toString();
      const fn: Maybe<typeof toString> = new Maybe(toString);
      const val = new Maybe(3);

      const result = fn.ap(val);

      expect(result.equals(MaybeNS.of('3'))).toBe(true);
    });

    test('`property` method', () => {
      type DeepType = { something?: { with?: { deeper?: { 'key names'?: string } } } };

      const allSet: DeepType = { something: { with: { deeper: { 'key names': 'like this' } } } };
      const deepResult = new Maybe(allSet)
        .get('something')
        .get('with')
        .get('deeper')
        .get('key names');
      expect(deepResult).toEqual(MaybeNS.just('like this'));

      const allEmpty: DeepType = {};
      const emptyResult = new Maybe(allEmpty)
        .get('something')
        .get('with')
        .get('deeper')
        .get('key names');
      expect(emptyResult).toEqual(MaybeNS.nothing());
    });
  });

  describe('`Nothing` instance', () => {
    test('constructor', () => {
      const theNothing = new Maybe();
      expect(theNothing.variant).toEqual(Variant.Nothing);
    });

    test('`isJust` property', () => {
      const theNothing = new Maybe();
      expect(theNothing.isJust).toBe(false);
    });

    test('`value` property', () => {
      const theNothing = new Maybe();
      expectTypeOf(theNothing).not.toHaveProperty('value');
      expect(() => (theNothing as any).value).toThrow();
    });

    test('`isNothing` property', () => {
      const theNothing = new Maybe();
      expect(theNothing.isNothing).toBe(true);
    });

    test('`map` method', () => {
      const theNothing = new Maybe<string>();
      expect(theNothing.map(length)).toEqual(theNothing);
    });

    test('`mapOr` method', () => {
      const theNothing = new Maybe<number>();
      const theDefaultValue = 'yay';
      expect(theNothing.mapOr(theDefaultValue, String)).toEqual(theDefaultValue);
    });

    test('`mapOrElse` method', () => {
      const theDefaultValue = 'potatoes';
      const getDefaultValue = () => theDefaultValue;
      const getNeat = (x: Neat) => x.neat;
      const theNothing = new Maybe<Neat>();
      expect(theNothing.mapOrElse(getDefaultValue, getNeat)).toBe(theDefaultValue);
    });

    test('`match` method', () => {
      const nietzsche = MaybeNS.nothing();
      const soDeepMan = [
        'Whoever fights monsters should see to it that in the process he does not become a monster.',
        'And if you gaze long enough into an abyss, the abyss will gaze back into you.',
      ].join(' ');

      expect(
        nietzsche.match({
          Just: (s) => s + ', yo',
          Nothing: () => soDeepMan,
        })
      ).toBe(soDeepMan);
    });

    test('`or` method', () => {
      const theNothing = new Maybe<boolean>(); // the worst: optional booleans!
      const theDefaultValue = MaybeNS.just(false);

      expect(theNothing.or(theDefaultValue)).toBe(theDefaultValue);
    });

    test('`orElse` method', () => {
      const theNothing = new Maybe<{ here: string[] }>();
      const justTheFallback = MaybeNS.just({ here: ['to', 'see'] });
      const getTheFallback = () => justTheFallback;

      expect(theNothing.orElse(getTheFallback)).toEqual(justTheFallback);
    });

    test('`and` method', () => {
      const theNothing = new Maybe<string[]>();
      const theConsequentJust = new Maybe('blaster bolts');
      const anotherNothing = new Maybe<string>();
      expect(theNothing.and(theConsequentJust)).toEqual(theNothing);
      expect(theNothing.and(anotherNothing)).toEqual(theNothing);
    });

    test('`andThen` method', () => {
      const theNothing = new Maybe();
      const theDefaultValue = 'string';
      const getDefaultValue = () => MaybeNS.just(theDefaultValue);

      expect(theNothing.andThen(getDefaultValue)).toEqual(theNothing);
    });

    test('`unsafelyUnwrap` method', () => {
      const noStuffAtAll = new Maybe();
      expect(() => noStuffAtAll.unsafelyUnwrap()).toThrow();
    });

    test('`unwrapOr` method', () => {
      const theNothing = new Maybe<number[]>();
      const theDefaultValue: number[] = [];
      expect(theNothing.unwrapOr(theDefaultValue)).toEqual(theDefaultValue);
    });

    test('`unwrapOrElse` method', () => {
      const theNothing = new Maybe();
      const theDefaultValue = 'it be all fine tho';
      expect(theNothing.unwrapOrElse(() => theDefaultValue)).toEqual(theDefaultValue);
    });

    test('`toOkOrErr` method', () => {
      const theNothing = new Maybe();
      const errValue = { reason: 'such badness' };
      expect(theNothing.toOkOrErr(errValue)).toEqual(err(errValue));
    });

    test('`toOkOrElseErr` method', () => {
      const theNothing = new Maybe();
      const errValue = 24;
      const getErrValue = () => errValue;

      expect(theNothing.toOkOrElseErr(getErrValue)).toEqual(err(errValue));
    });

    test('`toString` method', () => {
      expect(MaybeNS.nothing().toString()).toEqual('Nothing');
    });

    test('`toJSON` method', () => {
      expect(MaybeNS.nothing().toJSON()).toEqual({ variant: MaybeNS.Variant.Nothing });
      expect(MaybeNS.of(MaybeNS.nothing()).toJSON()).toEqual({
        variant: MaybeNS.Variant.Just,
        value: { variant: MaybeNS.Variant.Nothing },
      });
    });

    test('`equals` method', () => {
      const a = new Maybe<string>('a');
      const b = new Maybe<string>();
      const c = new Maybe<string>();
      expect(a.equals(b)).toBe(false);
      expect(b.equals(c)).toBe(true);
    });

    test('`ap` method', () => {
      const fn = new Maybe<(val: string) => number>();
      const val = new Maybe('three');

      const result = fn.ap(val);

      expect(result.isNothing).toBe(true);
    });

    test('`property` method', () => {
      type DeepType = { something?: { with?: { deeper?: { 'key names'?: string } } } };

      const result = new Maybe<DeepType>()
        .get('something')
        .get('with')
        .get('deeper')
        .get('key names');
      expect(result).toEqual(MaybeNS.nothing());
    });
  });
});
