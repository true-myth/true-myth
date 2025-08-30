# Going Async Safely: `Task`

In JavaScript, we generally use a mix of callbacks or `Promise`s to deal with asynchronous operations. In both cases, it can be unclear how to handle *failure* in a type-safe way. We have already seen a taste of this with `Result`, but async brings additional concerns to handle.

:::tip So you know…

These docs do *not* try to introduce async programming with promises or callbacks in JavaScript. They instead assume you already have some basic familiarity with those ideas and discuss instead what is *different* about `Task`.

:::

## Async failure handling

### Callbacks

Callbacks generally need to handle an error provided as an argument—but in many callback-based designs, nothing *actually* requires you to handle that. For example, here is a slightly simplified version of the type signature for the classic callback-based Node API for reading a file:

```typescript
function readFile(
  path: string,
  callback: (err: ErrnoException | null, data: string) => void,
): void;
```

This tells you what kind of error may be present (an `ErrnoException`), but you can blithely try to read the `data` regardless. Worse, as of the time of this writing (and for a long time historically) the Node types *lie*: they promise that `data` is present, but in fact if there is an `err`, `data` will be `undefined`.[^why] So if you write this…

```typescript
import { readFile } from 'node:fs';

readFile('does-not-exist.lol', (err, data) => {
  console.log(data.length);
});
```

You will see one of JavaScript’s most infamous error messages:

> Uncaught TypeError: Cannot read properties of undefined (reading 'length')

### Promises

Similarly, `Promise` has a `catch` method, but TypeScript’s types for `Promise` only include the type for the successful resolution of the `Promise`, not the type of any rejections (they are at best). Here is a similarly simplified version of the type signature for the `Promise`-based version of the Node API for reading a file:

```typescript
function readFile(path: string): Promise<string>;
```

This type signature does not even tell you that it will actually throw an error of type `ErrnoException`! Again, if you call it like this:

```typescript
import { readFile } from 'node:fs/promises';

let data = await readFile('does-not-exist.lol');
```

You will just get an unhandled error:

```
Uncaught Error: ENOENT: no such file or directory, open 'does-not-exist.lol'
    at async open (node:internal/fs/promises:639:25)
    at async Object.readFile (node:internal/fs/promises:1242:14)
    at async REPL13:1:39 {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: 'does-not-exist.lol'
}
```

`Task` is True Myth’s solution to these problems: like `Result`, it is a union of success and error types, but unlike `Result`, it is designed for async!

Like a `Promise`, a `Task` can either be `Resolved` or `Rejected`. Unlike a `Promise`, though, when a `Task` is rejected, it does not throw an error or enter a totally different control flow path. Instead, it always produces a value you can work with, just like `Result` does for synchronous operations.


## Switching to `Task`

Let’s see how to use `Task` to build up safe versions of `readFile` as a motivating example. Then we’ll talk a bit about how to use `Task`’s more advanced features and capabilities to (a) do things more easily than these examples show and (b) solve harder and more interesting problems.

### The `Task` constructor API

:::info 🚧 Under Construction 🚧

There will be content here Soon™. We didn’t want to block getting the new docs site live on having fleshed out every detail of this!

:::

### Wrapping a callback

We’ll start by showing how to use a `Task` to wrap the callback-based `readFile` from Node, this time including the `options` argument so the types are actually correct.

```typescript
import { readFile } from 'node:fs';

import Task from 'true-myth/task';

let readTask = new Task<string, NodeJS.ErrnoException>((resolve, reject) => {
  readFile('does-not-exist.lol', { encoding: 'utf-8' }, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data);
    }
  });
});
```

We construct a `Task` with the right types by calling `new Task` and explicitly naming the types of resolved and rejected data.

:::tip

TypeScript cannot infer these types based on how you call `resolve` and `reject`, unfortunately. The same limitation applies to the native `Promise` constructor.

:::

Then the `readFile` callback produces either an `err` or `data`. If `err` is not `null`, we know there is an error, so we call the `reject` function with `err` as its argument. Otherwise, we know `data` will be set, so we pass it to `resolve`. Note that if the types we used when calling the `Task` constructor were not compatible with the types from the `readFile` callback, TypeScript would catch it for us!

You can use this same approach to turn *any* callback-based API into a `Task`-based API. For example, you could implement a `Task`-based timer around `setTimeout` like this:

```typescript
function timer(ms: number): Task<number, never> {
  return new Task((resolve) => {
    setTimeout(() => resolve(ms), ms);
  });
}
```

Here, inside the callback we pass to the `Task` constructor, we call `setTimeout` with the same duration passed into `timer`, and when it is done, we resolve with that same duration value.

:::info 🙈 Spoilers 🙈

That’s the same implementation we use for [the `timer` function](/api/task/functions/timer). The only difference is that we also provide a little extra time safety to distinguish [the resulting `Timer` type](/api/task/type-aliases/Timer) from a `Task<number, never>` where the `number` might represent some other number rather than an elapsed time.

:::


### Wrapping a `Promise`

To start with, we can do the same thing as we did with callbacks. Here, because the `.then` method for a `Promise` takes handlers for both resolution and rejection, we can simply pass the `resolve` and `reject` arguments to it directly:

```typescript
import { readFile } from 'node:fs/promises';

import Task from 'true-myth/task';

let readTask = new Task<string, NodeJS.ErrnoException>((resolve, reject) => {
  readFile("does-not-exist.lol", { encoding: "utf-8" }).then(resolve, reject);
});
```

Once again, we have a `readTask` that we can work with using the rest of the `Task` API.

:::danger

The rejection type is untyped, so this is actually *less* safe than the callback-based version above. Keep reading to see how `Task` can help you handle this more safely.

:::

However, because this is an *incredibly* common pattern—indeed, probably the most common thing you will do with `Task`!—we also provide the `fromPromise` constructor. Thus, we can rewrite the above example like this:

```typescript
import { readFile } from 'node:fs/promises';
import Task from 'true-myth/task';

let filePromise = readFile("does-not-exist.lol", { encoding: "utf-8" });
let readTask = Task.fromPromise(promise);
```

This time, the type of `readTask` is `Task<string, unknown>`, and this is actually safer and more accurate than the type produced by using the constructor: nothing in the type system actually *guarantees* that the `Promise`-based API will *only* throw a `ErrnoException`.

## Working with `Task`s

:::warning 🚧 Under Construction 🚧

There will be more, different, and better content here Soon™. We didn’t want to block getting the new docs site live on having fleshed out the whole tutorial!

:::


[^why]: Why is this the case? Your guess is as good as ours! Possibly changing it to be more correct would be judged “too breaking”. Either way, the problem remains!
