[True Myth](../../index.md) / [task](../index.md) / fromPromise

# Function: fromPromise()

## Call Signature

> **fromPromise**\<`T`\>(`promise`): [`Task`](../classes/Task.md)\<`T`, `unknown`\>

Produce a [`Task<T, unknown>`](../classes/Task.md) from a [`Promise`][mdn-promise].

[mdn-promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

To handle the error case and produce a `Task<T, E>` instead, use the overload
the overload which accepts an `onRejection` handler instead.

> [!IMPORTANT]
> This does not (and by definition cannot) handle errors that happen during
> construction of the `Promise`, because those happen before this is called.
> See [`safelyTry`](safelyTry.md), [`tryOr`](tryOr.md), or
> [`tryOrElse`](tryOrElse.md) for alternatives which accept a callback for
> constructing a promise and can therefore handle errors thrown in the call.

### Type Parameters

#### T

`T`

The type the `Promise` would resolve to, and thus that the `Task`
  will also resolve to if the `Promise` resolves.

### Parameters

#### promise

`Promise`\<`T`\>

The promise from which to create the `Task`.

### Returns

[`Task`](../classes/Task.md)\<`T`, `unknown`\>

## Call Signature

> **fromPromise**\<`T`, `E`\>(`promise`, `onRejection`): [`Task`](../classes/Task.md)\<`T`, `E`\>

Produce a [`Task<T, E>`](../classes/Task.md) from a [`Promise`][mdn-promise], using a
.

[mdn-promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

To absorb all errors/rejections as `unknown`, use the overload without an
`onRejection` handler instead.

> [!IMPORTANT]
> This does not (and by definition cannot) handle errors that happen during
> construction of the `Promise`, because those happen before this is called.
> See [`safelyTry`](safelyTry.md), [`tryOr`](tryOr.md), or
> [`tryOrElse`](tryOrElse.md) for alternatives which accept a callback for
> constructing a promise and can therefore handle errors thrown in the call.

### Type Parameters

#### T

`T`

The type the `Promise` would resolve to, and thus that the `Task`
  will also resolve to if the `Promise` resolves.

#### E

`E`

The type of a rejected `Task` if the promise rejects.

### Parameters

#### promise

`Promise`\<`T`\>

The promise from which to create the `Task`.

#### onRejection

(`reason`) => `E`

Transform errors from `unknown` to a known error type.

### Returns

[`Task`](../classes/Task.md)\<`T`, `E`\>
