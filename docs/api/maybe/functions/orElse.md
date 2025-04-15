[True Myth](../../index.md) / [maybe](../index.md) / orElse

# Function: orElse()

## Call Signature

> **orElse**\<`T`, `R`\>(`elseFn`, `maybe`): [`Maybe`](../classes/Maybe.md)\<`ValueFor`\<`R`\>\>

Like [`or`](or.md), but using a function to construct the alternative
[`Maybe`](../classes/Maybe.md).

Sometimes you need to perform an operation using other data in the environment
to construct the fallback value. In these situations, you can pass a function
(which may be a closure) as the `elseFn` to generate the fallback `Maybe<T>`.

Useful for transforming empty scenarios based on values in context.

### Type Parameters

#### T

`T`

The type of the wrapped value.

#### R

`R` *extends* `AnyMaybe`

### Parameters

#### elseFn

() => `R`

The function to apply if `maybe` is `Nothing`

#### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

The `maybe` to use if it is `Just`.

### Returns

[`Maybe`](../classes/Maybe.md)\<`ValueFor`\<`R`\>\>

The `maybe` if it is `Just`, or the `Maybe` returned by `elseFn`
              if the `maybe` is `Nothing`.

## Call Signature

> **orElse**\<`T`, `R`\>(`elseFn`): (`maybe`) => [`Maybe`](../classes/Maybe.md)\<`ValueFor`\<`R`\>\>

Like [`or`](or.md), but using a function to construct the alternative
[`Maybe`](../classes/Maybe.md).

Sometimes you need to perform an operation using other data in the environment
to construct the fallback value. In these situations, you can pass a function
(which may be a closure) as the `elseFn` to generate the fallback `Maybe<T>`.

Useful for transforming empty scenarios based on values in context.

### Type Parameters

#### T

`T`

The type of the wrapped value.

#### R

`R` *extends* `AnyMaybe`

### Parameters

#### elseFn

() => `R`

The function to apply if `maybe` is `Nothing`

### Returns

`Function`

The `maybe` if it is `Just`, or the `Maybe` returned by `elseFn`
              if the `maybe` is `Nothing`.

#### Parameters

##### maybe

[`Maybe`](../classes/Maybe.md)\<`T`\>

#### Returns

[`Maybe`](../classes/Maybe.md)\<`ValueFor`\<`R`\>\>
