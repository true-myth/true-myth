<h1 align="center"><a href='https://github.com/true-myth/true-myth'>True Myth</a></h1>

<p align="center">True Myth provides safe, idiomatic null, error, and async code handling in TypeScript, with <code>Maybe</code>, <code>Result</code>, and <code>Task</code> types that are <em>really nice</em>.</p>

<p align="center">
  <a href='https://github.com/true-myth/true-myth/blob/main/.github/workflows/CI.yml'><img src='https://github.com/true-myth/true-myth/actions/workflows/CI.yml/badge.svg?branch=main' title='CI'></a>
  <a href='https://github.com/true-myth/true-myth/blob/master/package.json#L78-L85'><img src='https://img.shields.io/badge/Vitest-100%25-0a7c00.svg' alt='Test coverage: 100%'></a>
  <a href='https://www.npmjs.com/package/true-myth'><img src='https://img.shields.io/npm/v/true-myth.svg' alt='npm'></a>
  <a href='https://github.com/true-myth/true-myth/blob/main/.github/workflows/CI.yml#L25'><img src='https://img.shields.io/badge/Node-18%20LTS%20%7C%2020%20LTS%20%7C%2022-darkgreen' alt='supported Node versions'></a>
  <a href='https://github.com/true-myth/true-myth/blob/main/.github/workflows/CI.yml#L59'><img src='https://img.shields.io/badge/TypeScript-5.3%20%3C=%205.9%20%7C%20next-3178c6' alt='supported TypeScript versions'></a>
  <a href='https://github.com/true-myth/true-myth/actions/workflows/Nightly.yml'><img src='https://github.com/true-myth/true-myth/workflows/Nightly%20TypeScript%20Run/badge.svg' alt='Nightly TypeScript Run'></a>
  <img src='https://img.shields.io/badge/stability-active-663399' alt='Stability: Active'>
  <a href='https://github.com/true-myth/true-myth/blob/main/LICENSE'><img src='https://img.shields.io/github/license/true-myth/true-myth.svg'></a>
  <a href='https://js.org'><img src='https://img.shields.io/badge/dns-js.org-ffb400.svg' alt='DNS by JS.org'></a>
  <a href='http://true-myth.js.org'><img src='https://img.shields.io/badge/docs-Typedoc-009fb5.svg' alt='docs built with Typedoc'></a>
</p>

<p align="center">
  <a href='https://github.com/true-myth/true-myth'>README</a> • <a href='https://true-myth.js.org'>API docs</a> • <a href='https://github.com/true-myth/true-myth/tree/main/src'>Source</a> • <a href='http://www.chriskrycho.com/2017/announcing-true-myth-10.html'>Intro blog post</a>
</p>

## Overview

True Myth provides standard, type-safe wrappers and helper functions to help you with three _extremely_ common cases in programming:

- not having a value
- having a _result_ where you need to deal with either success or failure
- having an asynchronous operation which may fail

You could implement all of these yourself – it's not hard! – but it's much easier to just have one extremely well-tested library you can use everywhere to solve this problem once and for all.

