# True Myth

[![Travis](https://img.shields.io/travis/chriskrycho/true-myth.svg?style=flat-square)](https://travis-ci.org/chriskrycho/true-myth)
[![npm](https://img.shields.io/npm/v/true-myth.svg?style=flat-square)](https://www.npmjs.com/package/true-myth)

A library for safe functional programming in JavaScript, with first-class
support for TypeScript and Flow.

- [What is this for?](#what-is-this-for)
    - [Philosophy](#philosophy)
    - [What's with the name?](#whats-with-the-name)
- [Setup](#setup)
    - [JavaScript](#javascript)
    - [TypeScript](#typescript)
    - [Flow](#flow)
- [Roadmap](#roadmap)
- [Why not...](#why-not)
    - [Folktale](#folktale)
    - [Sanctuary](#sanctuary)

## What is this for?

- [ ] TODO: motivation

### Philosophy

The design aims of this library are:

-   to be as idiomatic as possible in JavaScript
-   to support a natural *functional* style
-   to have zero runtime cost beyond simple object construction and function
    invocation
-   to lean heavily on TypeScript and Flow to enable all of the above

In practice, that means:

-   You can construct the variant types in the traditional JavaScript way or
    with a pure function:

    ```ts
    const classical = new Some('value');
    const functional = some('value);
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
    would you do that?!!)

-   Using the library with TypeScript or Flow will *just work* and will provide
    you with considerable safety out of the box. Using it with JavaScript will
    work just fine, but there is no runtime checking, and you're responsible to
    make sure you don't `unwrap()` a `Maybe` without checking that it's safe to
    do so.

The overarching themes are flexibility and approachability.

The hope is that a team just picking up these ideas for the first time can use
them without adapting their whole style to a "traditional" functional
programming approach, but a team comfortable with functional idioms will find
themselves at home with the item-last pure functions. (For a brief discussion
of why you want the item last in a functional style, see [this blog post].)

[this blog post]: http://www.chriskrycho.com/2017/collection-last-auto-curried-functions.html

(As a closely related note: this library does not currently supply curried
variants of the functions. There are a *lot* of good options out there for
that; both [lodash] and [Ramda] have tools for currying existing function
definitions. It also profoundly complicates writing the type signatures for
these functions, since neither TypeScript nor Flow can easily represent auto-
curried functions – unsurprisingly, given they're uncommon in JavaScript. Using
Ramda or lodash to get curried versions of the functions may be a huge win for
you in your codebase, though!)

[Ramda]: http://ramdajs.com
[lodash]: https://lodash.com

### What's with the name?

- [ ] TODO: Tolkien/Lewis, also Folktale/FantasyLand/Sanctuary. Nice resonance

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
    - [ ] add aliases for the standard names, e.g. `bind`, `chain`, etc.
    - [ ] finish documentation

- [ ] `Result`
    - [ ] implement
    - [ ] document

If you think another type should be in this list, please [open an issue]!

[open an issue]: https://github.com/chriskrycho/true-myth/issues

## Why not...

There are other great functional programming libraries out there... so why not
just use one of them?

### Folktale?

Folktale has an API a lot like this one, as you'll see when perusing the docs.
However, there are two main reasons you might prefer <this library> to Folktale:

1.  This is TypeScript-first and Flow-first, which means that it assumes you are
    using one of those tools if you're aiming for rigorous type safety. Folktale
    is a JavaScript-first library, with runtime checking built in for its types;
    TypeScript support is in-progress but will be quite secondary until a
    TypeScript rewrite of the whole Folktale library lands... eventually.
   
    There's value in both of these approaches, so this library aims to take
    advantage of the compilers and play in a no-runtime-cost space instead.

2.  This library aims to keep functional programming jargon to a minimum and to
    use TypeScript/Flow type notation throughout. Folktale is aimed squarely at
    people who are already pretty comfortable with the world of strongly-typed
    functional programming languagues. This is particularly evident in the way
    its type signatures are written out (using the same basic notation you might
    see in e.g. Haskell), but it's also there in its heavy use of functional
    programming terminology throughout its docs.

    Those type signatures are quite nice, and functional programming jargon is
    very useful. However, they're also another hump to get over. Again: a
    tradeoff. By opting for type notation that TS or Flow developers are already
    familiar with, and by focusing on what various functions *do* rather than
    the standard FP names for them, this library aims at people just coming up
    to speed on these ideas.

There were also a few nitpicky things about Folktale's API that weren't to

### Sanctuary?

- [ ] TODO: kind of the same as Folktale, but add specific details