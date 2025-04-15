[True Myth](../../../index.md) / [task/delay](../index.md) / Strategy

# Interface: Strategy

A retry delay strategy is just an `Iterator<number>`.

For details on how to use or implement a `Strategy`, as well as why it exists
as a distinct type, see [the guide][guide].

[guide]: /guide/understanding/task/retries-and-delays

## Extends

- `Iterator`\<`number`\>

## Methods

### next()

> **next**(...`args`): `IteratorResult`\<`number`, `any`\>

#### Parameters

##### args

\[\] | \[`undefined`\]

#### Returns

`IteratorResult`\<`number`, `any`\>

#### Inherited from

`Iterator.next`

***

### return()?

> `optional` **return**(`value`?): `IteratorResult`\<`number`, `any`\>

#### Parameters

##### value?

`any`

#### Returns

`IteratorResult`\<`number`, `any`\>

#### Inherited from

`Iterator.return`

***

### throw()?

> `optional` **throw**(`e`?): `IteratorResult`\<`number`, `any`\>

#### Parameters

##### e?

`any`

#### Returns

`IteratorResult`\<`number`, `any`\>

#### Inherited from

`Iterator.throw`
