import { describe, expect, expectTypeOf, test } from 'vitest';

import Maybe, { Variant, Nothing, Just, Matcher } from 'true-myth/maybe';
import * as maybe from 'true-myth/maybe';
import { Unit } from 'true-myth/unit';

type Neat = { neat: string };

const length = (s: string) => s.length;

describe('`Maybe` pure functions', () => {
  test('`just`', () => {
    const theJust = maybe.just('string');
    expect(theJust).toBeInstanceOf(Maybe);
    switch (theJust.variant) {
      case maybe.Variant.Just:
        expect(theJust.value).toBe('string');
        break;
      case maybe.Variant.Nothing:
        expect(true).toBe(false); // Not possible
        break;
      default:
        expect(false).toBe(true); // because those are the only cases
    }

    expect(() =>
      maybe.just(
        // @ts-expect-error: null is forbidden here
        null
      )
    ).toThrow();
    expect(() =>
      maybe.just(
        // @ts-expect-error: undefined is forbidden here
        undefined
      )
    ).toThrow();

    expectTypeOf(Maybe.just(() => null)).toBeNever();
    expectTypeOf(Maybe.just(() => undefined)).toBeNever();

    let example = (): string | undefined => undefined;
    expectTypeOf(Maybe.just(example)).toBeNever();
    expectTypeOf(Maybe.just(() => 'hello')).toEqualTypeOf<Maybe<() => string>>();
  });

  test('`nothing`', () => {
    const theNothing = maybe.nothing();
    expect(theNothing).toBeInstanceOf(Maybe);
    switch (theNothing.variant) {
      // @ts-expect-error -- this cannot happen! Should fail to type-check if it
      // *does* happen.
      case maybe.Variant.Just:
        expect(true).toBe(false); // because this should never happen
        break;
      case maybe.Variant.Nothing:
        expect(true).toBe(true); // yay
        break;
      default:
        expect(false).toBe(true); // because those are the only cases
    }

    const nothingOnType = maybe.nothing<string>();
    expectTypeOf(nothingOnType).toMatchTypeOf<Maybe<string>>();
  });

  describe('`of`', () => {
    expectTypeOf(Maybe.of(() => null)).toBeNever();
    expectTypeOf(Maybe.of(() => undefined)).toBeNever();

    let example = (): string | undefined => undefined;
    expectTypeOf(Maybe.of(example)).toBeNever();
    expectTypeOf(Maybe.of(() => 'hello')).toEqualTypeOf<Maybe<() => string>>();

    test('with `null', () => {
      const nothingFromNull = maybe.of<string>(null);
      expectTypeOf(nothingFromNull).toEqualTypeOf<Maybe<string>>();
      expect(nothingFromNull.isJust).toBe(false);
      expect(nothingFromNull.isNothing).toBe(true);
      // @ts-expect-error -- `value` isn't accessible without narrowing
      expect(() => nothingFromNull.value).toThrow();
    });

    test('with `undefined`', () => {
      const nothingFromUndefined = maybe.of<number>(undefined);
      expectTypeOf(nothingFromUndefined).toEqualTypeOf<Maybe<number>>();
      expect(nothingFromUndefined.isJust).toBe(false);
      expect(nothingFromUndefined.isNothing).toBe(true);
      // @ts-expect-error -- `value` isn't accessible without narrowing
      expect(() => nothingFromUndefined.value).toThrow();
    });

    test('with values', () => {
      const aJust = maybe.of<Neat>({ neat: 'strings' });
      expectTypeOf(aJust).toEqualTypeOf<Maybe<Neat>>();
      const aNothing = maybe.of<Neat>(null);
      expectTypeOf(aNothing).toEqualTypeOf<Maybe<Neat>>();

      const justANumber = maybe.of(42);
      expectTypeOf(justANumber).toEqualTypeOf<Maybe<number>>();
      expect(justANumber.isJust).toBe(true);
      expect(justANumber.isNothing).toBe(false);
      expect((justANumber as Just<number>).value).toBe(42);
    });
  });

  test('`map`', () => {
    const justAString = maybe.just('string');
    const itsLength = maybe.map(length, justAString);
    expectTypeOf(itsLength).toEqualTypeOf<Maybe<number>>();
    expect(itsLength).toEqual(maybe.just('string'.length));

    const none = maybe.nothing<string>();
    const noLength = maybe.map(length, none);
    expectTypeOf(none).toMatchTypeOf<Maybe<string>>();
    expect(noLength).toEqual(maybe.nothing());

    expect(() => {
      maybe.map(
        // @ts-expect-error
        (_val) => null,
        Maybe.of('Hello')
      );
    }).toThrow();
  });

  test('`mapOr`', () => {
    const justAString = maybe.of('string');

    expect(maybe.mapOr(0, length, justAString)).toEqual('string'.length);
    expect(maybe.mapOr(0, length, maybe.of<string>(null))).toEqual(0);

    expect(maybe.mapOr<string, number>(0)(length)(justAString)).toEqual(
      maybe.mapOr(0, length, justAString)
    );
    expect(maybe.mapOr(0, length)(justAString)).toEqual(maybe.mapOr(0, length, justAString));
  });

  test('`mapOrElse`', () => {
    const theValue = 'a string';
    const theDefault = 0;
    const toDefault = () => theDefault;
    const aJust = maybe.just(theValue);
    const aNothing: Maybe<string> = maybe.nothing();

    expect(maybe.mapOrElse(toDefault, length, aJust)).toBe(theValue.length);
    expect(maybe.mapOrElse(toDefault, length, aNothing)).toBe(theDefault);

    expect(maybe.mapOrElse<string, number>(toDefault)(length)(aJust)).toEqual(
      maybe.mapOrElse(toDefault, length, aJust)
    );
    expect(maybe.mapOrElse(toDefault, length)(aJust)).toEqual(
      maybe.mapOrElse(toDefault, length, aJust)
    );
  });

  test('`match`', () => {
    const theValue = 'a string';
    const aJust = maybe.just(theValue);
    const aNothing: Maybe<string> = maybe.nothing();

    const matcher: Matcher<string, string> = {
      Just: (val) => val + ', yo',
      Nothing: () => 'rats, nothing',
    };

    expect(maybe.match(matcher, aJust)).toEqual('a string, yo');
    expect(maybe.match(matcher, aNothing)).toEqual('rats, nothing');

    expect(maybe.match(matcher)(aJust)).toEqual(maybe.match(matcher, aJust));
  });

  test('`and`', () => {
    const aJust = maybe.just(42);
    const anotherJust = maybe.just('a string');
    const aNothing: Maybe<{}> = maybe.nothing();
    expect(maybe.and(anotherJust, aJust)).toBe(anotherJust);

    expect(maybe.and(aNothing, aJust)).toEqual(aNothing);
    expect(maybe.and(aNothing, aJust)).toEqual(aNothing);
    expect(maybe.and(aNothing, aNothing)).toEqual(aNothing);

    expect(maybe.and<number, {}>(aNothing)(aJust)).toEqual(maybe.and(aNothing, aJust));
  });

  describe('`andThen`', () => {
    test('basic functionality', () => {
      const toMaybeNumber = (x: string) => maybe.just(Number(x));
      const toNothing = (_: string) => maybe.nothing<number>();

      const theValue = '42';
      const theJust = maybe.just(theValue);
      const theExpectedResult = toMaybeNumber(theValue);
      const noString = maybe.nothing<string>();
      const noNumber = maybe.nothing<number>();

      expect(maybe.andThen(toMaybeNumber, theJust)).toEqual(theExpectedResult);
      expect(maybe.andThen(toNothing, theJust)).toEqual(noNumber);
      expect(maybe.andThen(toMaybeNumber, noString)).toEqual(noNumber);
      expect(maybe.andThen(toNothing, noString)).toEqual(noNumber);

      expect(maybe.andThen(toMaybeNumber)(theJust)).toEqual(maybe.andThen(toMaybeNumber, theJust));
    });

    test('with multiple types in the returned `Maybe` instances', () => {
      class Branded<T extends string> {
        constructor(public readonly name: T) {}
      }

      let theOutput = maybe.andThen(
        (_) => {
          if (Math.random() < 0.1) {
            return maybe.just(new Branded('just-a'));
          }

          if (Math.random() < 0.2) {
            return maybe.nothing<Branded<'empty'>>();
          }

          if (Math.random() < 0.3) {
            return maybe.just(new Branded('just-b'));
          }

          return maybe.nothing<Branded<'empty'>>();
        },
        Maybe.of(new Branded('just'))
      );

      expectTypeOf(theOutput).toEqualTypeOf<
        Maybe<Branded<'just-a'> | Branded<'just-b'> | Branded<'empty'>>
      >;
    });
  });

  test('`or`', () => {
    const justAnswer = maybe.of('42');
    const justWaffles = maybe.of('waffles');
    const nothing: Maybe<string> = maybe.nothing();

    expect(maybe.or(justAnswer, justWaffles)).toBe(justWaffles);
    expect(maybe.or(nothing, justWaffles)).toBe(justWaffles);
    expect(maybe.or(justAnswer, nothing)).toBe(justAnswer);
    expect(maybe.or(nothing, nothing)).toBe(nothing);

    expect(maybe.or(justAnswer)(justWaffles)).toEqual(maybe.or(justAnswer, justWaffles));
  });

  describe('`orElse`', () => {
    test('basic functionality', () => {
      const getWaffles = () => maybe.of('waffles');
      const just42 = maybe.of('42');
      expect(maybe.orElse(getWaffles, just42)).toEqual(maybe.just('42'));
      expect(maybe.orElse(getWaffles, maybe.of(null as string | null))).toEqual(
        maybe.just('waffles')
      );
      expect(maybe.orElse(() => maybe.of(null as string | null), just42)).toEqual(maybe.just('42'));
      expect(
        maybe.orElse(() => maybe.of(null as string | null), maybe.of(null as string | null))
      ).toEqual(maybe.nothing());

      expect(maybe.orElse(getWaffles)(just42)).toEqual(maybe.orElse(getWaffles, just42));
    });

    test('with multiple types in the returned `Maybe` instances', () => {
      class Branded<T extends string> {
        constructor(public readonly name: T) {}
      }

      let theOutput = maybe.orElse(() => {
        if (Math.random() < 0.1) {
          return maybe.just(new Branded('just-a'));
        }

        if (Math.random() < 0.2) {
          return maybe.nothing<Branded<'empty'>>();
        }

        if (Math.random() < 0.3) {
          return maybe.just(new Branded('just-b'));
        }

        return maybe.nothing<Branded<'empty'>>();
      }, Maybe.nothing<'empty-start'>());

      expectTypeOf(theOutput).toEqualTypeOf<
        Maybe<Branded<'just-a'> | Branded<'just-b'> | Branded<'empty'>>
      >;
    });
  });

  test('`unwrap`', () => {
    expect((maybe.of('42') as Just<string>).value).toBe('42');
    // @ts-expect-error -- `value` isn't accessible without narrowing
    expect(() => maybe.nothing().value).toThrow();
  });

  test('`unwrapOr`', () => {
    const theValue = [1, 2, 3];
    const theDefaultValue: number[] = [];

    const theJust = maybe.of(theValue);
    const theNothing = maybe.nothing();

    expect(maybe.unwrapOr(theDefaultValue, theJust)).toEqual(theValue);
    expect(maybe.unwrapOr(theDefaultValue, theNothing)).toEqual(theDefaultValue);

    expect(maybe.unwrapOr(theDefaultValue)(theJust)).toEqual(
      maybe.unwrapOr(theDefaultValue, theJust)
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
    const just42 = maybe.of(42);

    expect(maybe.unwrapOrElse(getVal, just42)).toBe(42);
    expect(maybe.unwrapOrElse(getVal, maybe.nothing())).toBe(val);

    expect(maybe.unwrapOrElse(getVal)(just42)).toEqual(maybe.unwrapOrElse(getVal, just42));

    // test unwrapping to undefined
    const noop = (): undefined => undefined;
    const undefinedOr42 = maybe.unwrapOrElse(noop, just42);
    expectTypeOf(undefinedOr42).toEqualTypeOf<number | undefined>();
    expect(undefinedOr42).toEqual(42);
  });

  describe('`toString`', () => {
    test('with simple values', () => {
      expect(maybe.toString(maybe.of(42))).toEqual('Just(42)');
      expect(maybe.toString(maybe.nothing<string>())).toEqual('Nothing');
    });

    test('with complex values', () => {
      expect(maybe.toString(maybe.of([1, 2, 3]))).toEqual('Just(1,2,3)');
      expect(maybe.toString(maybe.of({ neato: true }))).toEqual('Just([object Object])');

      class HasToString {
        toString() {
          return 'This has toString';
        }
      }
      expect(maybe.toString(maybe.of(new HasToString()))).toEqual('Just(This has toString)');
    });
  });

  describe('`toString`', () => {
    test('normal cases', () => {
      expect(maybe.toString(maybe.of(42))).toEqual('Just(42)');
      expect(maybe.toString(maybe.nothing<string>())).toEqual('Nothing');
    });

    test('custom `toString`s', () => {
      const withNotAFunction = {
        whyThough: 'because JS bro',
        toString: '🤨',
      };

      expect(maybe.toString(Maybe.of(withNotAFunction))).toEqual(
        `Just(${JSON.stringify(withNotAFunction)})`
      );

      const withBadFunction = {
        cueSobbing: true,
        toString() {
          return { lol: 123 };
        },
      };

      expect(maybe.toString(Maybe.of(withBadFunction))).toEqual(
        `Just(${JSON.stringify(withBadFunction)})`
      );
    });
  });

  test('`toJSON`', () => {
    expect(maybe.toJSON(maybe.of(42))).toEqual({ variant: maybe.Variant.Just, value: 42 });
    expect(maybe.toJSON(maybe.nothing())).toEqual({ variant: maybe.Variant.Nothing });
    expect(maybe.toJSON(maybe.of({ a: 42, b: null }))).toEqual({
      variant: maybe.Variant.Just,
      value: { a: 42, b: null },
    });
  });

  test('`toJSON` through serialization', () => {
    const actualSerializedJust = JSON.stringify(maybe.of(42));
    const actualSerializedNothing = JSON.stringify(maybe.nothing());
    const expectedSerializedJust = JSON.stringify({ variant: maybe.Variant.Just, value: 42 });
    const expectedSerializedNothing = JSON.stringify({ variant: maybe.Variant.Nothing });

    expect(actualSerializedJust).toEqual(expectedSerializedJust);
    expect(actualSerializedNothing).toEqual(expectedSerializedNothing);
  });

  test('`equals`', () => {
    const a = maybe.of<string>('a');
    const b = maybe.of<string>('a');
    const c = maybe.nothing<string>();
    const d = maybe.nothing<string>();
    expect(maybe.equals(b, a)).toBe(true);
    expect(maybe.equals(b)(a)).toBe(true);
    expect(maybe.equals(c, b)).toBe(false);
    expect(maybe.equals(c)(b)).toBe(false);
    expect(maybe.equals(d, c)).toBe(true);
    expect(maybe.equals(d)(c)).toBe(true);
  });

  test('`ap`', () => {
    const add = (a: number) => (b: number) => a + b;
    const maybeAdd = maybe.of(add);

    expect(maybeAdd.ap(maybe.of(1)).ap(maybe.of(5))).toEqual(maybe.of(6));

    const maybeAdd3 = maybe.of<(val: number) => number>(add(3));
    const val = maybe.of(2);
    const nada: Maybe<number> = maybe.of(null as number | null | undefined);

    expect(maybe.ap(maybeAdd3, val)).toEqual(maybe.just(5));
    expect(maybe.ap(maybeAdd3)(nada)).toEqual(maybe.nothing());
  });

  test('isInstance', () => {
    const something: unknown = maybe.just('yay');
    expect(maybe.isInstance(something)).toBe(true);

    const nothing = maybe.nothing();
    expect(maybe.isInstance(nothing)).toBe(true);

    const nada = null;
    expect(maybe.isInstance(nada)).toBe(false);

    const obj = { random: 'nonsense' };
    expect(maybe.isInstance(obj)).toBe(false);
  });

  describe('array helpers', () => {
    test('`find`', () => {
      const theValue = 4;
      const pred = (v: number) => v === theValue;

      const empty: number[] = [];

      expect(maybe.find(pred, empty).variant).toBe(maybe.Variant.Nothing);

      const missingTheValue = [1, 2, 3];
      expect(maybe.find(pred, missingTheValue).variant).toBe(maybe.Variant.Nothing);

      const hasTheValue = [1, 2, 3, theValue];
      const result = maybe.find(pred, hasTheValue);
      expect(result.variant).toBe(maybe.Variant.Just);
      expect((result as Just<number>).value).toBe(theValue);

      type Item = { count: number; name: string };
      type Response = Array<Item>;

      // This is more about testing the types with the currying; it's functionally
      // covered already.
      const array: Response = [
        { count: 1, name: 'potato' },
        { count: 10, name: 'waffles' },
      ];
      const findAtLeast5 = maybe.find(({ count }: Item) => count > 5);
      const found = findAtLeast5(array);
      expect(found.variant).toBe(maybe.Variant.Just);
      expect((found as Just<Item>).value).toEqual(array[1]);

      // Type narrowing via predicates.
      // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
      const findByName = <T extends string>(name: T) =>
        maybe.find((item: Item): item is Item & { name: T } => item.name === name);
      const waffles = findByName('waffles')(array);
      expect(waffles.variant).toBe(maybe.Variant.Just);
      expect((waffles as Just<Item>).value).toEqual(array[1]);
      expectTypeOf(waffles).toMatchTypeOf<Maybe<{ name: 'waffles' }>>();

      const readonlyEmpty: readonly number[] = [];
      const foundReadonly = maybe.find(pred, readonlyEmpty);
      expectTypeOf(foundReadonly).toMatchTypeOf<Maybe<number>>();
    });

    test('`first`', () => {
      expect(maybe.first([])).toEqual(maybe.nothing());
      expect(maybe.first([1])).toEqual(maybe.just(1));
      expect(maybe.first([1, 2, 3])).toEqual(maybe.just(1));

      const readonlyEmpty: readonly number[] = [];
      expect(maybe.first(readonlyEmpty)).toEqual(maybe.nothing());
      const readonlyFilled: readonly number[] = [1, 2, 3];
      expect(maybe.first(readonlyFilled)).toEqual(maybe.just(1));
    });

    test('`last`', () => {
      expect(maybe.last([])).toEqual(maybe.nothing());
      expect(maybe.last([1])).toEqual(maybe.just(1));
      expect(maybe.last([1, 2, 3])).toEqual(maybe.just(3));

      const readonlyEmpty: readonly number[] = [];
      expect(maybe.last(readonlyEmpty)).toEqual(maybe.nothing());
      const readonlyFilled: readonly number[] = [1, 2, 3];
      expect(maybe.last(readonlyFilled)).toEqual(maybe.just(3));
    });

    describe('`transposeArray`', () => {
      test('with basic types', () => {
        type ExpectedOutputType = Maybe<Array<string | number>>;

        let onlyJusts = [maybe.just(2), maybe.just('three')];
        let onlyJustsAll = maybe.transposeArray(onlyJusts);
        expectTypeOf(onlyJustsAll).toEqualTypeOf<ExpectedOutputType>();
        expect(onlyJustsAll).toEqual(maybe.just([2, 'three']));

        let hasNothing = [maybe.just(2), maybe.nothing<string>()];
        let hasNothingAll = maybe.transposeArray(hasNothing);
        expectTypeOf(hasNothingAll).toEqualTypeOf<ExpectedOutputType>();
        expect(hasNothingAll).toEqual(maybe.nothing());
      });

      test('with arrays', () => {
        type ExpectedOutputType = Maybe<Array<number | string[]>>;

        let nestedArrays = [maybe.just(1), maybe.just(['two', 'three'])];
        let nestedArraysAll = maybe.transposeArray(nestedArrays);

        expectTypeOf(nestedArraysAll).toEqualTypeOf<ExpectedOutputType>();
        expect(nestedArraysAll).toEqual(maybe.just([1, ['two', 'three']]));
      });

      test('with tuples', () => {
        type ExpectedOutputType = Maybe<readonly [number, string]>;

        let theOutput = maybe.transposeArray([maybe.just(123), maybe.just('hello')]);

        expectTypeOf(theOutput).toEqualTypeOf<ExpectedOutputType>();
        expect(theOutput).toEqual(maybe.just([123, 'hello']));
      });

      test('with readonly arrays', () => {
        let theInput: readonly Maybe<number>[] = [Maybe.just(1), Maybe.just(2)];
        let theOutput = maybe.transposeArray(theInput);
        expectTypeOf(theOutput).toEqualTypeOf<Maybe<readonly number[]>>();
        expect(theOutput).toEqual(Maybe.just([1, 2]));
      });
    });
  });

  test('`property`', () => {
    type Person = { name?: string };
    let chris: Person = { name: 'chris' };
    expect(maybe.property('name', chris)).toEqual(maybe.just('chris'));

    let nobody: Person = {};
    expect(maybe.property('name', nobody)).toEqual(maybe.nothing());

    type Dict<T> = { [key: string]: T };
    let dict: Dict<string> = { quux: 'warble' };
    expect(maybe.property('quux', dict)).toEqual(maybe.just('warble'));
    expect(maybe.property('wat', dict)).toEqual(maybe.nothing());
  });

  describe('`get`', () => {
    test('basic form', () => {
      type Person = { name?: string };
      let chris: Person = { name: 'chris' };
      let justChris: Maybe<Person> = maybe.just(chris);
      expect(maybe.get('name', justChris)).toEqual(maybe.just('chris'));

      let nobody: Maybe<Person> = maybe.nothing();
      expect(maybe.get('name', nobody)).toEqual(maybe.nothing());

      type Dict<T> = { [key: string]: T };
      let dict = maybe.just({ quux: 'warble' } as Dict<string>);
      expect(maybe.get('quux', dict)).toEqual(maybe.just('warble'));
      expect(maybe.get('wat', dict)).toEqual(maybe.nothing());
    });

    test('curried form', () => {
      type DeepType = { something?: { with?: { deeper?: { 'key names'?: string } } } };

      const allSet: DeepType = { something: { with: { deeper: { 'key names': 'like this' } } } };
      let fromSet = maybe.get(
        'key names',
        maybe.get('deeper', maybe.get('with', maybe.get('something', Maybe.of(allSet))))
      );

      const allEmpty: DeepType = {};
      let fromEmpty = maybe.get(
        'key names',
        maybe.get('deeper', maybe.get('with', maybe.get('something', Maybe.of(allEmpty))))
      );

      expect(fromEmpty).toEqual(maybe.nothing());

      expectTypeOf(fromSet).toEqualTypeOf(fromEmpty);
      expectTypeOf(fromSet).toEqualTypeOf<Maybe<string>>();
      expectTypeOf(fromEmpty).toEqualTypeOf<Maybe<string>>();
    });
  });

  test('`safe`', () => {
    const empty = '';
    const emptyResult = maybe.nothing();

    const full = 'hello';
    const fullResult = maybe.just(full.length);

    const mayBeNull = (s: string): number | null => (s.length > 0 ? s.length : null);
    const mayNotBeNull = maybe.safe(mayBeNull);

    expect(mayNotBeNull(empty)).toEqual(emptyResult);
    expect(mayNotBeNull(full)).toEqual(fullResult);

    const mayBeUndefined = (s: string): number | undefined => (s.length > 0 ? s.length : undefined);
    const mayNotBeUndefined = maybe.safe(mayBeUndefined);

    expect(mayNotBeUndefined(empty)).toEqual(emptyResult);
    expect(mayNotBeUndefined(full)).toEqual(fullResult);

    const returnsNullable = (): string | null => null;

    const querySelector = maybe.safe(returnsNullable);
    expectTypeOf(querySelector).toEqualTypeOf<() => Maybe<string>>();
  });

  test('`isJust` with a Just', () => {
    const testJust: Maybe<string> = maybe.just('test');

    if (maybe.isJust(testJust)) {
      expect(testJust.value).toEqual('test');
    } else {
      expect.fail('Expected a Just');
    }
  });

  test('`isJust` with a Nothing', () => {
    const testNothing: Maybe<string> = maybe.nothing();

    expect(maybe.isJust(testNothing)).toEqual(false);
  });

  test('`isNothing` with a Just', () => {
    const testJust: Maybe<string> = maybe.just('test');

    expect(maybe.isNothing(testJust)).toEqual(false);
  });

  test('`isNothing` with a Nothing', () => {
    const testNothing: Maybe<string> = maybe.nothing();

    expect(maybe.isNothing(testNothing)).toEqual(true);
  });
});

// We aren't even really concerned with the "runtime" behavior here, which we
// know to be correct from other tests. Instead, this test just checks whether
// the types are narrowed as they should be.
test('narrowing', () => {
  const oneJust = maybe.of(Unit);
  if (oneJust.isJust) {
    expectTypeOf(oneJust).toEqualTypeOf<Just<Unit>>();
    expect(oneJust.value).toBeDefined();
  }

  // As above, narrowing directly on the type rather than with the lookup.
  const anotherJust = maybe.of(Unit);
  if (anotherJust.variant === Variant.Just) {
    expectTypeOf(anotherJust).toEqualTypeOf<Just<Unit>>();
    expect(anotherJust.value).toBeDefined();
  }

  const oneNothing = maybe.nothing();
  if (oneNothing.isNothing) {
    expectTypeOf(oneNothing).toEqualTypeOf<Nothing<unknown>>();
  }

  const anotherNothing = maybe.nothing();
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
    if (maybe.isJust) {
      expectTypeOf(maybe).toHaveProperty('value');
    }
    expectTypeOf(Maybe).constructorParameters.toEqualTypeOf<[value?: unknown]>();
  });

  describe('Just instance', () => {
    test('constructor', () => {
      const theJust = new Maybe('cool');
      expect(theJust.variant).toEqual(Variant.Just);
      expect((theJust as Just<string>).value).toEqual('cool');
    });

    test('static constructor', () => {
      const theJust = Maybe.just(123);
      expect(theJust.variant).toEqual(Variant.Just);
      expect((theJust as Just<number>).value).toEqual(123);

      expect(() =>
        Maybe.just(
          // @ts-expect-error
          null
        )
      ).toThrow();

      expect(() =>
        Maybe.just(
          // @ts-expect-error
          undefined
        )
      ).toThrow();

      // By definition cannot throw on this since it actually does exist and the
      // semantics we are checking are type-only at this point.
      expect(() =>
        Maybe.just(
          // @ts-expect-error
          'Hello' as string | null | undefined
        )
      ).not.toThrow();

      // Whereas here it should fail both type-checking *and* at runtime.
      expect(() =>
        Maybe.just(
          // @ts-expect-error
          null as string | null | undefined
        )
      ).toThrow();
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
      expect(theJust.value).toEqual(val);
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

      // Forbid returning `null` at the type level, but not at the runtime level.
      expect(() => {
        theJust.map(
          // @ts-expect-error
          (_val) => null
        );
      }).toThrow();
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

    describe('`orElse` method', () => {
      test('`orElse` method', () => {
        const theJust = new Maybe(12);
        const getAnotherJust = () => maybe.just(42);

        expect(theJust.orElse(getAnotherJust)).toEqual(theJust);
      });

      test('with multiple types in the returned `Maybe` instances', () => {
        class Branded<T extends string> {
          constructor(public readonly name: T) {}
        }

        let theOutput = Maybe.just(new Branded('just')).orElse(() => {
          if (Math.random() < 0.1) {
            return maybe.just(new Branded('just-a'));
          }

          if (Math.random() < 0.2) {
            return maybe.nothing<Branded<'empty'>>();
          }

          if (Math.random() < 0.3) {
            return maybe.just(new Branded('just-b'));
          }

          return maybe.nothing<Branded<'empty'>>();
        });

        expectTypeOf(theOutput).toEqualTypeOf<
          Maybe<Branded<'just-a'> | Branded<'just-b'> | Branded<'empty'>>
        >;
      });
    });

    test('`and` method', () => {
      const theJust = new Maybe({ neat: 'thing' });
      const theConsequentJust = new Maybe(['amazing', { tuple: 'thing' }]);
      const aNothing = new Maybe();

      expect(theJust.and(theConsequentJust)).toEqual(theConsequentJust);
      expect(theJust.and(aNothing)).toEqual(aNothing);
    });

    describe('`andThen` method', () => {
      test('basics', () => {
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

      test('with multiple types in the returned `Maybe` instances', () => {
        class Branded<T extends string> {
          constructor(public readonly name: T) {}
        }

        let theOutput = Maybe.of(new Branded('just')).andThen((_) => {
          if (Math.random() < 0.1) {
            return maybe.just(new Branded('just-a'));
          }

          if (Math.random() < 0.2) {
            return maybe.nothing<Branded<'empty'>>();
          }

          if (Math.random() < 0.3) {
            return maybe.just(new Branded('just-b'));
          }

          return maybe.nothing<Branded<'empty'>>();
        });

        expectTypeOf(theOutput).toEqualTypeOf<
          Maybe<Branded<'just-a'> | Branded<'just-b'> | Branded<'empty'>>
        >;
      });
    });

    test('`unwrap` method', () => {
      const theValue = 'value';
      const theJust = new Maybe(theValue);
      expect((theJust as Just<string>).value).toEqual(theValue);
      expect(() => (theJust as Just<string>).value).not.toThrow();
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

    test('`toString` method', () => {
      expect(maybe.of(42).toString()).toEqual('Just(42)');
    });

    test('`toJSON` method', () => {
      expect(maybe.of({ x: 42 }).toJSON()).toEqual({
        variant: maybe.Variant.Just,
        value: { x: 42 },
      });
      expect(maybe.of(maybe.of(42)).toJSON()).toEqual({
        variant: maybe.Variant.Just,
        value: { variant: maybe.Variant.Just, value: 42 },
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
      const fn = new Maybe(toString);
      const val = new Maybe(3);

      const result = fn.ap(val);

      expect(result.equals(maybe.of('3'))).toBe(true);
    });

    test('`get` method', () => {
      type DeepType = { something?: { with?: { deeper?: { 'key names'?: string } } } };

      const allSet: DeepType = { something: { with: { deeper: { 'key names': 'like this' } } } };
      const deepResult = new Maybe(allSet)
        .get('something')
        .get('with')
        .get('deeper')
        .get('key names');
      expect(deepResult).toEqual(maybe.just('like this'));

      const allEmpty: DeepType = {};
      const emptyResult = new Maybe(allEmpty)
        .get('something')
        .get('with')
        .get('deeper')
        .get('key names');
      expect(emptyResult).toEqual(maybe.nothing());
    });
  });

  describe('`Nothing` instance', () => {
    test('constructor', () => {
      const theNothing = new Maybe();
      expect(theNothing.variant).toEqual(Variant.Nothing);
    });

    test('static constructor', () => {
      const theNothing = Maybe.nothing();
      expect(theNothing.variant).toEqual(Variant.Nothing);
      // @ts-expect-error -- `value` isn't accessible without narrowing
      expect(() => theNothing.value).toThrow();

      const fromNull = Maybe.nothing(null);
      expect(fromNull.variant).toEqual(Variant.Nothing);
      // @ts-expect-error -- `value` isn't accessible without narrowing
      expect(() => fromNull.value).toThrow();

      const nothingFromUndefined = Maybe.nothing(undefined);
      expect(nothingFromUndefined.variant).toEqual(Variant.Nothing);
      // @ts-expect-error -- `value` isn't accessible without narrowing
      expect(() => nothingFromUndefined.value).toThrow();
    });

    test('`isJust` property', () => {
      const theNothing = new Maybe();
      expect(theNothing.isJust).toBe(false);
    });

    test('`value` property', () => {
      const theNothing = new Maybe();
      // @ts-expect-error -- `value` isn't accessible without narrowing
      expect(() => theNothing.value).toThrow();
    });

    test('`isNothing` property', () => {
      const theNothing = new Maybe();
      expect(theNothing.isNothing).toBe(true);
    });

    test('`map` method', () => {
      const theNothing = new Maybe<string>();
      expect(theNothing.map(length)).toEqual(theNothing);

      theNothing.map(
        // @ts-expect-error
        (_val) => null
      );
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
      const nietzsche = maybe.nothing();
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
      const theDefaultValue = maybe.just(false);

      expect(theNothing.or(theDefaultValue)).toBe(theDefaultValue);
    });

    describe('`orElse` method', () => {
      test('`orElse` method', () => {
        const theNothing = new Maybe<{ here: string[] }>();
        const justTheFallback = maybe.just({ here: ['to', 'see'] });
        const getTheFallback = () => justTheFallback;

        expect(theNothing.orElse(getTheFallback)).toEqual(justTheFallback);
      });

      test('with multiple types in the returned `Maybe` instances', () => {
        class Branded<T extends string> {
          constructor(public readonly name: T) {}
        }

        let theOutput = Maybe.nothing<'empty-start'>().orElse(() => {
          if (Math.random() < 0.1) {
            return maybe.just(new Branded('just-a'));
          }

          if (Math.random() < 0.2) {
            return maybe.nothing<Branded<'empty'>>();
          }

          if (Math.random() < 0.3) {
            return maybe.just(new Branded('just-b'));
          }

          return maybe.nothing<Branded<'empty'>>();
        });

        expectTypeOf(theOutput).toEqualTypeOf<
          Maybe<Branded<'just-a'> | Branded<'just-b'> | Branded<'empty'>>
        >;
      });
    });

    test('`and` method', () => {
      const theNothing = new Maybe<string[]>();
      const theConsequentJust = new Maybe('blaster bolts');
      const anotherNothing = new Maybe<string>();
      expect(theNothing.and(theConsequentJust)).toEqual(theNothing);
      expect(theNothing.and(anotherNothing)).toEqual(theNothing);
    });

    describe('`andThen` method', () => {
      test('basic functionality', () => {
        const theNothing = new Maybe();
        const theDefaultValue = 'string';
        const getDefaultValue = () => maybe.just(theDefaultValue);

        expect(theNothing.andThen(getDefaultValue)).toEqual(theNothing);
      });

      test('with multiple types in the returned `Maybe` instances', () => {
        class Branded<T extends string> {
          constructor(public readonly name: T) {}
        }

        let theOutput = Maybe.nothing<'empty-start'>().andThen((_) => {
          if (Math.random() < 0.1) {
            return maybe.just(new Branded('just-a'));
          }

          if (Math.random() < 0.2) {
            return maybe.nothing<Branded<'empty'>>();
          }

          if (Math.random() < 0.3) {
            return maybe.just(new Branded('just-b'));
          }

          return maybe.nothing<Branded<'empty'>>();
        });

        expectTypeOf(theOutput).toEqualTypeOf<
          Maybe<Branded<'just-a'> | Branded<'empty'> | Branded<'just-b'>>
        >();
      });
    });

    test('`value` access', () => {
      const noStuffAtAll = new Maybe();
      // @ts-expect-error -- `value` isn't accessible without narrowing
      expect(() => noStuffAtAll.value).toThrow();
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

    test('`toString` method', () => {
      expect(maybe.nothing().toString()).toEqual('Nothing');
    });

    test('`toJSON` method', () => {
      expect(maybe.nothing().toJSON()).toEqual({ variant: maybe.Variant.Nothing });
      expect(maybe.of(maybe.nothing()).toJSON()).toEqual({
        variant: maybe.Variant.Just,
        value: { variant: maybe.Variant.Nothing },
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
      expect(result).toEqual(maybe.nothing());
    });
  });
});
