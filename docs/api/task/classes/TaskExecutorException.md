[True Myth](../../index.md) / [task](../index.md) / TaskExecutorException

# Class: TaskExecutorException

The error thrown when an error is thrown in the executor passed to [`Task.constructor`](Task.md#constructor). This error class exists so it is clear exactly what went
wrong in that case.

## Extends

- `Error`

## Constructors

### Constructor

> **new TaskExecutorException**(`originalError`): `TaskExecutorException`

#### Parameters

##### originalError

`unknown`

#### Returns

`TaskExecutorException`

#### Overrides

`Error.constructor`

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

### name

> **name**: `string` = `'TrueMyth.Task.ThrowingExecutor'`

#### Overrides

`Error.name`

***

### stack?

> `optional` **stack**: `string`

#### Inherited from

`Error.stack`

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
