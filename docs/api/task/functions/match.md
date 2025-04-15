[True Myth](../../index.md) / [task](../index.md) / match

# Function: match()

## Call Signature

> **match**\<`T`, `E`, `A`\>(`matcher`): (`task`) => `Promise`\<`A`\>

Auto-curried, standalone function form of
[`Task.prototype.match`](../classes/Task.md#match).

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

#### A

`A`

### Parameters

#### matcher

[`Matcher`](../type-aliases/Matcher.md)\<`T`, `E`, `A`\>

### Returns

`Function`

#### Parameters

##### task

[`Task`](../classes/Task.md)\<`T`, `E`\>

#### Returns

`Promise`\<`A`\>

## Call Signature

> **match**\<`T`, `E`, `A`\>(`matcher`, `task`): `Promise`\<`A`\>

Auto-curried, standalone function form of
[`Task.prototype.match`](../classes/Task.md#match).

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

#### A

`A`

### Parameters

#### matcher

[`Matcher`](../type-aliases/Matcher.md)\<`T`, `E`, `A`\>

#### task

[`Task`](../classes/Task.md)\<`T`, `E`\>

### Returns

`Promise`\<`A`\>
