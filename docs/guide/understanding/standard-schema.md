# Standard Schema Integration

[Standard Schema][ss] is, by its own description:

> Standard Schema is a common interface designed to be implemented by JavaScript and TypeScript schema libraries.

[ss]: https://standardschema.dev

What that means in practice is that libraries like True Myth can provide an implementation that works across all sorts of “schema libraries”: from [Arktype][a] to [Zod][z] (yes, from A to Z). In the case of True Myth, that means you can use a very thin layer to translate between a parser you have written with any library that implements Standard Schema support and True Myth’s `Result` or `Task` types.

[a]: https://arktype.io
[z]: https://zod.dev

Our integration provides two functions and two corresponding types for each:

| function         | produces         | parser utility type |
| ---------------- | ---------------- | ------------------- |
| `parserFor`      | `ParseResult<T>` | `ParserFor<T>`      |
| `asyncParserFor` | `ParseTask<T>`   | `AsyncParserFor<T>` |

- , and `ParserFor`
-  and `AsyncParserFor`

As their names imply, the `parserFor` and `asyncParserFor` functions accept a schema from one of the Standard Schema-compliant libraries and produce a `ParseResult` or `ParseTask` wrapping the type that would be produced by the schema—but using True Myth’s `Result` and `Task` types respectively, instead of the Standard Schema Result type.

```ts
import { parserFor } from 'true-myth';
import { type } from 'arktype';
import * as z from 'zod';

const personParserArktype = type({
  age: "number >= 0",
  "name?": "string",
});

const personParserZod = z.object({
  age: z.number().nonnegative(),
  name: z.string().optional(),
});

const parsePersonWithArktype = parserFor(personParserArktype);
const parsePersonWithZod = parserFor(personParserZod);
```

The related utility types, `ParserFor` and `AsyncParserFor`, are shorthands for functions that can take unknown data and produce . In other words: they’re fully generic aliases for the type of a function produced by `parserFor` and `asyncParserFor` respectively.

```ts
import { parserFor } from 'true-myth';
import { type } from 'arktype';
import * as z from 'zod';

interface Person {
  age: number;
  name?: string | undefined;
}

const parsePersonWithArktype: ParserFor<Person> = parserFor(type({
  age: "number >= 0",
  "name?": "string",
}));

const parsePersonWithZod: ParserFor<Person> = parserFor(z.object({
  age: z.number().nonnegative(),
  name: z.string().optional(),
}));
```

The async versions of these work exactly the same as the synchronous versions, but for schemas that include asynchronous parsing.

> [!WARNING]
> You are responsible to handle this yourself, because the types provided by
> Standard Schema unfortunately do not provide enough information for True Myth
> to handle it safely.
>
> The parser created by `parserFor` will throw an `InvalidAsyncSchema` error if
> the schema it was created from produces an async result, i.e., a `Promise`.
> Standard Schema is [currently unable][gh] to distinguish between synchronous
> and asynchronous parsers due to limitations in Zod.
>
> [gh]: https://github.com/standard-schema/standard-schema/issues/22
