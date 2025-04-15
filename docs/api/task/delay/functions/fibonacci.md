[True Myth](../../../index.md) / [task/delay](../index.md) / fibonacci

# Function: fibonacci()

> **fibonacci**(`options`?): `Generator`\<`number`\>

Generate an infinite iterable of integers beginning with `base` and
increasing as a Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, ...) until reaching
`Number.MAX_SAFE_INTEGER`, after which the generator will continue yielding
`Number.MAX_SAFE_INTEGER` forever.

If you pass a non-integral value as the `from` property on the configuration
argument, it will be rounded to the nearest integral value using `Math.round`.

## Parameters

### options?

#### from

`number`

Initial delay duration in milliseconds. Default is `1`.

## Returns

`Generator`\<`number`\>
