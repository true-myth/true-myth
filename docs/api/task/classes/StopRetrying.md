[True Myth](../../index.md) / [task](../index.md) / StopRetrying

# Class: StopRetrying

A custom [`Error`][mdn-error] subclass which acts as a “sentinel”: when you
return it either as the top-level return value from the callback for
[`withRetries`](../functions/withRetries.md) or the rejection reason for a [`Task`](Task.md)
produces by `withRetries`, the function will stop retrying immediately.

[mdn-error]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error

You can neither construct this class directly nor subclass it. Instead, use
the [`stopRetrying`](../functions/stopRetrying.md) helper function to construct it.

## Extends

- `Error`

## Constructors

### Constructor

> **new StopRetrying**(`message`?): `StopRetrying`

#### Parameters

##### message?

`string`

#### Returns

`StopRetrying`

#### Inherited from

`Error.constructor`

### Constructor

> **new StopRetrying**(`message`?, `options`?): `StopRetrying`

#### Parameters

##### message?

`string`

##### options?

`ErrorOptions`

#### Returns

`StopRetrying`

#### Inherited from

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

## Accessors

### name

#### Get Signature

> **get** **name**(): `string`

##### Returns

`string`

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
