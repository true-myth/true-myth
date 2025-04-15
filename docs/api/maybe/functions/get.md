[True Myth](../../index.md) / [maybe](../index.md) / get

# Function: get()

## Call Signature

> **get**\<`T`, `K`\>(`key`, `maybeObj`): [`Maybe`](../classes/Maybe.md)\<`NonNullable`\<`T`\[`K`\]\>\>

Safely extract a key from a [`Maybe`](../classes/Maybe.md) of an object, returning
[`Just`](../interfaces/Just.md) if the key has a value on the object and
[`Nothing`](../interfaces/Nothing.md) if it does not. (Like [`property`](property.md) but
operating on a `Maybe<T>` rather than directly on a `T`.)

The check is type-safe: you won't even be able to compile if you try to look
up a property that TypeScript *knows* doesn't exist on the object.

```ts
import { get, just, nothing } from 'true-myth/maybe';

type Person = { name?: string };

const me: Maybe<Person> = just({ name: 'Chris' });
console.log(get('name', me)); // Just('Chris')

const nobody = nothing<Person>();
console.log(get('name', nobody)); // Nothing
```

However, it also works correctly with dictionary types:

```ts
import { get, just } from 'true-myth/maybe';

type Dict<T> = { [key: string]: T };

const score: Maybe<Dict<number>> = just({
  player1: 0,
  player2: 1
});

console.log(get('player1', score)); // Just(0)
console.log(get('player2', score)); // Just(1)
console.log(get('player3', score)); // Nothing
```

The order of keys is so that it can be partially applied:

```ts
import { get, just } from 'true-myth/maybe';

type Person = { name?: string };

const lookupName = get('name');

const me: Person = { name: 'Chris' };
console.log(lookupName(me)); // Just('Chris')

const nobody: Person = {};
console.log(lookupName(nobody)); // Nothing
```

### Type Parameters

#### T

`T` *extends* `object`

#### K

`K` *extends* `string` \| `number` \| `symbol`

### Parameters

#### key

`K`

The key to pull out of the object.

#### maybeObj

[`Maybe`](../classes/Maybe.md)\<`T`\>

The object to look up the key from.

### Returns

[`Maybe`](../classes/Maybe.md)\<`NonNullable`\<`T`\[`K`\]\>\>

## Call Signature

> **get**\<`T`, `K`\>(`key`): (`maybeObj`) => [`Maybe`](../classes/Maybe.md)\<`NonNullable`\<`T`\[`K`\]\>\>

Safely extract a key from a [`Maybe`](../classes/Maybe.md) of an object, returning
[`Just`](../interfaces/Just.md) if the key has a value on the object and
[`Nothing`](../interfaces/Nothing.md) if it does not. (Like [`property`](property.md) but
operating on a `Maybe<T>` rather than directly on a `T`.)

The check is type-safe: you won't even be able to compile if you try to look
up a property that TypeScript *knows* doesn't exist on the object.

```ts
import { get, just, nothing } from 'true-myth/maybe';

type Person = { name?: string };

const me: Maybe<Person> = just({ name: 'Chris' });
console.log(get('name', me)); // Just('Chris')

const nobody = nothing<Person>();
console.log(get('name', nobody)); // Nothing
```

However, it also works correctly with dictionary types:

```ts
import { get, just } from 'true-myth/maybe';

type Dict<T> = { [key: string]: T };

const score: Maybe<Dict<number>> = just({
  player1: 0,
  player2: 1
});

console.log(get('player1', score)); // Just(0)
console.log(get('player2', score)); // Just(1)
console.log(get('player3', score)); // Nothing
```

The order of keys is so that it can be partially applied:

```ts
import { get, just } from 'true-myth/maybe';

type Person = { name?: string };

const lookupName = get('name');

const me: Person = { name: 'Chris' };
console.log(lookupName(me)); // Just('Chris')

const nobody: Person = {};
console.log(lookupName(nobody)); // Nothing
```

### Type Parameters

#### T

`T` *extends* `object`

#### K

`K` *extends* `string` \| `number` \| `symbol`

### Parameters

#### key

`K`

The key to pull out of the object.

### Returns

`Function`

#### Parameters

##### maybeObj

[`Maybe`](../classes/Maybe.md)\<`T`\>

#### Returns

[`Maybe`](../classes/Maybe.md)\<`NonNullable`\<`T`\[`K`\]\>\>
