[True Myth](../../../index.md) / [task/delay](../index.md) / fixed

# Function: fixed()

> **fixed**(`options`?): `Generator`\<`number`\>

Generate an infinite iterable of the same integer value in milliseconds.

If you pass a non-integral value, like `{ at: 2.5 }`, it will be rounded to
the nearest integral value using `Math.round`, i.e. `3` in that case.

## Parameters

### options?

#### at

`number`

Delay duration in milliseconds. Default is `1` (immediate).

## Returns

`Generator`\<`number`\>
