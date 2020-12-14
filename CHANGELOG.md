# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.1.0] (2020-12-13)

### Added :star:

- Support unwrapping to an alternative type with (backwards-compatible) tweak to type of `Maybe.unwrapOr` and `Result.unwrapOr`. For example, given `let a: Maybe<string>`, `let b = a.unwrapOr(42)` would produce a type of `string | number` for `b`. Useful particularly for interop with `null` and `undefined` at system boundaries while preserving general type safety.

### Contributors 🙇 

- @alantrick (#69)
- @atrick-speedline (#63, discussion motivating #69)

## [4.0.0] (2019-12-18)

### Fixed :wrench:

- Switched to using namespace-style imports (`import * as Maybe`) internally to enable users to tree-shake.

### Changed :boom:

- Explicitly drop support for Node 8 (and specify it going forward)
- Reverted the use of `NonNullable` to constraint the types of callbacks like that passed to `map` and `mapOr`, because they [broke][#54] in TypeScript 3.6. (If you have ideas about how to improve this, please let us know!)

[#54]: https://github.com/true-myth/true-myth/issues/54

### Upgrading :gear:

With yarn:

```sh
yarn upgrade true-myth@latest
```

With npm:

```sh
npm install true-myth@latest
```

### Contributors 🙇 

- @chriskrycho
- @bmakuh

## [3.1.0] (2019-10-08)

### Added :star:

Thanks to @MarcNq, with very helpful input from @CrossEye, True Myth now has `toJSON` functions and methods on its types. This means that there's now a stable serialization format, which you can rely on going forward!

For `Maybe<T>`, the type is `{ variant: 'Just', value: T }` or `{ variant: 'Nothing' }`. For `Result`, it's `{ variant: 'Ok', value: T  }` or `{ variant: 'Err', error: E }`. Since we just hand back the wrapped item, any object's implementation of `toJSON` or similar will work as usual, so you're fully in  control of serialization.

### Upgrading :gear:

With yarn:

```sh
yarn upgrade true-myth@latest
```

With npm:

```sh
npm install true-myth@latest
```

### Contributors 🙇 

- @MarcNq
- @CrossEye
- @chriskrycho
- @bmakuh

## [3.0.0] (2019-05-17)

### Added :star:

True Myth now includes the `Maybe.wrapReturn` function, conveniently aliased as `maybeify` and `Maybe.ify`, which lets you take any function which includes `null` or `undefined` in its return type (like [`Document#querySelector`][qs] and friends) and convert it to a function which returns a `Maybe` instead:

[qs]: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector

```ts
const querySelector = Maybe.wrapReturn(document.querySelector.bind(document));
querySelector('#neat'); // Maybe<Element>
```

See [the docs](https://true-myth.js.org/modules/_maybe_.html#wrapreturn) for more!

### Changed :boom:

All `Maybe` helper functions must now return `NonNullable<T>`. This example, which previously compiled and resulted in the type `Maybe<string | null>`, will now cause a type error:

```ts
Maybe.of(document.querySelector('#neat'))
  .map(el => el.style.color); // `color` may be `null`
```

**SemVer note:** The new behavior was the ordinary expectation for those types before—doing otherwise would cause a runtime error—and so could reasonably be described as a bugfix. Any place this type-checked before was causing a runtime error. However, it seems clearer simply to mark it as a breaking change, since it *may* cause your build to fail, and encourage you all to upgrade directly and fix those bugs if so!

### Upgrading :gear:

With yarn:

```sh
yarn upgrade true-myth@latest
```

With npm:

```sh
npm install true-myth@latest
```

### Contributors 🙇 

- @bmakuh
- @chriskrycho
- @snatvb

[unreleased]: https://github.com/true-myth/true-myth/compare/v3.1.0...HEAD
[4.1.0]: https://github.com/true-myth/true-myth/compare/v4.0.0...v4.1.0
[4.0.0]: https://github.com/true-myth/true-myth/compare/v3.1.0...v4.0.0
[3.1.0]: https://github.com/true-myth/true-myth/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/true-myth/true-myth/compare/v2.2.8...v3.0.0
