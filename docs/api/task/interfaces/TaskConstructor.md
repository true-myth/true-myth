[True Myth](../../index.md) / [task](../index.md) / TaskConstructor

# Interface: TaskConstructor

The public interface for the [`Task`](../classes/Task.md) class *as a value*: a
constructor and the associated static properties.

## Extends

- `Omit`\<*typeof* `TaskImpl`, `"constructor"`\>

## Constructors

### Constructor

> **new TaskConstructor**\<`T`, `E`\>(`executor`): [`Task`](../classes/Task.md)\<`T`, `E`\>

Construct a new `Task`, using callbacks to wrap APIs which do not natively
provide a `Promise`.

This is identical to the [Promise][promise] constructor, with one very
important difference: rather than producing a value upon resolution and
throwing an exception when a rejection occurs like `Promise`, a `Task`
always “succeeds” in producing a usable value, just like [`Result`](../../result/classes/Result.md)
for synchronous code.

[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise

For constructing a `Task` from an existing `Promise`, see:

- [`fromPromise`](../functions/fromPromise.md)
- [`safelyTry`](../functions/safelyTry.md)
- [`tryOr`](../functions/tryOr.md)
- [`tryOrElse`](../functions/tryOrElse.md)

For constructing a `Task` immediately resolved or rejected with given
values, see [`Task.resolve`](#resolve) and [`Task.reject`](#reject)
respectively.

#### Parameters

##### executor

(`resolve`, `reject`) => `void`

A function which the constructor will execute to manage
  the lifecycle of the `Task`. The executor in turn has two functions as
  parameters: one to call on resolution, the other on rejection.

#### Returns

[`Task`](../classes/Task.md)\<`T`, `E`\>

#### Inherited from

`Omit<typeof TaskImpl, 'constructor'>.constructor`

***

### reject()

#### Call Signature

> **reject**\<`T`, `E`\>(): [`Task`](../classes/Task.md)\<`T`, [`Unit`](../../unit/interfaces/Unit.md)\>

Construct a `Task` which is already rejected. Useful when you have an error
already, but need it to be available in an API which expects a `Task`.

##### Type Parameters

###### T

`T` = `never`

###### E

`E` *extends* `object` = \{\}

##### Returns

[`Task`](../classes/Task.md)\<`T`, [`Unit`](../../unit/interfaces/Unit.md)\>

##### Inherited from

`Omit.reject`

#### Call Signature

> **reject**\<`T`, `E`\>(`reason`): [`Task`](../classes/Task.md)\<`T`, `E`\>

Construct a `Task` which is already rejected. Useful when you have an error
already, but need it to be available in an API which expects a `Task`.

##### Type Parameters

###### T

`T` = `never`

###### E

`E` = `unknown`

##### Parameters

###### reason

`E`

##### Returns

[`Task`](../classes/Task.md)\<`T`, `E`\>

##### Inherited from

`Omit.reject`

***

### resolve()

#### Call Signature

> **resolve**\<`T`, `E`\>(): [`Task`](../classes/Task.md)\<[`Unit`](../../unit/interfaces/Unit.md), `E`\>

Construct a `Task` which is already resolved. Useful when you have a value
already, but need it to be available in an API which expects a `Task`.

##### Type Parameters

###### T

`T` *extends* [`Unit`](../../unit/interfaces/Unit.md)

###### E

`E` = `never`

##### Returns

[`Task`](../classes/Task.md)\<[`Unit`](../../unit/interfaces/Unit.md), `E`\>

##### Inherited from

`Omit.resolve`

#### Call Signature

> **resolve**\<`T`, `E`\>(`value`): [`Task`](../classes/Task.md)\<`T`, `E`\>

Construct a `Task` which is already resolved. Useful when you have a value
already, but need it to be available in an API which expects a `Task`.

##### Type Parameters

###### T

`T`

###### E

`E` = `never`

##### Parameters

###### value

`T`

##### Returns

[`Task`](../classes/Task.md)\<`T`, `E`\>

##### Inherited from

`Omit.resolve`

***

### withResolvers()

> **withResolvers**\<`T`, `E`\>(): [`WithResolvers`](../type-aliases/WithResolvers.md)\<`T`, `E`\>

Create a pending `Task` and supply `resolveWith` and `rejectWith` helpers,
similar to the [`Promise.withResolvers`][pwr] static method, but producing a
`Task` with the usual safety guarantees.

[pwr]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers

## Examples

### Resolution

```ts
let { task, resolveWith, rejectWith } = Task.withResolvers<string, Error>();
resolveWith("Hello!");

let result = await task.map((s) => s.length);
let length = result.unwrapOr(0);
console.log(length); // 5
```

### Rejection

```ts
let { task, resolveWith, rejectWith } = Task.withResolvers<string, Error>();
rejectWith(new Error("oh teh noes!"));

let result = await task.mapRejection((s) => s.length);
let errLength = result.isErr ? result.error : 0;
console.log(errLength); // 5
```

#### Type Parameters

##### T

`T`

##### E

`E`

#### Returns

[`WithResolvers`](../type-aliases/WithResolvers.md)\<`T`, `E`\>

#### Inherited from

`Omit.withResolvers`

## Properties

### prototype

> **prototype**: `TaskImpl`\<`any`, `any`\>

#### Inherited from

`Omit.prototype`
