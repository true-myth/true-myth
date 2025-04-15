[True Myth](../../index.md) / [result](../index.md) / tryOr

# Function: tryOr()

## Call Signature

> **tryOr**\<`T`, `E`\>(`error`, `callback`): [`Result`](../classes/Result.md)\<`T`, `E`\>

Execute the provided callback, wrapping the return value in [`Ok`](../interfaces/Ok.md) or
[`Err(error)`](../interfaces/Err.md) if there is an exception.

```ts
const aSuccessfulOperation = () => 2 + 2;

const anOkResult = Result.tryOr('Oh noes!!1', () => {
  aSuccessfulOperation()
}); // => Ok(4)

const thisOperationThrows = () => throw new Error('Bummer');

const anErrResult = Result.tryOr('Oh noes!!1', () => {
  thisOperationThrows();
}); // => Err('Oh noes!!1')
```

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### error

`E`

The error value in case of an exception

#### callback

() => `T`

The callback to try executing

### Returns

[`Result`](../classes/Result.md)\<`T`, `E`\>

## Call Signature

> **tryOr**\<`T`, `E`\>(`error`): (`callback`) => [`Result`](../classes/Result.md)\<`T`, `E`\>

Execute the provided callback, wrapping the return value in [`Ok`](../interfaces/Ok.md) or
[`Err(error)`](../interfaces/Err.md) if there is an exception.

```ts
const aSuccessfulOperation = () => 2 + 2;

const anOkResult = Result.tryOr('Oh noes!!1', () => {
  aSuccessfulOperation()
}); // => Ok(4)

const thisOperationThrows = () => throw new Error('Bummer');

const anErrResult = Result.tryOr('Oh noes!!1', () => {
  thisOperationThrows();
}); // => Err('Oh noes!!1')
```

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### error

`E`

The error value in case of an exception

### Returns

`Function`

#### Parameters

##### callback

() => `T`

#### Returns

[`Result`](../classes/Result.md)\<`T`, `E`\>
