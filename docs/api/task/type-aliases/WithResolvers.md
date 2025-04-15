[True Myth](../../index.md) / [task](../index.md) / WithResolvers

# Type Alias: WithResolvers\<T, E\>

> **WithResolvers**\<`T`, `E`\> = `object`

Type returned by calling [`Task.withResolvers`](../interfaces/TaskConstructor.md#withresolvers)

## Type Parameters

### T

`T`

### E

`E`

## Properties

### reject()

> **reject**: (`reason`) => `void`

#### Parameters

##### reason

`E`

#### Returns

`void`

***

### resolve()

> **resolve**: (`value`) => `void`

#### Parameters

##### value

`T`

#### Returns

`void`

***

### task

> **task**: [`Task`](../classes/Task.md)\<`T`, `E`\>
