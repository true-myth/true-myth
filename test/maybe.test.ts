import Maybe, { Variant, Nothing, Just, Matcher } from '../src/maybe';
import { err, ok } from '../src/result';
import { assertType } from './lib/assert';
import { Unit } from '../src/unit';

type Neat = { neat: string };

type AndThenAliases = 'andThen' | 'chain' | 'flatMap';

const length = (s: string) => s.length;

describe('`Maybe` pure functions', () => {
  test('`just`', () => {
    const theJust = Maybe.just('string');
    expect(theJust).toBeInstanceOf(Maybe.Just);
    switch (theJust.variant) {
      case Maybe.Variant.Just:
        expect(theJust.unsafelyUnwrap()).toBe('string');
        break;
      case Maybe.Variant.Nothing:
        expect(false).toBe(true); // because this should never happen
        break;
      default:
        expect(false).toBe(true); // because those are the only cases
    }

    expect(() => Maybe.just(null)).toThrow();
    expect(() => Maybe.just(undefined)).toThrow();
  });

  test('`nothing`', () => {
    const theNothing = Maybe.nothing();
    expect(theNothing).toBeInstanceOf(Maybe.Nothing);
    switch (theNothing.variant) {
      case Maybe.Variant.Just:
        expect(true).toBe(false); // because this should never happen
        break;
      case Maybe.Variant.Nothing:
        expect(true).toBe(true); // yay
        break;
      default:
        expect(false).toBe(true); // because those are the only cases
    }

    const nothingOnType = Maybe.nothing<string>();
    assertType<Maybe<string>>(nothingOnType);
  });

  describe('`of`', () => {
    test('with `null', () => {
      const nothingFromNull = Maybe.of<string>(null);
      assertType<Maybe<string>>(nothingFromNull);
      expect(Maybe.isJust(nothingFromNull)).toBe(false);
      expect(Maybe.isNothing(nothingFromNull)).toBe(true);
      expect(() => Maybe.unsafelyUnwrap(nothingFromNull)).toThrow();
    });

    test('with `undefined`', () => {
      const nothingFromUndefined = Maybe.of<number>(undefined);
      assertType<Maybe<number>>(nothingFromUndefined);
      expect(Maybe.isJust(nothingFromUndefined)).toBe(false);
      expect(Maybe.isNothing(nothingFromUndefined)).toBe(true);
      expect(() => Maybe.unsafelyUnwrap(nothingFromUndefined)).toThrow();
    });

    test('with values', () => {
      const aJust = Maybe.of<Neat>({ neat: 'strings' });
      assertType<Maybe<Neat>>(aJust);
      const aNothing = Maybe.of<Neat>(null);
      assertType<Maybe<Neat>>(aNothing);

      const justANumber = Maybe.of(42);
      assertType<Maybe<number>>(justANumber);
      expect(Maybe.isJust(justANumber)).toBe(true);
      expect(Maybe.isNothing(justANumber)).toBe(false);
      expect(Maybe.unsafelyUnwrap(justANumber)).toBe(42);
    });
  });

  describe('`fromNullable`', () => {
    test('with `null', () => {
      const nothingFromNull = Maybe.fromNullable<string>(null);
      assertType<Maybe<string>>(nothingFromNull);
      expect(Maybe.isJust(nothingFromNull)).toBe(false);
      expect(Maybe.isNothing(nothingFromNull)).toBe(true);
      expect(() => Maybe.unsafelyUnwrap(nothingFromNull)).toThrow();
    });

    test('with `undefined`', () => {
      const nothingFromUndefined = Maybe.fromNullable<number>(undefined);
      assertType<Maybe<number>>(nothingFromUndefined);
      expect(Maybe.isJust(nothingFromUndefined)).toBe(false);
      expect(Maybe.isNothing(nothingFromUndefined)).toBe(true);
      expect(() => Maybe.unsafelyUnwrap(nothingFromUndefined)).toThrow();
    });

    test('with values', () => {
      const aJust = Maybe.fromNullable<Neat>({ neat: 'strings' });
      assertType<Maybe<Neat>>(aJust);
      const aNothing = Maybe.fromNullable<Neat>(null);
      assertType<Maybe<Neat>>(aNothing);

      const justANumber = Maybe.fromNullable(42);
      assertType<Maybe<number>>(justANumber);
      expect(Maybe.isJust(justANumber)).toBe(true);
      expect(Maybe.isNothing(justANumber)).toBe(false);
      expect(Maybe.unsafelyUnwrap(justANumber)).toBe(42);
    });
  });

  test('`map`', () => {
    const justAString = Maybe.just('string');
    const itsLength = Maybe.map(length, justAString);
    assertType<Maybe<number>>(itsLength);
    expect(itsLength).toEqual(Maybe.just('string'.length));

    const none = Maybe.nothing<string>();
    const noLength = Maybe.map(length, none);
    assertType<Maybe<string>>(none);
    expect(noLength).toEqual(Maybe.nothing());
  });

  test('`mapOr`', () => {
    const justAString = Maybe.of('string');

    expect(Maybe.mapOr(0, length, justAString)).toEqual('string'.length);
    expect(Maybe.mapOr(0, length, Maybe.of<string>(null))).toEqual(0);

    expect(Maybe.mapOr<string, number>(0)(length)(justAString)).toEqual(
      Maybe.mapOr(0, length, justAString)
    );
    expect(Maybe.mapOr(0, length)(justAString)).toEqual(Maybe.mapOr(0, length, justAString));
  });

  test('`mapOrElse`', () => {
    const theValue = 'a string';
    const theDefault = 0;
    const toDefault = () => theDefault;
    const aJust = Maybe.just(theValue);
    const aNothing: Maybe<string> = Maybe.nothing();

    expect(Maybe.mapOrElse(toDefault, length, aJust)).toBe(theValue.length);
    expect(Maybe.mapOrElse(toDefault, length, aNothing)).toBe(theDefault);

    expect(Maybe.mapOrElse<string, number>(toDefault)(length)(aJust)).toEqual(
      Maybe.mapOrElse(toDefault, length, aJust)
    );
    expect(Maybe.mapOrElse(toDefault, length)(aJust)).toEqual(
      Maybe.mapOrElse(toDefault, length, aJust)
    );
  });

  test('`match`', () => {
    const theValue = 'a string';
    const aJust = Maybe.just(theValue);
    const aNothing: Maybe<string> = Maybe.nothing();

    const matcher: Matcher<string, string> = {
      Just: val => val + ', yo',
      Nothing: () => 'rats, nothing',
    };

    expect(Maybe.match(matcher, aJust)).toEqual('a string, yo');
    expect(Maybe.match(matcher, aNothing)).toEqual('rats, nothing');

    expect(Maybe.match(matcher)(aJust)).toEqual(Maybe.match(matcher, aJust));
  });

  test('`and`', () => {
    const aJust = Maybe.just(42);
    const anotherJust = Maybe.just('a string');
    const aNothing: Maybe<{}> = Maybe.nothing();
    expect(Maybe.and(anotherJust, aJust)).toBe(anotherJust);

    expect(Maybe.and(aNothing, aJust)).toEqual(aNothing);
    expect(Maybe.and(aNothing, aJust)).toEqual(aNothing);
    expect(Maybe.and(aNothing, aNothing)).toEqual(aNothing);

    expect(Maybe.and<number, {}>(aNothing)(aJust)).toEqual(Maybe.and(aNothing, aJust));
  });

  const andThenTest = (fn: AndThenAliases) => () => {
    const toMaybeNumber = (x: string) => Maybe.just(Number(x));
    const toNothing = (_: string) => Maybe.nothing<number>();

    const theValue = '42';
    const theJust = Maybe.just(theValue);
    const theExpectedResult = toMaybeNumber(theValue);
    const noString = Maybe.nothing<string>();
    const noNumber = Maybe.nothing<number>();

    expect(Maybe[fn](toMaybeNumber, theJust)).toEqual(theExpectedResult);
    expect(Maybe[fn](toNothing, theJust)).toEqual(noNumber);
    expect(Maybe[fn](toMaybeNumber, noString)).toEqual(noNumber);
    expect(Maybe[fn](toNothing, noString)).toEqual(noNumber);

    expect(Maybe[fn](toMaybeNumber)(theJust)).toEqual(Maybe[fn](toMaybeNumber, theJust));
  };

  test('`andThen`', andThenTest('andThen'));
  test('`chain`', andThenTest('chain'));
  test('`flatMap`', andThenTest('flatMap'));

  test('`or`', () => {
    const justAnswer = Maybe.of('42');
    const justWaffles = Maybe.of('waffles');
    const nothing: Maybe<string> = Maybe.nothing();

    expect(Maybe.or(justAnswer, justWaffles)).toBe(justWaffles);
    expect(Maybe.or(nothing, justWaffles)).toBe(justWaffles);
    expect(Maybe.or(justAnswer, nothing)).toBe(justAnswer);
    expect(Maybe.or(nothing, nothing)).toBe(nothing);

    expect(Maybe.or(justAnswer)(justWaffles)).toEqual(Maybe.or(justAnswer, justWaffles));
  });

  test('`orElse`', () => {
    const getWaffles = () => Maybe.of('waffles');
    const just42 = Maybe.of('42');
    expect(Maybe.orElse(getWaffles, just42)).toEqual(Maybe.just('42'));
    expect(Maybe.orElse(getWaffles, Maybe.of(null as string | null))).toEqual(
      Maybe.just('waffles')
    );
    expect(Maybe.orElse(() => Maybe.of(null as string | null), just42)).toEqual(Maybe.just('42'));
    expect(
      Maybe.orElse(() => Maybe.of(null as string | null), Maybe.of(null as string | null))
    ).toEqual(Maybe.nothing());

    expect(Maybe.orElse(getWaffles)(just42)).toEqual(Maybe.orElse(getWaffles, just42));
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

    expect(Maybe.unwrapOr(theDefaultValue)(theJust)).toEqual(
      Maybe.unwrapOr(theDefaultValue, theJust)
    );
  });

  test('`unwrapOrElse`', () => {
    const val = 100;
    const getVal = () => val;
    const just42 = Maybe.of(42);

    expect(Maybe.unwrapOrElse(getVal, just42)).toBe(42);
    expect(Maybe.unwrapOrElse(getVal, Maybe.nothing())).toBe(val);

    expect(Maybe.unwrapOrElse(getVal)(just42)).toEqual(Maybe.unwrapOrElse(getVal, just42));
  });

  test('`toOkOrErr`', () => {
    const theValue = 'string';
    const theJust = Maybe.of(theValue);
    const errValue = { reason: 'such badness' };

    expect(Maybe.toOkOrErr(errValue, theJust)).toEqual(ok(theValue));
    expect(Maybe.toOkOrErr(errValue, Maybe.nothing())).toEqual(err(errValue));

    expect(Maybe.toOkOrErr<string, typeof errValue>(errValue)(theJust)).toEqual(
      Maybe.toOkOrErr(errValue, theJust)
    );
  });

  test('`toOkOrElseErr`', () => {
    const theJust = Maybe.of(12);
    const errValue = 24;
    const getErrValue = () => errValue;

    expect(Maybe.toOkOrElseErr(getErrValue, theJust)).toEqual(ok(12));
    expect(Maybe.toOkOrElseErr(getErrValue, Maybe.nothing())).toEqual(err(errValue));

    expect(Maybe.toOkOrElseErr<number, number>(getErrValue)(theJust)).toEqual(
      Maybe.toOkOrElseErr(getErrValue, theJust)
    );
  });

  test('`fromResult`', () => {
    const value = 1000;
    const anOk = ok(value);
    expect(Maybe.fromResult(anOk)).toEqual(Maybe.just(value));

    const reason = 'oh teh noes';
    const anErr = err(reason);
    expect(Maybe.fromResult(anErr)).toEqual(Maybe.nothing());
  });

  test('`toString`', () => {
    expect(Maybe.toString(Maybe.of(42))).toEqual('Just(42)');
    expect(Maybe.toString(Maybe.nothing())).toEqual('Nothing');
  });

  test('`equals`', () => {
    const a = Maybe.of<string>('a');
    const b = Maybe.of<string>('a');
    const c = Maybe.nothing<string>();
    const d = Maybe.nothing<string>();
    expect(Maybe.equals(b, a)).toBe(true);
    expect(Maybe.equals(b)(a)).toBe(true);
    expect(Maybe.equals(c, b)).toBe(false);
    expect(Maybe.equals(c)(b)).toBe(false);
    expect(Maybe.equals(d, c)).toBe(true);
    expect(Maybe.equals(d)(c)).toBe(true);
  });

  test('`ap`', () => {
    const add = (a: number) => (b: number) => a + b;
    const maybeAdd = Maybe.of(add);

    expect(maybeAdd.ap(Maybe.of(1)).ap(Maybe.of(5))).toEqual(Maybe.of(6));

    const maybeAdd3 = Maybe.of<(val: number) => number>(add(3));
    const val = Maybe.of(2);
    const nada: Maybe<number> = Maybe.of(null as number | null | undefined);

    expect(Maybe.ap(maybeAdd3, val)).toEqual(Maybe.just(5));
    expect(Maybe.ap(maybeAdd3)(nada)).toEqual(Maybe.nothing());
  });

  test('isInstance', () => {
    const something: any = Maybe.just('yay');
    expect(Maybe.isInstance(something)).toBe(true);

    const nothing = Maybe.nothing();
    expect(Maybe.isInstance(nothing)).toBe(true);

    const nada = null;
    expect(Maybe.isInstance(nada)).toBe(false);

    const obj = { random: 'nonsense' };
    expect(Maybe.isInstance(obj)).toBe(false);
  });

  test('`find`', () => {
    const theValue = 4;
    const pred = (v: number) => v === theValue;

    const empty: number[] = [];

    expect(Maybe.find(pred, empty).variant).toBe(Maybe.Variant.Nothing);

    const missingTheValue = [1, 2, 3];
    expect(Maybe.find(pred, missingTheValue).variant).toBe(Maybe.Variant.Nothing);

    const hasTheValue = [1, 2, 3, theValue];
    const result = Maybe.find(pred, hasTheValue);
    expect(result.variant).toBe(Maybe.Variant.Just);
    expect((result as Just<number>).value).toBe(theValue);

    type Item = { count: number; name: string };
    type Response = Array<Item>;

    // This is more about testing the types with the currying; it's functionally
    // covered already.
    const array: Response = [{ count: 1, name: 'potato' }, { count: 10, name: 'waffles' }];
    const findAtLeast5 = Maybe.find(({ count }: Item) => count > 5);
    const found = findAtLeast5(array);
    expect(found.variant).toBe(Maybe.Variant.Just);
    expect((found as Just<Item>).value).toEqual(array[1]);
  });

  test('`head`', () => {
    expect(Maybe.head([])).toEqual(Maybe.nothing());
    expect(Maybe.head([1])).toEqual(Maybe.just(1));
    expect(Maybe.head([1, 2, 3])).toEqual(Maybe.just(1));
  });

  test('`last`', () => {
    expect(Maybe.last([])).toEqual(Maybe.nothing());
    expect(Maybe.last([1])).toEqual(Maybe.just(1));
    expect(Maybe.last([1, 2, 3])).toEqual(Maybe.just(3));
  });

  describe('`all`', () => {
    test('with basic types', () => {
      type ExpectedOutputType = Maybe<Array<string | number>>;

      let onlyJusts = [Maybe.just(2), Maybe.just('three')];
      let onlyJustsAll = Maybe.all(...onlyJusts);
      assertType<ExpectedOutputType>(onlyJustsAll);
      expect(onlyJustsAll).toEqual(Maybe.just([2, 'three']));

      let hasNothing = [Maybe.just(2), Maybe.nothing<string>()];
      let hasNothingAll = Maybe.all(...hasNothing);
      assertType<ExpectedOutputType>(hasNothingAll);
      expect(hasNothingAll).toEqual(Maybe.nothing());
    });

    test('with arrays', () => {
      type ExpectedOutputType = Maybe<Array<number | string[]>>;

      let nestedArrays = [Maybe.just(1), Maybe.just(['two', 'three'])];
      let nestedArraysAll = Maybe.all(...nestedArrays);

      assertType<ExpectedOutputType>(nestedArraysAll);
      expect(nestedArraysAll).toEqual(Maybe.just([1, ['two', 'three']]));
    });
  });

  test('`tuple`', () => {
    type Tuple2 = [Maybe<string>, Maybe<number>];
    let invalid: Tuple2 = [Maybe.just('wat'), Maybe.nothing()];
    const invalidResult = Maybe.tuple(invalid);
    expect(invalidResult).toEqual(Maybe.nothing());

    type Tuple3 = [Maybe<string>, Maybe<number>, Maybe<{ neat: string }>];
    let valid: Tuple3 = [Maybe.just('hey'), Maybe.just(4), Maybe.just({ neat: 'yeah' })];
    const result = Maybe.tuple(valid);
    expect(result).toEqual(Maybe.just(['hey', 4, { neat: 'yeah' }]));
    assertType<Maybe<[string, number, { neat: string }]>>(result);
  });

  test('`property`', () => {
    type Person = { name?: string };
    let chris: Person = { name: 'chris' };
    expect(Maybe.property('name', chris)).toEqual(Maybe.just(chris.name));

    let nobody: Person = {};
    expect(Maybe.property('name', nobody)).toEqual(Maybe.nothing());

    type Dict<T> = { [key: string]: T };
    let dict: Dict<string> = { quux: 'warble' };
    expect(Maybe.property('quux', dict)).toEqual(Maybe.just('warble'));
    expect(Maybe.property('wat', dict)).toEqual(Maybe.nothing());
  });

  test('`get`', () => {
    type Person = { name?: string };
    let chris: Person = { name: 'chris' };
    let justChris: Maybe<Person> = Maybe.just(chris);
    expect(Maybe.get('name', justChris)).toEqual(Maybe.just(chris.name));

    let nobody: Maybe<Person> = Maybe.nothing();
    expect(Maybe.get('name', nobody)).toEqual(Maybe.nothing());

    type Dict<T> = { [key: string]: T };
    let dict = Maybe.just({ quux: 'warble' } as Dict<string>);
    expect(Maybe.get('quux', dict)).toEqual(Maybe.just('warble'));
    expect(Maybe.get('wat', dict)).toEqual(Maybe.nothing());
  });

  test('`wrap`', () => {
    const empty = '';
    const emptyResult = Maybe.nothing();

    const full = 'hello';
    const fullResult = Maybe.just(full.length);

    const mayBeNull = (s: string): number | null => (s.length > 0 ? s.length : null);
    const mayNotBeNull = Maybe.wrap(mayBeNull);

    expect(mayNotBeNull(empty)).toEqual(emptyResult);
    expect(mayNotBeNull(full)).toEqual(fullResult);

    const mayBeUndefined = (s: string): number | undefined => (s.length > 0 ? s.length : undefined);
    const mayNotBeUndefined = Maybe.wrap(mayBeUndefined);

    expect(mayNotBeUndefined(empty)).toEqual(emptyResult);
    expect(mayNotBeUndefined(full)).toEqual(fullResult);
  });
});

