[True Myth](../../index.md) / [result](../index.md) / Matcher

# Type Alias: Matcher\<T, E, A\>

> **Matcher**\<`T`, `E`, `A`\> = `object`

A lightweight object defining how to handle each variant of a
[`Result`](../classes/Result.md).

## Type Parameters

### T

`T`

The success type

### E

`E`

The error type

### A

`A`

The type resulting from calling [`match`](../functions/match.md) on a
  [`Result`](../classes/Result.md)

## Properties

### Err()

> **Err**: (`error`) => `A`

Transform an `E` into the resulting type `A`.

#### Parameters

##### error

`E`

#### Returns

`A`

***

### Ok()

> **Ok**: (`value`) => `A`

Transform a `T` into the resulting type `A`.

#### Parameters

##### value

`T`

#### Returns

`A`
