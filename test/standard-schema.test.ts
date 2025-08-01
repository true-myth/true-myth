import { describe, expect, expectTypeOf, test } from 'vitest';

import { type } from 'arktype';
import * as effect from 'effect';
import * as v from 'valibot';
import * as z from 'zod';

import Result, * as result from 'true-myth/result';
import {
  type AsyncParserFor,
  asyncParserFor,
  type ParseResult,
  type ParserFor,
  type ParseTask,
  parserFor,
  StandardSchemaV1,
} from 'true-myth/standard-schema';
import { unwrapErr } from 'true-myth/test-support';

interface Person {
  name?: string | undefined;
  age: number;
}

// Arktype does not implement support for async morphs:
//
// - https://arktype.io/docs/faq#is-there-a-way-to-create-an-async-morph
// - https://github.com/arktypeio/arktype/issues/462
describe('with Arktype', () => {
  describe('parserFor', () => {
    const PersonSchema = type({
      'name?': 'string',
      age: 'number>=0',
    });

    const parse = parserFor(PersonSchema);
    expectTypeOf(parse).toEqualTypeOf<ParserFor<Person>>();

    test('with a valid user', () => {
      expect(parse({ age: 38 })).toEqual(result.ok({ age: 38 }));

      const withName = parse({ age: 38, name: 'Chris' });
      expect(withName).toEqual(result.ok({ age: 38, name: 'Chris' }));
      expectTypeOf(withName).toEqualTypeOf<ParseResult<Person>>();
    });

    test('with an invalid user', () => {
      const theResult = parse({});
      expect(theResult.isErr).toBe(true);
      const theError = unwrapErr(theResult);
      expect(theError.issues.length).not.toBe(0);
    });
  });
});

// Effect is stricter than the others, because of its strong functional
// programming idiom, so all types are `Readonly`.
describe('with Effect Schema', () => {
  describe('parserFor', () => {
    const PersonSchema = effect.Schema.Struct({
      name: effect.Schema.optional(effect.Schema.String),
      age: effect.Schema.Number.pipe(effect.Schema.nonNegative()),
    });

    const parse = parserFor(effect.Schema.standardSchemaV1(PersonSchema));
    expectTypeOf(parse).toEqualTypeOf<ParserFor<Readonly<Person>>>();

    test('with a valid user', () => {
      expect(parse({ age: 38 })).toEqual(result.ok({ age: 38 }));

      const withName = parse({ age: 38, name: 'Chris' });
      expect(withName).toEqual(result.ok({ age: 38, name: 'Chris' }));
      expectTypeOf(withName).toEqualTypeOf<ParseResult<Readonly<Person>>>();
    });

    test('with an invalid user', () => {
      const theResult = parse({});
      expect(theResult.isErr).toBe(true);
      const theError = unwrapErr(theResult);
      expect(theError.issues.length).not.toBe(0);
    });
  });

  describe('asyncParserFor', () => {
    // Define an async transformation so we have something to work with. This is
    // pretty silly: it just supplies the same transformation more than once!
    // But it gives us a useful test.
    const AsyncSchema = effect.Schema.Struct({
      name: effect.Schema.optional(effect.Schema.String),
      age: effect.Schema.Number.pipe(
        effect.Schema.filterEffect((age) => effect.Effect.promise(async () => age >= 0))
      ),
    });

    const parse = asyncParserFor(effect.Schema.standardSchemaV1(AsyncSchema));
    expectTypeOf(parse).toEqualTypeOf<AsyncParserFor<Readonly<Person>>>();

    test('with a valid user', async () => {
      expect(await parse({ age: 38 })).toEqual(result.ok({ age: 38 }));

      const withName = parse({ age: 38, name: 'Chris' });
      expectTypeOf(withName).toEqualTypeOf<ParseTask<Readonly<Person>>>();
      const theResult = await withName;
      expect(theResult).toEqual(result.ok({ age: 38, name: 'Chris' }));
    });

    test('with an invalid user', async () => {
      const theResult = await parse({});
      expect(theResult.isErr).toBe(true);
      const theError = unwrapErr(theResult);
      expect(theError.issues.length).not.toBe(0);
    });
  });
});

