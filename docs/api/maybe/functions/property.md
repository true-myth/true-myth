[True Myth](../../index.md) / [maybe](../index.md) / property

# Function: property()

## Call Signature

> **property**\<`T`, `K`\>(`key`, `obj`): [`Maybe`](../classes/Maybe.md)\<`NonNullable`\<`T`\[`K`\]\>\>

Safely extract a key from an object, returning [`Just`](../interfaces/Just.md) if the key has
a value on the object and [`Nothing`](../interfaces/Nothing.md) if it does not.

The check is type-safe: you won't even be able to compile if you try to look
up a property that TypeScript *knows* doesn't exist on the object.

```ts
type Person = { name?: string };

const me: Person = { name: 'Chris' };
console.log(Maybe.property('name', me)); // Just('Chris')

const nobody: Person = {};
console.log(Maybe.property('name', nobody)); // Nothing
```

However, it also works correctly with dictionary types:

```ts
import * as maybe from 'true-myth/maybe';

type Dict<T> = { [key: string]: T };

const score: Dict<number> = {
  player1: 0,
  player2: 1
};

console.log(maybe.property('player1', score)); // Just(0)
console.log(maybe.property('player2', score)); // Just(1)
console.log(maybe.property('player3', score)); // Nothing
```

The order of keys is so that it can be partially applied:

```ts
type Person = { name?: string };

const lookupName = maybe.property('name');

const me: Person = { name: 'Chris' };
console.log(lookupName(me)); // Just('Chris')

const nobody: Person = {};
console.log(lookupName(nobody)); // Nothing
```

### Type Parameters

#### T

`T`

#### K

`K` *extends* `string` \| `number` \| `symbol`

### Parameters

#### key

`K`

The key to pull out of the object.

#### obj

`T`

The object to look up the key from.

### Returns

[`Maybe`](../classes/Maybe.md)\<`NonNullable`\<`T`\[`K`\]\>\>

## Call Signature

> **property**\<`T`, `K`\>(`key`): (`obj`) => [`Maybe`](../classes/Maybe.md)\<`NonNullable`\<`T`\[`K`\]\>\>

Safely extract a key from an object, returning [`Just`](../interfaces/Just.md) if the key has
a value on the object and [`Nothing`](../interfaces/Nothing.md) if it does not.

The check is type-safe: you won't even be able to compile if you try to look
up a property that TypeScript *knows* doesn't exist on the object.

```ts
type Person = { name?: string };

const me: Person = { name: 'Chris' };
console.log(Maybe.property('name', me)); // Just('Chris')

const nobody: Person = {};
console.log(Maybe.property('name', nobody)); // Nothing
```

However, it also works correctly with dictionary types:

```ts
import * as maybe from 'true-myth/maybe';

type Dict<T> = { [key: string]: T };

const score: Dict<number> = {
  player1: 0,
  player2: 1
};

console.log(maybe.property('player1', score)); // Just(0)
console.log(maybe.property('player2', score)); // Just(1)
console.log(maybe.property('player3', score)); // Nothing
```

The order of keys is so that it can be partially applied:

```ts
type Person = { name?: string };

const lookupName = maybe.property('name');

const me: Person = { name: 'Chris' };
console.log(lookupName(me)); // Just('Chris')

const nobody: Person = {};
console.log(lookupName(nobody)); // Nothing
```

### Type Parameters

#### T

`T`

#### K

`K` *extends* `string` \| `number` \| `symbol`

### Parameters

#### key

`K`

The key to pull out of the object.

### Returns

`Function`

#### Parameters

##### obj

`T`

#### Returns

[`Maybe`](../classes/Maybe.md)\<`NonNullable`\<`T`\[`K`\]\>\>
