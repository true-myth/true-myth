[True Myth](../../index.md) / [result](../index.md) / ok

# Variable: ok()

> `const` **ok**: () => [`Result`](../classes/Result.md)\<[`Unit`](../../unit/interfaces/Unit.md), `never`\>\<`T`, `E`\>(`value`) => [`Result`](../classes/Result.md)\<`T`, `E`\> = `ResultImpl.ok`

Create an instance of [`Ok`](../interfaces/Ok.md).

If you need to create an instance with a specific type (as you do whenever you
are not constructing immediately for a function return or as an argument to a
function), you can use a type parameter:

```ts
const yayNumber = Result.ok<number, string>(12);
```

Note: passing nothing, or passing `null` or `undefined` explicitly, will
produce a `Result<Unit, E>`, rather than producing the nonsensical and in
practice quite annoying `Result<null, string>` etc. See [`Unit`](../../unit/variables/Unit.md) for
more.

```ts
const normalResult = Result.ok<number, string>(42);
const explicitUnit = Result.ok<Unit, string>(Unit);
const implicitUnit = Result.ok<Unit, string>();
```

In the context of an immediate function return, or an arrow function with a
single expression value, you do not have to specify the types, so this can be
quite convenient.

```ts
type SomeData = {
  //...
};

const isValid = (data: SomeData): boolean => {
  // true or false...
}

const arrowValidate = (data: SomeData): Result<Unit, string> =>
  isValid(data) ? Result.ok() : Result.err('something was wrong!');

function fnValidate(data: someData): Result<Unit, string> {
  return isValid(data) ? Result.ok() : Result.err('something was wrong');
}
```

Create an instance of [`Ok`](../interfaces/Ok.md).

Note that you may explicitly pass [`Unit`](../../unit/variables/Unit.md) to the `ok`
constructor to create a `Result<Unit, E>`. However, you may *not* call the
`ok` constructor with `null` or `undefined` to get that result (the type
system won't allow you to construct it that way). Instead, for convenience,
you can simply call `` `Result.ok()` ``, which will construct the
type correctly.

## Returns

[`Result`](../classes/Result.md)\<[`Unit`](../../unit/interfaces/Unit.md), `never`\>

## Type Parameters

### T

`T`

### E

`E` = `never`

## Parameters

### value

`T`

The value to wrap in an `Ok`.

## Returns

[`Result`](../classes/Result.md)\<`T`, `E`\>

## Template

The type of the item contained in the `Result`.

## Param

The value to wrap in a `Result.Ok`.
