[True Myth](../../../index.md) / [task/delay](../index.md) / jitter

# Function: jitter()

> **jitter**(`n`): `number`

Apply fully random jitter proportional to the number passed in. The resulting
value will never be larger than 2×n, and never less than 0.

This is useful for making sure your retries generally follow a given
[`Strategy`](../interfaces/Strategy.md), but if multiple tasks start at the same time, they do
not all retry at exactly the same time.

## Parameters

### n

`number`

The value to apply random jitter to.

## Returns

`number`