// We aren't even really concerned with the "runtime" behavior here, which we
// know to be correct from other tests. Instead, this test just checks whether
// the types are narrowed as they should be.
test('narrowing', () => {
  const oneJust = Maybe.of(Unit);
  if (oneJust.isJust()) {
    assertType<Just<Unit>>(oneJust);
    expect(oneJust.value).toBeDefined();
  }

  // As above, narrowing directly on the type rather than with the lookup.
  const anotherJust = Maybe.of(Unit);
  if (anotherJust.variant === Variant.Just) {
    assertType<Just<Unit>>(anotherJust);
    expect(anotherJust.value).toBeDefined();
  }

  const oneNothing = Maybe.nothing();
  if (oneNothing.isNothing()) {
    assertType<Nothing<any>>(oneNothing);
  }

  const anotherNothing = Maybe.nothing();
  if (anotherNothing.variant === Variant.Nothing) {
    assertType<Nothing<any>>(anotherNothing);
  }

  expect('this type checked, hooray').toBeTruthy();
});

describe('`Maybe.Just` class', () => {
  test('constructor', () => {
    const theJust = new Maybe.Just([]);
    expect(theJust).toBeInstanceOf(Maybe.Just);
  });

  test('`value` property', () => {
    const val = 'hallo';
    const theJust = new Maybe.Just(val);
    expect(theJust.value).toBe(val);
  });

  test('`unwrap` static method', () => {
    const val = 42;
    const theJust = new Maybe.Just(42);
    expect(Just.unwrap(theJust)).toEqual(val);
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
    const plus2 = (x: number) => x + 2;
    const theValue = 12;
    const theJust = new Maybe.Just(theValue);
    const theResult = new Maybe.Just(plus2(theValue));

    expect(theJust.map(plus2)).toEqual(theResult);
  });

  test('`mapOr` method', () => {
    const theValue = 42;
    const theJust = new Maybe.Just(42);
    const theDefault = 1;
    const double = (n: number) => n * 2;

    expect(theJust.mapOr(theDefault, double)).toEqual(double(theValue));
  });

  test('`mapOrElse` method', () => {
    const theValue = 'this is a string';
    const theJust = new Maybe.Just(theValue);
    const aDefault = () => 0;

    expect(theJust.mapOrElse(aDefault, length)).toEqual(length(theValue));
  });

  test('`match` method', () => {
    const theValue = 'this is a string';
    const theJust = new Maybe.Just(theValue);

    expect(
      theJust.match({
        Just: val => val + ', yo',
        Nothing: () => 'rats, nothing',
      })
    ).toEqual('this is a string, yo');
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

  const andThenMethodTest = (method: AndThenAliases) => () => {
    const theValue = { Jedi: 'Luke Skywalker' };
    const theJust = new Maybe.Just(theValue);
    const toDescription = (dict: { [key: string]: string }) =>
      new Maybe.Just(
        Object.keys(dict)
          .map(key => `${dict[key]} is a ${key}`)
          .join('\n')
      );

    const theExpectedResult = toDescription(theValue);
    expect(theJust[method](toDescription)).toEqual(theExpectedResult);
  };

  test('`andThen` method', andThenMethodTest('andThen'));
  test('`chain` method', andThenMethodTest('chain'));
  test('`flatMap` method', andThenMethodTest('flatMap'));

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

  test('`equals` method', () => {
    const a = new Maybe.Just('a');
    const b = new Maybe.Just('a');
    const c = new Maybe.Just('b');
    const d = new Maybe.Nothing<string>();
    expect(a.equals(b)).toBe(true);
    expect(b.equals(c)).toBe(false);
    expect(c.equals(d)).toBe(false);
  });

  test('`ap` method', () => {
    const toString = (a: number) => a.toString();
    const fn: Maybe<typeof toString> = new Maybe.Just(toString);
    const val = new Maybe.Just(3);

    const result = fn.ap(val);

    expect(result.equals(Maybe.of('3'))).toBe(true);
  });

  test('`property` method', () => {
    type DeepType = { something?: { with?: { deeper?: { 'key names'?: string } } } };

    const allSet: DeepType = { something: { with: { deeper: { 'key names': 'like this' } } } };
    const deepResult = new Maybe.Just(allSet)
      .get('something')
      .get('with')
      .get('deeper')
      .get('key names');
    expect(deepResult).toEqual(Maybe.just('like this'));

    const allEmpty: DeepType = {};
    const emptyResult = new Maybe.Just(allEmpty)
      .get('something')
      .get('with')
      .get('deeper')
      .get('key names');
    expect(emptyResult).toEqual(Maybe.nothing());
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

  test('`match` method', () => {
    const nietzsche = Maybe.nothing();
    const soDeepMan = [
      'Whoever fights monsters should see to it that in the process he does not become a monster.',
      'And if you gaze long enough into an abyss, the abyss will gaze back into you.',
    ].join(' ');

    expect(
      nietzsche.match({
        Just: s => s + ', yo',
        Nothing: () => soDeepMan,
      })
    ).toBe(soDeepMan);
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
    const theNothing = new Maybe.Nothing<string[]>();
    const theConsequentJust = new Maybe.Just('blaster bolts');
    const anotherNothing = new Maybe.Nothing<string>();
    expect(theNothing.and(theConsequentJust)).toEqual(theNothing);
    expect(theNothing.and(anotherNothing)).toEqual(theNothing);
  });

  const andThenMethodTest = (method: AndThenAliases) => () => {
    const theNothing = new Maybe.Nothing();
    const theDefaultValue = 'string';
    const getDefaultValue = () => Maybe.just(theDefaultValue);

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

  test('`equals` method', () => {
    const a = new Maybe.Just<string>('a');
    const b = new Maybe.Nothing<string>();
    const c = new Maybe.Nothing<string>();
    expect(a.equals(b)).toBe(false);
    expect(b.equals(c)).toBe(true);
  });

  test('`ap` method', () => {
    const fn = new Maybe.Nothing<(val: string) => number>();
    const val = new Maybe.Just('three');

    const result = fn.ap(val);

    expect(result.isNothing()).toBe(true);
  });

  test('`property` method', () => {
    type DeepType = { something?: { with?: { deeper?: { 'key names'?: string } } } };

    const result = new Maybe.Nothing<DeepType>()
      .get('something')
      .get('with')
      .get('deeper')
      .get('key names');
    expect(result).toEqual(Maybe.nothing());
  });
});

test('`Maybe` classes interacting', () => {
  const aMaybe: Maybe<string> = Maybe.nothing();
  const mapped = aMaybe.map(length);
  expect(mapped).toBeInstanceOf(Maybe.Nothing);
  expect(mapped).not.toBeInstanceOf(Maybe.Just);

  const anotherMaybe: Maybe<number> = Maybe.just(10);
  const anotherMapped = anotherMaybe.mapOr('nada', n => `The number was ${n}`);
  expect(anotherMapped).toEqual('The number was 10');
});
