[True Myth](../../index.md) / [result](../index.md) / orElse

# Function: orElse()

## Call Signature

> **orElse**\<`T`, `E`, `R`\>(`elseFn`, `result`): [`Result`](../classes/Result.md)\<`T` \| `OkFor`\<`R`\>, `ErrFor`\<`R`\>\>

Like [`or`](or.md), but using a function to construct the alternative
[`Result`](../classes/Result.md).

Sometimes you need to perform an operation using the `error` value (and
possibly other data in the environment) to construct the fallback value. In
these situations, you can pass a function (which may be a closure) as the
`elseFn` to generate the fallback `Result<T>`. It can then transform the data
in the `Err` to something usable as an [`Ok`](../interfaces/Ok.md), or generate a new
[`Err`](../interfaces/Err.md) instance as appropriate.

Useful for transforming failures to usable data.

### Type Parameters

#### T

`T`

#### E

`E`

#### R

`R` *extends* `AnyResult`

### Parameters

#### elseFn

(`err`) => `R`

The function to apply to the contents of the `Err` if `result`
              is an `Err`, to create a new `Result`.

#### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

The `Result` to use if it is an `Ok`.

### Returns

[`Result`](../classes/Result.md)\<`T` \| `OkFor`\<`R`\>, `ErrFor`\<`R`\>\>

The `result` if it is `Ok`, or the `Result` returned by `elseFn`
              if `result` is an `Err.

## Call Signature

> **orElse**\<`T`, `E`, `R`\>(`elseFn`): (`result`) => [`Result`](../classes/Result.md)\<`T` \| `OkFor`\<`R`\>, `ErrFor`\<`R`\>\>

Like [`or`](or.md), but using a function to construct the alternative
[`Result`](../classes/Result.md).

Sometimes you need to perform an operation using the `error` value (and
possibly other data in the environment) to construct the fallback value. In
these situations, you can pass a function (which may be a closure) as the
`elseFn` to generate the fallback `Result<T>`. It can then transform the data
in the `Err` to something usable as an [`Ok`](../interfaces/Ok.md), or generate a new
[`Err`](../interfaces/Err.md) instance as appropriate.

Useful for transforming failures to usable data.

### Type Parameters

#### T

`T`

#### E

`E`

#### R

`R` *extends* `AnyResult`

### Parameters

#### elseFn

(`err`) => `R`

The function to apply to the contents of the `Err` if `result`
              is an `Err`, to create a new `Result`.

### Returns

`Function`

The `result` if it is `Ok`, or the `Result` returned by `elseFn`
              if `result` is an `Err.

#### Parameters

##### result

[`Result`](../classes/Result.md)\<`T`, `E`\>

#### Returns

[`Result`](../classes/Result.md)\<`T` \| `OkFor`\<`R`\>, `ErrFor`\<`R`\>\>
