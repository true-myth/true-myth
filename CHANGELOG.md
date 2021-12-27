# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).





## 5.1.2 (2021-12-27)

#### :bug: Bug Fix
* 5.1.1 regression: type inference for Result.ok ([@krivachy](https://github.com/krivachy))
* [#272](https://github.com/true-myth/true-myth/pull/272) Fix v5 regression of checks on `.value` ([@chriskrycho](https://github.com/chriskrycho))

#### :memo: Documentation
* [#266](https://github.com/true-myth/true-myth/pull/266) Fix out-of-date parts of README ([@chriskrycho](https://github.com/chriskrycho))

#### Committers: 2
- Akos Krivachy ([@krivachy](https://github.com/krivachy))
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
