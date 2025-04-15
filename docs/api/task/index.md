[True Myth](../index.md) / task

# task

A [`Task<T, E>`](classes/Task.md) is a type representing an asynchronous operation
that may fail, with a successful (“resolved”) value of type `T` and an error
(“rejected”) value of type `E`.

If the `Task` is pending, it is [`Pending`](interfaces/Pending.md). If it has resolved, it is
[`Resolved(value)`](interfaces/Resolved.md). If it has rejected, it is [`Rejected(reason)`](interfaces/Rejected.md).

For more, see [the guide](/guide/understanding/task/).

## Classes

- [AggregateRejection](classes/AggregateRejection.md)
- [InvalidAccess](classes/InvalidAccess.md)
- [Task](classes/Task.md)
- [Timeout](classes/Timeout.md)

## Interfaces

- [RetryStatus](interfaces/RetryStatus.md)
- [TaskConstructor](interfaces/TaskConstructor.md)

## Type Aliases

- [Matcher](type-aliases/Matcher.md)
- [TaskTypesFor](type-aliases/TaskTypesFor.md)
- [Timer](type-aliases/Timer.md)
- [WithResolvers](type-aliases/WithResolvers.md)

## Constructors

- [reject](variables/reject.md)
- [resolve](variables/resolve.md)
- [withResolvers](variables/withResolvers.md)
- [fromPromise](functions/fromPromise.md)
- [fromUnsafePromise](functions/fromUnsafePromise.md)

## Variables

- [RETRY\_FAILED\_NAME](variables/RETRY_FAILED_NAME.md)
- [safelyTryOr](variables/safelyTryOr.md)
- [safelyTryOrElse](variables/safelyTryOrElse.md)
- [State](variables/State.md)

## Functions

- [all](functions/all.md)
- [allSettled](functions/allSettled.md)
- [and](functions/and.md)
- [andThen](functions/andThen.md)
- [any](functions/any.md)
- [fromResult](functions/fromResult.md)
- [isRetryFailed](functions/isRetryFailed.md)
- [map](functions/map.md)
- [mapRejected](functions/mapRejected.md)
- [match](functions/match.md)
- [or](functions/or.md)
- [orElse](functions/orElse.md)
- [race](functions/race.md)
- [safe](functions/safe.md)
- [safelyTry](functions/safelyTry.md)
- [safeNullable](functions/safeNullable.md)
- [stopRetrying](functions/stopRetrying.md)
- [timeout](functions/timeout.md)
- [timer](functions/timer.md)
- [toPromise](functions/toPromise.md)
- [tryOr](functions/tryOr.md)
- [tryOrElse](functions/tryOrElse.md)
- [withRetries](functions/withRetries.md)

## References

### default

Renames and re-exports [Task](classes/Task.md)

***

### delay

Renames and re-exports [task/delay](delay/index.md)

***

### Delay

Renames and re-exports [task/delay](delay/index.md)

## Errors

- [RetryFailed](classes/RetryFailed.md)
- [StopRetrying](classes/StopRetrying.md)
- [TaskExecutorException](classes/TaskExecutorException.md)
- [UnsafePromise](classes/UnsafePromise.md)

## Task Variants

- [Pending](interfaces/Pending.md)
- [Rejected](interfaces/Rejected.md)
- [Resolved](interfaces/Resolved.md)
