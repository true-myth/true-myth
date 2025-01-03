# Task

A `Task<T, E>` is a type representing the state of an asynchronous computation which may fail, with a successful value of type `T` or an error of type `E`. It has three states:

- `Pending`
- `Resolved`, with a value of type `T`
- `Rejected`, with a reason of type `E`

In general, however, because of the asynchronous nature of a `Task`, you will interact with it via its methods, rather than matching on its state, since you generally want to perform an operation once it has resolved.

You can think of a `Task<T, E>` as being basically a `Promise<Result<T, E>>`, because it *is* a `Promise<Result<T, E>>` under the hood, but with two main differences:

1. A `Task` cannot *reject*. All rejections must be handled. This means that, like a `Result`, it will *never* throw an error if used in strict TypeScript.

2. Unlike `Promise`, `Task` robustly distinguishes between `map` and `andThen` operations.

`Task` also implements JavaScript’s `PromiseLike` interface, so you can`await` it; when a `Task<T, E>` is awaited, it produces a `Result<T, E>`.

## Creating a `Task`

The simplest way to create a `Task` is to call `Task.try(somePromise)`. Because any promise may reject/throw an error, this simplest form catches all rejections and maps them into the `Rejected` variant. Given a `Promise<T>`, the resulting `Task` thus has the type `Task<T, unknown>`. For example:

```ts
let { promise, reject } = Promise.withResolvers<number>();

// `theTask` has the type `Task<number, unknown>`
let theTask = Task.try(promise);

// The rejection will always produce
reject("Tasks always safely handle errors!");
await theTask;
console.log(theTask.state); // State.Rejected

// The `reason` here is of type `unknown`. Attempting to access it on a pending
// or resolved `Task` (rather than a rejected `Task`) will throw an error.
console.log(theTask.reason); // "Tasks always safely handle errors!"
```

You can also provide a fallback value for the error using `tryOr`:

```ts
let { promise, reject } = Promise.withResolvers<number>();

// `theTask` has the type `Task<number, string>`
let theTask = Task.tryOr(promise, "a fallback error");

reject({ thisStructuredObject: "will be ignored!" });
await theTask;

console.log(theTask.reason); // "a fallback error"
```

You can use `Task.tryOrElse` to produce a known rejection reason from the `unknown` rejection reason of a `Promise`:

```ts
let { promise, reject } = Promise.withResolvers<number>();

// `theTask` has the type `Task<number, Error>`
let theTask = Task.tryOrElse(
  promise,
  (reason) => new Error("Promise was rejected", { cause: reason })
);
```

`Task` also has `resolved` and `rejected` static helpers:

```ts
// `resolved` has the type `Task<number, never>`
let resolved = Task.resolved(123);

// `rejected` has the type `Task<never, string>`
let rejected = Task.rejected("something went wrong");
```


## Working with a `Task`

There are many helpers (“combinators”) for working with a `Task`. The most common are `map`, `mapRejected`, `andThen`, and `orElse`.

- `map` transforms a value “within” a `Task` context:

    ```ts
    let theTask = Task.resolved(123);
    let doubled = theTask.map((n) => n * 2);
    let theResult = await doubled;
    console.log(theResult); // Ok(456)
    ```

- `mapRejected` does the same, but for a rejection:

    ```ts
    let theTask = Task.rejected(new Error("ugh"));
    let wrapped = theTask.mapRejected(
      (err) => new Error(`sigh (caused by: ${err.message})`)
    );
    let theResult = await wrapped;
    console.log(theResult); // Err("Error: sigh (caused by: ugh)")
    ```

- `andThen` uses the value produced by one resolved `Task` to create another `Task`, but without nesting them. `orElse` is like `andThen`, but for the `Rejection`. You can often combine them to good effect. For example, a safe `fetch` usage might look like this:

    ```ts
    let fetchUsersTask = Task.try(fetch(/* some endpoint */))
      .orElse(handleError('http'))
      .andThen((res) => Task.try(res.json().orElse(handleError('parse')))
      .match({
        Resolved: (users) => {
          for (let user of users) {
            console.log(user);
          }
        },
        Rejected: (error) => {
          let currentError = error;
          console.error(currentError.message)
          while (currentError = currentError.cause) {
            console.error(currentError.message);
          }
        },
      });

    let usersResult = await fetchUsersTask;
    usersResult.match({
      Ok: (users) => {
        for (let user of users) {
          console.log(user);
        }
      },
      Err: (error) => {
        let currentError = error;
        console.error(currentError.message)
        while (currentError = currentError.cause) {
          console.error(currentError.message);
        }
      }
    });

    function handleError(name: string): (error: unknown) => Error {
      return new Error(`my-lib.${name}`, { cause: error });
    }
    ```

There are many others; see the API docs!

## Timing

Because `Task` wraps `Promise`, it (currently) always requires *at least* two ticks of the microtask queue before it will produce its final state. In practical terms, you must *always* `await` a `Task` before its `state` will be `Resolved` or `Rejected`, even with `Task.resolved` and `Task.rejected`. If the (Stage 1) [Faster Promise Adoption][fpa] TC39 proposal is adopted, this *may* change/improve.

[fpa]: https://github.com/tc39/proposal-faster-promise-adoption
