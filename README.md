<h1 align="center"><a href='https://github.com/chriskrycho/true-myth'>True Myth</a></h1>

<p align="center">A library for safer programming in JavaScript, with first-class support for TypeScript, with <code>Maybe</code> and <code>Result</code> types, and supporting both a functional style and a more traditional method-call style.</p>

<p align="center">
  <a href='https://travis-ci.org/chriskrycho/true-myth'>
    <img src='https://img.shields.io/travis/chriskrycho/true-myth/master.svg?style=flat-square' alt='Travis `master` build status'>
  </a>
  <a href='https://github.com/chriskrycho/true-myth/blob/master/package.json#L78-L85'>
    <img src='https://img.shields.io/badge/Jest-100%25-0a7c00.svg?style=flat-square' alt='Test coverage: 100%'>
  </a>
  <a href='https://www.npmjs.com/package/true-myth'>
    <img src='https://img.shields.io/npm/v/true-myth.svg?style=flat-square' alt='npm'>
  </a>
  <img src='https://img.shields.io/badge/stability-active-purple.svg?style=flat-square&colorB=663399' alt='Stability: Active'>
  <a href='https://github.com/chriskrycho/true-myth/blob/master/LICENSE'>
    <img src='https://img.shields.io/github/license/chriskrycho/true-myth.svg?style=flat-square'>
  </a>
  <br/>
  <a href='https://js.org'>
    <img src='https://img.shields.io/badge/dns-js.org-ffb400.svg?style=flat-square' alt='DNS by JS.org'>
  </a>
  <a href='http://true-myth.js.org'>
    <img src='https://img.shields.io/badge/docs-Typedoc-009fb5.svg?style=flat-square' alt='docs built with Typedoc'>
  </a>
  <a href='https://gitter.im/true-myth/Lobby'>
    <img src='https://img.shields.io/gitter/room/true-myth/Lobby.svg?style=flat-square' alt='chat in Gitter'>
  </a>
  <a href='https://www.patreon.com/chriskrycho'>
    <img src='https://img.shields.io/badge/sponsor-Patreon-F76959.svg?style=flat-square' alt='support me on Patreon!'>
  </a>
</p>

<p align="center">
  <a href='https://github.com/chriskrycho/true-myth'>README</a> • <a href='https://true-myth.js.org'>API docs</a> • <a href='https://github.com/chriskrycho/true-myth/tree/master/src'>Source</a>  • <a href='http://www.chriskrycho.com/2017/announcing-true-myth-10.html'>Intro blog post</a>
</p>

## Overview

True Myth provides standard, type-safe wrappers and helper functions to help help you with two *extremely* common cases in programming:

-   not having a value
-   having a *result* where you need to deal with either success or failure

You could implement all of these yourself – it's not hard! – but it's much easier to just have one extremely well-tested library you can use everywhere to solve this problem once and for all.

### Contents

