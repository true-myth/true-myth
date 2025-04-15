[True Myth](../../index.md) / [task](../index.md) / RetryFailed

# Class: RetryFailed\<E\>

An [`Error`][mdn-error] subclass for when a `Task` rejected after a specified
number of retries. It includes all rejection reasons, including the final one,
as well as the number of retries and the total duration spent on the retries.
It distinguishes between the list of rejections and the optional `cause`
property inherited from `Error` so that it can indicate if the retries failed
because the retry strategy was exhausted (in which case `cause` will be
`undefined`) or because the caller returned a [`StopRetrying`](StopRetrying.md)
instance (in which case `cause` will be that instance.)

You can neither construct nor subclass this error, only use its properties. If
you need to check whether an `Error` class is an instance of this class, you
can check whether its `name` is [`RETRY_FAILED_NAME`](../variables/RETRY_FAILED_NAME.md) or you can use
the [`isRetryFailed`](../functions/isRetryFailed.md) helper function:

```ts
import * as task from 'true-myth/task';

// snip
let result = await someFnThatReturnsATask();
if (result.isErr) {
  if (task.isRetryFailed(result.error)) {
    if (result.error.cause) {
      console.error('You quit on purpose: ', cause);
    }

    for (let rejection of result.error.rejections) {
      console.error(rejection);
     }
  } else {
    // handle other error types
  }
}
```

[mdn-error]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error

## Extends

- `Error`

## Type Parameters

### E

`E`

## Properties

### cause?

> `optional` **cause**: `unknown`

#### Inherited from

`Error.cause`

***

### message

> **message**: `string`

#### Inherited from

`Error.message`

***

### rejections

> `readonly` **rejections**: `E`[]

***

### stack?

> `optional` **stack**: `string`

#### Inherited from

`Error.stack`

***

### totalDuration

> `readonly` **totalDuration**: `number`

***

### tries

> `readonly` **tries**: `number`

***

### prepareStackTrace()?

> `static` `optional` **prepareStackTrace**: (`err`, `stackTraces`) => `any`

Optional override for formatting stack traces

#### Parameters

##### err

`Error`

##### stackTraces

`CallSite`[]

#### Returns

`any`

#### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Inherited from

`Error.prepareStackTrace`

***

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

#### Inherited from

`Error.stackTraceLimit`

## Accessors

### name

#### Get Signature

> **get** **name**(): `"TrueMyth.Task.RetryFailed"`

##### Returns

`"TrueMyth.Task.RetryFailed"`

#### Overrides

`Error.name`

## Methods

### captureStackTrace()

> `static` **captureStackTrace**(`targetObject`, `constructorOpt`?): `void`

Create .stack property on a target object

#### Parameters

##### targetObject

`object`

##### constructorOpt?

`Function`

#### Returns

`void`

#### Inherited from

`Error.captureStackTrace`
