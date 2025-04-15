[True Myth](../../index.md) / [task](../index.md) / timer

# Function: timer()

> **timer**(`ms`): [`Timer`](../type-aliases/Timer.md)

Create a [`Task`](../classes/Task.md) which will resolve to the number of milliseconds the
timer waited for that time elapses. (In other words, it safely wraps the
[`setTimeout`][setTimeout] function.)

[setTimeout]: https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout

This can be used as a “timeout” by calling it in conjunction any of the
[`Task`](../classes/Task.md) helpers like [`all`](all.md), [`race`](race.md), and so on. As
a convenience to use it as a timeout for another task, you can also combine it
with the [`Task.timeout`](../classes/Task.md#timeout) instance method or the standalone
[`timeout`](timeout.md) function.

Provides the requested duration of the timer in case it is useful for working
with multiple timers.

## Parameters

### ms

`number`

The number of milliseconds to wait before resolving the `Task`.

## Returns

[`Timer`](../type-aliases/Timer.md)

a Task which resolves to the passed-in number of milliseconds.
