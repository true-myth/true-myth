[True Myth](../../index.md) / [task](../index.md) / reject

# Variable: reject()

> `const` **reject**: \<`T`, `E`\>() => [`Task`](../classes/Task.md)\<`T`, [`Unit`](../../unit/interfaces/Unit.md)\>\<`T`, `E`\>(`reason`) => [`Task`](../classes/Task.md)\<`T`, `E`\> = `Task.reject`

Standalone function version of [`Task.reject`](../interfaces/TaskConstructor.md#reject)

Construct a `Task` which is already rejected. Useful when you have an error
already, but need it to be available in an API which expects a `Task`.

## Type Parameters

### T

`T` = `never`

### E

`E` *extends* `object` = \{\}

## Returns

[`Task`](../classes/Task.md)\<`T`, [`Unit`](../../unit/interfaces/Unit.md)\>

Construct a `Task` which is already rejected. Useful when you have an error
already, but need it to be available in an API which expects a `Task`.

## Type Parameters

### T

`T` = `never`

### E

`E` = `unknown`

## Parameters

### reason

`E`

## Returns

[`Task`](../classes/Task.md)\<`T`, `E`\>
