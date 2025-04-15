[True Myth](../../index.md) / [task](../index.md) / resolve

# Variable: resolve()

> `const` **resolve**: \<`T`, `E`\>() => [`Task`](../classes/Task.md)\<[`Unit`](../../unit/interfaces/Unit.md), `E`\>\<`T`, `E`\>(`value`) => [`Task`](../classes/Task.md)\<`T`, `E`\> = `Task.resolve`

Standalone function version of [`Task.resolve`](../interfaces/TaskConstructor.md#resolve)

Construct a `Task` which is already resolved. Useful when you have a value
already, but need it to be available in an API which expects a `Task`.

## Type Parameters

### T

`T` *extends* [`Unit`](../../unit/interfaces/Unit.md)

### E

`E` = `never`

## Returns

[`Task`](../classes/Task.md)\<[`Unit`](../../unit/interfaces/Unit.md), `E`\>

Construct a `Task` which is already resolved. Useful when you have a value
already, but need it to be available in an API which expects a `Task`.

## Type Parameters

### T

`T`

### E

`E` = `never`

## Parameters

### value

`T`

## Returns

[`Task`](../classes/Task.md)\<`T`, `E`\>
