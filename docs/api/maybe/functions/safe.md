[True Myth](../../index.md) / [maybe](../index.md) / safe

# Function: safe()

> **safe**\<`F`, `P`, `R`\>(`fn`): (...`params`) => [`Maybe`](../classes/Maybe.md)\<`R`\>

Transform a function from a normal JS function which may return `null` or
`undefined` to a function which returns a [`Maybe`](../classes/Maybe.md) instead.

For example, dealing with the `Document#querySelector` DOM API involves a
*lot* of things which can be `null`:

```ts
const foo = document.querySelector('#foo');
let width: number;
if (foo !== null) {
  width = foo.getBoundingClientRect().width;
} else {
  width = 0;
}

const getStyle = (el: HTMLElement, rule: string) => el.style[rule];
const bar = document.querySelector('.bar');
let color: string;
if (bar != null) {
  let possibleColor = getStyle(bar, 'color');
  if (possibleColor !== null) {
    color = possibleColor;
  } else {
    color = 'black';
  }
}
```

(Imagine in this example that there were more than two options: the
simplifying workarounds you commonly use to make this terser in JS, like the
ternary operator or the short-circuiting `||` or `??` operators, eventually
become very confusing with more complicated flows.)

We can work around this with `Maybe`, always wrapping each layer in
[`Maybe.of`](../interfaces/MaybeConstructor.md#of) invocations, and this is *somewhat* better:

```ts
import Maybe from 'true-myth/maybe';

const aWidth = Maybe.of(document.querySelector('#foo'))
  .map(el => el.getBoundingClientRect().width)
  .unwrapOr(0);

const aColor = Maybe.of(document.querySelector('.bar'))
  .andThen(el => Maybe.of(getStyle(el, 'color'))
  .unwrapOr('black');
```

With `wrapReturn`, though, you can create a transformed version of a function
*once* and then be able to use it freely throughout your codebase, *always*
getting back a `Maybe`:

```ts
import { wrapReturn } from 'true-myth/maybe';

const querySelector = wrapReturn(document.querySelector.bind(document));
const safelyGetStyle = wrapReturn(getStyle);

const aWidth = querySelector('#foo')
  .map(el => el.getBoundingClientRect().width)
  .unwrapOr(0);

const aColor = querySelector('.bar')
  .andThen(el => safelyGetStyle(el, 'color'))
  .unwrapOr('black');
```

## Type Parameters

### F

`F` *extends* `AnyFunction`

### P

`P` *extends* `never`[]

### R

`R` *extends* `object`

## Parameters

### fn

`F`

The function to transform; the resulting function will have the
          exact same signature except for its return type.

## Returns

`Function`

### Parameters

#### params

...`P`

### Returns

[`Maybe`](../classes/Maybe.md)\<`R`\>
