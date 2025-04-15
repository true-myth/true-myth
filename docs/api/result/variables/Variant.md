[True Myth](../../index.md) / [result](../index.md) / Variant

# Variable: Variant

> `const` **Variant**: `object`

Discriminant for [`Ok`](../interfaces/Ok.md) and [`Err`](../interfaces/Err.md) variants of the
[`Result`](../classes/Result.md) type.

You can use the discriminant via the `variant` property of `Result` instances
if you need to match explicitly on it.

## Type declaration

### Err

> `readonly` **Err**: `"Err"` = `'Err'`

### Ok

> `readonly` **Ok**: `"Ok"` = `'Ok'`
