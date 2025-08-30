# Handling Errors: `Result`

Many functions have to deal with the result of operations which might fail. `Result` is True Myth’s type for dealing with *synchronous* fallible operations.

## Failure handling

Many patterns exist to work around the fact that you can't very easily return two things together in JavaScript. Node has a callback pattern with an error as the first argument to every callback, set to `null` if there was no error. Client-side JavaScript usually just doesn't have a single pattern for handling this.

In both cases, you might use exceptions – but often an exception feels like the wrong thing because the possibility of failure is built into the kind of thing you're doing – querying an API, or checking the validity of some date, and so on.

In Node.js, the callback pattern encourages a style where literally every function starts with the exact same code:

```js
const doSomething = (err, data) => {
  if (err) {
    return handleErr(err);
  }

  // do whatever the *actual* point of the function is
};
```

There are two major problems with this:

1.  It's incredibly repetitive – the very opposite of "Don't Repeat Yourself". We wouldn't do this with _anything_ else in our codebase!

2.  It puts the error-handling right up front and _not in a good way._ While we want to have a failure case in mind when designing the behavior of our functions, it's not usually the _point_ of most functions – things like `handleErr` in the above example being the exception and not the rule. The actual meat of the function is always after the error handling.

Meanwhile, in client-side code, if we're not using some similar kind of callback pattern, we usually resort to exceptions. But exceptions are unpredictable: you can't know whether a given function invocation is going to throw an exception until runtime as someone calling the function. No big deal if it's a small application and one person wrote all the code, but with even a few thousand lines of code or two developers, it's very easy to miss that. And then this happens:

```js
// in one part of the codebase
function getMeAValue(url) {
  if (isMalformed(url)) {
    throw new Error(`The url `${url}` is malformed!`);
  }

  // do something else to load data from the URL
}

// somewhere else in the codebase
const value = getMeAValue('http:/www.google.com');  // missing slash
```

Notice: there's no way for the caller to know that the function will throw. Perhaps you're very disciplined and write good docstrings for every function – _and_ moreover, perhaps everyone's editor shows it to them _and_ they pay attention to that briefly-available popover. More likely, though, this exception throws at runtime and probably as a result of user-entered data – and then you're chasing down the problem through error logs.

More, if you _do_ want to account for the reality that any function anywhere in JavaScript might actually throw, you're going to write something like this:

```js
try {
  getMeAValue('http:/www.google.com'); // missing slash
} catch (e) {
  handleErr(e);
}
```

This is like the Node example _but even worse_ for repetition!

Nor can TypeScript help you here! It doesn't have type signatures to say "This throws an exception!" (TypeScript's `never` might come to mind, but it might mean lots of things, not just exception-throwing.) What is more, exceptions and `Promise` rejection values are untyped—with the strictest settings, `unknown`, but otherwise just `any`.

Neither callbacks nor exceptions are robustly good solutions here.

## Switching to `Result`

A `Result` packages up the result of a synchronous, fallible operation—whether it's a success (an `Ok`) or a failure (an `Err`)—and lets us unwrap the package at our leisure. As with `Maybe`, the `Result` type provides a type-safe container for dealing with the possibility that an error occurred, without needing to scatter `try`/`catch` blocks throughout your codebase. This has two major advantages:

1.  You _know_ when an item may have a failure case, unlike exceptions (which may be thrown from any function with no warning and no help from the type system).
2.  The error scenario is a first-class citizen, and the provided helper functions and methods allow you to deal with the type in much the same way as you might an array – transforming values if present, or dealing with errors instead if necessary.

Having the possibility of an error handed to you as part of the type of an item gives you the flexibility to do the same kinds of things with it that you might with any other nice container type. For example, you can use [`map`][map] to apply a transformation if the item represents a successful outcome, and even if the result was actually an error, it won't break under you.

[map]: /api/result/functions/map

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

If we wanted to _handle_ that error, we'd need to first of all know that the function could throw an error. Assuming we knew that – probably we'd figure it out via painful discovery at runtime, or by documenting it in our JSDoc – then we'd need to wrap it up in a `try`/`catch` block:

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

- You have to mutate an object. This doesn't work for simple items like numbers, and it can also be pretty unexpected behavior at times – you want to _know_ when something is going to change, and mutating freely throughout a library or application makes that impossible.

