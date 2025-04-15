[True Myth](../../index.md) / [task](../index.md) / AggregateRejection

# Class: AggregateRejection\<E\>

An error type produced when [`any`](../functions/any.md) produces any rejections. All
rejections are aggregated into this type.

> [!NOTE]
> This error type is not allowed to be subclassed.

## Extends

- `Error`

## Type Parameters

### E

`E` *extends* `unknown`[]

The type of the rejection reasons.

## Constructors

### Constructor

> **new AggregateRejection**\<`E`\>(`errors`): `AggregateRejection`\<`E`\>

#### Parameters

##### errors

`E`

#### Returns

`AggregateRejection`\<`E`\>

#### Overrides

`Error.constructor`

## Properties

### cause?

> `optional` **cause**: `unknown`

#### Inherited from

`Error.cause`

***

### errors

> `readonly` **errors**: `E`

***

### message

> **message**: `string`

#### Inherited from

`Error.message`

***

### name

> `readonly` **name**: `"AggregateRejection"` = `'AggregateRejection'`

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

### toString()

> **toString**(): `string`

Returns a string representation of an object.

#### Returns

`string`

***

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
