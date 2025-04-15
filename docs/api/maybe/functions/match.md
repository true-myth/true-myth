[True Myth](../../index.md) / [maybe](../index.md) / match

# Function: match()

## Call Signature

> **match**\<`T`, `A`\>(`matcher`, `maybe`): `A`

Performs the same basic functionality as [`unwrapOrElse`](unwrapOrElse.md), but instead
of simply unwrapping the value if it is [`Just`](../interfaces/Just.md) and applying a value
to generate the same default type if it is [`Nothing`](../interfaces/Nothing.md), lets you
supply functions which may transform the wrapped type if it is `Just` or get a
default value for `Nothing`.

This is kind of like a poor man's version of pattern matching, which
JavaScript currently lacks.

Instead of code like this:

```ts
import Maybe from 'true-myth/maybe';

const logValue = (mightBeANumber: Maybe<number>) => {
  const valueToLog = Maybe.mightBeANumber.isJust
    ? mightBeANumber.value.toString()
    : 'Nothing to log.';

  console.log(valueToLog);
};
```

...we can write code like this:

```ts
import { match } from 'true-myth/maybe';

const logValue = (mightBeANumber: Maybe<number>) => {
  const value = match(
    {
      Just: n => n.toString(),
      Nothing: () => 'Nothing to log.',
    },
    mightBeANumber
  );

  console.log(value);
};
```

This is slightly longer to write, but clearer: the more complex the resulting
expression, the hairer it is to understand the ternary. Thus, this is
especially convenient for times when there is a complex result, e.g. when
rendering part of a React component inline in JSX/TSX.

### Type Parameters

#### T

`T`

#### A

`A`

### Parameters

#### matcher

[`Matcher`](../type-aliases/Matcher.md)\<`T`, `A`\>

A lightweight object defining what to do in the case of each
               variant.

#### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

The `maybe` instance to check.

### Returns

`A`

## Call Signature

> **match**\<`T`, `A`\>(`matcher`): (`m`) => `A`

Performs the same basic functionality as [`unwrapOrElse`](unwrapOrElse.md), but instead
of simply unwrapping the value if it is [`Just`](../interfaces/Just.md) and applying a value
to generate the same default type if it is [`Nothing`](../interfaces/Nothing.md), lets you
supply functions which may transform the wrapped type if it is `Just` or get a
default value for `Nothing`.

This is kind of like a poor man's version of pattern matching, which
JavaScript currently lacks.

Instead of code like this:

```ts
import Maybe from 'true-myth/maybe';

const logValue = (mightBeANumber: Maybe<number>) => {
  const valueToLog = Maybe.mightBeANumber.isJust
    ? mightBeANumber.value.toString()
    : 'Nothing to log.';

  console.log(valueToLog);
};
```

...we can write code like this:

```ts
import { match } from 'true-myth/maybe';

const logValue = (mightBeANumber: Maybe<number>) => {
  const value = match(
    {
      Just: n => n.toString(),
      Nothing: () => 'Nothing to log.',
    },
    mightBeANumber
  );

  console.log(value);
};
```

This is slightly longer to write, but clearer: the more complex the resulting
expression, the hairer it is to understand the ternary. Thus, this is
especially convenient for times when there is a complex result, e.g. when
rendering part of a React component inline in JSX/TSX.

### Type Parameters

#### T

`T`

#### A

`A`

### Parameters

#### matcher

[`Matcher`](../type-aliases/Matcher.md)\<`T`, `A`\>

A lightweight object defining what to do in the case of each
               variant.

### Returns

`Function`

#### Parameters

##### m

[`Maybe`](../classes/Maybe.md)\<`T`\>

#### Returns

`A`