- [Setup](#setup)
    - [TypeScript](#typescript)
- [Just the API, please](#just-the-api-please)
    - [`Result` with a functional style](#result-with-a-functional-style)
    - [`Maybe` with the method style](#maybe-with-the-method-style)
    - [Constructing `Maybe`](#constructing-maybe)
    - [Safely getting at values](#safely-getting-at-values)
    - [Curried variants](#curried-variants)
- [Why do I need this?](#why-do-i-need-this)
    - [1. Nothingness: `null` and `undefined`](#1-nothingness-null-and-undefined)
    - [2. Failure handling: callbacks and exceptions](#2-failure-handling-callbacks-and-exceptions)
- [Solutions: `Maybe` and `Result`](#solutions-maybe-and-result)
    - [How it works: `Maybe`](#how-it-works-maybe)
    - [How it works: `Result`](#how-it-works-result)
- [Design philosophy](#design-philosophy)
    - [A note on reference types: no deep copies here!](#a-note-on-reference-types-no-deep-copies-here)
    - [The type names](#the-type-names)
        - [`Maybe`](#maybe)
            - [The `Maybe` variants: `Just` and `Nothing`](#the-maybe-variants-just-and-nothing)
        - [`Result`](#result)
            - [The `Result` variants: `Ok` and `Err`](#the-result-variants-ok-and-err)
    - [Inspiration](#inspiration)
- [Why not...](#why-not)
    - [Folktale](#folktale)
    - [Sanctuary](#sanctuary)
- [Migrating from other libraries](#migrating-from-other-libraries)
    - [From Folktale](#from-folktale)
        - [1.x](#from-folktale-1x)
        - [2.x](#from-folktale-2x)
    - [Sanctuary](#from-sanctuary)
- [What's with the name?](#whats-with-the-name)

## Setup

Add True Myth to your dependencies:

-   with Yarn:

    ```sh
    yarn add true-myth
    ```

-   with npm:

    ```sh
    npm install true-myth
    ```

For ES6-module-friendly consumers, you can import the modules directly, or import them from the root module:

```typescript
// this works:
import Maybe from 'true-myth/maybe';
import Result from 'true-myth/result';

// this also works:
import { Maybe, Result } from 'true-myth';
```

In Node.js, the TypeScript-generated CommonJS package cannot be imported as nested modules, but the modules still can be imported directly from the top-level module:

```typescript
const { Maybe, Result } = require('true-myth');
```

With the TypeScript Node-aware transforms, you can also write this in ES6 module-style imports for Node, but the same limitations apply about the nested module imports, i.e. you just can't use them. Use the top-level imports instead:

```typescript
import { Maybe, Result } from 'true-myth';
```

The build includes both ES6 modules and CommonJS modules, so you may reference them directly from their installation in the `node_modules` directory. (This may be helpful for using the library in different contexts, with the ES modules being supplied especially so you can do tree-shaking with e.g. Rollup.)

Note that the build target is ES2015, since all current evergreen browsers and the current LTS of Node support all ES2015 features. (Strictly speaking, Node 6 does not support *all* of ES2015, but this library goes nowhere near the couple features it has behind a flag.)

<details>
<summary>Distributed package layout</summary>

```
node_modules/
  true-myth/
    index.d.ts
    maybe.d.ts
    result.d.ts
    unit.d.ts
    utils.d.ts
    dist/
      cjs/
        index.js
        maybe.js
        result.js
        unit.js
        utils.js
      es/
        index.js
        maybe.js
        result.js
        unit.js
        utils.js
```

</details>

### TypeScript

TypeScript should resolve the types in both a Node and a bundler (Webpack, Parcel, Broccoli/Ember CLI, etc.) context automatically. If it doesn't, please [open an issue](https://github.com/chriskrycho/true-myth/issues/new)!

## Just the API, please

_If you're unsure of why you would want to use the library, you might jump down to [**Why do I need this?**](#why-do-i-need-this)._

These examples don't cover every corner of the API; it's just here to show you what a few of the functions are like. [Full API documentation is available!][docs] You can also [view the source][source] if you prefer.

[docs]: https://true-myth.js.org
[source]: https://github.com/chriskrycho/true-myth

### `Result` with a functional style

```typescript
import Result, { err, map, ok, toString } from 'true-myth/result';

function fallibleCheck(isValid: boolean): Result<string, { reason: string }> {
  return isValid ? ok('all fine here') : err({ reason: 'was not valid' });
}

const describe = s => 'The outcome was: ' + s;

const wentFine = fallibleCheck(true);
const mappedFine = map(describe, wentFine);
console.log(toString(mappedFine)); // "Ok(The outcome was: all fine here)"

const notGreat = fallibleCheck(false);
const mappedBad = map(describe, notGreat);
console.log(toString(mappedBad)); // "Err({ reason: 'was not valid' })"
```

### `Maybe` with the method style

```typescript
import Maybe, { Just, Nothing } from 'true-myth/maybe';

function safeLength(mightBeAString: Maybe<string>): Maybe<number> {
  return mightBeAString.map(s => s.length);
}

const justAString = new Just('a string');
const nothingHere = new Nothing<string>();
console.log(safeLength(justAString).toString()); // Just(8)
console.log(safeLength(nothingHere).toString()); // Nothing
```

### Constructing `Maybe`

You can use `Maybe.of` to construct a `Maybe` from any value. It will return a `Nothing` if the passed type is `null` or `undefined`, or a `Just` otherwise.

```typescript
import Maybe from 'true-myth/maybe';

function acceptsANullOhNo(value: number | null): Maybe<string> {
  const maybeNumber = Maybe.of(value);
  return mapOr("0", n => n.toString(), maybeNumber);
}
```

### Safely getting at values

Helpers are supplied to allow you to get at the values wrapped in the type:

```typescript
import { ok, unsafelyUnwrap } from 'true-myth/result';

const theAnswer = ok(42);
const theAnswerValue = unsafelyUnwrap(theAnswer);
```

However, as its name makes explicit `unsafelyUnwrap` is not a safe operation; if the item being unwrapped is an `Err`, this will throw an `Error`. Instead, you can use one of the safe unwrap methods:

```typescript
import { ok, unwrapOr } from 'true-myth/result';

const theAnswer = ok(42);
const theAnswerValue = unwrapOr(0, theAnswer);
```

You can also use TypeScript's "type narrowing" capabilities: if you *check* which variant you are accessing, TypeScript will "narrow" the type to that variant and allow you to access the `value` directly if it is available.

```typescript
import Maybe from 'true-myth/maybe';

// Maybe<string>
const couldBeSomething = Maybe.of("Hello!");

// type error, because `value` does not exist on `Nothing`:
// couldBeSomething.value;

if (couldBeSomething.isJust()) {
  // valid, because `couldBeSomething` is "narrowed" to `Just` here:
  console.log(couldBeSomething.value);
}
```

This is especially convenient in functional style pipelines, and there are convenience methods available to make it even more ergonomic:

```typescript
import Result, { Err } from 'true-myth/result';

function getErrorMessages(results: Array<Result<string, Error>>) {
  return results
    .filter(Result.isErr)
    .map(Err.unwrapErr) // would not type-checkout with previous line
    .map(error => error.message);
}
```

### Curried variants

All static functions which take two or more parameters are automatically partially applied/curried so you can supply only *some* of the arguments as makes sense. For example, if you were using [lodash], you might have something like this:

```ts
import * as _ from 'lodash-fp';
import Maybe from 'true-myth/maybe';

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

const transform = _flow(
  // transform strings to their length: Just(3), Nothing, etc.
  _.map(Maybe.map(length)),
  // drop `Nothing` instances
  _.filter(Maybe.isJust),
  // get value now that it's safe to do so (TS will not allow it earlier)
  _.map(maybe => maybe.value),
  // only keep the even numbers ('fish' => 4)
  _.filter(even),
  // multiply by three
  _.map(timesThree),
  // add them up!
  _.sum
);

console.log(result);  // 18
```

This makes for a much nicer API than needing to include the parameters for every function. If we *didn't* have the curried functions, we'd have a much, *much* noisier input:

```ts
import * as _ from 'lodash';
import Maybe from 'true-myth/maybe';

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

const transform = _flow(
  // transform strings to their length: Just(3), Nothing, etc.
  maybeStrings => _.map(maybeStrings, maybeString => Maybe.map(length, maybeString)),
  // drop `Nothing` instances
  maybeLengths => _.filter(maybeLengths, Maybe.isJust),
  // get value now that it's safe to do so (TS will not allow it earlier)
  justLengths => _.map(justLengths, maybe => maybe.value),
  // only keep the even numbers ('fish' => 4)
  lengths => _.filter(lengths, even),
  // multiply by three
  evenLengths => _.map(evenLengths, timesThree),
  // add them up!
  _.sum
);

console.log(result);  // 18
```

This "point-free" style isn't always better, but it's available for the times when it *is* better. ([Use it judiciously!][pfod])

[pfod]: https://www.youtube.com/watch?v=seVSlKazsNk

## Why do I need this?

There are two motivating problems for True Myth (and other libraries like it): dealing with *nothingness* and dealing with *operations which can fail*.

### 1. Nothingness: `null` and `undefined`

How do you represent the concept of *not having anything*, programmatically? As a language, JavaScript uses `null` to represent this concept; if you have a variable `myNumber` to store numbers, you might assign the value `null` when you don't have any number at all. If you have a variable `myString`, you might set `myString = null;` when you don't have a string.

Some JavaScript programmers use `undefined` in place of `null` or in addition to `null`, so rather than setting a value to `null` they might just set `let myString;` or even `let myString = undefined;`.

Every language needs a way to express the concept of nothing, but `null` and `undefined` are a curse. Their presence in JavaScript (and in many other languages) introduce a host of problems, because they are not a particularly *safe* way to represent the concept. Say, for a moment, that you have a function that takes an integer as a parameter:

```js
let myNumber = undefined;

function myFuncThatTakesAnInteger(anInteger) {
  return anInteger.toString();
}

myFuncThatTakesAnInteger(myNumber); // TypeError: anInteger is undefined
```

![this is fine](https://user-images.githubusercontent.com/2403023/31154374-ac25ce0e-a874-11e7-9399-73ad99d9d6cb.png)

When the function tries to convert the integer to a string, the function blows up because it was written with the assumption that the parameter being passed in (a) is defined and (b) has a `toString` method. Neither of these assumptions are true when `anInteger` is `null` or `undefined`. This leads JavaScript programmers to program defensively, with `if (!anInteger) return;` style guard blocks at the top of their functions. This leads to harder-to-read code, and what's more, *it doesn't actually solve the root problem.*

You could imagine this situation playing itself out in a million different ways: arguments to functions go missing. Values on objects turn out not to exist. Arrays are absent instead of merely empty. The result is a steady stream not merely of programming frustrations, but of *errors*. The program does not function as the programmer intends. That means stuff doesn't work correctly for the user of the software.

You can program around `null` and `undefined`. But defensive programming is gross. You write a lot of things like this:

```js
function isNil(thingToCheck) {
  return thingToCheck === undefined || thingToCheck === null;
}

function doAThing(withAString) {
  if (isNil(withAString)) {
    withAString = 'some default value';
  }

  console.log(withAString.length);
}
```

If you forget that check, or simply assume, "Look, I'll *never* call this without including the argument," eventually you or someone else will get it wrong. Usually somewhere far away from the actual invocation of `doAThing`, so that it's not obvious why that value ended up being `null` there.

TypeScript takes us a big step in that direction, so long as our type annotations are good enough. (Use of `any` will leave us sad, though.) We can specify that type *may* be present, using the [maybe]/[optional] annotation. This at least helps keep us honest. But we still end up writing a ton of repeated boilerplate to deal with this problem. Rather than just handling it once and being done with it, we play a never-ending game of whack-a-mole. We must be constantly vigilant and proactive so that our users don't get into broken error states.

[maybe]: https://flow.org/en/docs/types/maybe/
[optional]: http://www.typescriptlang.org/docs/handbook/interfaces.html#optional-properties

### 2. Failure handling: callbacks and exceptions

Similarly, you often have functions whose return value represents an operation which might fail in some way. We also often have functions which have to deal with the result of operations which might fail.

Many patterns exist to work around the fact that you can't very easily return two things together in JavaScript. Node has a callback pattern with an error as the first argument to every callback, set to `null` if there was no error. Client-side JavaScript usually just doesn't have a single pattern for handling this.

In both cases, you might use exceptions – but often an exception feels like the wrong thing because the possibility of failure is built into the kind of thing you're doing – querying an API, or checking the validity of some date, and so on.

In Node.js, the callback pattern encourages a style where literally every function starts with the exact same code:

```js
const doSomething = (err, data) => {
  if (err) {
    return handleErr(err);
  }

  // do whatever the *actual* point of the function is
}
```

There are two major problems with this:

1.  It's incredibly repetitive – the very opposite of "Don't Repeat Yourself". We wouldn't do this with *anything* else in our codebase!

2.  It puts the error-handling right up front and *not in a good way.* While we want to have a failure case in mind when designing the behavior of our functions, it's not usually the *point* of most functions – things like `handleErr` in the above example being the exception and not the rule. The actual meat of the function is always after the error handling.

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

Notice: there's no way for the caller to know that the function will throw. Perhaps you're very disciplined and write good docstrings for every function – *and* moreover, perhaps everyone's editor shows it to them *and* they pay attention to that briefly-available popover. More likely, though, this exception throws at runtime and probably as a result of user-entered data – and then you're chasing down the problem through error logs.

More, if you *do* want to account for the reality that any function anywhere in JavaScript might actually throw, you're going to write something like this:

```js
try {
  getMeAValue('http:/www.google.com');  // missing slash
} catch (e) {
  handleErr(e);
}
```

This is like the Node example *but even worse* for repetition!

Nor can TypeScript help you here! It doesn't have type signatures to say "This throws an exception!" (TypeScript's `never` might come to mind, but it might mean lots of things, not just exception-throwing.)

Neither callbacks nor exceptions are good solutions here.

## Solutions: `Maybe` and `Result`

`Maybe` and `Result` are our escape hatch from all this madness.

We reach for libraries precisely so we can solve real business problems while letting lower-level concerns live in the "solved problems" category. True Myth, borrowing ideas from many other languages and libraries, aims to put _code written to defend against `null`/`undefined` problems_ in that "solved problems" category.

`Maybe` and `Result` solve this problem *once*, and *in a principled way*, instead of in an _ad-hoc_ way throughout your codebase, by putting the value into a *container* which is guaranteed to be safe to act upon, regardless of whether there's something inside it or not.

These containers let us write functions with *actually safe* assumptions about parameter values by extracting the question, "Does this variable contain a valid value?" to API boundaries, rather than needing to ask that question at the head of every. single. function.

*What is this sorcery?*

### How it works: `Maybe`

It turns out you probably already have a good idea of how this works, if you've spent much time writing JavaScript, because this is exactly how arrays work.

Imagine, for a moment, that you have a variable `myArray` and you want to map over it and print out every value to the console. You instantiate it as an empty array and then forget to load it up with values before mapping over it:

```js
let myArray = [];
// oops, I meant to load up the variable with an array, but I forgot!
myArray.forEach(n => console.log(n)); // <nothing prints to the screen>
```

Even though this doesn't print anything to the screen, it doesn't unexpectedly blow up, either. In other words, it represents the concept of having nothing "inside the box" in a safe manner. By contrast, an integer has no such safe box around it. What if you could multiply an integer by two, and if your variable was "empty" for one reason or another, it wouldn't blow up?

```js
let myInteger = undefined;

myInteger * 3; // 😢
```

Let's try that again, but this time let's put the actual value in a container and give ourselves safe access methods:

```js
import Maybe from 'true-myth/maybe';

const myInteger = Maybe.of(undefined);
myInteger.map(x => x * 3); // Nothing
```

![mind blown](https://user-images.githubusercontent.com/2403023/31098390-5d6573d0-a790-11e7-96f9-361d2e70522b.gif)

We received `Nothing` back as our value, which isn't particularly useful, but it also didn't halt our program in its tracks!

Best of all, when you use these with libraries like TypeScript, you can lean on their type systems to check aggressively for `null` and `undefined`, and actually *eliminate* those from your codebase by replacing anywhere you would have used them with `Maybe`.

### How it works: `Result`

`Result` is similar to `Maybe`, except it packages up the result of an operation (like a network request) whether it's a success (an `Ok`) or a failure (an `Err`) and lets us unwrap the package at our leisure. Whether you get back a 200 or a 401 for your HTTP request, you can pass the box around the same either way; the methods and properties the container has are not dependent upon whether there is shiny new data or a big red error inside.

```typescript
import { ok, err } from 'true-myth/result';

const myNumber = ok<number, string>(12);
const myNumberErr = err<number, string>("oh no");

console.log(myNumber.map(n => n * 2)); // Ok(24)
console.log(myNumberErr.map(n => n * 2)); // Err(oh no)
```

Thus, you can replace functions which take polymorphic arguments or have polymorphic return values to try to handle scenarios where something may be a success or an error with functions using `Result`.

Any place you try to treat either a `Maybe` or a `Result` as just the underlying value rather than the container, the type systems will complain, of course. And you'll also get help from smart editors with suggestions about what kinds of values (including functions) you need to interact with any given helper or method, since the type definitions are supplied.

By leaning on TypeScript to handle the checking, we also get all these benefits with *no* runtime overhead other than the cost of constructing the actual container objects (which is to say: *very* low!).

## Design philosophy

The design aims for True Myth are:

-   to be as idiomatic as possible in JavaScript
-   to support a natural functional programming style
-   to have zero runtime cost beyond simple object construction and function invocation
-   to lean heavily on TypeScript to enable all of the above

In practice, that means:

-   You can construct the variant types in the traditional JavaScript way or with a pure function:

    ```typescript
    import { Just, just, Nothing, nothing } from 'true-myth/maybe';

    const classicalJust = new Just('value');
    const classicalNothing = new Nothing();

    const functionalJust = just('value');
    const functionalNothing = nothing();
    ```

-   Similarly, you can use methods or pure functions:

    ```typescript
    import { ok, map } from 'true-myth/result';

    const numberResult = ok(42);
    const ok84 = numberResult.map(x => x * 2);
    const ok21 = map(x => x / 2, numberResult);
    ```

    As this second example suggests, the aim has been to support the most idiomatic approach for each style. This means that yes, you might find it a bit confusing if you're actively switching between the two of them. (Why would you do that?!?)

-   Using the library with TypeScript will *just work* and will provide you with considerable safety out of the box. Using it with JavaScript will work just fine, but there is no runtime checking, and you're responsible to make sure you don't `unwrap()` a `Maybe` without checking that it's safe to do so.

-   Since this is a TypeScript-first library, we intentionally leave out any runtime type checking. As such, you *should* make use of the type systems if you want the benefits of the system. Many of the functions simply assume that the types are checked, and *will* error if you pass in items of the wrong type.

    For example, if you pass a non-`Maybe` instance to many functions, they will simply fail – even the basic helpers like `isJust` and `isNothing`. These assumptions have been made precisely *because* this is a TypeScript-first library. (See the discussion below comparing True Myth to Folktale and Sanctuary if you aren't using TypeScript and need runtime checking.)

The overarching themes are flexibility and approachability.

The hope is that a team just picking up these ideas for the first time can use them without adapting their whole style to a "traditional" functional programming approach, but a team comfortable with functional idioms will find themselves at home with the style of data-last pure functions. (For a brief discussion of why you want the data last in a functional style, see [this blog post].)

[this blog post]: http://www.chriskrycho.com/2017/collection-last-auto-curried-functions.html

[Ramda]: http://ramdajs.com
[lodash]: https://lodash.com

### A note on reference types: no deep copies here!

One important note: True Myth does *not* attempt to deeply-clone the wrapped values when performing operations on them. Instead, the library assumes that you will *not* mutate those objects in place. (Doing more than this would require taking on a dependency on e.g. [lodash]). If you violate that constraint, you can and will see surprising outcomes. Accordingly, you should take care not to mutate reference types, or to use deep cloning yourself when e.g. mapping over reference types.

```typescript
import { just, map, unsafelyUnwrap } from 'true-myth/maybe';

const anObjectToWrap = {
  desc: ['this', ' ', 'is a string'],
  val: 42,
};

const wrapped = just(anObjectToWrap);
const updated = map(obj => ({...obj, val: 92 }), wrapped);

console.log(unsafelyUnwrap(anObjectToWrap).val);  // 42
console.log(unsafelyUnwrap(updated).val);  // 92
console.log(unsafelyUnwrap(anObjectToWrap).desc);  // ["this", " ", "is a string"]
console.log(unsafelyUnwrap(updated).desc);  // ["this", " ", "is a string"]

// Now mutate the original
anObjectToWrap.desc.push('.');

// And… 😱 we've mutated the new one, too:
console.log(unsafelyUnwrap(anObjectToWrap).desc);  // ["this", " ", "is a string", "."]
console.log(unsafelyUnwrap(updated).desc);  // ["this", " ", "is a string", "."]
```

In other words: you *must* use other tools along with True Myth if you're going to mutate objects you're wrapping in `Maybe` or `Result`.

True Myth will work quite nicely with [lodash], [Ramda], [Immutable-JS], etc., so you can use whatever tools you like to handle this problem.

[Immutable-JS]: http://facebook.github.io/immutable-js/

### The type names

#### `Maybe`

The existing options in this space include `Option`, `Optional`, and `Maybe`. You could also point to "nullable," but that actually means the *opposite* of what we're doing here – these represent types which can *not* be nullable!

`Option` implies a choice between several different *options*; in this case that's not really what's going on. It's also not really a great word for the type in the sense that it's weird to read aloud: "an Option string" doesn't make any sense in English.

`Optional` is much better than `Option`. The semantics are much more accurate, in that it captures that the thing is allowed to be absent. It's also the nicest grammatically: "an Optional string". On the other hand, it's also the *longest*.

`Maybe` seems to be the best type name semantically: we're modeling something which *may* be there – or may *not* be there! Grammatically, it's comparable to "optional": "a Maybe string" isn't great – but "maybe a string" is the most natural *accurate* way to answer the question, "What's in this field?" It's also the shortest!

`Optional` or `Maybe` are both good names; `Maybe` just seemed slightly better.

##### The `Maybe` variants: `Just` and `Nothing`

Similar consideration was given to the names of the type variants. Options for the "present" type in other libraries are `Some` and `Just`. Options for the "absent" type are `None` or `Nothing`.

###### Why `Just`?

Both `Just` and `Some` are reasonable choices for this, and both have things to recommend them semantically:

-   When talking about the *type* of given item, "some" makes a lot of sense: "What's in this field? Some number." You can get the same idea across with "just" but it's a bit less clear: "What's in this field? Just a number."
-   On the other hand, when talking about or constructing a given *value*, "just" makes more sense: "What is this? It's just 12." When you try to use "some" there, it reads oddly: "What is this? It's some 12."

Given that "just a number" *works* (even if it's strictly a little less nice than "some number") and that "just 12" works but "some 12" doesn't, `Just` seems to be a slightly better option.

###### Why `Nothing`?

Given the choice between `None` and `Nothing`, the consideration just came down to the most natural *language* choice. "What's here? Nothing!" makes sense, while "What's here? None" does not. `None` also implies that there might be more than one of the items. It's entirely unnatural to say "There is none of a number here"; you'd normally say "there is no number here" or "there is nothing here" instead. So `Nothing` it is!

#### `Result`

In some languages and libraries, a more general type named `Either` is used instead of the more specific `Result` name. The two are equivalent in functionality – both provide two variants, each of which wraps a value. In the `Either` implementations, those are usually named `Left` and `Right`. In the `Result` implementations (both here and in other libraries and languages), they are named `Ok` and `Err`.

The main difference between `Either` and `Result` is precisely that question of generality. `Either` can meaningfully capture *any* scenario where there are two possible values resulting from a given function application, or applicable as arguments to a function. `Result` *only* captures the idea of something succeeding or failing. In that sense, `Either` might seem to be better: it can capture what `Result` captures (traditionally with `Left` being the error case and `Right` being the success, or *right*, case), and many more besides.

However, in practice, the idea of a result is far and away the most common case for using an `Either`, and it's also the easiest to explain. (An `Either` implementation would also be valuable, though, and it might be a later addition to the library.)

##### The `Result` variants: `Ok` and `Err`

Given a "result" type, we need to be able to express the idea of "success" and "failure." The most obvious names here would be `Success` and `Failure`. Those are actually really good names with a single problem: they're *long*. Needing to write `success(12)` or `failure({ oh: 'no' })` is a *lot* to write over and over again. Especially when there some options which *also* work well: `Ok` and `Err`.

Both `Ok` and `Err` could be written out long-form: `Okay` and `Error`. But in this case, the longer names don't add any particular clarity; they require more typing; and the `Error` case also overloads the existing name of the base exception type in JavaScript. So: `Ok` and `Err` it is.

### Inspiration

The design of True Myth draws heavily on prior art; essentially nothing of this is original – *perhaps* excepting the choice to make `Maybe.of` handle `null` and `undefined` in constructing the types. In particular, however, True Myth draws particular inspiration from:

-   Rust's [`Option`][rs-option] and [`Result`][rs-result] types and their associated methods
-   Folktale's [`Maybe`][ft-maybe] and [`Result`][ft-result] implementations
-   Elm's [`Maybe`][elm-maybe] and [`Result`][elm-result] types and their
    associated functions

[rs-option]: https://doc.rust-lang.org/stable/std/option/
[rs-result]: https://doc.rust-lang.org/stable/std/result/
[ft-maybe]: http://folktale.origamitower.com/api/v2.0.0/en/folktale.maybe.html
[ft-result]: http://folktale.origamitower.com/api/v2.0.0/en/folktale.result.html
[elm-maybe]: http://package.elm-lang.org/packages/elm-lang/core/5.1.1/Maybe
[elm-result]: http://package.elm-lang.org/packages/elm-lang/core/5.1.1/Result

## Why not...

There are other great functional programming libraries out there... so why not just use one of them?

Note that much of the content between these sections is the same; it's presented as is so you can simply read the section appropriate to the library you're comparing it with.

### Folktale?

[Folktale] has an API a lot like this one, as you'll see when perusing the docs. However, there are two main reasons you might prefer True Myth to Folktale:

[Folktale]: http://folktale.origamitower.com

1.  True Myth is TypeScript-first, which means that it assumes you are using TypeScript if you're aiming for rigorous type safety.

    By contrast, Folktale is a JavaScript-first library, with runtime checking built in for its types. Folktale's TypeScript support is in-progress, but will remain secondary until a TypeScript rewrite of the whole Folktale library lands... eventually.

    There's value in both of these approaches, so True Myth aims to take advantage of the compilers and play in a no-runtime-cost space.

    If you want a JS-focused (rather than TS-focused) library which will help you be safer without a compiler, you should definitely pick Folktale over True Myth. If you've already using TS, True Myth is a bit nicer of an experience.

2.  True Myth aims to keep functional programming jargon to a minimum and to use TypeScript type notation throughout its docs as well as in its implementation.

    Folktale is aimed squarely at people who are already pretty comfortable with the world of strongly-typed functional programming languages. This is particularly evident in the way its type signatures are written out (using the same basic notation you might see in e.g. Haskell), but it's also there in its heavy use of functional programming terminology throughout its docs.

    Haskell-style types are quite nice, and functional programming jargon is very useful. However, they're also another hump to get over. Again: a tradeoff.

    By opting for type notation that TS developers are already familiar with, and by focusing on what various functions *do* rather than the usual FP names for them, True Myth aims at people just coming up to speed on these ideas.

    The big win for Folktale over True Myth is [Fantasy Land] compatibility.

3.  True Myth's API aims to be more idiomatic as JavaScript/TypeScript, with a couple differences in particular worth calling out:

    -   **function naming convention:** True Myth uses PascalCase for types and camelCase for functions – so, `new Just(5)` and `just(5)`, whereas FolkTale uses the capitals as function names for type constructors, i.e. `Just(5)`, and does not support `new`.

    -   **ease of construction from nullable types:** True Myth allows you to construct `Maybe` types from nullable types with `Maybe.of`, because JS is *full* of `null` and `undefined`, and allowing `Maybe.of` to handle them makes it easier to be sure you're always doing the right thing.

        Folktale's `Maybe.of` only allows the use of non-nullable types, and requires you to use `Maybe.fromNullable` instead. This isn't unreasonable, but it dramatically decreases the convenience of integration with existing JS codebases or interfacing with untyped JS libraries.

4.  Folktale also aims to provide a larger suite of types and functions to use – though much smaller than [lodash] – including a number of [general functions][folktale-core], [concurrency][folktale-concurrency], [general union types][folktale-adt], and more. True Myth intentionally punts on those concerns, assuming that most consumers are already using a library like Lodash or Ramda, and are comfortable with or prefer using e.g. `Promise`s for concurrency, and aiming to be easy to integrate with those instead.

[Fantasy Land]: https://github.com/fantasyland/fantasy-land
[folktale-core]: http://folktale.origamitower.com/api/v2.0.0/en/folktale.core.html
[folktale-concurrency]: http://folktale.origamitower.com/api/v2.0.0/en/folktale.concurrency.html
[folktale-adt]: http://folktale.origamitower.com/api/v2.0.0/en/folktale.adt.html

### Sanctuary?

[Sanctuary] has many of the same goals as True Myth, but is much more focused on the expectations and patterns you'd see in Haskell or PureScript or similar languages. Its API and True Myth's are much *less* similar than Folktale and True Myth's are, as a result – the underlying details are often similar, but the names are nearly all different. A few of the major contrasts:

[Sanctuary]: https://sanctuary.js.org

1.  True Myth is TypeScript-first, which means that it assumes you are using TypeScript if you're aiming for rigorous type safety.

    By contrast, Sanctuary is a JavaScript-first library, with runtime checking built in for its types. Sanctuary's TypeScript support is [in progress][s-ts], but will for the foreseeable future remain add-on rather than first-class. (Sanctuary *does* allow you to create a version of the module without the runtime checking, but it requires you to do this yourself.)

    There's value in both of these approaches, so True Myth aims to take advantage of the compilers and play in a no-runtime-cost space.

    If you want a JS-focused (rather than TS-focused) library which will help you be safer without a compiler, you should definitely pick Sanctuary over True Myth. If you've already using TS, True Myth is a bit nicer of an experience.

2.  True Myth aims to keep functional programming jargon to a minimum and to use TypeScript type notation throughout its docs as well as in its implementation.

    Sanctuary is aimed squarely at people who are already extremely comfortable the world of strongly-typed, pure functional programming languages. This is particularly evident in the way its type signatures are written out (using the same notation you would see in Haskell or PureScript), but it's also present in Sanctuary's heavy use of functional programming terminology throughout its docs.

    Haskell- and Purescript-style types are quite nice, and the functional programming jargon is very useful. However, they're also another hump to get over. Again: a tradeoff.

    By opting for type notation that TS developers are already familiar with, and by focusing on what various functions *do* rather than the usual FP names for them True Myth aims at people just coming up to speed on these ideas.

    The big win for Sanctuary over True Myth is [Fantasy Land] compatibility, or familiarity if coming from a language like Haskell or PureScript.

3.  True Myth's API aims to be more idiomatic as JavaScript/TypeScript, with a one difference in particular worth calling out: the **function naming convention.** True Myth uses PascalCase for types and camelCase for functions – so, `new Just(5)` and `just(5)`, whereas Sanctuary uses the capitals as function names for type constructors, i.e. `S.Just(5)`, and does not support `new`.

4.  Sanctuary also aims to provide a much larger suite of functions, more like [Ramda], but with Haskell- or PureScript-inspired type safety and sophistication. True Myth intentionally punts on those concerns, assuming that most consumers are already using a library like Lodash or Ramda and aiming to be easy to integrate with those instead.

[s-ts]: https://github.com/sanctuary-js/sanctuary/pull/431

## Migrating from other libraries

### From Folktale

Migrating from Folktale should be *very* straightforward: many of the names are the same, and the behavior of many of the functions is as well.

#### From Folktale 1.x

In many cases, you can simple rename your imports and some of the function invocations for Folktale to switch to True Myth – several imports are supplied with exactly that pattern in mind. If a given item is not mentioned, you can assume no change other than the import is required.

##### Update imports

```diff
-import Maybe from 'data.maybe'
+import Maybe from 'true-myth/maybe'
```

##### Update `Nothing`/`Just` constructors

```diff
-Maybe.Nothing()
-Maybe.Just('foo')
+Maybe.nothing()
+Maybe.just('foo)
```

##### Update `getOrElse` -> `unwrapOr`

```diff
-foo.getOrElse('oh noes')
+foo.unwrapOr('oh noes')
```

##### Update `get` -> `unsafelyUnwrap`

*Note: the method is called `unsafelyUnwrap` because it's not a good idea to use it. It's technically the equivalent of `get`, but it would be much better to change your logic to work with `match` instead because it's safer.*

```diff
-foo.get()
+foo.unsafelyUnwrap()
```

```js
// a better alternative:
foo.match({
  Just: (foo) => foo,
  Nothing: () => 'fallback value'
})
```

- [ ] TODO: migration path from data.either -> Result

#### From Folktale 2.x

In many cases, you can simple rename your imports and some of the function invocations for Folktale to switch to True Myth – several imports are supplied with exactly that pattern in mind. If a given item is not mentioned, you can assume no change other than the import is required.

- [ ] TODO: rest of the migration path from Folktale 2.0

|        Folktale        |     True Myth      |                                                                             Notes                                                                              |
| ---------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Maybe`                | `Maybe `           |                                                                                                                                                                |
| `Maybe.hasInstance`    | no equivalent      |                                                                                                                                                                |
| `Maybe.empty`          | `Maybe.nothing`    |                                                                                                                                                                |
| `Maybe.of`             | `Maybe.just`       | Because True Myth's `Maybe.of` correctly handles `null` and `undefined`, you *can* simply keep using `Maybe.of`, but the semantics will be somewhat different. |
| `Maybe.fromNullable`   | `Maybe.of`         | `Maybe.fromNullable` also exists and accordingly you do not *need* to migrate. `Maybe.of` is nicer, though!                                                    |
| `Maybe.fromResult`     | `Maybe.fromResult` |                                                                                                                                                                |
| `Maybe.fromValidation` | no equivalent      | You can use `Maybe.fromResult` as type-signature equivalent                                                                                                    |
| `Maybe.fromJSON`       | no equivalent      |                                                                                                                                                                |
| `Maybe.Just`           | `Maybe.just`       | You may also use `new Maybe.Just`, but the standalone function is recommended                                                                                  |
| `Maybe.Nothing`        | `Maybe.nothing`    | You may also use `new Maybe.Nothing`, but the standalone function is recommended                                                                               |
| `Maybe.matchWith`      | `Maybe.match`      | The value is supplied unwrapped, i.e. you do not need to do `item.value`, merely `item` in True Myth, as in Folktale 1.0                                       |
| `Maybe.cata`           | `Maybe.cata`       | The value is supplied unwrapped, i.e. you do not need to do `item.value`, merely `item` in True Myth, as in Folktale 1.0                                       |
| `Just#inspect`         | `Just#toString`    | You can also use the static method `Maybe.toString`                                                                                                            |
| `Nothing#inspect`      | `Nothing#toString` | You can also use the static method `Maybe.toString`                                                                                                            |
| `Just#tag`             | `Just#variant`     |                                                                                                                                                                |
| `Nothing#tag`          | `Nothing#variant`  |                                                                                                                                                                |
| `Just#type`            | no equivalent      |                                                                                                                                                                |
| `Nothing#type`         | no equivalent      |                                                                                                                                                                |
| `Just#concat`          | no equivalent      |                                                                                                                                                                |
| `Nothing#concat`       | no equivalent      |                                                                                                                                                                |
| `Just#equals`          | `Just#equals`      | You can also use the static method `Maybe.equals`                                                                                                              |
| `Nothing#equals`       | `Nothing#equals`   | You can also use the static method `Maybe.equals`                                                                                                              |
| `Result`               | `Result`           |                                                                                                                                                                |
| `Validation`           | no equivalent      | You can use `Result` instead: a `Validation<Success, Failure>` has identical semantics to `Result<T, E>`                                                       |

[`_.isEqual`]: https://lodash.com/docs/4.17.4#isEqual
[`R.equals`]: http://ramdajs.com/docs/#equals

### From Sanctuary

There are straightforward conversions from most Sanctuary functions to True Myth functions.

|  Sanctuary  | True Myth  | Notes |
| ----------- | ---------- | ----- |
| `S.Either`  | `Result`   |       |
| `Left`      | `Err`      |       |
| `Right`     | `Ok`       |       |
| `S.toMaybe` | `Maybe.of` |       |

- [ ] TODO: migration path from Sanctuary

## What's with the name?

For slightly quirky [historical reasons], libraries which borrow ideas from typed functional programming in JavaScript often use names related to the phrase "fantasy land" – especially [Fantasy Land] itself and [Folktale].

[historical reasons]: https://github.com/promises-aplus/promises-spec/issues/94#issuecomment-16176966

"True Myth" leans on that history (and serves, hopefully, as a respectful nod to Folktale in particular, as both Folktale and Sanctuary are huge inspirations for this library), and borrows an idea from J.R.R. Tolkien and C.S. Lewis: what if all myths appeal to us because they point ultimately at something true – and what if some story with the structure of a myth *were* true in history? It's a beautiful idea, and the name of this library was picked as an homage to it.
