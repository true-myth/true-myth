# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).













## 8.6.0 (2025-04-15)

The headlining feature here is making the `andThen` and `orElse` functions work more like people intuitively expect them to! See [#1003](https://github.com/true-myth/true-myth/pull/1003) for details. Additionally, this fixes a long-standing (but easy-to-miss) bug in the behavior of `maybe.get`.

This final release in the v8.x series includes all the *features* which will be present on v9.0. To prepare for the v9.0 release, all you need to do is make sure you are on a sufficiently recent version of TypeScript and switch from any deprecated functions to their supported replacements.

### Changes

#### (:rocket: Enhancement)
* [#1003](https://github.com/true-myth/true-myth/pull/1003) Feature: generalize inference for `andThen` and `orElse` [backport] ([@chriskrycho](https://github.com/chriskrycho))

#### (:bug: Bug Fix)
* [#1011](https://github.com/true-myth/true-myth/pull/1011) bug: fix `maybe.get` types [backport] ([@chriskrycho](https://github.com/chriskrycho))

### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))


## 8.5.3 (2025-04-09)

### Changes

#### :bug: Bug Fix
* [#1006](https://github.com/true-myth/true-myth/pull/1006) Task: `withRetries` is callable with any `Strategy` [backport] ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## 8.5.2 (2025-04-07)

### Changes

This *mostly* comes down to fixing a bug introduced in v8.5.1 in the definition of `Strategy`, but it brings along some documentation benefits as well.

#### (:bug: Bug Fix)
* [#1001](https://github.com/true-myth/true-myth/pull/1001) Task: define `Strategy` as `Iterator<number>` [backport] ([@chriskrycho](https://github.com/chriskrycho))

#### (:memo: Documentation)
* [#1000](https://github.com/true-myth/true-myth/pull/1000) docs: fix incorrect references to safelyTryOr ([@chriskrycho](https://github.com/chriskrycho))
* [#999](https://github.com/true-myth/true-myth/pull/999) docs: fix types in one Result example in the tour [backport] ([@chriskrycho](https://github.com/chriskrycho))
* [#998](https://github.com/true-myth/true-myth/pull/998) docs: add in a missing closing quote [backport] ([@chriskrycho](https://github.com/chriskrycho))
* [#997](https://github.com/true-myth/true-myth/pull/997) docs: fix outdated reference to `Result.tryOrElse` [backport] ([@chriskrycho](https://github.com/chriskrycho))
* [#996](https://github.com/true-myth/true-myth/pull/996) docs: correct references to `map` and `mapRejected` in `task` [backport] ([@chriskrycho](https://github.com/chriskrycho))
* [#995](https://github.com/true-myth/true-myth/pull/995) docs: fix API doc references to `resolved` and `rejected` [backport] ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## 8.5.1 (2025-04-02)

The first of what will likely be several 8.5.x bug fix releases to address issues found in the past few months!

#### (:bug: Bug Fix)
* [#987](https://github.com/true-myth/true-myth/pull/987) [backport] Fix type definition of `Strategy` ([@chriskrycho](https://github.com/chriskrycho))
* [#959](https://github.com/true-myth/true-myth/pull/959) Bug: `all` and `any` should preserve order of types ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## 8.5.0 (2025-01-25)

Adds a powerful `Task.withRetries` utility for retrying tasks, along with a new module, `true-myth/task/delay`, which provides a bunch of useful strategies for retries. See the docs for more details, and thanks to @alfierivera for [suggesting it][discussion]!

[discussion]: https://github.com/true-myth/true-myth/discussions/931

#### (:rocket: Enhancement)
* [#939](https://github.com/true-myth/true-myth/pull/939) [backport] Task: add a new `withRetries` function ([@chriskrycho](https://github.com/chriskrycho))

#### (:house: Internal)
* [#926](https://github.com/true-myth/true-myth/pull/926) internal: Introduce a separate CI job for any 8.x work ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))


## 8.4.0 (2025-01-11)

Highlight: adds auto-curried, module-scope versions of all the `Task` instance methods like `map` and `andThen` and more. Hot on the heels of 8.3.0, with what we *think* is probably the last set of features for this release!

#### (:rocket: Enhancement)
* [#918](https://github.com/true-myth/true-myth/pull/918) Task: module-scoped versions of instance methods ([@chriskrycho](https://github.com/chriskrycho))

#### (:memo: Documentation)
* [#920](https://github.com/true-myth/true-myth/pull/920) docs: clarify tips aboout auto-curried forms ([@chriskrycho](https://github.com/chriskrycho))
* [#919](https://github.com/true-myth/true-myth/pull/919) docs: add many type parameter docs ([@chriskrycho](https://github.com/chriskrycho))

#### (:house: Internal)
* [#917](https://github.com/true-myth/true-myth/pull/917) internal: clean up a `console.log` ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))


## 8.3.0 (2025-01-10)

Highlights:

- All the missing `Task` combinators that weren’t part of v8.3.0: `all`, `allSettled`, `any`, `race`, as well as fancy new `timer` and `timeout` functions.
- New `safe` functions in the `Result` and `Task` modules, for transforming a throwing function into one you can call safely and get a `Result` or `Task` instead.
- Module-scope versions of all the major `Task` constructors.
- A new name for the `wrapReturn` function in the `Maybe` module, `safe`, to match the same function in the `Result` and `Task` modules

This release also introduces some deprecations to tackle some mistakes we (read: @chriskrycho) made in the initial release of `Task` in [v8.2.0](https://github.com/true-myth/true-myth/releases/tag/v8.2.0).

> [!NOTE]
> We will be releasing v9.0.0 very soon, removing those deprecations and updating our TypeScript support matrix. However, we expect 8.3 to be stable enough that you could stay on it without issues—potentially for *years*. If there are any showstopper bugs, we will of course backport a fix for them, but there shouldn’t be any!

#### (:rocket: Enhancement)
* [#916](https://github.com/true-myth/true-myth/pull/916) Task: add module-scoped `resolve`, `reject`, and `withResolvers` ([@chriskrycho](https://github.com/chriskrycho))
* [#909](https://github.com/true-myth/true-myth/pull/909) Maybe: rename `wrapReturn` to `safe` ([@chriskrycho](https://github.com/chriskrycho))
* [#902](https://github.com/true-myth/true-myth/pull/902) Task: add `all`, `allSettled`, `any`, `race`, `timer`, and `timeout` ([@chriskrycho](https://github.com/chriskrycho))
* [#901](https://github.com/true-myth/true-myth/pull/901) Task: better inference for chaining combinators ([@chriskrycho](https://github.com/chriskrycho))
* [#898](https://github.com/true-myth/true-myth/pull/898) Maybe: support readonly arrays in `transposeArray` ([@chriskrycho](https://github.com/chriskrycho))

#### (:memo: Documentation)
* [#915](https://github.com/true-myth/true-myth/pull/915) docs: expand on `Task` in README ([@chriskrycho](https://github.com/chriskrycho))
* [#914](https://github.com/true-myth/true-myth/pull/914) Task: document `safelyTryOr` and `safelyTryOrElse` ([@chriskrycho](https://github.com/chriskrycho))
* [#894](https://github.com/true-myth/true-myth/pull/894) doc: fix task-basics link ([@priegger](https://github.com/priegger))

#### (:house: Internal)
* [#910](https://github.com/true-myth/true-myth/pull/910) internal: add deprecation type to lerna-changelog ([@chriskrycho](https://github.com/chriskrycho))
* [#903](https://github.com/true-myth/true-myth/pull/903) internal: Pin to the oldest TS version we support for dev ([@chriskrycho](https://github.com/chriskrycho))
* [#900](https://github.com/true-myth/true-myth/pull/900) Task(tests): group and name tests more clearly ([@chriskrycho](https://github.com/chriskrycho))
* [#899](https://github.com/true-myth/true-myth/pull/899) internal: tweak Zed settings ([@chriskrycho](https://github.com/chriskrycho))

#### (:wastebasket: Deprecation)
* [#909](https://github.com/true-myth/true-myth/pull/909) Maybe: rename `wrapReturn` to `safe` ([@chriskrycho](https://github.com/chriskrycho))
* [#908](https://github.com/true-myth/true-myth/pull/908) Task: deprecate `Task.try`, `Task.tryOr`, and `Task.tryOrElse` ([@chriskrycho](https://github.com/chriskrycho))
* [#913](https://github.com/true-myth/true-myth/pull/913) Task: deprecate static `fromResult`, `fromPromise`, and `fromUnsafePromise`

#### Committers: 2
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))
- Philipp Riegger ([@priegger](https://github.com/priegger))


## 8.2.0 (2025-01-03)

Finally—*finally!*—True Myth get a `Task` type! A `Task<T, E>` is like a `Promise<Result<T, E>>`. In fact, under the hood, it is *exactly* a `Promise<Result<T, E>>`, but in general you do not need to think about that layering. Instead, you get a nice type-safe API for fallible async operations. (It’s what `Promise` should have been!)

#### :rocket: Enhancement
* [#885](https://github.com/true-myth/true-myth/pull/885) feature: implement a new `Task` type ([@chriskrycho](https://github.com/chriskrycho))

#### :memo: Documentation
* [#890](https://github.com/true-myth/true-myth/pull/890) docs: improve rendering of the fancy variant shenanigans with `@class` ([@chriskrycho](https://github.com/chriskrycho))

#### :house: Internal
* [#891](https://github.com/true-myth/true-myth/pull/891) Task: fix name of one of the tests ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## 8.2.0-beta.1 (2024-12-31)

Beta release with `Task`, so folks can easily test it out!

#### :bug: Bug Fix
* [#887](https://github.com/true-myth/true-myth/pull/887) Result: correct the implementation of `static err` constructor ([@chriskrycho](https://github.com/chriskrycho))

#### :memo: Documentation
* [#886](https://github.com/true-myth/true-myth/pull/886) docs/internals: `Task`-inspired improvements ([@chriskrycho](https://github.com/chriskrycho))
* [#881](https://github.com/true-myth/true-myth/pull/881) docs: remove long-defunct reference to `new` from `Result.(ok|err)` ([@chriskrycho](https://github.com/chriskrycho))

#### :house: Internal
* [#886](https://github.com/true-myth/true-myth/pull/886) docs/internals: `Task`-inspired improvements ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## 8.1.0 (2024-12-04)

The big feature: a new module just for test support, with two functions in it: `unwrap` and `unwrapErr`. You can now write this:

```ts
import { expect, test } from 'vitest'; // or your testing library of choice

import Maybe from 'true-myth/maybe';
import Result from 'true-myth/result';
import { unwrap, unwrapErr } from 'true-myth/test-helpers';

import { producesMaybe, producesResult } from 'my-library';

test('using this new helper', () => {
  expect(unwrap(producesMaybe())).toBe(true);
  expect(unwrap(producesResult('valid'))).toBe('cool');
  expect(unwrapErr(producesResult('invalid')).toBe('oh teh noes');
});
```

See [the docs][docs] for more!

[docs]: https://true-myth.js.org/modules/test-support.html

#### :rocket: Enhancement
* [#870](https://github.com/true-myth/true-myth/pull/870) feature: add `unwrap` and `unwrapErr` test helpers ([@chriskrycho](https://github.com/chriskrycho))
* [#868](https://github.com/true-myth/true-myth/pull/868) Explicitly support TS 5.6 and 5.7 in CI and docs ([@chriskrycho](https://github.com/chriskrycho))

#### :memo: Documentation
* [#872](https://github.com/true-myth/true-myth/pull/872) docs: fix rendering issues ([@chriskrycho](https://github.com/chriskrycho))

#### :house: Internal
* [#837](https://github.com/true-myth/true-myth/pull/837) infra: improve name of CI job for tests ([@chriskrycho](https://github.com/chriskrycho))
* [#835](https://github.com/true-myth/true-myth/pull/835) Fix vitest config for coverage ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 2
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))
- Tom Mrazauskas ([@mrazauskas](https://github.com/mrazauskas))

## 8.0.1 (2024-08-22)

#### :bug: Bug Fix
* [#811](https://github.com/true-myth/true-myth/pull/811) fix: do not set sourceRoot in tsconfigs ([@chriskrycho](https://github.com/chriskrycho)) – this should make source maps resolve correctly!

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## 8.0.0 (2024-08-11)

This is a pretty small “breaking” release: it makes a change so True Myth is *more* type safe than it was before, specifically when constructing known-`Ok` or known-`Err` types with `Result.ok` and `Result.err`. In earlier versions, if you wrote `Result.ok(123)`, the type would be `Result<number, unknown>`. New contributor [@auvred](https://github.com/auvred) pointed out that in that case, we know there is *never* an error type, though, so we can use [the `never` type][never]. This is breaking in that you may have to explicitly annotate some types where you did not before, because of [the assignability rules][assignability] for `unknown` and `never` (cf. [this playground][play]).

Net, very little of your code should have to change, but where it does, it will be safer than it was before! Thanks to [@auvred](https://github.com/auvred) for the improvement!

[never]: https://www.typescriptlang.org/docs/handbook/2/functions.html#never
[assignability]: https://www.typescriptlang.org/docs/handbook/type-compatibility.html#any-unknown-object-void-undefined-null-and-never-assignability
[play]: https://www.typescriptlang.org/play/?#code/CYUwxgNghgTiAEEQBd5QHIgG4hgLngDttcBuAKFElgSVSkIFVCBrQgewHdCCBXVjtwrk6aAoV4BbAEa54AXjSYcMCqOnipsmArRMBXQsNEAPcSR2KAjACYAzGpTwAnnwPddth+SA

#### :boom: Breaking Change
* [#789](https://github.com/true-myth/true-myth/pull/789) fix: set error type in `Result.ok` and ok type in `Result.err` to `never` by default ([@auvred](https://github.com/auvred))

#### :rocket: Enhancement
* [#789](https://github.com/true-myth/true-myth/pull/789) fix: set error type in `Result.ok` and ok type in `Result.err` to `never` by default ([@auvred](https://github.com/auvred))

#### :memo: Documentation
* [#785](https://github.com/true-myth/true-myth/pull/785) fix(docs): fix typo in README ([@nullndr](https://github.com/nullndr))

#### Committers: 2
- Andrea ([@nullndr](https://github.com/nullndr))
- [@auvred](https://github.com/auvred)


## 7.4.0 (2024-07-10)

#### :rocket: Enhancement
* [#782](https://github.com/true-myth/true-myth/pull/782) Add explicit support for Node 22 and TypeScript 5.5 ([@chriskrycho](https://github.com/chriskrycho))
* [#776](https://github.com/true-myth/true-myth/pull/776) Allow readonly Arrays in first() and last() ([@screendriver](https://github.com/screendriver))

#### :memo: Documentation
* [#765](https://github.com/true-myth/true-myth/pull/765) Docs: we do not special-case `toString()` ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 2
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))
- Christian Rackerseder ([@screendriver](https://github.com/screendriver))

## 7.3.0 (2024-05-26)

#### :rocket: Enhancement
* [#756](https://github.com/true-myth/true-myth/pull/756) Forbid `null` and `undefined` as arguments to `Maybe.just` ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## 7.2.1 (2024-05-26)

#### :bug: Bug Fix
* [#755](https://github.com/true-myth/true-myth/pull/755) Correctly handle `null` and `undefined` in function return types ([@chriskrycho](https://github.com/chriskrycho))

#### :house: Internal
* [#754](https://github.com/true-myth/true-myth/pull/754) infra: update to actions/checkout@v4 for GHA ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## 7.2.0 (2024-05-16)

#### :rocket: Enhancement
* [#749](https://github.com/true-myth/true-myth/pull/749) Allow readonly Arrays in `find()` ([@screendriver](https://github.com/screendriver))
* [#720](https://github.com/true-myth/true-myth/pull/720) Add (tested) support for Node 20 ([@chriskrycho](https://github.com/chriskrycho))
* [#719](https://github.com/true-myth/true-myth/pull/719) Add support for TypeScript 5.4 ([@chriskrycho](https://github.com/chriskrycho))
* [#650](https://github.com/true-myth/true-myth/pull/650) Add support for TypeScript 5.3 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### :house: Internal
* [#751](https://github.com/true-myth/true-myth/pull/751) Supply an `AnyArray` type in maybe.ts ([@chriskrycho](https://github.com/chriskrycho))
* [#750](https://github.com/true-myth/true-myth/pull/750) infra: update to latest pnpm ([@chriskrycho](https://github.com/chriskrycho))
* [#631](https://github.com/true-myth/true-myth/pull/631) Simplify CI test matrix ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 2
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))
- Christian Rackerseder ([@screendriver](https://github.com/screendriver))

## 7.1.0 (2023-09-05)

#### :rocket: Enhancement
* [#609](https://github.com/true-myth/true-myth/pull/609) Add support for TypeScript 5.2 ([@chriskrycho](https://github.com/chriskrycho))

#### :memo: Documentation
* [#572](https://github.com/true-myth/true-myth/pull/572) Fix docs for `transposeArray` ([@chriskrycho](https://github.com/chriskrycho))

#### :house: Internal
* [#601](https://github.com/true-myth/true-myth/pull/601) refactor: Remove duplicate tests in '/test/result.test.ts' ([@royiro10](https://github.com/royiro10))
* [#585](https://github.com/true-myth/true-myth/pull/585) Further work to fix pnpm usage in TS nightly ([@chriskrycho](https://github.com/chriskrycho))
* [#584](https://github.com/true-myth/true-myth/pull/584) More cleanup: pnpm references and prettierignore ([@chriskrycho](https://github.com/chriskrycho))
* [#583](https://github.com/true-myth/true-myth/pull/583) Fix CI for nightly TS run ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 2
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))
- [@royiro10](https://github.com/royiro10)

## 7.0.1 (2023-07-16)

#### :bug: Bug Fix
* [#570](https://github.com/true-myth/true-myth/pull/570) Fix CJS import location in package `exports` map ([@chriskrycho](https://github.com/chriskrycho))

#### :house: Internal
* [#569](https://github.com/true-myth/true-myth/pull/569) Fix docs publishing GH Action ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## 7.0.0 (2023-07-15)

#### :boom: Breaking Change
* [#562](https://github.com/true-myth/true-myth/pull/562) [Breaking] Require Node 18, adopt pnpm, use latest release-it ([@chriskrycho](https://github.com/chriskrycho))

#### :rocket: Enhancement
* [#567](https://github.com/true-myth/true-myth/pull/567) Publish True Myth as a dual-mode package (ESM + CJS) ([@chriskrycho](https://github.com/chriskrycho))
* [#561](https://github.com/true-myth/true-myth/pull/561) Add type-safe `Ok.cast()` and `Err.cast()` methods ([@chriskrycho](https://github.com/chriskrycho))
* [#552](https://github.com/true-myth/true-myth/pull/552) Add support for TypeScript 5.0 and 5.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
* [#469](https://github.com/true-myth/true-myth/pull/469) Add support for TypeScript 4.9 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### :memo: Documentation
* [#568](https://github.com/true-myth/true-myth/pull/568) Upgrade to latest TypeDoc ([@chriskrycho](https://github.com/chriskrycho))

#### :house: Internal
* [#566](https://github.com/true-myth/true-myth/pull/566) Use pnpm in CI ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 3
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))
- Josh Martinez ([@jm4rtinez](https://github.com/jm4rtinez))
- [@DaviDevMod](https://github.com/DaviDevMod)

## 6.2.0 (2022-09-08)

#### :rocket: Enhancement
* [#438](https://github.com/true-myth/true-myth/pull/438) Add explicit support for TS 4.8 ([@chriskrycho](https://github.com/chriskrycho))

#### :bug: Bug Fix
* [#437](https://github.com/true-myth/true-myth/pull/437) docs: include doc comments in published types ([@chriskrycho](https://github.com/chriskrycho))

#### :memo: Documentation
* [#437](https://github.com/true-myth/true-myth/pull/437) docs: include doc comments in published types ([@chriskrycho](https://github.com/chriskrycho))
* [#434](https://github.com/true-myth/true-myth/pull/434) Update readme with v6.x requirements ([@bmakuh](https://github.com/bmakuh))

#### :house: Internal
* [#436](https://github.com/true-myth/true-myth/pull/436) chore: remove defunct parts of package ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 2
- Ben Makuh ([@bmakuh](https://github.com/bmakuh))
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## 6.1.0 (2022-07-08)

#### :rocket: Enhancement

* Re-export `Toolbelt` from root for consumers not using TS 4.7’s `exports` support ([@chriskrycho](https://github.com/chriskrycho))

#### :house: Internal
* [#388](https://github.com/true-myth/true-myth/pull/388) Remove v5 CI configuration ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## 6.0.0 (2022-05-25)

There are two significant breaking changes in v6.0:

1. It now requires **TypeScript 4.7+ and Node 14+**. This allows us to use Node's `exports` syntax without hacks.
2. It removes items deprecated in the 4.x and 5.x cycles. This allows us to provide **better tree-shaking**. Previously, using either the `Result` or `Maybe` classes meant you also pulled in the other, since they had code to interoperate with each other. These now live only in the `toolbelt` module, along with the `Array` helpers.

To upgrade:

1. Update your project to at least Node 14 and TypeScript 4.7.

2. Switch from using any deprecated code to the supported replacements (as described in the docs for each deprecated function).

3. Set `compilerOptions.module` to `Node16` or `nodenext` in your `tsconfig.json`. **Note:** this is the most significant breaking change here: it requires that every other TS package you consume also be compatible with the new mode, and if you are using True Myth in a library, cascades that requirement to *your* consumers as well.

4. Update to True Myth v6. :tada:

#### :boom: Breaking Change
* [#357](https://github.com/true-myth/true-myth/pull/357) Update publication mechanics with "exports" ([@chriskrycho](https://github.com/chriskrycho))
* [#352](https://github.com/true-myth/true-myth/pull/352) Update minimum Node to v14, add v18 ([@chriskrycho](https://github.com/chriskrycho))
* [#252](https://github.com/true-myth/true-myth/pull/252) Enable tree-shaking by removing deprecated code ([@chriskrycho](https://github.com/chriskrycho))
* [#242](https://github.com/true-myth/true-myth/pull/242) Improve performance by switching to a 'methods-first' implementation ([@chriskrycho](https://github.com/chriskrycho))

#### :rocket: Enhancement
* [#360](https://github.com/true-myth/true-myth/pull/360) Decrease Unit implementation runtime size ([@chriskrycho](https://github.com/chriskrycho))
* [#356](https://github.com/true-myth/true-myth/pull/356) Improve `toString` handling (forward-port from v5) ([@chriskrycho](https://github.com/chriskrycho))
* [#351](https://github.com/true-myth/true-myth/pull/351) More forward ports ([@chriskrycho](https://github.com/chriskrycho))
* [#275](https://github.com/true-myth/true-myth/pull/275) One fewer assignment in Nothing construction ([@chriskrycho](https://github.com/chriskrycho))
* [#252](https://github.com/true-myth/true-myth/pull/252) Enable tree-shaking by removing deprecated code ([@chriskrycho](https://github.com/chriskrycho))
* [#251](https://github.com/true-myth/true-myth/pull/251) [Forward] Deprecate Maybe.head for 6.0, preferring Maybe.first ([@chriskrycho](https://github.com/chriskrycho))
* [#250](https://github.com/true-myth/true-myth/pull/250) [Forward] Deprecate non-Toolbelt versions of toolbelt utils ([@chriskrycho](https://github.com/chriskrycho))
* [#249](https://github.com/true-myth/true-myth/pull/249) [Forward] Introduce `true-myth/toolbelt` module for better tree shaking ([@chriskrycho](https://github.com/chriskrycho))
* [#242](https://github.com/true-myth/true-myth/pull/242) Improve performance by switching to a 'methods-first' implementation ([@chriskrycho](https://github.com/chriskrycho))

#### :bug: Bug Fix
* [#351](https://github.com/true-myth/true-myth/pull/351) More forward ports ([@chriskrycho](https://github.com/chriskrycho))
* [#276](https://github.com/true-myth/true-myth/pull/276) Finish forward-porting null/undefined reversion ([@chriskrycho](https://github.com/chriskrycho))
* [#274](https://github.com/true-myth/true-myth/pull/274) Forward port more fixes ([@chriskrycho](https://github.com/chriskrycho))
* 5.1.1 regression: type inference for Result.ok ([@krivachy](https://github.com/krivachy))

#### :memo: Documentation
* [#387](https://github.com/true-myth/true-myth/pull/387) Prep for v6 release ([@chriskrycho](https://github.com/chriskrycho))
* [#383](https://github.com/true-myth/true-myth/pull/383) Incorporate TS 4.7 *and* next in support matrix ([@chriskrycho](https://github.com/chriskrycho))
* [#355](https://github.com/true-myth/true-myth/pull/355) Update the CHANGELOG and `package.json` to actual current ([@chriskrycho](https://github.com/chriskrycho))
* [#350](https://github.com/true-myth/true-myth/pull/350) Improve doc comments on Maybe and Toolbelt ([@chriskrycho](https://github.com/chriskrycho))
* [#317](https://github.com/true-myth/true-myth/pull/317) Forward-port CI, docs updates ([@chriskrycho](https://github.com/chriskrycho))
* [#267](https://github.com/true-myth/true-myth/pull/267) [Forward] Fix out-of-date parts of README ([@chriskrycho](https://github.com/chriskrycho))

#### :house: Internal
* [#387](https://github.com/true-myth/true-myth/pull/387) Final updates ([@chriskrycho](https://github.com/chriskrycho))
* [#386](https://github.com/true-myth/true-myth/pull/386) Drop `preversion` npm script ([@chriskrycho](https://github.com/chriskrycho))
* [#384](https://github.com/true-myth/true-myth/pull/384) Simplify `exports` definitions for types ([@chriskrycho](https://github.com/chriskrycho))
* [#383](https://github.com/true-myth/true-myth/pull/383) Incorporate TS 4.7 *and* next in support matrix ([@chriskrycho](https://github.com/chriskrycho))
* [#377](https://github.com/true-myth/true-myth/pull/377) Add option to run Nightly TS run manually ([@chriskrycho](https://github.com/chriskrycho))
* [#376](https://github.com/true-myth/true-myth/pull/376) Use 'Node16' to support TS 4.7 ([@chriskrycho](https://github.com/chriskrycho))
* [#362](https://github.com/true-myth/true-myth/pull/362) Add Code of Conduct and Contributing guide ([@chriskrycho](https://github.com/chriskrycho))
* [#359](https://github.com/true-myth/true-myth/pull/359) Actually run yarn so TypeDoc is available ([@chriskrycho](https://github.com/chriskrycho))
* [#358](https://github.com/true-myth/true-myth/pull/358) Switch docs publishing to use gh-pages on release ([@chriskrycho](https://github.com/chriskrycho))
* [#353](https://github.com/true-myth/true-myth/pull/353) Use `Omit` rather than `Exclude` + `keyof` in Maybe ([@chriskrycho](https://github.com/chriskrycho))
* [#354](https://github.com/true-myth/true-myth/pull/354) Use `Omit` rather than `Exclude` + `keyof` in Maybe ([@chriskrycho](https://github.com/chriskrycho))
* [#264](https://github.com/true-myth/true-myth/pull/264) [Forward] no ESLint ([@chriskrycho](https://github.com/chriskrycho))
* [#242](https://github.com/true-myth/true-myth/pull/242) Improve performance by switching to a 'methods-first' implementation ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 2
- Akos Krivachy ([@krivachy](https://github.com/krivachy))
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## 5.4.0 (2022-05-25)

This is the final release for v5.x, and only exists to make sure there are fully overlapping supported TypeScript versions for True Myth v5 and v6. See the release notes for the upcoming v6.0 release for upgrade notes.

#### :rocket: Enhancement
* [#382](https://github.com/true-myth/true-myth/pull/382) v5.x: Add Node 18 and TS 4.7 ([@chriskrycho](https://github.com/chriskrycho))

#### :house: Internal
* [#385](https://github.com/true-myth/true-myth/pull/385) v5.x: Drop `preversion` npm script ([@chriskrycho](https://github.com/chriskrycho))
* [#361](https://github.com/true-myth/true-myth/pull/361) Add conduct and contributing (v5.x) ([@chriskrycho](https://github.com/chriskrycho))
* [#354](https://github.com/true-myth/true-myth/pull/354) Use `Omit` rather than `Exclude` + `keyof` in Maybe ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## 5.3.1 (2022-04-22)

#### :bug: Bug Fix
* [#336](https://github.com/true-myth/true-myth/pull/336) Require narrowing before exposing wrapped values ([@screendriver](https://github.com/screendriver))

#### Committers: 1
- Christian Rackerseder ([@screendriver](https://github.com/screendriver))

## 5.3.0 (2022-04-22)

#### :rocket: Enhancement
* [#349](https://github.com/true-myth/true-myth/pull/349) Add support for TypeScript 4.7 ([@chriskrycho](https://github.com/chriskrycho))
* [#334](https://github.com/true-myth/true-myth/pull/334) Export pure isErr() function ([@screendriver](https://github.com/screendriver))
* [#332](https://github.com/true-myth/true-myth/pull/332) Export pure isNothing() function ([@screendriver](https://github.com/screendriver))
* [#333](https://github.com/true-myth/true-myth/pull/333) Export pure isOk() function ([@screendriver](https://github.com/screendriver))
* [#331](https://github.com/true-myth/true-myth/pull/331) Export pure isJust() function ([@screendriver](https://github.com/screendriver))

#### :bug: Bug Fix
* [#335](https://github.com/true-myth/true-myth/pull/335) Add missing readonly variants modifiers ([@screendriver](https://github.com/screendriver))

#### Committers: 2
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))
- Christian Rackerseder ([@screendriver](https://github.com/screendriver))

## 5.2.0 (2022-03-07)

#### :rocket: Enhancement
* [#299](https://github.com/true-myth/true-myth/pull/299) feat(maybe/find): type narrowing via predicates ([@buschtoens](https://github.com/buschtoens))

#### Committers: 1
- Jan Buschtöns ([@buschtoens](https://github.com/buschtoens))

## 5.1.3 (2022-03-06)

#### :bug: Bug Fix
* [#312](https://github.com/true-myth/true-myth/pull/312) Fix ember build ([@ombr](https://github.com/ombr))

#### Committers: 1
- Luc Boissaye ([@ombr](https://github.com/ombr))

## 5.1.2 (2021-12-27)

#### :bug: Bug Fix
* [#272](https://github.com/true-myth/true-myth/pull/272) Fix v5 regression of checks on `.value` ([@chriskrycho](https://github.com/chriskrycho))
* [#273](https://github.com/true-myth/true-myth/pull/273) Revert handling of explicit `null` and `undefined` ([@chriskrycho](https://github.com/chriskrycho))

#### :memo: Documentation
* [#266](https://github.com/true-myth/true-myth/pull/266) Fix out-of-date parts of README ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## 5.1.1 (2021-12-16)

#### :rocket: Enhancement
* [#263](https://github.com/true-myth/true-myth/pull/263) Fix regression of `Result.ok()` ([@chriskrycho](https://github.com/chriskrycho))

#### :bug: Bug Fix
* [#263](https://github.com/true-myth/true-myth/pull/263) Fix regression of `Result.ok()` ([@chriskrycho](https://github.com/chriskrycho))

#### :house: Internal
* [#262](https://github.com/true-myth/true-myth/pull/262) Remove ESLint ([@chriskrycho](https://github.com/chriskrycho))
* [#253](https://github.com/true-myth/true-myth/pull/253) Target both `main` and `next` with Dependabot ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## 5.1.0 (2021-12-12)

#### :rocket: Enhancement
* [#248](https://github.com/true-myth/true-myth/pull/248) Deprecate Maybe.head for 6.0, preferring Maybe.first ([@chriskrycho](https://github.com/chriskrycho))
* [#247](https://github.com/true-myth/true-myth/pull/247) Deprecate non-Toolbelt versions of toolbelt utils ([@chriskrycho](https://github.com/chriskrycho))
* [#246](https://github.com/true-myth/true-myth/pull/246) Introduce `true-myth/toolbelt` module for better tree shaking ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## 5.0.1 (2021-12-11)

#### :bug: Bug Fix
* [#243](https://github.com/true-myth/true-myth/pull/243) Add `package.json` to `exports` ([@chriskrycho](https://github.com/chriskrycho))

#### :memo: Documentation
* [#226](https://github.com/true-myth/true-myth/pull/226) Export useful internal types, improve docs ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 1
- Chris Krycho ([@chriskrycho](https://github.com/chriskrycho))

## [5.0.0]

### :boom: Changed

- The top-level namespace-style export has been removed. If you were relying on the static members to be present when doing `import Maybe from 'true-myth/maybe'` or `import Result from 'true-myth/result';`, you can replace them with `import * as Maybe from 'true-myth/maybe';` or `import * as Result from 'true-myth/result';`. This should make for much better tree-shaking with bundlers like Rollup, which can see “through” a namespace import in a way they cannot with a manually-created namespace object. Where you want to maintain the type *and* namespace imports, you can do this:

    ```ts
    import * as Maybe from 'true-myth/maybe';
    type Maybe<T> = Maybe.Maybe<T>; // convenience alias
    ```

    In general, though, you should prefer to simply import the named functions instead:

    ```ts
    import Maybe, { transposeArray } from 'true-myth/maybe';
    ```

- There are no longer separate classes for `Just`, `Nothing`, `Ok`, and `Err`. This substantially reduces the size of the library, and should hopefully improve browsers' ability to optimize code using these, since there is now only one class in each case: `Maybe` and `Result`. The public API for the classes is unchanged, but if you relied on `instanceof` checks against those classes anywhere, those checks will no longer work.

- The exported `Variant` types are now frozen, constant objects, not TypeScript `enum`s. This *should* not break anyone, since the only difference in observable behavior between an `enum` and a `const` is the ability to do a “reverse lookup” on an `enum`—but since the field names and their values are identical, this just means shipping less, and faster, code.

- The `isJust`, `isNothing`, `isOk`, and `isErr` methods have been converted to getters. This makes them muchmore immediately useful in contexts where invoking a function is annoying, for any reason—for example, in Ember templates.

- We no longer publish CommonJS modules, only ES Modules.

- Dropped support for Node versions earlier than Node 12 LTS.

- Support for versions of TypeScript before 4.0 have been removed, to enable the type-safe re-implementation of `Maybe.all`.

- The `MaybeShape` and `ResultShape` interfaces are no longer exported. These were never intended for public reimplementation, and there is accordingly no value in their continuing to be public.

- A number of aliases (originally designed to make migration from e.g. Folktale easier) have been removed:
    - `cata`: use `match`
    - `chain` and `flatMap`: use `andThen`
    - `maybeify` and `transmogrify`: use `wrapReturn`
    - `unsafelyGet` and `unsafeGet`: use `.isJust`/`.isOk` then `.value`
    - `unsafelyGetErr` and `unsafelyUnwrapErr`: use `.isErr` then `.error`
    - `getOr`: use `unwrapOr`
    - `getOrElse`: use `unwrapOrElse`
    - `fromNullable` and `maybe`:
        - import `Maybe` and use its static constructor `Maybe.of`
        - import the module as namespace and use `Maybe.of`
        - import `of` and alias it as you like

### :star: Added

- We introduced a new `Maybe.transposeArray`, which is a type-safe, renamed, merged version of `Maybe.tuple` and `Maybe.all` which can correctly handle both array and tuple types. To support this change, it now accepts arrays or tuples directly, and the variadic/spread arguments to `all` have been replaced with taking an array or tuple directly. While `tuple` and `all` are unchanged, they are also deprecated (see below).

    **Before:**

    ```ts
    import Maybe, { all, just, nothing, tuple } from 'true-myth/maybe';

    // arrays
    type ArrayResult = Maybe<Array<string | number>>;

    let mixedArray = [just("hello"), nothing<number>()];
    let mixedArrayResult: ArrayResult = all(...arrayOfMaybes);

    let allJustArray = [just("hello"), just(12)];
    let allJustArrayResult: ArrayResult = all(...allJustArray);

    type Tuple = [Maybe<number>, Maybe<string>];
    type TupleResult = Maybe<[number, string]>;

    let mixedTuple: Tuple = [just(12), just("hi")];
    let mixedTupleResult: TupleResult = tuple(mixedTuple);
    ```

    **After:**

    ```ts
    import Maybe, { arrayTranspose, just, nothing } from 'true-myth/maybe';

    // arrays
    type ArrayResult = Maybe<Array<string | number>>;

    let mixedArray = [just("hello"), nothing<number>()];
    let mixedArrayResult: ArrayResult = arrayTranspose(arrayOfMaybes);

    let allJustArray = [just("hello"), just(12)];
    let allJustArrayResult: ArrayResult = arrayTranspose(allJustArray);

    // Tuples now work with `arrayTranspose` as well.
    type Tuple = [Maybe<number>, Maybe<string>];
    type TupleResult = Maybe<[number, string]>;

    let mixedTuple: Tuple = [just(12), just("hi")];
    let mixedTupleResult: TupleResult = arrayTranspose(mixedTuple);
    ```

-   `Maybe.transpose` and `Result.transpose`: for when you have a `Maybe<Result<T, E>>` or a `Result<Maybe<T>, E>` and need to invert them.

    ```ts
    import Maybe, { just, nothing } from 'true-myth/maybe';
    import Result, { ok, err } from 'true-myth/result';

    let anOkJust: Result<Maybe<number>, string> = ok(just(12));
    let maybe: Maybe<number>, string> = Maybe.transposeResult(anOkJust);
    console.log(maybe); // Just(Ok(12))

    let aJustOk: Maybe<Result<number, string>> = just(ok(12));
    let result: Maybe<Result<number, string>> = Result.transposeMaybe(aJustOk);
    console.log(result); // Ok(Just(12))
    ```

    See the docs for further details!

    **Note:** these are standalone functions, not methods, because TypeScript
    does not support conditionally supplying a method only for one specific type
    parameterization.

### :red_square: Deprecated

- `Maybe.tuple` and `Maybe.all` are deprecated in favor of `Maybe.arrayTranspose` now correctly handles both arrays and tuples. They will be removed not earlier than 6.0.0 (timeline not decided, but not sooner than when Node 12 LTS reaches end of life on April 30, 2022).

## [4.1.1] (2021-01-31)

### :wrench: Fixed

- Set `stripInternal` to false for generated types (#97), so that they type-check.

## [4.1.0] (2020-12-13)

### :star: Added

- Support unwrapping to an alternative type with (backwards-compatible) tweak to type of `Maybe.unwrapOr` and `Result.unwrapOr`. For example, given `let a: Maybe<string>`, `let b = a.unwrapOr(42)` would produce a type of `string | number` for `b`. Useful particularly for interop with `null` and `undefined` at system boundaries while preserving general type safety.

### 🙇 Contributors

- @alantrick (#69)
- @C-Saunders, @flyiniggle, @bmakuh, @atrick-speedline (#63, discussion motivating #69)

## [4.0.0] (2019-12-18)

### :wrench: Fixed

- Switched to using namespace-style imports (`import * as Maybe`) internally to enable users to tree-shake.

### :boom: Changed

- Explicitly drop support for Node 8 (and specify it going forward)
- Reverted the use of `NonNullable` to constraint the types of callbacks like that passed to `map` and `mapOr`, because they [broke][#54] in TypeScript 3.6. (If you have ideas about how to improve this, please let us know!)

[#54]: https://github.com/true-myth/true-myth/issues/54

### :gear: Upgrading

With yarn:

```sh
yarn upgrade true-myth@latest
```

With npm:

```sh
npm install true-myth@latest
```

### 🙇 Contributors

- @chriskrycho
- @bmakuh

## [3.1.0] (2019-10-08)

### :star: Added

Thanks to @MarcNq, with very helpful input from @CrossEye, True Myth now has `toJSON` functions and methods on its types. This means that there's now a stable serialization format, which you can rely on going forward!

For `Maybe<T>`, the type is `{ variant: 'Just', value: T }` or `{ variant: 'Nothing' }`. For `Result`, it's `{ variant: 'Ok', value: T  }` or `{ variant: 'Err', error: E }`. Since we just hand back the wrapped item, any object's implementation of `toJSON` or similar will work as usual, so you're fully in  control of serialization.

### :gear: Upgrading

With yarn:

```sh
yarn upgrade true-myth@latest
```

With npm:

```sh
npm install true-myth@latest
```

### 🙇 Contributors

- @MarcNq
- @CrossEye
- @chriskrycho
- @bmakuh

## [3.0.0] (2019-05-17)

### :star: Added

True Myth now includes the `Maybe.wrapReturn` function, conveniently aliased as `maybeify` and `Maybe.ify`, which lets you take any function which includes `null` or `undefined` in its return type (like [`Document#querySelector`][qs] and friends) and convert it to a function which returns a `Maybe` instead:

[qs]: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector

```ts
const querySelector = Maybe.wrapReturn(document.querySelector.bind(document));
querySelector('#neat'); // Maybe<Element>
```

See [the docs](https://true-myth.js.org/modules/_maybe_.html#wrapreturn) for more!

### :boom: Changed

All `Maybe` helper functions must now return `NonNullable<T>`. This example, which previously compiled and resulted in the type `Maybe<string | null>`, will now cause a type error:

```ts
Maybe.of(document.querySelector('#neat'))
  .map(el => el.style.color); // `color` may be `null`
```

**SemVer note:** The new behavior was the ordinary expectation for those types before—doing otherwise would cause a runtime error—and so could reasonably be described as a bugfix. Any place this type-checked before was causing a runtime error. However, it seems clearer simply to mark it as a breaking change, since it *may* cause your build to fail, and encourage you all to upgrade directly and fix those bugs if so!

### :gear: Upgrading

With yarn:

```sh
yarn upgrade true-myth@latest
```

With npm:

```sh
npm install true-myth@latest
```

### 🙇 Contributors

- @bmakuh
- @chriskrycho
- @snatvb

[unreleased]: https://github.com/true-myth/true-myth/compare/v5.0.0...HEAD
[5.0.0]: https://github.com/true-myth/true-myth/compare/v4.1.1...v5.0.0
[4.1.1]: https://github.com/true-myth/true-myth/compare/v4.1.0...v4.1.1
[4.1.0]: https://github.com/true-myth/true-myth/compare/v4.0.0...v4.1.0
[4.0.0]: https://github.com/true-myth/true-myth/compare/v3.1.0...v4.0.0
[3.1.0]: https://github.com/true-myth/true-myth/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/true-myth/true-myth/compare/v2.2.8...v3.0.0
