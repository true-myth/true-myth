[True Myth](../../index.md) / [result](../index.md) / match

# Function: match()

## Call Signature

> **match**\<`T`, `E`, `A`\>(`matcher`, `result`): `A`

Performs the same basic functionality as [`unwrapOrElse`](unwrapOrElse.md), but instead
of simply unwrapping the value if it is [`Ok`](../interfaces/Ok.md) and applying a value to
generate the same default type if it is [`Err`](../interfaces/Err.md), lets you supply
functions which may transform the wrapped type if it is `Ok` or get a default
value for `Err`.

This is kind of like a poor man's version of pattern matching, which
JavaScript currently lacks.

Instead of code like this:

```ts
import Result, { isOk, match } from 'true-myth/result';

const logValue = (mightBeANumber: Result<number, string>) => {
  console.log(
    mightBeANumber.isOk
      ? mightBeANumber.value.toString()
      : `There was an error: ${unsafelyGetErr(mightBeANumber)}`
  );
};
```

...we can write code like this:

```ts
import Result, { match } from 'true-myth/result';

const logValue = (mightBeANumber: Result<number, string>) => {
  const value = match(
    {
      Ok: n => n.toString(),
      Err: e => `There was an error: ${e}`,
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

#### E

`E`

#### A

`A`

### Parameters

#### matcher

[`Matcher`](../type-aliases/Matcher.md)\<`T`, `E`, `A`\>

A lightweight object defining what to do in the case of each
               variant.

#### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

The `result` instance to check.

### Returns

`A`

## Call Signature

> **match**\<`T`, `E`, `A`\>(`matcher`): (`result`) => `A`

Performs the same basic functionality as [`unwrapOrElse`](unwrapOrElse.md), but instead
of simply unwrapping the value if it is [`Ok`](../interfaces/Ok.md) and applying a value to
generate the same default type if it is [`Err`](../interfaces/Err.md), lets you supply
functions which may transform the wrapped type if it is `Ok` or get a default
value for `Err`.

This is kind of like a poor man's version of pattern matching, which
JavaScript currently lacks.

Instead of code like this:

```ts
import Result, { isOk, match } from 'true-myth/result';

const logValue = (mightBeANumber: Result<number, string>) => {
  console.log(
    mightBeANumber.isOk
      ? mightBeANumber.value.toString()
      : `There was an error: ${unsafelyGetErr(mightBeANumber)}`
  );
};
```

...we can write code like this:

```ts
import Result, { match } from 'true-myth/result';

const logValue = (mightBeANumber: Result<number, string>) => {
  const value = match(
    {
      Ok: n => n.toString(),
      Err: e => `There was an error: ${e}`,
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

#### E

`E`

#### A

`A`

### Parameters

#### matcher

[`Matcher`](../type-aliases/Matcher.md)\<`T`, `E`, `A`\>

A lightweight object defining what to do in the case of each
               variant.

### Returns

`Function`

#### Parameters

##### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

#### Returns

`A`
