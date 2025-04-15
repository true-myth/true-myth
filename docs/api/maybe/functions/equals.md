[True Myth](../../index.md) / [maybe](../index.md) / equals

# Function: equals()

## Call Signature

> **equals**\<`T`\>(`mb`, `ma`): `boolean`

Allows quick triple-equal equality check between the values inside two
[`maybe`](../classes/Maybe.md) instances without having to unwrap them first.

```ts
const a = Maybe.of(3);
const b = Maybe.of(3);
const c = Maybe.of(null);
const d = Maybe.nothing();

Maybe.equals(a, b); // true
Maybe.equals(a, c); // false
Maybe.equals(c, d); // true
```

### Type Parameters

#### T

`T`

### Parameters

#### mb

[`Maybe`](../classes/Maybe.md)\<`T`\>

A `maybe` to compare to.

#### ma

[`Maybe`](../classes/Maybe.md)\<`T`\>

A `maybe` instance to check.

### Returns

`boolean`

## Call Signature

> **equals**\<`T`\>(`mb`): (`ma`) => `boolean`

Allows quick triple-equal equality check between the values inside two
[`maybe`](../classes/Maybe.md) instances without having to unwrap them first.

```ts
const a = Maybe.of(3);
const b = Maybe.of(3);
const c = Maybe.of(null);
const d = Maybe.nothing();

Maybe.equals(a, b); // true
Maybe.equals(a, c); // false
Maybe.equals(c, d); // true
```

### Type Parameters

#### T

`T`

### Parameters

#### mb

[`Maybe`](../classes/Maybe.md)\<`T`\>

A `maybe` to compare to.

### Returns

`Function`

#### Parameters

##### ma

[`Maybe`](../classes/Maybe.md)\<`T`\>

#### Returns

`boolean`
