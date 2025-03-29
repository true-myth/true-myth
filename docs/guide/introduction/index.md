# Introduction

If you just want to get started using the library, you can jump right to [Getting Started](./getting-started).

## What is True Myth?

True Myth is a library designed to provide *really* safe types for TypeScript, for some of the most common challenges faced by JavaScript and TypeScript developers:

**Having “nothing” in the form of `null` and `undefined`:**
: TypeScript’s `strictNullChecking` option and the `?.`, `??`, and similar operators have made it easier to work with nothing-ness in JavaScript over the past few years. However, there are still [many cases][special-null-syntax] where having a dedicated type with methods and functions available can make it easier to make your app more robust.

    True Myth’s `Maybe` type provides a lightweight wrapper type for nullable or optional values, representing *something* with a `Just` type and *nothing* with a `Nothing` type. It will feel familiar to you if you you have used the `Option` type in Rust, the `Optional` type in Swift, the `Maybe` type in Haskell, or similar types in other languages.

[special-null-syntax]: https://v5.chriskrycho.com/journal/special-null-syntax-vs.-types-and-functions/

**Dealing with errors:**
: JavaScript’s exception-based error system makes it hard to get type safety around the *unhappy* path. But the unhappy path is important for our users!

    True Myth’s `Result` is a lightweight wrapper that represents success and failure with `Ok` and `Err` types respectively. It will feel familiar to you if you you have used the `Result` type in Rust or Swift, or similar types in other languages.

**Working with async code:**
: JavaScript’s `Promise` API is limited, and as with exceptions, it is difficult to make sure you handle errors in a type safe way.

    True Myth’s `Task` API builds on top of the `Result` type to provide a safe version of `Promise`, where you can guarantee that success and error both get handled.

Each of these types also has an extensive toolkit for solving common problems!

We reach for libraries precisely so we can solve real business problems while letting lower-level concerns live in the "solved problems" category. True Myth, borrowing ideas from many other languages and libraries, aims to put _code written to defend against `null`/`undefined` problems_ and _error handling for sync and async code_ in that "solved problems" category.

`Maybe`, `Result`, and `Task` solve this problem once, and in a principled way, instead of in an _ad-hoc_ way throughout your codebase, by putting the value into a _container_ which is guaranteed to be safe to act upon, regardless of whether there's something inside it or not.

These containers let us write functions with _actually safe_ assumptions about parameter values by extracting the question, "Does this variable contain a valid value?" to API boundaries, rather than needing to ask that question at the head of every. single. function.

## Using these docs

[Getting started](./getting-started) has installation and configuration instructions. The [Tutorial](./tutorial/) introduces the basic concepts of the library and walks through some initial examples of how to use it to replace common JavaScript patterns. If you already have a good idea what types like `Maybe`, `Result`, and `Task` are good for and just want a quick overview of the library, you might start with [Tour](./tour) instead.

The [Understanding](../understanding/) section should help you get a deeper handle on the core types and some advanced concepts, while the [API Docs](/api/) provide a detailed API reference.

Finally, the [Background](../background/) materials dig into history, provide comparisons with other libraries, and discuss our design philosophy.
