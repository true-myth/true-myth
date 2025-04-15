[True Myth](../../index.md) / [toolbelt](../index.md) / fromMaybe

# Function: fromMaybe()

## Call Signature

> **fromMaybe**\<`T`, `E`\>(`errValue`, `maybe`): [`Result`](../../result/classes/Result.md)\<`T`, `E`\>

Transform a [`Maybe`](../../maybe/classes/Maybe.md) into a [`Result`](../../result/classes/Result.md).

If the `Maybe` is a [`Just`](../../maybe/interfaces/Just.md), its value will be wrapped
in the [`Ok`](../../result/interfaces/Ok.md) variant; if it is a [`Nothing`](../../maybe/interfaces/Nothing.md), the `errValue` will be wrapped in the [`Err`](../../result/interfaces/Err.md) variant.

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### errValue

`E`

A value to wrap in an `Err` if `maybe` is a `Nothing`.

#### maybe

[`Maybe`](../../maybe/classes/Maybe.md)\<`T`\>

The `Maybe` to convert to a `Result`.

### Returns

[`Result`](../../result/classes/Result.md)\<`T`, `E`\>

## Call Signature

> **fromMaybe**\<`T`, `E`\>(`errValue`): (`maybe`) => [`Result`](../../result/classes/Result.md)\<`T`, `E`\>

Transform a [`Maybe`](../../maybe/classes/Maybe.md) into a [`Result`](../../result/classes/Result.md).

If the `Maybe` is a [`Just`](../../maybe/interfaces/Just.md), its value will be wrapped
in the [`Ok`](../../result/interfaces/Ok.md) variant; if it is a [`Nothing`](../../maybe/interfaces/Nothing.md), the `errValue` will be wrapped in the [`Err`](../../result/interfaces/Err.md) variant.

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### errValue

`E`

A value to wrap in an `Err` if `maybe` is a `Nothing`.

### Returns

`Function`

#### Parameters

##### maybe

[`Maybe`](../../maybe/classes/Maybe.md)\<`T`\>

#### Returns

[`Result`](../../result/classes/Result.md)\<`T`, `E`\>
