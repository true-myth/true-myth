[True Myth](../../index.md) / [task](../index.md) / withResolvers

# Variable: withResolvers()

> `const` **withResolvers**: \<`T`, `E`\>() => [`WithResolvers`](../type-aliases/WithResolvers.md)\<`T`, `E`\> = `Task.withResolvers`

Standalone function version of [`Task.withResolvers`](../interfaces/TaskConstructor.md#withresolvers)

Create a pending `Task` and supply `resolveWith` and `rejectWith` helpers,
similar to the [`Promise.withResolvers`][pwr] static method, but producing a
`Task` with the usual safety guarantees.

[pwr]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers

## Examples

### Resolution

```ts
let { task, resolveWith, rejectWith } = Task.withResolvers<string, Error>();
resolveWith("Hello!");

let result = await task.map((s) => s.length);
let length = result.unwrapOr(0);
console.log(length); // 5
```

### Rejection

```ts
let { task, resolveWith, rejectWith } = Task.withResolvers<string, Error>();
rejectWith(new Error("oh teh noes!"));

let result = await task.mapRejection((s) => s.length);
let errLength = result.isErr ? result.error : 0;
console.log(errLength); // 5
```

## Type Parameters

### T

`T`

### E

`E`

## Returns

[`WithResolvers`](../type-aliases/WithResolvers.md)\<`T`, `E`\>
