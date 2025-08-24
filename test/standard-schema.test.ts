import { describe, expect, expectTypeOf, test } from "vitest";

import Result, * as result from "true-myth/result";
import {
  type AsyncParserFor,
  asyncParserFor,
  type ParseResult,
  type ParserFor,
  type ParseTask,
  parserFor,
  StandardSchemaV1,
} from "true-myth/standard-schema";
import { unwrapErr } from "true-myth/test-support";

interface Person {
  name?: string | undefined;
  age: number;
}

type CustomParser<O> = (input: unknown) => Result<O, string>;

describe("Standard Schema integration", () => {
  describe("parserFor", () => {
    class CustomSchema<O> implements StandardSchemaV1<unknown, O> {
      #parse: CustomParser<O>;

      get ["~standard"](): StandardSchemaV1.Props<O> {
        return {
          vendor: "True Myth tests",
          version: 1,
          validate: (input: unknown) => {
            // Explicit match so TS doesn't ask for the return types to match.
            // (Note: if we loosen `match` to return different types and produce a
            // union, this explicit match type can be dropped.)
            return this.#parse(input).match<StandardSchemaV1.Result<O>>({
              Ok: (value) => ({ value }),
              Err: (reason) => ({ issues: [{ message: `Nope: ${reason}` }] }),
            });
          },
        };
      }

      constructor(parse: CustomParser<O>) {
        this.#parse = parse;
      }
    }

    const parse = parserFor(
      new CustomSchema((data) => {
        if (typeof data !== "object")
          return result.err("data is not an object");
        if (data === null) return result.err("data is null");

        if (!("age" in data)) return result.err("data missing `age` field");
        if (typeof data.age !== "number")
          return result.err(
            `'data.age' is ${typeof data.age}, should be number`,
          );

        let person: Person = {
          age: data.age,
        };

        if (
          "name" in data &&
          (data.name === undefined || typeof data.name === "string")
        ) {
          person.name = data.name;
        }

        return result.ok(person);
      }),
    );

    expectTypeOf(parse).toEqualTypeOf<ParserFor<Person>>();

    test("with a valid user", () => {
      expect(parse({ age: 38 })).toEqual(result.ok({ age: 38 }));

      const withName = parse({ age: 38, name: "Chris" });
      expect(withName).toEqual(result.ok({ age: 38, name: "Chris" }));
      expectTypeOf(withName).toEqualTypeOf<ParseResult<Person>>();
    });

    test("with an invalid user", () => {
      const theResult = parse({});
      expect(theResult.isErr).toBe(true);
      const theError = unwrapErr(theResult);
      expect(theError.issues.length).not.toBe(0);
    });
  });

  describe("asyncParserFor", () => {
    describe("with an asynchronous parser", () => {
      class CustomAsyncSchema<O> implements StandardSchemaV1<unknown, O> {
        #parse: CustomParser<Promise<O>>;

        get ["~standard"](): StandardSchemaV1.Props<O> {
          return {
            vendor: "True Myth tests",
            version: 1,
            validate: (input: unknown) => {
              // Explicit match so TS doesn't ask for the return types to match.
              // (Note: if we loosen `match` to return different types and produce a
              // union, this explicit match type can be dropped.)
              return this.#parse(input).match<
                Promise<StandardSchemaV1.Result<O>>
              >({
                Ok: (value) => value.then((value) => ({ value })),
                Err: (reason) =>
                  Promise.resolve({ issues: [{ message: `Nope: ${reason}` }] }),
              });
            },
          };
        }

        constructor(parse: CustomParser<Promise<O>>) {
          this.#parse = parse;
        }
      }

      const parse = asyncParserFor(
        new CustomAsyncSchema((data) => {
          if (typeof data !== "object")
            return result.err("data is not an object");
          if (data === null) return result.err("data is null");

          if (!("age" in data)) return result.err("data missing `age` field");
          if (typeof data.age !== "number")
            return result.err(
              `'data.age' is ${typeof data.age}, should be number`,
            );

          let person: Person = {
            age: data.age,
          };

          if (
            "name" in data &&
            (data.name === undefined || typeof data.name === "string")
          ) {
            person.name = data.name;
          }

          return result.ok(Promise.resolve(person));
        }),
      );

      expectTypeOf(parse).toEqualTypeOf<AsyncParserFor<Person>>();

      test("with a valid user", async () => {
        expect(await parse({ age: 38 })).toEqual(result.ok({ age: 38 }));

        const withName = parse({ age: 38, name: "Chris" });
        expectTypeOf(withName).toEqualTypeOf<ParseTask<Person>>();
        let nameResult = await withName;
        expect(nameResult).toEqual(result.ok({ age: 38, name: "Chris" }));
      });

      test("with an invalid user", async () => {
        const theResult = await parse({});
        expect(theResult.isErr).toBe(true);
        const theError = unwrapErr(theResult);
        expect(theError.issues.length).not.toBe(0);
      });
    });

    describe("with a synchronous parser", () => {
      class CustomAsyncSchema<O> implements StandardSchemaV1<unknown, O> {
        #parse: CustomParser<O>;

        get ["~standard"](): StandardSchemaV1.Props<O> {
          return {
            vendor: "True Myth tests",
            version: 1,
            validate: (input: unknown) => {
              // Explicit match so TS doesn't ask for the return types to match.
              // (Note: if we loosen `match` to return different types and produce a
              // union, this explicit match type can be dropped.)
              return this.#parse(input).match<StandardSchemaV1.Result<O>>({
                Ok: (value) => ({ value }),
                Err: (reason) => ({ issues: [{ message: `Nope: ${reason}` }] }),
              });
            },
          };
        }

        constructor(parse: CustomParser<O>) {
          this.#parse = parse;
        }
      }

      const parse = asyncParserFor(
        new CustomAsyncSchema((data) => {
          if (typeof data !== "object")
            return result.err("data is not an object");
          if (data === null) return result.err("data is null");

          if (!("age" in data)) return result.err("data missing `age` field");
          if (typeof data.age !== "number")
            return result.err(
              `'data.age' is ${typeof data.age}, should be number`,
            );

          let person: Person = {
            age: data.age,
          };

          if (
            "name" in data &&
            (data.name === undefined || typeof data.name === "string")
          ) {
            person.name = data.name;
          }

          return result.ok(person);
        }),
      );

      expectTypeOf(parse).toEqualTypeOf<AsyncParserFor<Person>>();

      test("with a valid user", async () => {
        expect(await parse({ age: 38 })).toEqual(result.ok({ age: 38 }));

        const withName = parse({ age: 38, name: "Chris" });
        expectTypeOf(withName).toEqualTypeOf<ParseTask<Person>>();
        let nameResult = await withName;
        expect(nameResult).toEqual(result.ok({ age: 38, name: "Chris" }));
      });

      test("with an invalid user", async () => {
        const theResult = await parse({});
        expect(theResult.isErr).toBe(true);
        const theError = unwrapErr(theResult);
        expect(theError.issues.length).not.toBe(0);
      });
    });
  });

  test("throws InvalidAsyncSchema when calling parserFor with async schema", () => {
    class BadParser<O> implements StandardSchemaV1<unknown, O> {
      #parse: CustomParser<O>;

      get ["~standard"](): StandardSchemaV1.Props<O> {
        return {
          vendor: "True Myth tests",
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

    const BadSchema = new BadParser((val) =>
      typeof val === "string"
        ? result.ok(val)
        : result.err(`'${val}' is not a string`),
    );

    let badParser = parserFor(BadSchema);
    try {
      badParser("valid input");
      expect(false, "parse should throw"); // should never get here
    } catch (e) {
      expect(e instanceof Error);
      expect((e as Error).name).toEqual("InvalidAsyncSchema");
    }
  });
});
