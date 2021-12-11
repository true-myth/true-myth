# Result

A `Result<T, E>` is a type representing the value result of an operation which may fail, with a successful value of type `T` or an error of type `E`.

If the value is present, it is `Ok(value)`. If it's absent, it's `Err(reason)`. This provides a type-safe container for dealing with the possibility that an error occurred, without needing to scatter `try`/`catch` blocks throughout your codebase. This has two major advantages:

1.  You _know_ when an item may have a failure case, unlike exceptions (which may be thrown from any function with no warning and no help from the type system).
2.  The error scenario is a first-class citizen, and the provided helper functions and methods allow you to deal with the type in much the same way as you might an array – transforming values if present, or dealing with errors instead if necessary.

Having the possibility of an error handed to you as part of the type of an item gives you the flexibility to do the same kinds of things with it that you might with any other nice container type. For example, you can use [`map`][map] to apply a transformation if the item represents a successful outcome, and even if the result was actually an error, it won't break under you.

[map]: https://chriskrycho.github.io/true-myth/modules/_result_.html#map

To make that concrete, let's look at an example. In normal JavaScript, you might have something like this:

```js
function mightSucceed(doesSucceed) {
  if (!doesSucceed) {
    throw new Error('something went wrong!');
  }

  return 42;
}

const doubleTheAnswer = mightSucceed(true) * 2;
console.log(doubleTheAnswer); // 84; this is fine

const doubleAnError = mightSucceed(false) * 2; // throws an uncaught exception
console.log(doubleAnErr); // never even gets here because of the exception
```

If we wanted to _handle_ that error, we'd need to first of all know that the function could throw an error. Assuming we knew that – probably we'd figure it out via painful discovery at runtime, or by documenting it in our JSDoc – then we'd need to wrap it up in a `try`/`catch` block:

```js
try {
  const doubleTheAnswer = mightSucceed(true) * 2;
  console.log(doubleTheAnswer);

  const doubleAnError = mightSucceed(false) * 2;
} catch (ex) {
  console.log(ex.message);
}
```

This is a pain to work with!

The next thing we might try is returning an error code and mutating an object passed in. (This is the standard pattern for non-exception-based error handling in C, C++, Java, and C#, for example.) But that has a few problems:

- You have to mutate an object. This doesn't work for simple items like numbers, and it can also be pretty unexpected behavior at times – you want to _know_ when something is going to change, and mutating freely throughout a library or application makes that impossible.

- You have to make sure to actually check the return code to make sure it's valid. In theory, we're all disciplined enough to always do that. In practice, we often end up reasoning, _Well, this particular call can never fail..._ (but of course, it probably can, just not in a way we expect).

- We don't have a good way to return a _reason_ for the error. We end up needing to introduce another parameter, designed to be mutated, to make sure that's possible.

- Even if you go to all the trouble of doing all of that, you need to make sure – every time – that you use only the error value if the return code specified an error, and only the success value if the return code specified that it succeeded.

(Note that in slightly varied form, this is also basically what the Node.js callback pattern gives you. It's just a conventional way of needing to check for an error on every callback invocation, since you don't actually have a return code in that case.)

Our way out is `Result`. It lets us just return one thing from a function, which encapsulates the possibility of failure in the very thing we return. We get:

- the simplicity of just dealing with the return value of a function (no `try`/`catch` to worry about!)
- the ease of expressing an error we got with throwing an exception
- the explicitness about success or failure that we got with a return code

Here's what that same example from above would look like using `Result`:

```typescript
import Result, { ok, err, map, toString } from 'true-myth/result';

function mightSucceed(doesSucceed: boolean): Result<number, string> {
  return doesSucceed ? ok(42) : err('something went wrong!');
}

const double = (x: number) => x * 2;

const doubleTheAnswer = map(double, mightSucceed(true));
console.log(toString(doubleTheAnswer)); // `Ok(84)`

const doubleAnErr = map(double, mightSucceed(false));
console.log(toString(doubleAnErr)); // `Err('something went wrong')`
```

Note that if we tried to call `mightSucceed(true) * 2` here, we'd get a type error – this wouldn't make it past the compile step. Instead, we need to use one of the helper functions (or methods) to manipulate the value in a safe way.

## Using `Result`

The library is designed to be used with a functional style, allowing you to compose operations easily. Thus, standalone pure function versions of every operation are supplied. However, the same operations also exist on the `Ok` and `Err` types directly, so you may also write them in a more traditional "fluent" object style.

### Examples: functional style

```typescript
import { ok, err, map, toString } from 'true-myth/result';

const length = (s: string) => s.length;

const anOk = ok('some string');
const okLength = map(length, anOk);
console.log(toString(okLength)); // Ok(11)

const anErr = err('gah!');
const errLength = map(length, anErr);
console.log(toString(errLength)); // Err(gah!)
```

### Examples: fluent object invocation

You can also use a "fluent" method chaining style to apply the various helper functions to a `Result` instance:

```typescript
import { ok, err } from 'true-myth/result';

const length = (s: string) => s.length;

const hooray = ok('yay');
const okLen = hooray.map(length).unwrapOr(0); // okLen = 3

const muySad = err('oh no');
const errLen = muySad.map(length).unwrapOr(0); // errLen = 0
```

### Writing type constraints

When creating a `Result` instance, you'll nearly always be using _either_ the `Ok` _or_ the `Err` type, so the type system won't necessarily be able to infer the other type parameter.

```typescript
import { ok, err } from 'true-myth/result';

const anOk = ok(12); // TypeScript infers: `Result<number, {}>`
const anErr = err('sad'); // TypeScript infers: `Result<{}, string>`
```

In TypeScript, because of the direction type inference happens, you will need to specify the type at declaration to make it type check when returning values from a function with a specified type. Note that this _only_ applies when the instance is declared in its own statement and returned separately, _not_ when it is the expression value of a single-expression arrow function or the explicit return value of any function.

```typescript
import Result, { ok } from 'true-myth/result';

// ERROR: Type 'Result<number, {}>' is not assignable to type 'Result<number, string>'.
const getAResultNotAssignable = (): Result<number, string> => {
  const theResult = ok(12);
  return theResult;
};

// Succeeds
const getAResultExpression = (): Result<number, string> => ok(12);

// Succeeds
const getAResultReturn = (): Result<number, string> => {
  return ok(12);
};
```
