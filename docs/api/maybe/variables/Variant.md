[True Myth](../../index.md) / [maybe](../index.md) / Variant

# Variable: Variant

> `const` **Variant**: `object`

Discriminant for the [`Just`](../interfaces/Just.md) and [`Nothing`](../interfaces/Nothing.md) type instances.

You can use the discriminant via the `variant` property of [`Maybe`](../classes/Maybe.md)
instances if you need to match explicitly on it.

## Type declaration

### Just

> `readonly` **Just**: `"Just"` = `'Just'`

### Nothing

> `readonly` **Nothing**: `"Nothing"` = `'Nothing'`
