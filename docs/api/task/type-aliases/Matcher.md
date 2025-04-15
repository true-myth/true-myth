[True Myth](../../index.md) / [task](../index.md) / Matcher

# Type Alias: Matcher\<T, E, A\>

> **Matcher**\<`T`, `E`, `A`\> = `object`

A lightweight object defining how to handle each outcome state of a
[`Task`](../classes/Task.md).

## Type Parameters

### T

`T`

### E

`E`

### A

`A`

## Properties

### Rejected()

> **Rejected**: (`reason`) => `A`

#### Parameters

##### reason

`E`

#### Returns

`A`

***

### Resolved()

> **Resolved**: (`value`) => `A`

#### Parameters

##### value

`T`

#### Returns

`A`
