[True Myth](../../../index.md) / [task/delay](../index.md) / exponential

# Function: exponential()

> **exponential**(`options`?): `Generator`\<`number`\>

Generate an infinite iterable of integers beginning with `base` and increasing
exponentially until reaching `Number.MAX_SAFE_INTEGER`, after which the
generator will continue yielding `Number.MAX_SAFE_INTEGER` forever.

By default, this increases exponentially by a factor of 2; you may optionally
pass `{ factor: someOtherValue }` to change the exponentiation factor.

If you pass a non-integral value as `base`, it will be rounded to the nearest
integral value using `Math.round`.

## Parameters

### options?

#### from?

`number`

Initial delay duration in milliseconds. Default is `1`.

#### withFactor?

`number`

Exponentiation factor. Default is `2`.

> [!IMPORTANT]
> Setting this to a value less than `1` will cause the delay intervals to
> *decay* rather than *increase*. This is rarely what you want!

## Returns

`Generator`\<`number`\>
