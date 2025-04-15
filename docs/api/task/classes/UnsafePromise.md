[True Myth](../../index.md) / [task](../index.md) / UnsafePromise

# Class: UnsafePromise

An error thrown when the `Promise<Result<T, E>>` passed to
[fromUnsafePromise](../functions/fromUnsafePromise.md) rejects.

## Extends

- `Error`

## Constructors

### Constructor

> **new UnsafePromise**(`unhandledError`): `UnsafePromise`

#### Parameters

##### unhandledError

`unknown`

#### Returns

`UnsafePromise`

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

> `readonly` **name**: `"TrueMyth.Task.UnsafePromise"` = `'TrueMyth.Task.UnsafePromise'`

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
