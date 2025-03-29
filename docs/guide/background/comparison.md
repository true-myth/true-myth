# Why not...

There are other great functional programming libraries out there... so why not just use one of them?

Note that much of the content between these sections is the same; it's presented as is so you can simply read the section appropriate to the library you're comparing it with.

## neverthrow?

[neverthrow][neverthrow] is a modern, type-safe TypeScript library which has a lot in common with True Myth. We like it—seriously! If for some reason True Myth goes away someday, neverthrow would be our recommendation for what to switch to. Like True Myth, neverthrow is a TypeScript-first library, and it provides safe `Result` and `ResultAsync` types. Notably, `neverthrow` does *not* include a `Maybe` type. There are a number of small but meaningful API differences, for which see the True Myth and neverthrow documentation respectively.

[neverthrow]: https://github.com/supermacro/neverthrow

There may also be some performance differences, due to design differences between the libraries, but we suspect these are small enough in practice that you are unlikely to notice except in particularly hot paths; measure if it matters!

## Folktale?

[Folktale][folktale] has an API a lot like this one, as you'll see when perusing the docs. However, there are two main reasons you might prefer True Myth to Folktale:

[folktale]: http://folktale.origamitower.com

1.  True Myth is TypeScript-first, which means that it assumes you are using TypeScript if you're aiming for rigorous type safety.

    By contrast, Folktale is a JavaScript-first library, with runtime checking built in for its types. Folktale's TypeScript support is in-progress, but will remain secondary until a TypeScript rewrite of the whole Folktale library lands... eventually.

    There's value in both of these approaches, so True Myth aims to take advantage of the compilers and play in a no-runtime-cost space.

    If you want a JS-focused (rather than TS-focused) library which will help you be safer without a compiler, you should definitely pick Folktale over True Myth. If you've already using TS, True Myth is a bit nicer of an experience.

2.  True Myth aims to keep functional programming jargon to a minimum and to use TypeScript type notation throughout its docs as well as in its implementation.

    Folktale is aimed squarely at people who are already pretty comfortable with the world of strongly-typed functional programming languages. This is particularly evident in the way its type signatures are written out (using the same basic notation you might see in e.g. Haskell), but it's also there in its heavy use of functional programming terminology throughout its docs.

    Haskell-style types are quite nice, and functional programming jargon is very useful. However, they're also another hump to get over. Again: a tradeoff.

    By opting for type notation that TS developers are already familiar with, and by focusing on what various functions _do_ rather than the usual FP names for them, True Myth aims at people just coming up to speed on these ideas.

    The big win for Folktale over True Myth is [Fantasy Land][fl] compatibility.

3.  True Myth's API aims to be more idiomatic as JavaScript/TypeScript, with a couple differences in particular worth calling out:

    - **function naming convention:** True Myth uses PascalCase for types and camelCase for functions – so, `new Just(5)` and `just(5)`, whereas FolkTale uses the capitals as function names for type constructors, i.e. `Just(5)`, and does not support `new`.

    - **ease of construction from nullable types:** True Myth allows you to construct `Maybe` types from nullable types with `Maybe.of`, because JS is _full_ of `null` and `undefined`, and allowing `Maybe.of` to handle them makes it easier to be sure you're always doing the right thing.

      Folktale's `Maybe.of` only allows the use of non-nullable types, and requires you to use `Maybe.fromNullable` instead. This isn't unreasonable, but it dramatically decreases the convenience of integration with existing JS codebases or interfacing with untyped JS libraries.

4.  Folktale also aims to provide a larger suite of types and functions to use – though much smaller than [lodash] – including a number of [general functions][folktale-core], [concurrency][folktale-concurrency], [general union types][folktale-adt], and more. True Myth intentionally punts on those concerns, assuming that most consumers are already using a library like Lodash or Ramda, and are comfortable with or prefer using e.g. `Promise`s for concurrency, and aiming to be easy to integrate with those instead.

[fl]: https://github.com/fantasyland/fantasy-land
[folktale-core]: http://folktale.origamitower.com/api/v2.0.0/en/folktale.core.html
[folktale-concurrency]: http://folktale.origamitower.com/api/v2.0.0/en/folktale.concurrency.html
[folktale-adt]: http://folktale.origamitower.com/api/v2.0.0/en/folktale.adt.html

## Sanctuary?

[Sanctuary] has many of the same goals as True Myth, but is much more focused on the expectations and patterns you'd see in Haskell or PureScript or similar languages. Its API and True Myth's are much _less_ similar than Folktale and True Myth's are, as a result – the underlying details are often similar, but the names are nearly all different. A few of the major contrasts:

[sanctuary]: https://sanctuary.js.org

1.  True Myth is TypeScript-first, which means that it assumes you are using TypeScript if you're aiming for rigorous type safety.

    By contrast, Sanctuary is a JavaScript-first library, with runtime checking built in for its types. Sanctuary's TypeScript support is [in progress][s-ts], but will for the foreseeable future remain add-on rather than first-class. (Sanctuary _does_ allow you to create a version of the module without the runtime checking, but it requires you to do this yourself.)

    There's value in both of these approaches, so True Myth aims to take advantage of the compilers and play in a no-runtime-cost space.

    If you want a JS-focused (rather than TS-focused) library which will help you be safer without a compiler, you should definitely pick Sanctuary over True Myth. If you've already using TS, True Myth is a bit nicer of an experience.

2.  True Myth aims to keep functional programming jargon to a minimum and to use TypeScript type notation throughout its docs as well as in its implementation.

    Sanctuary is aimed squarely at people who are already extremely comfortable the world of strongly-typed, pure functional programming languages. This is particularly evident in the way its type signatures are written out (using the same notation you would see in Haskell or PureScript), but it's also present in Sanctuary's heavy use of functional programming terminology throughout its docs.

    Haskell- and Purescript-style types are quite nice, and the functional programming jargon is very useful. However, they're also another hump to get over. Again: a tradeoff.

    By opting for type notation that TS developers are already familiar with, and by focusing on what various functions _do_ rather than the usual FP names for them True Myth aims at people just coming up to speed on these ideas.

    The big win for Sanctuary over True Myth is [Fantasy Land][fl] compatibility, or familiarity if coming from a language like Haskell or PureScript.

3.  True Myth's API aims to be more idiomatic as JavaScript/TypeScript, with a one difference in particular worth calling out: the **function naming convention.** True Myth uses PascalCase for types and camelCase for functions – so, `new Just(5)` and `just(5)`, whereas Sanctuary uses the capitals as function names for type constructors, i.e. `S.Just(5)`, and does not support `new`.

4.  Sanctuary also aims to provide a much larger suite of functions, more like [Ramda], but with Haskell- or PureScript-inspired type safety and sophistication. True Myth intentionally punts on those concerns, assuming that most consumers are already using a library like Lodash or Ramda and aiming to be easy to integrate with those instead.

[s-ts]: https://github.com/sanctuary-js/sanctuary/pull/431
