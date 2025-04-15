[True Myth](../../index.md) / [task](../index.md) / orElse

# Function: orElse()

## Call Signature

> **orElse**\<`T`, `E`, `F`, `U`\>(`elseFn`): (`task`) => [`Task`](../classes/Task.md)\<`T` \| `U`, `F`\>

Auto-curried, standalone function form of
[`Task.prototype.orElse`](../classes/Task.md#orelse).

> [!TIP]
> The auto-curried version is provided for parity with the similar functions
> that the `Maybe` and `Result` modules provide. However, like `Result`, you
> will likely find that this form is somewhat difficult to use, because
> TypeScript’s type inference does not support it well: you will tend to end
> up with an awful lot of `unknown` unless you write the type parameters
> explicitly at the call site.
>
> The non-curried form will not have that problem, so you should prefer it.

### Type Parameters

#### T

`T`

The type of the value when the `Task` resolves successfully.

#### E

`E`

The type of the rejection reason when the `Task` rejects.

#### F

`F`

#### U

`U` = `T`

### Parameters

#### elseFn

(`reason`) => [`Task`](../classes/Task.md)\<`U`, `F`\>

### Returns

`Function`

#### Parameters

##### task

[`Task`](../classes/Task.md)\<`T`, `E`\>

#### Returns

[`Task`](../classes/Task.md)\<`T` \| `U`, `F`\>

## Call Signature

> **orElse**\<`T`, `E`, `R`\>(`elseFn`): (`task`) => [`Task`](../classes/Task.md)\<`T` \| `ResolvesTo`\<`R`\>, `RejectsWith`\<`R`\>\>

Auto-curried, standalone function form of
[`Task.prototype.orElse`](../classes/Task.md#orelse).

> [!TIP]
> The auto-curried version is provided for parity with the similar functions
> that the `Maybe` and `Result` modules provide. However, like `Result`, you
> will likely find that this form is somewhat difficult to use, because
> TypeScript’s type inference does not support it well: you will tend to end
> up with an awful lot of `unknown` unless you write the type parameters
> explicitly at the call site.
>
> The non-curried form will not have that problem, so you should prefer it.

### Type Parameters

#### T

`T`

The type of the value when the `Task` resolves successfully.

#### E

`E`

The type of the rejection reason when the `Task` rejects.

#### R

`R` *extends* `AnyTask`

### Parameters

#### elseFn

(`reason`) => `R`

### Returns

`Function`

#### Parameters

##### task

[`Task`](../classes/Task.md)\<`T`, `E`\>

#### Returns

[`Task`](../classes/Task.md)\<`T` \| `ResolvesTo`\<`R`\>, `RejectsWith`\<`R`\>\>

## Call Signature

> **orElse**\<`T`, `E`, `F`, `U`\>(`elseFn`, `task`): [`Task`](../classes/Task.md)\<`T` \| `U`, `F`\>

Auto-curried, standalone function form of
[`Task.prototype.orElse`](../classes/Task.md#orelse).

> [!TIP]
> The auto-curried version is provided for parity with the similar functions
> that the `Maybe` and `Result` modules provide. However, like `Result`, you
> will likely find that this form is somewhat difficult to use, because
> TypeScript’s type inference does not support it well: you will tend to end
> up with an awful lot of `unknown` unless you write the type parameters
> explicitly at the call site.
>
> The non-curried form will not have that problem, so you should prefer it.

### Type Parameters

#### T

`T`

The type of the value when the `Task` resolves successfully.

#### E

`E`

The type of the rejection reason when the `Task` rejects.

#### F

`F`

#### U

`U` = `T`

### Parameters

#### elseFn

(`reason`) => [`Task`](../classes/Task.md)\<`U`, `F`\>

#### task

[`Task`](../classes/Task.md)\<`T`, `E`\>

### Returns

[`Task`](../classes/Task.md)\<`T` \| `U`, `F`\>

## Call Signature

> **orElse**\<`T`, `E`, `R`\>(`elseFn`, `task`): [`Task`](../classes/Task.md)\<`T` \| `ResolvesTo`\<`R`\>, `RejectsWith`\<`R`\>\>

Auto-curried, standalone function form of
[`Task.prototype.orElse`](../classes/Task.md#orelse).

> [!TIP]
> The auto-curried version is provided for parity with the similar functions
> that the `Maybe` and `Result` modules provide. However, like `Result`, you
> will likely find that this form is somewhat difficult to use, because
> TypeScript’s type inference does not support it well: you will tend to end
> up with an awful lot of `unknown` unless you write the type parameters
> explicitly at the call site.
>
> The non-curried form will not have that problem, so you should prefer it.

### Type Parameters

#### T

`T`

The type of the value when the `Task` resolves successfully.

#### E

`E`

The type of the rejection reason when the `Task` rejects.

#### R

`R` *extends* `AnyTask`

### Parameters

#### elseFn

(`reason`) => `R`

#### task

[`Task`](../classes/Task.md)\<`T`, `E`\>

### Returns

[`Task`](../classes/Task.md)\<`T` \| `ResolvesTo`\<`R`\>, `RejectsWith`\<`R`\>\>
