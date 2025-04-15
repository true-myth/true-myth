[True Myth](../../index.md) / [task](../index.md) / TaskTypesFor

# Type Alias: TaskTypesFor\<A\>

> **TaskTypesFor**\<`A`\> = \[`{ -readonly [P in keyof A]: ResolvesTo<A[P]> }`, `{ -readonly [P in keyof A]: RejectsWith<A[P]> }`\]

## Type Parameters

### A

`A` *extends* readonly `AnyTask`[]