- You have to make sure to actually check the return code to make sure it's valid. In theory, we're all disciplined enough to always do that. In practice, we often end up reasoning, _Well, this particular call can never fail..._ (but of course, it probably can, just not in a way we expect).

- We don't have a good way to return a _reason_ for the error. We end up needing to introduce another parameter, designed to be mutated, to make sure that's possible.

- Even if you go to all the trouble of doing all of that, you need to make sure – every time – that you use only the error value if the return code specified an error, and only the success value if the return code specified that it succeeded.

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

## Working with APIs that throw errors

It might be nice to live in a world where everything *already* used `Result` to handle expected errors, but of course that isn’t the real world! Instead, we often need a way to bridge between “normal” JavaScript APIs and the safer True Myth APIs. One useful tool here is the `safe` function.

For example, if you are using the Node `fs.renameFileSync` to rename a file synchronously (perhaps in a script where asynchrony is not necessary), you could capture its error cases with a `Result`, instead of with exceptions.

```typescript
import fs from 'node:fs';
import * as result from 'true-myth/result';

const rename = result.safe(fs.renameSync);

let renameResult = rename('original', 'updated');
if (renameResult.isErr) {
  console.error(renameResult.error);
}
```

The type of the new `rename` variable we have created is exactly the same as the type of the `fs.renameSync` version, except that instead of returning `void` and throwing errors, it returns `Result<void, unknown>`. If calling `rename` throws an error—say, because `'original'` does not exist, or because `'updated'` already exists—we will get back an `Err` with the details.

This most basic version of using `result.safe` already helps us out a bunch by getting rid of errors thrown. There is an even more powerful overload that allows you to transform the error

```typescript
import fs from 'node:fs';
import * as result from 'true-myth/result';

const rename = result.safe(fs.renameSync, (error) => {
  if (error instanceof Error) {
    return error;
  } else {
    return new Error('Unexpected error in renameSync', { cause: error });
  }
});

let renameResult = rename('original', 'updated');
if (renameResult.isErr) {
  console.error(renameResult.error);
}

```

:::tip

Unfortunately, if you try to use `result.safe` with functions that are defined with TypeScript’s function overloads, it will collapse all of the overload types together. This is not a limitation of True Myth but of TypeScript itself.

:::

There is also a more general version of `safe` that allows you to handle any function call that may throw an error, `tryOrElse`. Unlike with `safe`, you will usually `tryOrElse` not by creating a new function, but by invoking it directly in a callback. For example, instead of creating a `rename` function, we could call `fs.renameSync` directly. We pass a callback which invokes the fallible function, like this, so that `result.tryOrElse` can catch the error (if we didn’t pass a callback, the error would be thrown before `tryOrElse` had a chance to run):

```typescript
import fs from 'node:fs';
import * as result from 'true-myth/result';

let renameResult = result.tryOrElse(
  (error) => {
    if (error instanceof Error) {
      return error;
    } else {
      return new Error('Unexpected error in renameSync', { cause: error });
    }
  },
  () => fs.renameSync('original', 'updated')
);

if (renameResult.isErr) {
  console.error(renameResult.error);
}
```

Although this is substantially longer than just calling `renameSync`, you are *guaranteed* not to have unhandled errors this way.

:::tip

Using `result.tryOrElse` does *not* have the problem that `result.safe` does, so you may find it useful for building up custom handlers where the original version uses overloads.

:::

You may have noticed that we are repeating some of that boilerplate for error wrapping. We can define that as a standalone function that we can then use anywhere. We can even make it able to provide useful information about the context it is coming from by accepting a `context` argument that can be any string, and returning the callback that handles the unknown error type:

```typescript
function withWrappedError(context: string): (error: unknown) => Error {
  return (error) => {
    if (error instanceof Error) {
      return error;
    } else {
      return new Error(`Unexpected error in '${context}'`, { cause: error });
    }
  };
}
```

With that defined, we could update our invocation to look like this:

```typescript
let renameResult = result.tryOrElse(withWrappedError('renameSync'), () =>
  fs.renameSync('original', 'updated')
);
```

This is one of the big upsides to True Myth’s approach to error handling: we get type safety and *composability*—each of these pieces works just fine on its own, but you can pull them together quite easily as well.