describe('with Valibot', () => {
  describe('parserFor', () => {
    const PersonSchema = v.object({
      name: v.optional(v.string()),
      age: v.pipe(v.number(), v.minValue(0)),
    });

    const parse = parserFor(PersonSchema);
    expectTypeOf(parse).toEqualTypeOf<ParserFor<Person>>();

    test('with a valid user', () => {
      expect(parse({ age: 38 })).toEqual(result.ok({ age: 38 }));

      const withName = parse({ age: 38, name: 'Chris' });
      expect(withName).toEqual(result.ok({ age: 38, name: 'Chris' }));
      expectTypeOf(withName).toEqualTypeOf<ParseResult<Person>>();
    });

    test('with an invalid user', () => {
      const theResult = parse({});
      console.log(theResult);
      expect(theResult.isErr).toBe(true);
      const theError = unwrapErr(theResult);
      expect(theError.issues.length).not.toBe(0);
    });
  });

  describe('asyncParserFor', () => {
    const PersonSchema = v.objectAsync({
      name: v.pipe(v.optional(v.string())),
      // Define an async refinement so we have something to work with. The
      // actual value here is not especially interesting.
      age: v.pipeAsync(
        v.number(),
        v.checkAsync((val) => val >= 0)
      ),
    });

    const parse = asyncParserFor(PersonSchema);
    expectTypeOf(parse).toEqualTypeOf<AsyncParserFor<Person>>();

    test('with a valid user', async () => {
      expect(await parse({ age: 38 })).toEqual(result.ok({ age: 38 }));

      const withName = parse({ age: 38, name: 'Chris' });
      expectTypeOf(withName).toEqualTypeOf<ParseTask<Person>>();
      const theResult = await withName;
      expect(theResult).toEqual(result.ok({ age: 38, name: 'Chris' }));
    });

    test('with an invalid user', async () => {
      const theResult = await parse({});
      expect(theResult.isErr).toBe(true);
      const theError = unwrapErr(theResult);
      expect(theError.issues.length).not.toBe(0);
    });
  });
});

describe('with Zod', () => {
  describe('parserFor', () => {
    const PersonSchema = z.object({
      name: z.string().optional(),
      age: z.number().nonnegative(),
    });

    const parse = parserFor(PersonSchema);
    expectTypeOf(parse).toEqualTypeOf<ParserFor<Person>>();

    test('with a valid user', () => {
      expect(parse({ age: 38 })).toEqual(result.ok({ age: 38 }));

      const withName = parse({ age: 38, name: 'Chris' });
      expect(withName).toEqual(result.ok({ age: 38, name: 'Chris' }));
      expectTypeOf(withName).toEqualTypeOf<ParseResult<Person>>();
    });

    test('with an invalid user', () => {
      const theResult = parse({});
      expect(theResult.isErr).toBe(true);
      const theError = unwrapErr(theResult);
      expect(theError.issues.length).not.toBe(0);
    });
  });

  describe('asyncParserFor', () => {
    const PersonSchema = z.object({
      name: z.optional(z.string()),
      // Define an async refinement so we have something to work with. The
      // actual value here is not especially interesting.
      age: z.number().refine(async (val) => val >= 0),
    });

    const parse = asyncParserFor(PersonSchema);
    expectTypeOf(parse).toEqualTypeOf<AsyncParserFor<Person>>();

    test('with a valid user', async () => {
      expect(await parse({ age: 38 })).toEqual(result.ok({ age: 38 }));

      const withName = parse({ age: 38, name: 'Chris' });
      expectTypeOf(withName).toEqualTypeOf<ParseTask<Person>>();
      const theResult = await withName;
      expect(theResult).toEqual(result.ok({ age: 38, name: 'Chris' }));
    });

    test('with an invalid user', async () => {
      const theResult = await parse({});
      expect(theResult.isErr).toBe(true);
      const theError = unwrapErr(theResult);
      expect(theError.issues.length).not.toBe(0);
    });
  });
});

describe('custom implementation', () => {
  type CustomParser<O> = (input: unknown) => Result<O, string>;

  class CustomSchema<O> implements StandardSchemaV1<unknown, O> {
    #parse: CustomParser<O>;

    get ['~standard'](): StandardSchemaV1.Props<O> {
      return {
        vendor: 'True Myth tests',
        version: 1,
        validate: (input: unknown) => {
          // Explicit match so TS doesn't ask for the return types to match.
          // (Note: if we loosen `match` to return different types and produce a
          // union, this explicit match type can be dropped.)
          return this.#parse(input).match<
            StandardSchemaV1.Result<O> | Promise<StandardSchemaV1.Result<O>>
          >({
            Ok: (value) => Promise.resolve({ value }),
            Err: (reason) => ({ issues: [{ message: `Nope: ${reason}` }] }),
          });
        },
      };
    }

    constructor(parse: CustomParser<O>) {
      this.#parse = parse;
    }
  }

  test('throws InvalidAsyncSchema when calling parserFor with async schema', () => {
    const BadSchema = new CustomSchema((val) =>
      typeof val === 'string' ? result.ok(val) : result.err(`'${val}' is not a string`)
    );

    let badParser = parserFor(BadSchema);
    try {
      badParser('valid input');
      expect(false); // should never get here
    } catch (e) {
      expect(e instanceof Error);
      expect((e as Error).name).toEqual('InvalidAsyncSchema');
    }
  });
});
