<h1 align="center"><a href='https://github.com/true-myth/true-myth'>True Myth</a></h1>

<p align="center">True Myth provides safe, idiomatic null, error, and async code handling in TypeScript, with <code>Maybe</code>, <code>Result</code>, and <code>Task</code> types that are <em>really nice</em>.</p>

<p align="center">
  <a href='https://github.com/true-myth/true-myth/blob/main/.github/workflows/CI.yml'>
    <img src='https://github.com/true-myth/true-myth/workflows/CI/badge.svg?branch=main' title='CI'>
  </a>
  <a href='https://github.com/true-myth/true-myth/blob/master/package.json#L78-L85'>
    <img src='https://img.shields.io/badge/Vitest-100%25-0a7c00.svg' alt='Test coverage: 100%'>
  </a>
  <a href='https://www.npmjs.com/package/true-myth'>
    <img src='https://img.shields.io/npm/v/true-myth.svg' alt='npm'>
  </a>
  <a href='https://github.com/true-myth/true-myth/blob/main/.github/workflows/CI.yml#L25'>
    <img src='https://img.shields.io/badge/Node-18%20LTS%20%7C%2020%20LTS%20%7C%2022-darkgreen' alt='supported Node versions'>
  </a>
  <a href='https://github.com/true-myth/true-myth/blob/main/.github/workflows/CI.yml#L59'>
    <img src='https://img.shields.io/badge/TypeScript-5.3%20%3C=%205.7%20%7C%20next-3178c6' alt='supported TypeScript versions'>
  </a>
  <a href='https://github.com/true-myth/true-myth/blob/main/.github/workflows/Nightly.yml'>
    <img src='https://github.com/true-myth/true-myth/workflows/Nightly%20TypeScript%20Run/badge.svg' alt='Nightly TypeScript Run'>
  </a>
  <img src='https://img.shields.io/badge/stability-active-663399' alt='Stability: Active'>
  <a href='https://github.com/true-myth/true-myth/blob/main/LICENSE'>
    <img src='https://img.shields.io/github/license/true-myth/true-myth.svg'>
  </a>
  <a href='https://js.org'>
    <img src='https://img.shields.io/badge/dns-js.org-ffb400.svg' alt='DNS by JS.org'>
  </a>
  <a href='http://true-myth.js.org'>
    <img src='https://img.shields.io/badge/docs-Typedoc-009fb5.svg' alt='docs built with Typedoc'>
  </a>
</p>

<p align="center">
  <a href='https://github.com/true-myth/true-myth'>README</a> • <a href='https://true-myth.js.org'>API docs</a> • <a href='https://github.com/true-myth/true-myth/tree/main/src'>Source</a> • <a href='http://www.chriskrycho.com/2017/announcing-true-myth-10.html'>Intro blog post</a>
</p>

## Overview

True Myth provides standard, type-safe wrappers and helper functions to help you with three _extremely_ common cases in programming:

- not having a value
- having a _result_ where you need to deal with either success or failure
- having an asynchronous operation which may fail

You could implement all of these yourself – it's not hard! – but it's much easier to just have one extremely well-tested library you can use everywhere to solve this problem once and for all.

