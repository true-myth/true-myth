[True Myth](../../index.md) / [maybe](../index.md) / unwrapOr

# Function: unwrapOr()

## Call Signature

> **unwrapOr**\<`T`, `U`\>(`defaultValue`, `maybe`): `T` \| `U`

Safely get the value out of a [`Maybe`](../classes/Maybe.md).

Returns the content of a [`Just`](../interfaces/Just.md) or `defaultValue` if
[`Nothing`](../interfaces/Nothing.md). This is the recommended way to get a value out of a
`Maybe` most of the time.

```ts
import Maybe from 'true-myth/maybe';

const notAString = Maybe.nothing<string>();
const isAString = Maybe.just('look ma! some characters!');

console.log(Maybe.unwrapOr('<empty>', notAString));  // "<empty>"
console.log(Maybe.unwrapOr('<empty>', isAString));  // "look ma! some characters!"
```

### Type Parameters

#### T

`T`

The type of the wrapped value.

#### U

`U`

### Parameters

#### defaultValue

`U`

The value to return if `maybe` is a `Nothing`.

#### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

The `Maybe` instance to unwrap if it is a `Just`.

### Returns

`T` \| `U`

The content of `maybe` if it is a `Just`, otherwise
                    `defaultValue`.

## Call Signature

> **unwrapOr**\<`T`, `U`\>(`defaultValue`): (`maybe`) => `T` \| `U`

Safely get the value out of a [`Maybe`](../classes/Maybe.md).

Returns the content of a [`Just`](../interfaces/Just.md) or `defaultValue` if
[`Nothing`](../interfaces/Nothing.md). This is the recommended way to get a value out of a
`Maybe` most of the time.

```ts
import Maybe from 'true-myth/maybe';

const notAString = Maybe.nothing<string>();
const isAString = Maybe.just('look ma! some characters!');

console.log(Maybe.unwrapOr('<empty>', notAString));  // "<empty>"
console.log(Maybe.unwrapOr('<empty>', isAString));  // "look ma! some characters!"
```

### Type Parameters

#### T

`T`

The type of the wrapped value.

#### U

`U`

### Parameters

#### defaultValue

`U`

The value to return if `maybe` is a `Nothing`.

### Returns

`Function`

The content of `maybe` if it is a `Just`, otherwise
                    `defaultValue`.

#### Parameters

##### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

#### Returns

`T` \| `U`
