[True Myth](../../index.md) / [task](../index.md) / andThen

# Function: andThen()

## Call Signature

> **andThen**\<`T`, `E`, `R`\>(`thenFn`): (`task`) => [`Task`](../classes/Task.md)\<`ResolvesTo`\<`R`\>, `E` \| `RejectsWith`\<`R`\>\>

Auto-curried, standalone function form of
[`Task.prototype.andThen`](../classes/Task.md#andthen).

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

#### thenFn

(`t`) => `R`

### Returns

`Function`

#### Parameters

##### task

[`Task`](../classes/Task.md)\<`T`, `E`\>

#### Returns

[`Task`](../classes/Task.md)\<`ResolvesTo`\<`R`\>, `E` \| `RejectsWith`\<`R`\>\>

## Call Signature

> **andThen**\<`T`, `U`, `E`\>(`thenFn`): (`task`) => [`Task`](../classes/Task.md)\<`U`, `E`\>

Auto-curried, standalone function form of
[`Task.prototype.andThen`](../classes/Task.md#andthen).

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

#### U

`U`

#### E

`E`

The type of the rejection reason when the `Task` rejects.

### Parameters

#### thenFn

(`t`) => `U`

### Returns

`Function`

#### Parameters

##### task

[`Task`](../classes/Task.md)\<`T`, `E`\>

#### Returns

[`Task`](../classes/Task.md)\<`U`, `E`\>

## Call Signature

> **andThen**\<`T`, `E`, `R`\>(`thenFn`, `task`): [`Task`](../classes/Task.md)\<`ResolvesTo`\<`R`\>, `E` \| `RejectsWith`\<`R`\>\>

Auto-curried, standalone function form of
[`Task.prototype.andThen`](../classes/Task.md#andthen).

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

#### thenFn

(`t`) => `R`

#### task

[`Task`](../classes/Task.md)\<`T`, `E`\>

### Returns

[`Task`](../classes/Task.md)\<`ResolvesTo`\<`R`\>, `E` \| `RejectsWith`\<`R`\>\>

## Call Signature

> **andThen**\<`T`, `U`, `E`\>(`thenFn`, `task`): [`Task`](../classes/Task.md)\<`U`, `E`\>

Auto-curried, standalone function form of
[`Task.prototype.andThen`](../classes/Task.md#andthen).

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

#### U

`U`

#### E

`E`

The type of the rejection reason when the `Task` rejects.

### Parameters

#### thenFn

(`t`) => [`Task`](../classes/Task.md)\<`U`, `E`\>

#### task

[`Task`](../classes/Task.md)\<`T`, `E`\>

### Returns

[`Task`](../classes/Task.md)\<`U`, `E`\>
