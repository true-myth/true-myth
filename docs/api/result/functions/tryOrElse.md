[True Myth](../../index.md) / [result](../index.md) / tryOrElse

# Function: tryOrElse()

## Call Signature

> **tryOrElse**\<`T`, `E`\>(`onError`, `callback`): [`Result`](../classes/Result.md)\<`T`, `E`\>

Execute the provided callback, wrapping the return value in [`Ok`](../interfaces/Ok.md).
If there is an exception, return a [`Err`](../interfaces/Err.md) of whatever the `onError`
function returns.

```ts
import { tryOrElse } from 'true-myth/result';

const aSuccessfulOperation = () => 2 + 2;

const anOkResult = tryOrElse(
  (e) => e,
  aSuccessfulOperation
); // => Ok(4)

const thisOperationThrows = () => throw 'Bummer'

const anErrResult = tryOrElse(
  (e) => e,
  () => {
    thisOperationThrows();
  }
); // => Err('Bummer')
```

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### onError

(`e`) => `E`

A function that takes `e` exception and returns what will
  be wrapped in a `Result.Err`

#### callback

() => `T`

The callback to try executing

### Returns

[`Result`](../classes/Result.md)\<`T`, `E`\>

## Call Signature

> **tryOrElse**\<`T`, `E`\>(`onError`): (`callback`) => [`Result`](../classes/Result.md)\<`T`, `E`\>

Execute the provided callback, wrapping the return value in [`Ok`](../interfaces/Ok.md).
If there is an exception, return a [`Err`](../interfaces/Err.md) of whatever the `onError`
function returns.

```ts
import { tryOrElse } from 'true-myth/result';

const aSuccessfulOperation = () => 2 + 2;

const anOkResult = tryOrElse(
  (e) => e,
  aSuccessfulOperation
); // => Ok(4)

const thisOperationThrows = () => throw 'Bummer'

const anErrResult = tryOrElse(
  (e) => e,
  () => {
    thisOperationThrows();
  }
); // => Err('Bummer')
```

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### onError

(`e`) => `E`

A function that takes `e` exception and returns what will
  be wrapped in a `Result.Err`

### Returns

`Function`

#### Parameters

##### callback

() => `T`

#### Returns

[`Result`](../classes/Result.md)\<`T`, `E`\>
