[True Myth](../../index.md) / [result](../index.md) / ResultConstructor

# Interface: ResultConstructor

The public interface for the [`Result`](../classes/Result.md) class *as a value*: the static
constructors `ok` and `err` produce a `Result` with that variant.

## Properties

### err()

> **err**: \<`T`, `E`\>() => [`Result`](../classes/Result.md)\<`T`, [`Unit`](../../unit/interfaces/Unit.md)\>\<`T`, `E`\>(`error`) => [`Result`](../classes/Result.md)\<`T`, `E`\>

Create an instance of [`Err`](Err.md).

```ts
const anErr = Result.err('alas, failure');
```

#### Type Parameters

##### T

`T` = `never`

##### E

`E` = `unknown`

#### Returns

[`Result`](../classes/Result.md)\<`T`, [`Unit`](../../unit/interfaces/Unit.md)\>

Create an instance of [`Err`](Err.md).

```ts
const anErr = Result.err('alas, failure');
```

#### Type Parameters

##### T

`T` = `never`

##### E

`E` = `unknown`

#### Parameters

##### error

`E`

The value to wrap in an `Err`.

#### Returns

[`Result`](../classes/Result.md)\<`T`, `E`\>

***

### ok()

> **ok**: () => [`Result`](../classes/Result.md)\<[`Unit`](../../unit/interfaces/Unit.md), `never`\>\<`T`, `E`\>(`value`) => [`Result`](../classes/Result.md)\<`T`, `E`\>

Create an instance of [`Ok`](Ok.md).

Note that you may explicitly pass [`Unit`](../../unit/variables/Unit.md) to the [`ok`](../variables/ok.md)
constructor to create a `Result<Unit, E>`. However, you may *not* call the
`ok` constructor with `null` or `undefined` to get that result (the type
system won't allow you to construct it that way). Instead, for convenience,
you can simply call [`` `Result.ok()` ``](../variables/ok.md), which will construct the
type correctly.

#### Returns

[`Result`](../classes/Result.md)\<[`Unit`](../../unit/interfaces/Unit.md), `never`\>

#### Type Parameters

##### T

`T`

##### E

`E` = `never`

#### Parameters

##### value

`T`

The value to wrap in an `Ok`.

#### Returns

[`Result`](../classes/Result.md)\<`T`, `E`\>
