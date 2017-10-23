<h1 align="center"><a href='https://github.com/chriskrycho/true-myth'>True Myth</a></h1>

<p align="center">A library for safe functional programming in JavaScript, with first-class support for TypeScript and Flow.</p>

<p align="center">

[![Travis `master`](https://img.shields.io/travis/chriskrycho/true-myth/master.svg?style=flat-square)](https://travis-ci.org/chriskrycho/true-myth)
[![npm](https://img.shields.io/npm/v/true-myth.svg?style=flat-square)](https://www.npmjs.com/package/true-myth)
![Stability](https://img.shields.io/badge/stability-experimental-purple.svg?style=flat-square&colorB=b28cd9)
[![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg?style=flat-square)](https://gitter.im/true-myth/Lobby)
[![license](https://img.shields.io/github/license/chriskrycho/true-myth.svg?style=flat-square)](https://github.com/chriskrycho/true-myth/blob/master/LICENSE)
![test coverage](https://img.shields.io/badge/Jest-100%25-0da300.svg?style=flat-square)
[![Gratipay](https://img.shields.io/gratipay/project/true-myth.svg?style=flat-square)](https://gratipay.com/true-myth/)
[![](https://img.shields.io/badge/js.org-dns-ffb400.svg?style=flat-square)](https://js.org)
[![docs via TypeDoc](https://img.shields.io/badge/docs-TypeDoc-blue.svg?style=flat-square)](http://typedoc.org)

</p>

A library for safe functional programming in JavaScript, with first-class
support for TypeScript and Flow, that has `Maybe` and `Result` types, supporting both a
functional style and a more traditional method-call style.

- [Just the API, please](#just-the-api-please)
    - [`Result` with a functional style](#result-with-a-functional-style)
    - [`Maybe` with the method style](#maybe-with-the-method-style)
    - [Constructing `Maybe`](#constructing-maybe)
    - [Safely getting at values](#safely-getting-at-values)
- [What is this for?](#what-is-this-for)
    - [The problem](#the-problem)
    - [The solution](#the-solution)
- [Design philosophy](#design-philosophy)
    - [A note on reference types: no deep copies here!](#a-note-on-reference-types-no-deep-copies-here)
    - [The type names](#the-type-names)
        - [`Maybe`](#maybe)
            - [The `Maybe` variants: `Just` and `Nothing`](#the-maybe-variants-just-and-nothing)
        - [`Result`](#result)
            - [The `Result` variants: `Ok` and `Err`](#the-result-variants-ok-and-err)
    - [Inspiration](#inspiration)
- [Setup](#setup)
    - [TypeScript and Flow](#typescript-and-flow)
- [Roadmap](#roadmap)
- [Why not...](#why-not)
    - [Folktale](#folktale)
    - [Sanctuary](#sanctuary)
- [Migrating from existing libs](#migrating-from-existing-libs)
- [What's with the name?](#whats-with-the-name)

## Just the API, please

_If you're unsure of why you would want to use the library, you might jump down
to [**What is this for?**](#what-is-this-for)._

These examples don't cover every corner of the API; it's just here to show you
what a few of the functions are like. [Full API documentation is
available!][docs]

[docs]: https://chriskrycho.github.io/true-myth/

### `Result` with a functional style

```ts
import { Result, map toString } from 'true-myth/result';

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

```ts
import { Maybe, Just, Nothing } from 'true-myth/maybe';

function safeLength(mightBeAString: Maybe<string>): Maybe<number> {
  return mightBeAString.map(s => s.length);
}

const justAString = new Just('a string');
const nothingHere = new Nothing<string>();
console.log(safeLength(justAString).toString()); // Just(8)
console.log(safeLength(nothingHere).toString()); // Nothing
```

### Constructing `Maybe`

You can use `Maybe.of` to construct a `Maybe` from any value. It will return a
`Nothing` if the passed type is `null` or `undefined`, or a `Just` otherwise.

```ts
import { of as maybeOf, Maybe } from 'true-myth/maybe';

function acceptsANullOhNo(value: number | null): Maybe<string> {
  const maybeNumber = maybeOf(value);
  return mapOr("0", n => n.toString(), maybeNumber);
}
```

### Safely getting at values

Helpers are supplied to allow you to get at the values wrapped in the type:

```ts
import { ok, unsafelyUnwrap } from 'true-myth/result';

const theAnswer = ok(42);
const theAnwerValue = unsafelyUnwrap(theAnswer);
```

However, as its name makes explicit `unsafelyUnwrap` is not a safe operation; if
the item being unwrapped is an `Err`, this will throw an `Error`. Instead, you
can use one of the safe unwrap methods:

```ts
import { ok, unwrapOr } from 'true-myth/result';

const theAnswer = ok(42);
const theAnswerValue = unwrapOr(0, theAnswer);
```

## What is this for?

### The History

How do you represent the concept of not having anything, programmatically? As a
language, JavaScript uses `null` to represent this concept; if you have a
variable `myNumber` to store numbers, you might assign the value `null` when you
don't have any number at all. If you have a variable `myString`, you might set
`myString = null;` when you don't have a string.

Some JavaScript programmers use `undefined` in place of `null` or in addition to
`null`, so rather than setting a value to `null` they might just set `let
myString;` or even `let myString = undefined;`.

### The problem

Every language needs a way to express the concept of nothing, but `null` and
`undefined` are a curse. Their presence in JavaScript (and in many other
languages) introduce a host of problems, because they are not a particularly
*safe* way to represent the concept. Say, for a moment, that you have a function
that takes an integer as a parameter:

```js
let myNumber = undefined;

function myFuncThatTakesAnInteger(anInteger) {
  return anInteger.toString();
}

myFuncThatTakesAnInteger(myNumber); // TypeError: anInteger is undefined
```

![this is fine](https://user-images.githubusercontent.com/2403023/31154374-ac25ce0e-a874-11e7-9399-73ad99d9d6cb.png)

When the function tries to convert the integer to a string, the function blows
up because it was written with the assumption that the parameter being passed in
(a) is defined and (b) has a `toString` method. Neither of these assumptions are
true when `anInteger` is `null` or `undefined`. This leads JavaScript
programmers to program defensively, with `if (!anInteger) return;` style guard
blocks at the top of their functions. This leads to harder-to-read code, and
what's more, *it doesn't actually solve the root problem.* You could imagine
this situation playing itself out in a million different ways: arguments to
functions go missing. Values on objects turn out not to exist. Arrays are absent
instead of merely empty.

The result is a steady stream not merely of programming frustrations, but of
*errors*. The program does not function as the programmer intends. That means
stuff doesn't work correctly for the user of the software. Imagine a hammer
where the head just slips off every so often, in ways you could compensate for
but which makes it that much harder to just get the nail into the wood.

That's what `null` and `undefined` are. You can program around them. But
defensive programming is gross. You write a lot of things like this:

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

If you forget that check, or simply assume, "Look, I'll *never* call this
without including the argument," eventually you or someone else will get it
wrong. Usually somewhere far away from the actual invocation of `doAThing`, so
that it's not obvious why that value ended up being `null` there.

TypeScript and Flow take us a big step in that direction, so long as our type
annotations are good enough. (Use of `any` will leave us sad, though.) We can
specify that type *may* be present, using the [maybe]/[optional] annotation.
This at least helps keep us honest. But we still end up writing a ton of
repeated boilerplate to deal with this problem. Rather than just handling it
once and being done with it, we play a never-ending game of whack-a-mole. We
must be constantly vigilant and proactive so that our users don't get into
broken error states.

[maybe]: https://flow.org/en/docs/types/maybe/
[optional]: http://www.typescriptlang.org/docs/handbook/interfaces.html#optional-properties

### The solution

`Maybe` and `Result` are our escape hatch from all this madness. 

We reach for libraries precisely so we can solve real business problems
while letting lower-level concerns live in the "solved problems" category. True
Myth, borrowing ideas from many other languages and libraries, aims to put
_code written to defend against `null`/`undefined` problems_ in that "solved
problems" category.

`Maybe` and `Result` solve this problem *once*, and *in a principled way*,
instead of in an _ad-hoc_ way throughout your codebase, by putting the value
into a *container* which is guaranteed to be safe to act upon, regardless of
whether there's something inside it or not.

These containers let us write functions with *actually safe* assumptions about
parameter values by extracting the question, "Does this variable contain a valid
value?" to API boundaries, rather than needing to ask that question at the head
of every. single. function.

*What is this sorcery?*

It turns out you probably already have a good idea of how this works, if you've
spent much time writing JavaScript, because this is exactly how arrays work.

Imagine, for a moment, that you have a variable `myArray` and you want to map
over it and print out every value to the console. You instantiate it as an empty
array and then forget to load it up with values before mapping over it:

```js
let myArray = [];

// oops, I meant to load up the variable with an array, but I forgot!

myArray.forEach(n => console.log(n)); // <nothing prints to the screen>
```

Even though this doesn't print anything to the screen, it doesn't unexpectedly
blow up, either. In other words, it represents the concept of having nothing
"inside the box" in a safe manner. By contrast, an integer has no such safe box
around it. What if you could multiply an integer by two, and if your variable
was "empty" for one reason or another, it wouldn't blow up?

```js
let myInteger = undefined;

myInteger * 3; // 😢
```

Let's try that again, but this time let's put the actual value in a container
and give ourselves safe access methods:

```js
import * as Maybe from 'true-myth/maybe';

let myInteger = Maybe.of(undefined); 
myInteger.map(x => x * 3); // Nothing
```

![mind blown](https://user-images.githubusercontent.com/2403023/31098390-5d6573d0-a790-11e7-96f9-361d2e70522b.gif)

We received `Nothing` back as our value, which isn't particularly useful, but it
also didn't halt our program in its tracks!

`Result` is similar to `Maybe`, except it packages up the result of an operation
(like a network request) whether it's a success (an `Ok`) or a failure (an
`Err`) and lets us unwrap the package at our leisure. Whether you get back a 200
or a 401 for your HTTP request, you can pass the box around the same either way;
the methods and properties the container has are not dependent upon whether
there is shiny new data or a big red error inside.

Best of all, when you use these with libraries like TypeScript or Flow, you can
lean on their type systems to check aggressively for `null` and `undefined`, and
actually *eliminate* those from your codebase by replacing anywhere you would
have used them with `Maybe`.

Likewise, you can replace functions which take polymorphic arguments or have
polymorphic return values in order to try to handle scenarios where something
may be a success or an error with functions using `Result`.

Any place you try to treat them as just the underlying value rather than the
container, the type systems will complain, of course. And you'll also get help
from smart editors with suggestions about what kinds of values (including
functions) you need to interact with any given helper or method, since the type
definitions are supplied.

By leaning on TypeScript or Flow to handle the checking, we also get all these
benefits with *no* runtime overhead other than the cost of constructing the
actual container objects (which is to say: *very* low!).

## Design philosophy

The design aims for True Myth are:

-   to be as idiomatic as possible in JavaScript
-   to support a natural functional programming style
-   to have zero runtime cost beyond simple object construction and function
    invocation
-   to lean heavily on TypeScript and Flow to enable all of the above

In practice, that means:

-   You can construct the variant types in the traditional JavaScript way or
    with a pure function:

    ```ts
    import { Just, just, Nothing, nothing } from 'true-myth/maybe';

    const classicalJust = new Just('value');
    const classicalNothing = new Nothing();
    
    const functionalJust = just('value');
    const functionalNothing = nothing();
    ```

-   Similarly, you can use methods or pure functions:

    ```ts
    import { ok, map } from 'true-myth/result';

    const numberResult = ok(42);
    const ok84 = numberResult.map(x => x * 2);
    const ok21 = map(x => x / 2, numberResult);
    ```

    As this second example suggests, the aim has been to support the most
    idiomatic approach for each style. This means that yes, you might find it a
    bit confusing if you're actively switching between the two of them. (Why
    would you do that?!?)

-   Using the library with TypeScript or Flow will *just work* and will provide
    you with considerable safety out of the box. Using it with JavaScript will
    work just fine, but there is no runtime checking, and you're responsible to
    make sure you don't `unwrap()` a `Maybe` without checking that it's safe to
    do so.

-   Since this is a TypeScript- and Flow-first library, we intentionally leave
    out any runtime type checking. As such, you *should* make use of the type
    systems if you want the benefits of the system. Many of the functions simply
    assume that the types are checked, and *will* error if you pass in items of
    the wrong type.
    
    For example, if you pass a non-`Maybe` instance to many functions, they will
    simply fail – even the basic helpers like `isJust` and `isNothing`. These
    assumptions have been made precisely *because* this is a TypeScript- and
    Flow-first library. (See the discussion below comparing True Myth to
    Folktale and Sanctuary if you aren't using TypeScript or Flow and need
    runtime checking.)

The overarching themes are flexibility and approachability.

The hope is that a team just picking up these ideas for the first time can use
them without adapting their whole style to a "traditional" functional
programming approach, but a team comfortable with functional idioms will find
themselves at home with the style of data-last pure functions. (For a brief
discussion of why you want the data last in a functional style, see [this blog
post].)

[this blog post]: http://www.chriskrycho.com/2017/collection-last-auto-curried-functions.html

(As a closely related note: True Myth does not currently supply curried variants
of the functions. There are a *lot* of good options out there for that; both
[lodash] and [Ramda] have tools for currying existing function definitions. It
also profoundly complicates writing the type signatures for these functions,
since neither TypeScript nor Flow can easily represent auto- curried functions –
unsurprisingly, given they're uncommon in JavaScript. Using Ramda or lodash to
get curried versions of the functions may be a huge win for you in your
codebase, though!)

[Ramda]: http://ramdajs.com
[lodash]: https://lodash.com

### A note on reference types: no deep copies here!

One important note: True Myth does *not* attempt to deeply-clone the wrapped
values when performing operations on them. Instead, the library assumes that you
will *not* mutate those objects in place. (Doing more than this would require
taking on a dependency on e.g. [lodash]). If you violate that constraint, you
can and will see surprising outcomes. Accordingly, you should take care not to
mutate reference types, or to use deep cloning yourself when e.g. mapping over
reference types.

```ts
import { just, map, unsafelyUnwrap } from 'true-myth/maybe';

const anObjectToWrap = { desc: ['this', ' ', 'is a string'], val: 42 };
const wrapped = just(anObjectToWrap);
const updated = map(obj => ({...obj, val: 92 }), wrapped);

console.log(unsafelyUnwrap(updated).val);  // 92

// Now mutate the original
anObjectToWrap.desc.push('.');

// And… 😱 we've mutated the new one, too:
console.log(unsafelyUnwrap(updated).desc);  // ["this", " ", "is a string", "."]
```

In other words: you *must* use other tools along with True Myth if you're going
to mutate objects you're wrapping in `Maybe` or `Result`.

True Myth will work quite nicely with [lodash], [Ramda], [Immutable-JS], etc.,
so you can use whatever tools you like to handle this problem.

[Immutable-JS]: http://facebook.github.io/immutable-js/

### The type names

#### `Maybe`

The existing options in this space include `Option`, `Optional`, and `Maybe`.
You could also point to "nullable," but that actually means the *opposite* of
what we're doing here – these represent types which can *not* be nullable!

`Option` implies a choice between several different *options*; in this case
that's not really what's going on. It's also not really a great word for the
type in the sense that it's weird to read aloud: "an Option string" doesn't make
any sense in English.

`Optional` is much better than `Option`. The semantics are much more accurate,
in that it captures that the thing is allowed to be absent. It's also the nicest
grammatically: "an Optional string". On the other hand, it's also the *longest*.

`Maybe` seems to be the best type name semantically: we're modeling something
which *may* be there – or may *not* be there! Grammatically, it's comparable to
"optional": "a Maybe string" isn't great – but "maybe a string" is the most
natural *accurate* way to answer the question, "What's in this field?" It's also
the shortest!

`Optional` or `Maybe` are both good names; `Maybe` just seemed slightly better.

##### The `Maybe` variants: `Just` and `Nothing`

Similar consideration was given to the names of the type variants. Options for
the "present" type in other libraries are `Some` and `Just`. Options for the
"absent" type are `None` or `Nothing`.

###### Why `Just`?

Both `Just` and `Some` are reasonable choices for this, and both have things to
recommend them semantically:

-   When talking about the *type* of given item, "some" makes a lot of sense:
    "What's in this field? Some number." You can get the same idea across with
    "just" but it's a bit less clear: "What's in this field? Just a number."
-   On the other hand, when talking about or constructing a given *value*,
    "just" makes more sense: "What is this? It's just 12." When you try to use
    "some" there, it reads oddly: "What is this? It's some 12."

Given that "just a number" *works* (even if it's strictly a little less nice
than "some number") and that "just 12" works but "some 12" doesn't, `Just` seems
to be a slightly better option.

###### Why `Nothing`?

Given the choice between `None` and `Nothing`, the consideration just came down
to the most natural *language* choice. "What's here? Nothing!" makes sense,
while "What's here? None" does not. `None` also implies that there might be
more than one of the items. It's entirely unnatural to say "There is none of a
number here"; you'd normally say "there is no number here" or "there is nothing
here" instead. So `Nothing` it is!

#### `Result`

In some languages and libraries, a more general type named `Either` is used
instead of the more specific `Result` name. The two are equivalent in
functionality – both provide two variants, each of which wraps a value. In the
`Either` implementations, those are usually named `Left` and `Right`. In the
`Result` implementations (both here and in other libraries and languages), they
are named `Ok` and `Err`.

The main difference between `Either` and `Result` is precisely that question of
generality. `Either` can meaningfully capture *any* scenario where there are two
possible values resulting from a given function application, or applicable as
arguments to a function. `Result` *only* captures the idea of something
succeeding or failing. In that sense, `Either` might seem to be better: it can
capture what `Result` captures (traditionally with `Left` being the error case
and `Right` being the success, or *right*, case), and many more besides.

However, in practice, the idea of a result is far and away the most common case
for using an `Either`, and it's also the easiest to explain. (An `Either`
implementation would also be valuable, though, and it might be a later addition
to the library.)

##### The `Result` variants: `Ok` and `Err`

Given a "result" type, we need to be able to express the idea of "success" and
"failure." The most obvious names here would be `Success` and `Failure`. Those
are actually really good names with a single problem: they're *long*. Needing to
write `success(12)` or `failure({ oh: 'no' })` is a *lot* to write over and over
again. Especially when there some options which *also* work well: `Ok` and
`Err`.

Both `Ok` and `Err` could be written out long-form: `Okay` and `Error`. But in
this case, the longer names don't add any particular clarity; they require more
typing; and the `Error` case also overloads the existing name of the base
exception type in JavaScript. So: `Ok` and `Err` it is.

### Inspiration

The design of True Myth draws heavily on prior art; essentially nothing of this
is original – *perhaps* excepting the choice to make `Maybe.of` handle `null`
and `undefined` in constructing the types. In particular, however, True Myth
draws particular inspiration from:

-   Rust's [`Option`][rs-option] and [`Result`][rs-result] types and their
    associated methods
-   Folktale's [`Maybe`][ft-maybe] and [`Result`][ft-result] implementations
-   Elm's [`Maybe`][elm-maybe] and [`Result`][elm-result] types and their
    associated functions

[rs-option]: https://doc.rust-lang.org/stable/std/option/
[rs-result]: https://doc.rust-lang.org/stable/std/result/
[ft-maybe]: http://folktale.origamitower.com/api/v2.0.0/en/folktale.maybe.html
[ft-result]: http://folktale.origamitower.com/api/v2.0.0/en/folktale.result.html
[elm-maybe]: http://package.elm-lang.org/packages/elm-lang/core/5.1.1/Maybe
[elm-result]: http://package.elm-lang.org/packages/elm-lang/core/5.1.1/Result

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

Each of CommonJS, AMD, and ES modules are shipped, so you may reference them
directly from their installation in the `node_modules` directory. (This may be
helpful for using the library in different contexts, with the ES modules being
supplied especially so you can do tree-shaking with e.g. Rollup.)

```
node_modules/
  true-myth/
    dist/
      amd/
        index.js
        index.d.ts
        index.js.map
        index.js.flow
      commonjs/
        index.js
        index.d.ts
        index.js.map
        index.js.flow
      es/
        index.js
        index.d.ts
        index.js.flow
        index.js.map
        maybe.js
        maybe.d.ts
        maybe.js.flow
        maybe.js.map
        result.js
        result.d.ts
        result.js.flow
        result.js.map
        utils.js
        utils.d.ts
        utils.js.flow
        utils.js.map
```

### TypeScript and Flow

TypeScript and Flow should *just work*. You can simply use the module as a normal
ES6-style module import, whether working in Node or using something like Webpack
or Ember CLI for bundling.

Moreover, type defs are provided for both in each of the specific formats (as
you can see in the listing above), so you can reference them directly if you
need to.

## Roadmap

Before this hits 1.0, I will do:

- [x] `Maybe`
    - [x] add aliases for the standard names, e.g. `bind`, `chain`, etc.
    - [x] finish documentation

- [x] `Result`
    - [x] implement
    - [x] document

- [x] *All* the exports
    - [x] AMD
    - [x] ES modules
    - [x] CommonJS modules

- [ ] Ember CLI integration

If you think another type should be in this list, please [open an issue]!

[open an issue]: https://github.com/chriskrycho/true-myth/issues

## Why not...

There are other great functional programming libraries out there... so why not
just use one of them?

Note that much of the content between these sections is the same; it's presented
as is so you can simply read the section appropriate to the library you're
comparing it with.

### Folktale?

[Folktale] has an API a lot like this one, as you'll see when perusing the docs.
However, there are two main reasons you might prefer True Myth to Folktale:

[Folktale]: http://folktale.origamitower.com

1.  True Myth is TypeScript-first and Flow-first, which means that it assumes
    you are using TypeScript or Flow if you're aiming for rigorous type safety.
    
    By contrast, Folktale is a JavaScript-first library, with runtime checking
    built in for its types. Folktale's TypeScript support is in-progress, but
    will remain secondary until a TypeScript rewrite of the whole Folktale
    library lands... eventually.
   
    There's value in both of these approaches, so True Myth aims to take
    advantage of the compilers and play in a no-runtime-cost space.

    If you want a JS-focused (rather than TS- or Flow-focused) library which
    will help you be safer without a compiler, you should definitely pick
    Folktale over True Myth. If you've already using TS or Flow, True Myth is a
    bit nicer of an experience.

2.  True Myth aims to keep functional programming jargon to a minimum and to use
    TypeScript and Flow type notation throughout its docs as well as in its
    implementation.
    
    Folktale is aimed squarely at people who are already pretty comfortable with
    the world of strongly-typed functional programming languages. This is
    particularly evident in the way its type signatures are written out (using
    the same basic notation you might see in e.g. Haskell), but it's also there
    in its heavy use of functional programming terminology throughout its docs.

    Haskell-style types are quite nice, and functional programming jargon is
    very useful. However, they're also another hump to get over. Again: a
    tradeoff.
    
    By opting for type notation that TS or Flow developers are already familiar
    with, and by focusing on what various functions *do* rather than the usual
    FP names for them, True Myth aims at people just coming up to speed on
    these ideas.

    The big win for Folktale over True Myth is [Fantasy Land] compatibility.


3.  True Myth's API aims to be more idiomatic as JavaScript/TypeScript, with a
    couple differences in particular worth calling out:

    -   **function naming convention:** True Myth uses PascalCase for types and
        camelCase for functions – so, `new Just(5)` and `just(5)`, whereas
        FolkTale uses the capitals as function names for type constructors, i.e.
        `Just(5)`, and does not support `new`.
    
    -   **ease of construction from nullable types:** True Myth allows you to
        construct `Maybe` types from nullable types with `Maybe.of`, because JS
        is *full* of `null` and `undefined`, and allowing `Maybe.of` to handle
        them makes it easier to be sure you're always doing the right thing.
        
        Folktale's `Maybe.of` only allows the use of non-nullable types, and
        requires you to use `Maybe.fromNullable` instead. This isn't
        unreasonable, but it dramatically decreases the convenience of
        integration with existing JS codebases or interfacing with untyped JS
        libraries.

[Fantasy Land]: https://github.com/fantasyland/fantasy-land

### Sanctuary?

[Sanctuary] has many of the same goals as True Myth, but is much more focused on
the expectations and patterns you'd see in Haskell or PureScript or similar
languages. Its API and True Myth's are much *less* similar than Folktale and
True Myth's are, as a result – the underlying details are often similar, but the
names are nearly all different. A few of the major contrasts:

[Sanctuary]: https://sanctuary.js.org

1.  True Myth is TypeScript-first and Flow-first, which means that it assumes
    you are using TypeScript or Flow if you're aiming for rigorous type safety.
    
    By contrast, Sanctuary is a JavaScript-first library, with runtime checking
    built in for its types. Sanctuary's TypeScript support is [in progress][s-ts],
    but will for the foreseeable future remain add-on rather than first-class.
    (Sanctuary *does* allow you to create a version of the module without the
    runtime checking, but it requires you to do this yourself.)
   
    There's value in both of these approaches, so True Myth aims to take
    advantage of the compilers and play in a no-runtime-cost space.

    If you want a JS-focused (rather than TS- or Flow-focused) library which
    will help you be safer without a compiler, you should definitely pick
    Sanctuary over True Myth. If you've already using TS or Flow, True Myth is a
    bit nicer of an experience.

2.  True Myth aims to keep functional programming jargon to a minimum and to use
    TypeScript and Flow type notation throughout its docs as well as in its
    implementation.
    
    Sanctuary is aimed squarely at people who are already extremely comfortable
    the world of strongly-typed, pure functional programming languages. This is
    particularly evident in the way its type signatures are written out (using
    the same notation you would see in Haskell or PureScript), but it's also
    present in Sanctuary's heavy use of functional programming terminology
    throughout its docs.

    Haskell- and Purescript-style types are quite nice, and the functional
    programming jargon is very useful. However, they're also another hump to get
    over. Again: a tradeoff.
    
    By opting for type notation that TS or Flow developers are already familiar
    with, and by focusing on what various functions *do* rather than the usual
    FP names for them, True Myth aims at people just coming up to speed on
    these ideas.

    The big win for Sanctuary over True Myth is [Fantasy Land] compatibility, or
    familiarity if coming from a language like Haskell or PureScript.

3.  True Myth's API aims to be more idiomatic as JavaScript/TypeScript, with a
    one difference in particular worth calling out: the **function naming
    convention.** True Myth uses PascalCase for types and camelCase for
    functions – so, `new Just(5)` and `just(5)`, whereas Sanctuary uses the
    capitals as function names for type constructors, i.e. `S.Just(5)`, and does
    not support `new`.

4.  Sanctuary also aims to provide a much larger suite of functions, more like
    [Ramda] but with Haskell- or PureScript-inspired type safety and
    sophistication. True Myth intentionally punts on those concerns, assuming
    that most consumers are already using a library like Lodash or Ramda and
    aiming to be easy to integrate with those instead.

[s-ts]: https://github.com/sanctuary-js/sanctuary/pull/431

## Migrating from other libraries

### Folktale

Migrating from Folktale should be *very* straightforward: many of the names are
the same, and the behavior of many of the functions is as well.

#### Folktale 1.0

- [ ] TODO: migration path from Folktale 1.0

#### Folktale 2.0

- [ ] TODO: migration path from Folktale 2.0

### Sanctuary

- `S.Either`: `Result`
    + `Left`: `Err`
    + `Right`: `Ok`
- `S.toMaybe`: `Maybe.of`

<!-- break that list -->

- [ ] TODO: migration path from Sanctuary

## What's with the name?

For slightly quirky [historical reasons], libraries which borrow ideas from
typed functional programming in JavaScript often use names related to the phrase
"fantasy land" – especially [Fantasy Land] itself and [Folktale].

[historical reasons]: https://github.com/promises-aplus/promises-spec/issues/94#issuecomment-16176966

"True Myth" leans on that history (and serves, hopefully, as a respectful nod to
Folktale in particular, as both Folktale and Sanctuary are huge inspirations for
this library), and borrows an idea from J.R.R. Tolkien and C.S. Lewis: what if
all myths appeal to us because they point ultimately at something true – and
what if some story with the structure of a myth *were* true in history? It's a
beautiful idea, and the name of this library was picked as an homage to it.
