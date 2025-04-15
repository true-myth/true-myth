[True Myth](../../index.md) / [unit](../index.md) / Unit

# Variable: Unit

> `const` **Unit**: [`Unit`](../interfaces/Unit.md)

The `Unit` type exists for the cases where you want a type-safe equivalent of
`undefined` or `null`. It's a concrete instance, which won't blow up on you,
and you can safely use it with e.g. `Result` without being concerned that
you'll accidentally introduce `null` or `undefined` back into your
application.

Equivalent to `()` or "unit" in many functional or functional-influenced
languages.
