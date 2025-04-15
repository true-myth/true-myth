[True Myth](../../../index.md) / [task/delay](../index.md) / linear

# Function: linear()

> **linear**(`options`?): `Generator`\<`number`\>

Generate an infinite iterable of integers beginning with `base` and increasing
linearly (1, 2, 3, 4, 5, 5, 7, ...) until reaching `Number.MAX_SAFE_INTEGER`,
after which the generator will continue yielding `Number.MAX_SAFE_INTEGER`
forever.

By default, this increases by a step size of 1; you may optionally pass
`{ step: someOtherValue }` to change the step size.

If you pass a non-integral value as `base`, it will be rounded to the nearest
integral value using `Math.round`.

## Parameters

### options?

#### from?

`number`

Initial delay duration in milliseconds. Default is `0`.

#### withStepSize?

`number`

Step size by which to increase the value. Default is `1`.

> [!IMPORTANT]
> Setting this to a value less than `1` will cause the delay intervals to
> *decay* rather than *increase*. This is rarely what you want!

## Returns

`Generator`\<`number`\>
