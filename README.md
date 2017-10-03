# True Myth

[![Travis `master`](https://img.shields.io/travis/chriskrycho/true-myth/master.svg?style=flat-square)](https://travis-ci.org/chriskrycho/true-myth)
[![npm](https://img.shields.io/npm/v/true-myth.svg?style=flat-square)](https://www.npmjs.com/package/true-myth)
[![license](https://img.shields.io/github/license/chriskrycho/true-myth.svg?style=flat-square)](https://github.com/chriskrycho/true-myth/blob/master/LICENSE)

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
    - [The type names](#the-type-names)
        - [`Maybe`](#maybe)
            - [The `Maybe` variants: `Just` and `Nothing`](#the-maybe-variants-just-and-nothing)
        - [`Result`](#result)
            - [The `Result` variants: `Ok` and `Err`](#the-result-variants-ok-and-err)
- [Setup](#setup)
    - [JavaScript](#javascript)
    - [TypeScript](#typescript)
    - [Flow](#flow)
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
function safeLength(mightBeAString: Maybe<string>): Maybe<number> {
  return mightBeAString.map(s => s.length);
}

const someString = Maybe.just('a string');
const nothingHere = Maybe.nothing<string>();
console.log(safeLength(someString).toString()); // "Just(8)"
console.log(safeLength(nothingHere).toString()); // "Nothing"
```

### Constructing `Maybe`

You can use `Maybe.of` to construct a `Maybe` from any value. It will return a
`Nothing` if the passed type is `null` or `undefined`, or a `Just` otherwise.

```ts
function acceptsANullOhNo(value: number | null): Maybe<string> {
  const maybeNumber = Maybe.of(value);
  return mapOr("0", n => n.toString(), maybeNumber);
}
```

### Safely getting at values

Helpers are supplied to allow you to get at the values wrapped in the type:

```ts
const theAnswer = Result.ok(42);
const theAnwerValue = unsafelyUnwrap(theAnswer);
```

However, as its name makes explicit `unsafelyUnwrap` is not a safe operation; if
the item being unwrapped is an `Err`, this will throw an `Error`. Instead, you
can use one of the safe unwrap methods:

```ts
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
broken error states. Are you tired of the game yet?

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

What is this sorcery?

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

myInteger * 3; // :(
```

Let's try that again, but this time let's put the actual value in a container
and give ourselves safe access methods:

```js
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

- [ ] TODO: comments on type safety via TS and Flow

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
    const classicalJust = new Just('value');
    const functionalJust = just('value');
    const classicalNothing = new Nothing();
    const functionalNothing = nothing();
    ```

-   Similarly, you can use methods or pure functions:

    ```ts
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

- [ ] TODO: elaborate on reasons for `Just` and `Nothing`

#### `Result`

- [ ] TODO: Explain why `Result`

##### The `Result` variants: `Ok` and `Err`

- [ ] TODO: explain why `Ok` and `Err` (esp. instead of `Error`)

## Setup

### JavaScript

- [ ] TODO: JS setup

### TypeScript

- [ ] TODO: TS setup

### Flow

- [ ] TODO: Flow setup

## Roadmap

Before this hits 1.0, I will do:

- [ ] `Maybe`
    - [x] add aliases for the standard names, e.g. `bind`, `chain`, etc.
    - [ ] finish documentation

- [ ] `Result`
    - [x] implement
    - [ ] document

- [ ] `Either`
    - [ ] implement
    - [ ] document

If you think another type should be in this list, please [open an issue]!

[open an issue]: https://github.com/chriskrycho/true-myth/issues

## Why not...

There are other great functional programming libraries out there... so why not
just use one of them?

### Folktale?

Folktale has an API a lot like this one, as you'll see when perusing the docs.
However, there are two main reasons you might prefer True Myth to Folktale:

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
    the world of strongly-typed functional programming languagues. This is
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

- [ ] TODO: kind of the same as Folktale, but add specific details

## Migrating from other libraries

 - [ ] TODO: instructions for migrating from Folktale 1.0/2.0
 - [ ] TODO: instructions for migrating from Sanctuary

## What's with the name?

- [ ] TODO: Tolkien/Lewis, also Folktale/FantasyLand/Sanctuary. Nice resonance
