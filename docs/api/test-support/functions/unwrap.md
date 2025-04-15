[True Myth](../../index.md) / [test-support](../index.md) / unwrap

# Function: unwrap()

## Call Signature

> **unwrap**\<`T`\>(`maybe`): `T`

Unwrap the contained [`Just`](../../maybe/interfaces/Just.md) value. Throws if `maybe` is [`Nothing`](../../maybe/interfaces/Nothing.md).

### Type Parameters

#### T

`T`

### Parameters

#### maybe

[`Maybe`](../../maybe/classes/Maybe.md)\<`T`\>

### Returns

`T`

## Call Signature

> **unwrap**\<`T`, `E`\>(`result`): `T`

Unwrap the contained [`Ok`](../../result/interfaces/Ok.md) value. Throws if `result` is an [`Err`](../../result/interfaces/Err.md).

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### result

[`Result`](../../result/classes/Result.md)\<`T`, `E`\>

### Returns

`T`