> [!NOTE]
> This documentation is for versions 6.x–8.x, which [require](#requirements) using TypeScript's more recent `moduleResolution` modes: `"node16"`, `"nodenext"`, or `"bundler"`. (See [TypeScript's docs on `moduleResolution`](https://www.typescriptlang.org/tsconfig#moduleResolution) for more details!) If you cannot use that yet, please use version 5.x.*

See [the docs](https://true-myth.js.org) for setup, guides, and API docs!

### Contents

- [Requirements](#requirements)
- [Compatibility](#compatibility)
- [Basic bundle size info](#basic-bundle-size-info)

## Requirements

- Node 18+
- TS 4.7+
- `tsconfig.json`:
  - `moduleResolution: "Node16"`
- `package.json`
  - `type: "module"` (or else use `import()` to import True Myth into a commonJS build)

For details on using a pure ES modules package in TypeScript, see [the TypeScript handbook's guide](https://www.typescriptlang.org/docs/handbook/esm-node.html).


## Compatibility

This project follows the current draft of [the Semantic Versioning for TypeScript Types][semver] specification.

- **Currently supported TypeScript versions:** 4.7, 4.8, 4.9, 5.0, 5.1, 5.2, and 5.3
- **Compiler support policy:** [simple majors][sm]
- **Public API:** all published types not in a `-private` module are public

[semver]: https://www.semver-ts.org
[sm]: https://www.semver-ts.org/formal-spec/5-compiler-considerations.html#simple-majors

## Basic bundle size info

Size of the ESM build without tree-shaking (yes, these are in *bytes*: this is a pretty small library!):

|       file        | size (B) | terser[^terser] (B) | terser and brotli[^brotli] (B) |
| ----------------- | -------- | ------------------- | ------------------------------ |
| index.js          | 582      | 234                 | 96                             |
| maybe.js          | 18811    | 3467                | 872                            |
| result.js         | 13015    | 3168                | 787                            |
| task.js           | 29008    | 3433                | 999                            |
| test-support.js   | 448      | 142                 | 89                             |
| toolbelt.js       | 3620     | 890                 | 277                            |
| unit.js           | 656      | 58                  | 57                             |
| utils.js          | 888      | 321                 | 166                            |
| **total[^total]** | 38020    | 8102                | 2244                           |

Notes:

- The unmodified size *includes comments*.
- Thus, running through Terser gets us a much more realistic size: about 7.9KB to parse.
- The total size across the wire of the whole library will be ~2.2KB.
- This is all tree-shakeable to a significant degree. If your production bundle does not import or use anything from `true-myth/test-support`, you will not pay for it. However, some parts of the library do depend directly on other parts: for example, `toolbelt` uses exports from `result` and `maybe`, and `Task` makes extensive use of `Result` under the hood.

[^terser]: Using [terser](https://github.com/terser/terser) 5.10.0 with `--compress --mangle --mangle-props`.

[^brotli]: Generated by running `gzip -kq11` on the result of the `terser` invocation.

[^total]: This is just the sum of the previous lines. Real-world bundle size is a function of what you actually use, how your bundler handles tree-shaking, and how the results of bundling compresses. Notice that sufficiently small files can end up _larger_ after compression; this stops being an issue once part of a bundle.

## Just the API, please

_If you're unsure of why you would want to use the library, you might jump down to [**Why do I need this?**](#why-do-i-need-this)._

These examples don't cover every corner of the API; it's just here to show you what a few of the functions are like. [Full API documentation is available!][docs] You can also [view the source][source] if you prefer.

[docs]: https://true-myth.js.org
[source]: https://github.com/chriskrycho/true-myth

### `Result` with a functional style

```typescript
import Result, { err, map, ok, toString } from 'true-myth/result';

function fallibleCheck(isValid: boolean): Result<string, { reason: string }> {
  return isValid ? ok('all fine here') : err('was not valid');
}

const describe = (s) => 'The outcome was: ' + s;

const wentFine = fallibleCheck(true);
const mappedFine = map(describe, wentFine);
console.log(toString(mappedFine)); // "Ok(The outcome was: all fine here)"

const notGreat = fallibleCheck(false);
const mappedBad = map(describe, notGreat);
console.log(toString(mappedBad)); // "Err("was not valid")"
```

### `Maybe` with the method style

```typescript
import Maybe, { just, nothing } from 'true-myth/maybe';

function safeLength(mightBeAString: Maybe<string>): Maybe<number> {
  return mightBeAString.map((s) => s.length);
}

const justAString = just('a string');
const nothingHere = nothing<string>();
console.log(safeLength(justAString).toString()); // Just(8)
console.log(safeLength(nothingHere).toString()); // Nothing
```

### Constructing `Maybe`

You can use `Maybe.of` to construct a `Maybe` from any value. It will return a `Nothing` if the passed type is `null` or `undefined`, or a `Just` otherwise.

```typescript
import Maybe, { mapOr } from 'true-myth/maybe';

function acceptsANullOhNo(value: number | null): Maybe<string> {
  const maybeNumber = Maybe.of(value);
  return mapOr('0', (n) => n.toString(), maybeNumber);
}
```

### Safely getting at values

The library provides smart type narrowing tools to allow you to get at the values wrapped in the type:

```typescript
import { ok } from 'true-myth/result';

const theAnswer = ok(42);
const theAnswerValue = theAnswer.isOk ? theAnswer.value : 0;
```

However, ternaries like this can be annoying at times, and don't necessarily fit into functional composition pipelines when the expressions become more complicated. For situations like those, you can use one of the safe unwrap methods:

```typescript
import { ok, unwrapOr } from 'true-myth/result';

const theAnswer = ok(42);
const theAnswerValue = unwrapOr(0, theAnswer);
```

You can also use TypeScript's "type narrowing" capabilities: if you _check_ which variant you are accessing, TypeScript will "narrow" the type to that variant and allow you to access the `value` directly if it is available.

```typescript
import Maybe from 'true-myth/maybe';

// Maybe<string>
const couldBeSomething = Maybe.of('Hello!');

// type error, because `value` does not exist on `Nothing`:
// couldBeSomething.value;

if (couldBeSomething.isJust) {
  // valid, because `couldBeSomething` is "narrowed" to `Just` here:
  console.log(couldBeSomething.value);
}
```

This can also be convenient in functional style pipelines:

```typescript
import { filter, map, pipe, prop } from 'ramda';
import Result from 'true-myth/result';
import { unwrapErr } from 'true-myth/test-support';

function getErrorMessages(results: Array<Result<string, Error>>) {
  return results
    .filter(Result.isErr)
    .map(unwrapErr) // would not type-checkout with previous line
    .map((error) => error.message);
}
```

### Curried variants

All static functions which take two or more parameters are automatically partially applied/curried so you can supply only _some_ of the arguments as makes sense. For example, if you were using [lodash], you might have something like this:

```ts
import * as _ from 'lodash/fp';
import { just, nothing, map } from 'true-myth/maybe';

const length = (s: string) => s.length;
const even = (n: number) => n % 2 === 0;
const timesThree = (n: number) => n * 3;

const transform = _.flow(
  // transform strings to their length: Just(3), Nothing, etc.
  _.map(map(length)),
  // drop `Nothing` instances
  _.filter(_.prop('isJust')),
  // get value now that it's safe to do so (TS will not allow it earlier)
  _.map(_.prop('value')),
  // only keep the even numbers ('fish' => 4)
  _.filter(even),
  // multiply by three
  _.map(timesThree),
  // add them up!
  _.sum
);

const result = transform([
  just('yay'),
  nothing(),
  nothing(),
  just('waffles'),
  just('fish'),
  just('oh'),
]);

console.log(result); // 18
```

This makes for a much nicer API than needing to include the parameters for every function. If we _didn't_ have the curried functions, we'd have a much, _much_ noisier input:

```ts
import * as _ from 'lodash';
import Maybe, { map } from 'true-myth/maybe';

const length = (s: string) => s.length;
const even = (n: number) => n % 2 === 0;
const timesThree = (n: number) => n * 3;

const result = transform([
  Maybe.of('yay'),
  Maybe.nothing(),
  Maybe.nothing(),
  Maybe.of('waffles'),
  Maybe.of('fish'),
  Maybe.of('oh'),
]);

const transform = _.flow(
  // transform strings to their length: Just(3), Nothing, etc.
  (maybeStrings) => _.map(maybeStrings, (maybeString) => map(length, maybeString)),
  // drop `Nothing` instances
  (maybeLengths) => _.filter(maybeLengths, (maybe) => maybe.isJust),
  // get value now that it's safe to do so (TS will not allow it earlier)
  (justLengths) => _.map(justLengths, (maybe) => maybe.value),
  // only keep the even numbers ('fish' => 4)
  (lengths) => _.filter(lengths, even),
  // multiply by three
  (evenLengths) => _.map(evenLengths, timesThree),
  // add them up!
  _.sum
);

console.log(result); // 18
```

This "point-free" style isn't always better, but it's available for the times when it _is_ better. ([Use it judiciously!][pfod])

[pfod]: https://www.youtube.com/watch?v=seVSlKazsNk

## `Task` basics

A `Task` is effectively the composition of a `Promise` and a `Result`.[^task-impl] What is more, it implements the `PromiseLike` API for a `Result<T, E>`, and provides an easy way to get a `Promise<Result<T, E>>` if needed. This makes it a safe *and* flexible way to work with asynchronous computations.

You can wrap existing, non-`Promise`-based async operations using the `Task` constructor, much like you could with a `Promise`. For example, if you have some reason to use the old `XMLHttpRequest` instead of the more modern `fetch` API, you can wrap it with a `Task` like this:

```ts
import Task from 'true-myth/task';

interface RequestError {
  cause: string;
  status: number;
  statusText: string;
}

interface HttpError {
  text: string;
  status: number;
  statusText: string;
}

let xhrTask = new Task<string, RequestError | HttpError>((resolve, reject) => {
  let req = new XMLHttpRequest();
  req.addEventListener('load', () => {
    if (req.status >= 200 && req.status < 300) {
      resolve(req.responseText);
    } else {
      reject({
        text: req.responseText,
        status: req.status,
        statusText: req.statusText,
      });
    }
  });

  req.addEventListener('error', () =>
    reject({
      cause: 'Network Error',
      status: req.status,
      statusText: req.statusText,
    })
  );

  // etc. for the other error-emitting events

  req.open('GET', 'https://true-myth.js.org', true);
  req.send();
});
```

With `Task` in place, you could write a single adapter for `XMLHttpRequest` in one place in your app or library, which *always* produces a `Task` safely.

With `Task`’s ability to robustly handled all the error cases, you can use this just like you would a `Promise`, with `async` and `await`, or you can use `Task`’s own robust library of combinators. For example, to preserve type safety while working with a response, you might combine `Task` with [the excellent `zod` library][zod] to handle API responses robustly, like so:

```ts
import Task, { tryOrElse } from 'true-myth/task';
import { z } from 'zod';

const User = z.object({
  id: z.string().uuid(),
  name: z.optional(z.string()),
  birthday: z.date(),
});

const Users = z.array(User);

let usersTask = tryOrElse(
  fetch('https://api.example.com/users),
  (httpError) => new Error('Fetch error', { cause: httpError })
).andThen((res) => tryOrElse(
  res.json(),
  (parseError) => new Error('Parse error', { cause: parseError })
)).andThen((json) => {
  let result = Users.safeParse(json);
  return result.success
    ? Task.resolve(result.data)
    : Task.reject(new Error('Schema error', { cause: result.error }));
});
```

The resulting type here will be `Task<Array<User>>, Error>`. You can then perform further operations on it using more tools like `map` or `match`:

```ts
usersTask.match({
  Resolved: (users) => {
    for (let user of users) {
      console.log(user.name ?? "someone", "is", user.age, "years old");
    }
  },
  Rejected: (error) => {
    console.error(error.message, error.cause);
  },
});
```

Alternatively, you can `await` it and operate on its underlying `Result`:

```ts
let users = (await usersTask).unwrapOr([]);
```

[zod]: https://zod.dev/

[^task-impl]: Implementation-wise, a `Task<T, E>` directly uses a `Promise<Result<T, E>>` under the hood. It is, however, not *identical* with one



### Inspiration

The design of True Myth draws heavily on prior art; essentially nothing of this is original – _perhaps_ excepting the choice to make `Maybe.of` handle `null` and `undefined` in constructing the types. In particular, however, True Myth draws particular inspiration from:

- Rust's [`Option`][rs-option] and [`Result`][rs-result] types and their associated methods
- Folktale's [`Maybe`][ft-maybe] and [`Result`][ft-result] implementations
- Elm's [`Maybe`][elm-maybe] and [`Result`][elm-result] types and their
  associated functions

[rs-option]: https://doc.rust-lang.org/stable/std/option/
[rs-result]: https://doc.rust-lang.org/stable/std/result/
[ft-maybe]: http://folktale.origamitower.com/api/v2.0.0/en/folktale.maybe.html
[ft-result]: http://folktale.origamitower.com/api/v2.0.0/en/folktale.result.html
[elm-maybe]: http://package.elm-lang.org/packages/elm-lang/core/5.1.1/Maybe
[elm-result]: http://package.elm-lang.org/packages/elm-lang/core/5.1.1/Result
