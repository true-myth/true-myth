[True Myth](../../index.md) / [result](../index.md) / toString

# Function: toString()

> **toString**\<`T`, `E`\>(`result`): `string`

Create a `String` representation of a [`Result`](../classes/Result.md) instance.

An [`Ok`](../interfaces/Ok.md) instance will be `Ok(<representation of the value>)`, and an
[`Err`](../interfaces/Err.md) instance will be `Err(<representation of the error>)`, where
the representation of the value or error is simply the value or error's own
`toString` representation. For example:

              call                |         output
--------------------------------- | ----------------------
`toString(ok(42))`                | `Ok(42)`
`toString(ok([1, 2, 3]))`         | `Ok(1,2,3)`
`toString(ok({ an: 'object' }))`  | `Ok([object Object])`n
`toString(err(42))`               | `Err(42)`
`toString(err([1, 2, 3]))`        | `Err(1,2,3)`
`toString(err({ an: 'object' }))` | `Err([object Object])`

## Type Parameters

### T

`T`

The type of the wrapped value; its own `.toString` will be used
              to print the interior contents of the `Just` variant.

### E

`E`

## Parameters

### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

The value to convert to a string.

## Returns

`string`

The string representation of the `Maybe`.
