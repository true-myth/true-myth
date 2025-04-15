[True Myth](../../index.md) / [result](../index.md) / equals

# Function: equals()

## Call Signature

> **equals**\<`T`, `E`\>(`resultB`, `resultA`): `boolean`

Allows quick triple-equal equality check between the values inside two
[`Result`](../classes/Result.md)s without having to unwrap them first.

```ts
const a = Result.of(3)
const b = Result.of(3)
const c = Result.of(null)
const d = Result.nothing()

Result.equals(a, b) // true
Result.equals(a, c) // false
Result.equals(c, d) // true
```

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### resultB

[`Result`](../classes/Result.md)\<`T`, `E`\>

A `maybe` to compare to.

#### resultA

[`Result`](../classes/Result.md)\<`T`, `E`\>

A `maybe` instance to check.

### Returns

`boolean`

## Call Signature

> **equals**\<`T`, `E`\>(`resultB`): (`resultA`) => `boolean`

Allows quick triple-equal equality check between the values inside two
[`Result`](../classes/Result.md)s without having to unwrap them first.

```ts
const a = Result.of(3)
const b = Result.of(3)
const c = Result.of(null)
const d = Result.nothing()

Result.equals(a, b) // true
Result.equals(a, c) // false
Result.equals(c, d) // true
```

### Type Parameters

#### T

`T`

#### E

`E`

### Parameters

#### resultB

[`Result`](../classes/Result.md)\<`T`, `E`\>

A `maybe` to compare to.

### Returns

`Function`

#### Parameters

##### resultA

[`Result`](../classes/Result.md)\<`T`, `E`\>

#### Returns

`boolean`
