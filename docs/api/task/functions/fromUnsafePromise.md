[True Myth](../../index.md) / [task](../index.md) / fromUnsafePromise

# Function: fromUnsafePromise()

> **fromUnsafePromise**\<`T`, `E`\>(`promise`): [`Task`](../classes/Task.md)\<`T`, `E`\>

Produce a `Task<T, E>` from a promise of a [`Result<T, E>`](../../result/classes/Result.md).

> [!WARNING]
> This constructor assumes you have already correctly handled the promise
> rejection state, presumably by mapping it into the wrapped `Result`. It is
> *unsafe* for this promise ever to reject! You should only ever use this
> with `Promise<Result<T, E>>` you have created yourself (including via a
> `Task`, of course).
>
> For any other `Promise<Result<T, E>>`, you should first attach a `catch`
> handler which will also produce a `Result<T, E>`.
>
> If you call this with an unmanaged `Promise<Result<T, E>>`, that is, one
> that has *not* correctly set up a `catch` handler, the rejection will
> throw an [`UnsafePromise`](../classes/UnsafePromise.md) error that will ***not*** be catchable
> by awaiting the `Task` or its original `Promise`. This can cause test
> instability and unpredictable behavior in your application.

## Type Parameters

### T

`T`

### E

`E`

## Parameters

### promise

`Promise`\<[`Result`](../../result/classes/Result.md)\<`T`, `E`\>\>

The promise from which to create the `Task`.

## Returns

[`Task`](../classes/Task.md)\<`T`, `E`\>
