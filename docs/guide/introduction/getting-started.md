# Getting Started

True Myth has no additional dependencies and is ready to start using immediately after installation.

## Requirements

- Node 18+
- TS 5.3+
- `tsconfig.json`:
  - `moduleResolution`: use `"Node16"` or later
  - `strict: true`
- `package.json`
  - `type: "module"` (or else use `import()` to import True Myth into a commonJS build)

For details on using a pure ES modules package in TypeScript, see [the TypeScript handbook's guide](https://www.typescriptlang.org/docs/handbook/esm-node.html).

## Installation

Add True Myth to your dependencies:

::: code-group

```sh [npm]
npm add true-myth
```

```sh [yarn]
yarn add true-myth
```

```sh [pnpm]
pnpm add true-myth
```

```sh [bun]
bun add true-myth
```

:::

## Basic Usage

True Myth is organized into modules within its public API, so you will generally not import from the root of the package, but from the dedicated module for each major type:

```ts
import Maybe from 'true-myth/maybe';
import Result from 'true-myth/result';
import Task from 'true-myth/task';
import { exponential, jitter } from 'true-myth/task/delay';
```

If for some reason you *need* to import from the root, however,the default export and the full contents of each module are both available there. For example, you can import both the `Maybe` *type* and the contents of the `true-myth/maybe` module as a *namespace* like so:

```ts
import { Maybe, MaybeNS } from 'true-myth';
```

:::tip

This is not idiomatic and may be removed in a future version.

:::
