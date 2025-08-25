# Tour

:::tip

This page gives a high-level tour of the library, for folks who already have an idea why they might like types like `Maybe`, `Result`, and `Task`. For an introduction to the library that assumes no prior knowledge of types like these, see the [Tutorial](./tutorial/) instead!

:::

## Just the API, please

These examples don't cover every corner of the API; it's just here to show you what a few of the functions are like. [Full API documentation is available!][docs] You can also [view the source][source] if you prefer.

[docs]: https://true-myth.js.org
[source]: https://github.com/true-myth/true-myth

### `Result` with a functional style

```typescript
import Result, { err, map, ok, toString } from 'true-myth/result';

function fallibleCheck(isValid: boolean): Result<string, { reason: string }> {
  return isValid ? ok('all fine here') : err({ reason: 'was not valid' });
}

const describe = (s: string) => 'The outcome was: ' + s;

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
import * as result from 'true-myth/result';
import { unwrapErr } from 'true-myth/test-support';

function getErrorMessages(results: Array<Result<string, Error>>) {
  return results
    .filter(result.isErr)
    .map(result.unwrapErr) // would not type-checkout with previous line
    .map((error) => error.message);
}
```


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
import * as task from 'true-myth/task';
import { z } from 'zod';

const User = z.object({
  id: z.string().uuid(),
  name: z.optional(z.string()),
  birthday: z.date(),
});

const Users = z.array(User);

let usersTask = task.tryOrElse(
  (httpError) => new Error('Fetch error', { cause: httpError }),
  () => fetch('https://api.example.com/users')
).andThen((res) => task.tryOrElse(
  (parseError) => new Error('Parse error', { cause: parseError }),
  () => res.json(),
)).andThen((json) => {
  let result = Users.safeParse(json);
  return result.success
    ? task.resolve(result.data)
    : task.reject(new Error('Schema error', { cause: result.error }));
});
```

The resulting type here will be `Task<Array<User>>, Error>`. You can then perform further operations on it using more tools like `map` or `match`:

```ts
usersTask.match({
  Resolved: (users) => {
    for (let user of users) {
      const today = new Date();
      console.log("Hello,", user.name ?? "someone", "!");

      if (
        today.getDate() == user.birthday.getDate() &&
        today.getMonth() == user.birthday.getMonth()
      ) {
        console.log();
      }
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

[^task-impl]: Implementation-wise, a `Task<T, E>` directly uses a `Promise<Result<T, E>>` under the hood. It is, however, not *identical* with one, because it does implement the `Promise` API intentionally, and its semantics are quite different: it never rejects, for example. For more, see [Understanding: Task](/guide/understanding/task/).


## Curried variants

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
