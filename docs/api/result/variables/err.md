[True Myth](../../index.md) / [result](../index.md) / err

# Variable: err()

> `const` **err**: \<`T`, `E`\>() => [`Result`](../classes/Result.md)\<`T`, [`Unit`](../../unit/interfaces/Unit.md)\>\<`T`, `E`\>(`error`) => [`Result`](../classes/Result.md)\<`T`, `E`\> = `ResultImpl.err`

Create an instance of [`Err`](../interfaces/Err.md).

If you need to create an instance with a specific type (as you do whenever you
are not constructing immediately for a function return or as an argument to a
function), you can use a type parameter:

```ts
const notString = Result.err<number, string>('something went wrong');
```

Note: passing nothing, or passing `null` or `undefined` explicitly, will
produce a `Result<T, Unit>`, rather than producing the nonsensical and in
practice quite annoying `Result<null, string>` etc. See [`Unit`](../../unit/variables/Unit.md) for
more.

```ts
const normalResult = Result.err<number, string>('oh no');
const explicitUnit = Result.err<number, Unit>(Unit);
const implicitUnit = Result.err<number, Unit>();
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

const arrowValidate = (data: SomeData): Result<number, Unit> =>
  isValid(data) ? Result.ok(42) : Result.err();

function fnValidate(data: someData): Result<number, Unit> {
  return isValid(data) ? Result.ok(42) : Result.err();
}
```

Create an instance of [`Err`](../interfaces/Err.md).

```ts
const anErr = Result.err('alas, failure');
```

## Type Parameters

### T

`T` = `never`

### E

`E` = `unknown`

## Returns

[`Result`](../classes/Result.md)\<`T`, [`Unit`](../../unit/interfaces/Unit.md)\>

Create an instance of [`Err`](../interfaces/Err.md).

```ts
const anErr = Result.err('alas, failure');
```

## Type Parameters

### T

`T` = `never`

### E

`E` = `unknown`

## Parameters

### error

`E`

The value to wrap in an `Err`.

## Returns

[`Result`](../classes/Result.md)\<`T`, `E`\>

## Template

The type of the item contained in the `Result`.

## Param

The error value to wrap in a `Result.Err`.
