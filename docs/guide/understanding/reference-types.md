# Working with reference types

True Myth's types do _not_ attempt to deeply-clone the wrapped values when performing operations on them. Instead, the library assumes that you will _not_ mutate those objects in place. (Doing more than this would require taking on a dependency on e.g. [lodash]). If you violate that constraint, you can and will see surprising outcomes. Accordingly, you should take care not to mutate reference types, or to use deep cloning yourself when e.g. mapping over reference types.

```ts twoslash
// @noErrors
import { just, map, type Just } from 'true-myth/maybe';

const anObjectToWrap = {
  desc: ['this', ' ', 'is a string'],
  val: 42,
};

const wrapped = just(anObjectToWrap);
const updated = map((obj) => ({ ...obj, val: 92 }), wrapped);

console.log((anObjectToWrap as Just<number>).val); // 42
console.log((updated as Just<number>).val); // 92
console.log((anObjectToWrap as Just<string[]>).desc); // ["this", " ", "is a string"]
console.log((updated as Just<string[]>).desc); // ["this", " ", "is a string"]

// Now mutate the original
anObjectToWrap.desc.push('.');

// And… 😱 we've mutated the new one, too:
console.log((anObjectToWrap as Just<string[]>).desc); // ["this", " ", "is a string", "."]
console.log((updated as Just<string[]>).desc); // ["this", " ", "is a string", "."]
```

In other words: you _must_ use other tools along with True Myth if you're going to mutate objects you're wrapping in `Maybe` or `Result`.

True Myth will work quite nicely with [immer][immer], [lodash][lodash], [Ramda][ramda], [Immutable-JS], etc., so you can use whatever tools you like to handle this problem.

[immer]: https://immerjs.github.io/immer/
[lodash]: https://lodash.com
[ramda]: https://ramdajs.com
[immutable-js]: http://facebook.github.io/immutable-js/
