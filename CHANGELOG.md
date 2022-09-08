# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).



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
