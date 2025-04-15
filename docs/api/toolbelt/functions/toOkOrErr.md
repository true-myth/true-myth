[True Myth](../../index.md) / [toolbelt](../index.md) / toOkOrErr

# Function: toOkOrErr()

## Call Signature

> **toOkOrErr**\<`T`, `E`\>(`error`, `maybe`): [`Result`](../../result/classes/Result.md)\<`T`, `E`\>

Transform the [`Maybe`](../../maybe/classes/Maybe.md) into a [`Result`](../../result/classes/Result.md), using the wrapped
value as the [`Ok`](../../result/interfaces/Ok.md) value if the `Maybe` is [`Just`](../../maybe/interfaces/Just.md); otherwise using the supplied `error` value for [`Err`](../../result/interfaces/Err.md).

### Type Parameters

#### T

`T`

The wrapped value.

#### E

`E`

The error type to in the `Result`.

### Parameters

#### error

`E`

The error value to use if the `Maybe` is `Nothing`.

#### maybe

[`Maybe`](../../maybe/classes/Maybe.md)\<`T`\>

The `Maybe` instance to convert.

### Returns

[`Result`](../../result/classes/Result.md)\<`T`, `E`\>

A `Result` containing the value wrapped in `maybe` in an `Ok`, or
             `error` in an `Err`.

## Call Signature

> **toOkOrErr**\<`T`, `E`\>(`error`): (`maybe`) => [`Result`](../../result/classes/Result.md)\<`T`, `E`\>

Transform the [`Maybe`](../../maybe/classes/Maybe.md) into a [`Result`](../../result/classes/Result.md), using the wrapped
value as the [`Ok`](../../result/interfaces/Ok.md) value if the `Maybe` is [`Just`](../../maybe/interfaces/Just.md); otherwise using the supplied `error` value for [`Err`](../../result/interfaces/Err.md).

### Type Parameters

#### T

`T`

The wrapped value.

#### E

`E`

The error type to in the `Result`.

### Parameters

#### error

`E`

The error value to use if the `Maybe` is `Nothing`.

### Returns

`Function`

A `Result` containing the value wrapped in `maybe` in an `Ok`, or
             `error` in an `Err`.

#### Parameters

##### maybe

[`Maybe`](../../maybe/classes/Maybe.md)\<`T`\>

#### Returns

[`Result`](../../result/classes/Result.md)\<`T`, `E`\>
