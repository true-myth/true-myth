[True Myth](../../index.md) / [task](../index.md) / or

# Function: or()

## Call Signature

> **or**\<`U`, `F`, `T`, `E`\>(`other`): (`task`) => [`Task`](../classes/Task.md)\<`U` \| `T`, `F`\>

Auto-curried, standalone function form of
[`Task.prototype.or`](../classes/Task.md#or).

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

#### U

`U`

#### F

`F`

#### T

`T`

The type of the value when the `Task` resolves successfully.

#### E

`E`

The type of the rejection reason when the `Task` rejects.

### Parameters

#### other

[`Task`](../classes/Task.md)\<`U`, `F`\>

### Returns

`Function`

#### Parameters

##### task

[`Task`](../classes/Task.md)\<`T`, `E`\>

#### Returns

[`Task`](../classes/Task.md)\<`U` \| `T`, `F`\>

## Call Signature

> **or**\<`U`, `F`, `T`, `E`\>(`other`, `task`): [`Task`](../classes/Task.md)\<`U` \| `T`, `F`\>

Auto-curried, standalone function form of
[`Task.prototype.or`](../classes/Task.md#or).

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

#### U

`U`

#### F

`F`

#### T

`T`

The type of the value when the `Task` resolves successfully.

#### E

`E`

The type of the rejection reason when the `Task` rejects.

### Parameters

#### other

[`Task`](../classes/Task.md)\<`U`, `F`\>

#### task

[`Task`](../classes/Task.md)\<`T`, `E`\>

### Returns

[`Task`](../classes/Task.md)\<`U` \| `T`, `F`\>