See [the docs](https://true-myth.js.org) for setup, guides, and API docs!

### Contents

- [Requirements](#requirements)
- [Compatibility](#compatibility)
- [Basic bundle size info](#basic-bundle-size-info)

## Requirements

- Node 20+
- TS 5.3+
- `tsconfig.json`:
  - `moduleResolution`: use `"Node16"` or later
  - `strict: true`
- `package.json`
  - `type: "module"` (or else use `import()` to import True Myth into a commonJS build)

For details on using a pure ES modules package in TypeScript, see [the TypeScript handbook's guide](https://www.typescriptlang.org/docs/handbook/esm-node.html).


## Compatibility

This project follows the current draft of [the Semantic Versioning for TypeScript Types][semver] specification.

- **Currently supported TypeScript versions:** 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, and 5.9
- **Compiler support policy:** [simple majors][sm]
- **Public API:** all published, documented types not in a `-private` module and not marked as `@internal` or `@private` are public

[semver]: https://www.semver-ts.org
[sm]: https://www.semver-ts.org/formal-spec/5-compiler-considerations.html#simple-majors

## Basic bundle size info

Size of the ESM build without tree-shaking (yes, these are in *bytes*: this is a pretty small library!):

|       file         | size (B) | terser[^terser] (B) | terser and brotli[^brotli] (B) |
| ------------------ | -------- | ------------------- | ------------------------------ |
| -private/utils.js  |      888 |                 321 |                            166 |
| index.js           |      644 |                 352 |                            122 |
| maybe.js           |    18872 |                3637 |                            908 |
| result.js          |    15274 |                3927 |                            972 |
| standard-schema.js |     5975 |                 762 |                            317 |
| task/delay.js      |     3901 |                 649 |                            259 |
| task.js            |    54755 |                7448 |                           2025 |
| test-support.js    |      473 |                 142 |                             89 |
| toolbelt.js        |     3739 |                 890 |                            277 |
| unit.js            |      656 |                  58 |                             57 |
| **total[^total]**  |   105177 |               18186 |                           5192 |


Notes:

- The unmodified size *includes comments*.
- Thus, running through Terser gets us a much more realistic size: about 18.1KB to parse.
- The total size across the wire of the whole library will be ~5.2KB.
- This is all tree-shakeable to a significant degree: you should only have to “pay for” the types and functions you actually use, directly or indirectly. If your production bundle does not import or use anything from `true-myth/test-support`, you will not pay for it, for example. However, some parts of the library do depend directly on other parts: for example, `toolbelt` uses exports from `result` and `maybe`, and `Task` makes extensive use of `Result` under the hood.

    In detail, here are the dependencies of each module:

    | Module               | Depends on                                                   |
    | -------------------- | ------------------------------------------------------------ |
    | `index.js`           | All, but as tree-shakeable as possible                       |
    | `maybe.js`           | `unit.js`, `-private/utils.js`                               |
    | `result.js`          | `unit.js`, `-private/utils.js`                               |
    | `standard-schema.js` | `task.js`, `result.js`                                       |
    | `task.js`            | `result.js`, `unit.js`, `task/delay.js`, `-private/utils.js` |
    | `task/delay.js`      | None                                                         |
    | `test-support.js`    | `maybe.js`, `result.js`                                      |
    | `toolbelt.js`        | `maybe.js`, `result.js`, `-private/utils.js`                 |

[^terser]: Using [terser](https://github.com/terser/terser) 5.37.0 with `--compress --mangle --mangle-props`.

[^brotli]: Generated by running `gzip -kq11` on the result of the `terser` invocation.

[^total]: This is just the sum of the previous lines. Real-world bundle size is a function of what you actually use, how your bundler handles tree-shaking, and how the results of bundling compresses. Notice that sufficiently small files can end up _larger_ after compression; this stops being an issue once part of a bundle.


### Inspiration

The design of True Myth draws heavily on prior art; essentially nothing of this is original – _perhaps_ excepting the choice to make `Maybe.of` handle `null` and `undefined` in constructing the types. In particular, however, True Myth draws particular inspiration from:

- Rust's [`Option`][rs-option] and [`Result`][rs-result] types and their associated methods
- Folktale's [`Maybe`][ft-maybe] and [`Result`][ft-result] implementations
- Elm's [`Maybe`][elm-maybe] and [`Result`][elm-result] types and their
  associated functions

[rs-option]: https://doc.rust-lang.org/stable/std/option/
[rs-result]: https://doc.rust-lang.org/stable/std/result/
[ft-maybe]: http://folktale.origamitower.com/api/v2.0.0/en/folktale.maybe.html
[ft-result]: http://folktale.origamitower.com/api/v2.0.0/en/folktale.result.html
[elm-maybe]: http://package.elm-lang.org/packages/elm-lang/core/5.1.1/Maybe
[elm-result]: http://package.elm-lang.org/packages/elm-lang/core/5.1.1/Result
