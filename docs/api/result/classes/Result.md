[True Myth](../../index.md) / [result](../index.md) / Result

# Class: Result

A `Result` represents success ([`Ok`](../interfaces/Ok.md)) or failure ([`Err`](../interfaces/Err.md)).

The behavior of this type is checked by TypeScript at compile time, and bears
no runtime overhead other than the very small cost of the container object.

## Properties

### err()

> `static` **err**: \<`T`, `E`\>() => `Result`\<`T`, [`Unit`](../../unit/interfaces/Unit.md)\>\<`T`, `E`\>(`error`) => `Result`\<`T`, `E`\>

Create an instance of [`Err`](../interfaces/Err.md).

```ts
const anErr = Result.err('alas, failure');
```

#### Type Parameters

##### T

`T` = `never`

##### E

`E` = `unknown`

#### Returns

`Result`\<`T`, [`Unit`](../../unit/interfaces/Unit.md)\>

Create an instance of [`Err`](../interfaces/Err.md).

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

`Result`\<`T`, `E`\>

***

### ok()

> `static` **ok**: () => `Result`\<[`Unit`](../../unit/interfaces/Unit.md), `never`\>\<`T`, `E`\>(`value`) => `Result`\<`T`, `E`\>

Create an instance of [`Ok`](../interfaces/Ok.md).

Note that you may explicitly pass [`Unit`](../../unit/variables/Unit.md) to the [`ok`](../variables/ok.md)
constructor to create a `Result<Unit, E>`. However, you may *not* call the
`ok` constructor with `null` or `undefined` to get that result (the type
system won't allow you to construct it that way). Instead, for convenience,
you can simply call [`` `Result.ok()` ``](../variables/ok.md), which will construct the
type correctly.

#### Returns

`Result`\<[`Unit`](../../unit/interfaces/Unit.md), `never`\>

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

`Result`\<`T`, `E`\>
