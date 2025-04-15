# Result

:::warning 🚧 Under Construction 🚧

There will be different, and *better*, content here Soon™. We didn’t want to block getting the new docs site live on having finished updating all the existing content!

:::

## Using `Result`

The library is designed to be used with a functional style, allowing you to compose operations easily. Thus, standalone pure function versions of every operation are supplied. However, the same operations also exist on the `Ok` and `Err` types directly, so you may also write them in a more traditional "fluent" object style.

### Examples: functional style

```typescript
import { ok, err, map, toString } from 'true-myth/result';

const length = (s: string) => s.length;

const anOk = ok('some string');
const okLength = map(length, anOk);
console.log(toString(okLength)); // Ok(11)

const anErr = err('gah!');
const errLength = map(length, anErr);
console.log(toString(errLength)); // Err(gah!)
```

### Examples: fluent object invocation

You can also use a "fluent" method chaining style to apply the various helper functions to a `Result` instance:

```typescript
import { ok, err } from 'true-myth/result';

const length = (s: string) => s.length;

const hooray = ok('yay');
const okLen = hooray.map(length).unwrapOr(0); // okLen = 3

const muySad = err('oh no');
const errLen = muySad.map(length).unwrapOr(0); // errLen = 0
```

### Writing type constraints

When creating a `Result` instance, you'll nearly always be using _either_ the `Ok` _or_ the `Err` type, so the type system won't necessarily be able to infer the other type parameter.

```typescript
import { ok, err } from 'true-myth/result';

const anOk = ok(12); // TypeScript infers: `Result<number, {}>`
const anErr = err('sad'); // TypeScript infers: `Result<{}, string>`
```

In TypeScript, because of the direction type inference happens, you will need to specify the type at declaration to make it type check when returning values from a function with a specified type. Note that this _only_ applies when the instance is declared in its own statement and returned separately, _not_ when it is the expression value of a single-expression arrow function or the explicit return value of any function.

```typescript
import Result, { ok } from 'true-myth/result';

// ERROR: Type 'Result<number, {}>' is not assignable to type 'Result<number, string>'.
const getAResultNotAssignable = (): Result<number, string> => {
  const theResult = ok(12);
  return theResult;
};

// Succeeds
const getAResultExpression = (): Result<number, string> => ok(12);

// Succeeds
const getAResultReturn = (): Result<number, string> => {
  return ok(12);
};
```
