# True Myth

This is a library for safe functional programming in JavaScript, with
first-class support for TypeScript and Flow.

## What is this for?

- [ ] TODO: motivation

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