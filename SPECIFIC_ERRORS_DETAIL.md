# Specific Error Details

Generated: 2025-08-30T20:25:43.976Z

---

## Error 47

**File**: `unknown`
**Category**: OTHER
**Error Message**: Not captured

**Code Sample**:
```typescript
import Task from 'true-myth/task';

let resolvedA = Task.resolve<string, string>('A');
let resolvedB = Task.resolve<string, string>('B');
let rejectedA = Task.reject<string, string>('bad');
let rejectedB = Task.reject<string, string>('lame');

let aAndB = resolvedA.and(resolvedB);
await aAndB;

let aAndRA = resolvedA.and(rejectedA);
await aAndRA;

let raAndA = rejectedA.and(resolvedA);
await raAndA;
```

**Suggested Fix**: Manual review required - check types, imports, or context

---

## Error 48

**File**: `unknown`
**Category**: UNDECLARED_VARIABLE
**Error Message**: Not captured

**Code Sample**:
```typescript
import Task from 'true-myth/task';

let resolved = Task.resolve<string, string>('A');
let rejected = Task.reject<string, string>('bad');
let ok = Result.ok<string, string>('B');
let err = Result.err<string, string>('lame');

let aAndB = resolved.and(ok);
await aAndB;

let aAndRA = resolved.and(err);
await aAndRA;

let raAndA = rejected.and(ok);
await raAndA;
```

**Suggested Fix**: Add missing import statement

---

## Error 49

**File**: `unknown`
**Category**: UNDECLARED_VARIABLE
**Error Message**: Not captured

**Code Sample**:
```typescript
import Task from 'true-myth/task';
const double = n => n * 2;

const aResolvedTask = Task.resolve(12);
const mappedResolved = aResolvedTask.map(double);
let resolvedResult = await aResolvedTask;
console.log(resolvedResult.toString()); // Ok(24)

const aRejectedTask = Task.reject("nothing here!");
const mappedRejected = aRejectedTask.map(double);
let rejectedResult = await aRejectedTask;
console.log(rejectedResult.toString()); // Err("nothing here!")
```

**Suggested Fix**: Add missing import statement

---

## Error 50

**File**: `unknown`
**Category**: OTHER
**Error Message**: Not captured

**Code Sample**:
```typescript
import Task from 'true-myth/task';

const extractReason = (err: { code: number, reason: string }) => err.reason;

const aResolvedTask = Task.resolve(12);
const mappedResolved = aResolvedTask.mapRejected(extractReason);
console.log(mappedOk));  // Ok(12)

const aRejectedTask = Task.reject({ code: 101, reason: 'bad file' });
const mappedRejection = await aRejectedTask.mapRejected(extractReason);
console.log(toString(mappedRejection));  // Err("bad file")
```

**Suggested Fix**: Manual review required - check types, imports, or context

---

## Error 51

**File**: `unknown`
**Category**: INCOMPLETE_CODE
**Error Message**: Not captured

**Code Sample**:
```typescript
import { ok, err } from 'true-myth/result';

const one = ok<number, string>(1);
const five = ok<number, string>(5);
const whoops = err<number, string>('oh no');

one.match({
  Ok: n => five.match({
    Ok: o => ok<number, string>(n + o),
    Err: e => err<number, string>(e),
  }),
  Err: e  => err<number, string>(e),
}); // Ok(6)

one.match({
```

**Suggested Fix**: Complete the code example or add `// @noErrors`

---

## Error 52

**File**: `unknown`
**Category**: INCOMPLETE_CODE
**Error Message**: Not captured

**Code Sample**:
```typescript
import { ok } from 'true-myth/result';
import { is as immutableIs, Set } from 'immutable';

const is = (first: unknown) =>  (second: unknown) =>
  immutableIs(first, second);

const x = ok(Set.of(1, 2, 3));
const y = ok(Set.of(2, 3, 4));

ok(is).ap(x).ap(y); // Ok(false)
```

**Suggested Fix**: Complete the code example or add `// @noErrors`

---

## Error 56

**File**: `unknown`
**Category**: UNDECLARED_VARIABLE
**Error Message**: Not captured

**Code Sample**:
```typescript
import Result from 'true-myth/result';
import { curry } from 'lodash';

const merge3Strs = (a: string, b: string, c: string) => string;
const curriedMerge = curry(merge3Strs);

const fn = Result.ok<typeof curriedMerge, string>(curriedMerge);
```

**Suggested Fix**: Add missing import statement

---

## Error 57

**File**: `unknown`
**Category**: UNDECLARED_VARIABLE
**Error Message**: Not captured

**Code Sample**:
```typescript
const fn = Result.ok<(a: string) => (b: string) => (c: string) => string, string>(curriedMerge);
```

**Suggested Fix**: Add missing import statement

---

## Error 58

**File**: `unknown`
**Category**: INCOMPLETE_CODE
**Error Message**: Not captured

**Code Sample**:
```typescript
import { ok, err } from 'true-myth/result';

const one = ok<number, string>(1);
const five = ok<number, string>(5);
const whoops = err<number, string>('oh no');

one.match({
  Ok: n => five.match({
    Ok: o => ok<number, string>(n + o),
    Err: e => err<number, string>(e),
  }),
  Err: e  => err<number, string>(e),
}); // Ok(6)

one.match({
```

**Suggested Fix**: Complete the code example or add `// @noErrors`

---

## Error 59

**File**: `unknown`
**Category**: INCOMPLETE_CODE
**Error Message**: Not captured

**Code Sample**:
```typescript
import { ok } from 'true-myth/result';
import { is as immutableIs, Set } from 'immutable';

const is = (first: unknown) =>  (second: unknown) =>
  immutableIs(first, second);

const x = ok(Set.of(1, 2, 3));
const y = ok(Set.of(2, 3, 4));

ok(is).ap(x).ap(y); // Ok(false)
```

**Suggested Fix**: Complete the code example or add `// @noErrors`

---

## Error 68

**File**: `unknown`
**Category**: INCOMPLETE_CODE
**Error Message**: Not captured

**Code Sample**:
```typescript
import Maybe from 'true-myth/maybe';

type Item = { count: number; name: string };
type Response = Array<Item>;

// curried variant!
const findAtLeast100 = Maybe.find(({ count }: Item) => count > 100);

fetch('https://arrays.example.com')
  .then(response => response.json() as Response)
  .then(findAtLeast100)
  .then(found => {
    if (found.isJust) {
      console.log(`The matching value is ${found.value.name}!`);
    }
```

**Suggested Fix**: Complete the code example or add `// @noErrors`

---

## Error 70

**File**: `unknown`
**Category**: OTHER
**Error Message**: Not captured

**Code Sample**:
```typescript
import { safe } from 'true-myth/task';

const fetch = safe(window.fetch);
const toJson = safe((response: Response) => response.json() as unknown);
let json = fetch('https://www.example.com/api/users').andThen(toJson);
```

**Suggested Fix**: Manual review required - check types, imports, or context

---

## Error 73

**File**: `unknown`
**Category**: INCOMPLETE_CODE
**Error Message**: Not captured

**Code Sample**:
```typescript
import { readFile } from 'node:fs';

readFile('does-not-exist.lol', (err, data) => {
  console.log(data.length);
});
```

**Suggested Fix**: Complete the code example or add `// @noErrors`

---

## Error 74

**File**: `unknown`
**Category**: OTHER
**Error Message**: Not captured

**Code Sample**:
```typescript
function readFile(path: string): Promise<string>;
```

**Suggested Fix**: Manual review required - check types, imports, or context

---

## Error 81

**File**: `unknown`
**Category**: UNDECLARED_VARIABLE
**Error Message**: Not captured

**Code Sample**:
```typescript
import Task from 'true-myth/task';

let resolved = Task.resolve<string, string>('A');
let rejected = Task.reject<string, string>('bad');
let ok = Result.ok<string, string>('B');
let err = Result.err<string, string>('lame');

let aAndB = resolved.and(ok);
await aAndB;

let aAndRA = resolved.and(err);
await aAndRA;

let raAndA = rejected.and(ok);
await raAndA;
```

**Suggested Fix**: Add missing import statement

---

## Error 82

**File**: `unknown`
**Category**: UNDECLARED_VARIABLE
**Error Message**: Not captured

**Code Sample**:
```typescript
import Task from 'true-myth/task';
const double = n => n * 2;

const aResolvedTask = Task.resolve(12);
const mappedResolved = aResolvedTask.map(double);
let resolvedResult = await aResolvedTask;
console.log(resolvedResult.toString()); // Ok(24)

const aRejectedTask = Task.reject("nothing here!");
const mappedRejected = aRejectedTask.map(double);
let rejectedResult = await aRejectedTask;
console.log(rejectedResult.toString()); // Err("nothing here!")
```

**Suggested Fix**: Add missing import statement

---

## Error 86

**File**: `unknown`
**Category**: UNDECLARED_VARIABLE, INCOMPLETE_CODE
**Error Message**: console.log(theResult.toString()); // Err(Error: Uh oh!)

**Code Sample**:
```typescript
import { safelyTry } from 'true-myth/task';

function throws(): Promise<T> {
  throw new Error("Uh oh!");
}

// Note: passing the function by name, *not* calling it.
let theTask = safelyTry(throws);
let theResult = await theTask;
console.log(theResult.toString()); // Err(Error: Uh oh!)
```

**Suggested Fix**: Add missing import statement

**Suggested Fix**: Complete the code example or add `// @noErrors`

---

## Error 87

**File**: `unknown`
**Category**: INCOMPLETE_CODE
**Error Message**: Not captured

**Code Sample**:
```typescript
import Maybe, { mapOr } from 'true-myth/maybe';

function acceptsANullOhNo(value: number | null): Maybe<string> {
  const maybeNumber = Maybe.of(value);
  return mapOr('0', (n) => n.toString(), maybeNumber);
}
```

**Suggested Fix**: Complete the code example or add `// @noErrors`

---

## Error 97

**File**: `unknown`
**Category**: OTHER
**Error Message**: Not captured

**Code Sample**:
```typescript
let { promise, reject } = Promise.withResolvers<number>();

// `theTask` has the type `Task<number, Error>`
let theTask = Task.tryOrElse(
  promise,
  (reason) => new Error("Promise was rejected", { cause: reason })
);
```

**Suggested Fix**: Manual review required - check types, imports, or context

---

## Error 98

**File**: `unknown`
**Category**: OTHER
**Error Message**: Not captured

**Code Sample**:
```typescript
// `resolved` has the type `Task<number, never>`
let resolved = Task.resolve(123);

// `rejected` has the type `Task<never, string>`
let rejected = Task.rejecte("something went wrong");
```

**Suggested Fix**: Manual review required - check types, imports, or context

---

## Error 109

**File**: `unknown`
**Category**: UNDECLARED_VARIABLE
**Error Message**: Not captured

**Code Sample**:
```typescript
import Task from 'true-myth/task';

let resolved = Task.resolve<string, string>('A');
let rejected = Task.reject<string, string>('bad');
let ok = Result.ok<string, string>('B');
let err = Result.err<string, string>('lame');

let aAndB = resolved.and(ok);
await aAndB;

let aAndRA = resolved.and(err);
await aAndRA;

let raAndA = rejected.and(ok);
await raAndA;
```

**Suggested Fix**: Add missing import statement

---

## Error 110

**File**: `unknown`
**Category**: UNDECLARED_VARIABLE
**Error Message**: Not captured

**Code Sample**:
```typescript
import Task from 'true-myth/task';
const double = n => n * 2;

const aResolvedTask = Task.resolve(12);
const mappedResolved = aResolvedTask.map(double);
let resolvedResult = await aResolvedTask;
console.log(resolvedResult.toString()); // Ok(24)

const aRejectedTask = Task.reject("nothing here!");
const mappedRejected = aRejectedTask.map(double);
let rejectedResult = await aRejectedTask;
console.log(rejectedResult.toString()); // Err("nothing here!")
```

**Suggested Fix**: Add missing import statement

---

## Error 111

**File**: `unknown`
**Category**: OTHER
**Error Message**: Not captured

**Code Sample**:
```typescript
import Task from 'true-myth/task';

const extractReason = (err: { code: number, reason: string }) => err.reason;

const aResolvedTask = Task.resolve(12);
const mappedResolved = aResolvedTask.mapRejected(extractReason);
console.log(mappedOk));  // Ok(12)

const aRejectedTask = Task.reject({ code: 101, reason: 'bad file' });
const mappedRejection = await aRejectedTask.mapRejected(extractReason);
console.log(toString(mappedRejection));  // Err("bad file")
```

**Suggested Fix**: Manual review required - check types, imports, or context

---

## Error 141

**File**: `unknown`
**Category**: OTHER
**Error Message**: Not captured

**Code Sample**:
```typescript
import Maybe, { nothing } from 'true-myth/maybe';

const justA = Maybe.just('A');
const justB = Maybe.just('B');
const nothing: Maybe<number> = nothing();

console.log(Maybe.and(justB, justA).toString());  // Just(B)
console.log(Maybe.and(justB, nothing).toString());  // Nothing
console.log(Maybe.and(nothing, justA).toString());  // Nothing
console.log(Maybe.and(nothing, nothing).toString());  // Nothing
```

**Suggested Fix**: Manual review required - check types, imports, or context

---

## Error 142

**File**: `unknown`
**Category**: INCOMPLETE_CODE
**Error Message**: Not captured

**Code Sample**:
```typescript
type DeepOptionalType = {
  something?: {
    with?: {
      deeperKeys?: string;
    }
  }
};

const fullySet: DeepOptionalType = {
  something: {
    with: {
      deeperKeys: 'like this'
    }
  }
};
```

**Suggested Fix**: Complete the code example or add `// @noErrors`

---

## Error 159

**File**: `unknown`
**Category**: OTHER
**Error Message**: Not captured

**Code Sample**:
```typescript
import { get, just } from 'true-myth/maybe';

type Person = { name?: string };

const lookupName = get('name');

const me: Person = { name: 'Chris' };
console.log(lookupName(me)); // Just('Chris')

const nobody: Person = {};
console.log(lookupName(nobody)); // Nothing
```

**Suggested Fix**: Manual review required - check types, imports, or context

---

## Error 160

**File**: `unknown`
**Category**: OTHER
**Error Message**: Not captured

**Code Sample**:
```typescript
import { get, just } from 'true-myth/maybe';

type Person = { name?: string };

const lookupName = get('name');

const me: Person = { name: 'Chris' };
console.log(lookupName(me)); // Just('Chris')

const nobody: Person = {};
console.log(lookupName(nobody)); // Nothing
```

**Suggested Fix**: Manual review required - check types, imports, or context

---

## Error 165

**File**: `unknown`
**Category**: OTHER
**Error Message**: Not captured

**Code Sample**:
```typescript
import Maybe, { nothing } from 'true-myth/maybe';

const justA = Maybe.just("a");
const justB = Maybe.just("b");
const aNothing: Maybe<string> = nothing();

console.log(Maybe.or(justB, justA).toString());  // Just(A)
console.log(Maybe.or(aNothing, justA).toString());  // Just(A)
console.log(Maybe.or(justB, aNothing).toString());  // Just(B)
console.log(Maybe.or(aNothing, aNothing).toString());  // Nothing
```

**Suggested Fix**: Manual review required - check types, imports, or context

---

## Error 166

**File**: `unknown`
**Category**: OTHER
**Error Message**: Not captured

**Code Sample**:
```typescript
import Maybe, { nothing } from 'true-myth/maybe';

const justA = Maybe.just("a");
const justB = Maybe.just("b");
const aNothing: Maybe<string> = nothing();

console.log(Maybe.or(justB, justA).toString());  // Just(A)
console.log(Maybe.or(aNothing, justA).toString());  // Just(A)
console.log(Maybe.or(justB, aNothing).toString());  // Just(B)
console.log(Maybe.or(aNothing, aNothing).toString());  // Nothing
```

**Suggested Fix**: Manual review required - check types, imports, or context

---

## Error 174

**File**: `unknown`
**Category**: OTHER
**Error Message**: Not captured

**Code Sample**:
```typescript
import Maybe from 'true-myth/maybe';

// You can imagine that someOtherValue might be dynamic.
const someOtherValue = 99;
const handleNothing = () => someOtherValue;

const aJust = Maybe.just(42);
console.log(Maybe.unwrapOrElse(handleNothing, aJust));  // 42

const aNothing = nothing<number>();
console.log(Maybe.unwrapOrElse(handleNothing, aNothing)); // 99
```

**Suggested Fix**: Manual review required - check types, imports, or context

---

## Error 175

**File**: `unknown`
**Category**: OTHER
**Error Message**: Not captured

**Code Sample**:
```typescript
import Maybe from 'true-myth/maybe';

// You can imagine that someOtherValue might be dynamic.
const someOtherValue = 99;
const handleNothing = () => someOtherValue;

const aJust = Maybe.just(42);
console.log(Maybe.unwrapOrElse(handleNothing, aJust));  // 42

const aNothing = nothing<number>();
console.log(Maybe.unwrapOrElse(handleNothing, aNothing)); // 99
```

**Suggested Fix**: Manual review required - check types, imports, or context

---

## Error 178

**File**: `unknown`
**Category**: INCOMPLETE_CODE
**Error Message**: Not captured

**Code Sample**:
```typescript
type DeepOptionalType = {
  something?: {
    with?: {
      deeperKeys?: string;
    }
  }
};

const fullySet: DeepOptionalType = {
  something: {
    with: {
      deeperKeys: 'like this'
    }
  }
};
```

**Suggested Fix**: Complete the code example or add `// @noErrors`

---

## Error 179

**File**: `unknown`
**Category**: INCOMPLETE_CODE
**Error Message**: Not captured

**Code Sample**:
```typescript
type DeepOptionalType = {
  something?: {
    with?: {
      deeperKeys?: string;
    }
  }
};

const fullySet: DeepOptionalType = {
  something: {
    with: {
      deeperKeys: 'like this'
    }
  }
};
```

**Suggested Fix**: Complete the code example or add `// @noErrors`

---

## Error 194

**File**: `unknown`
**Category**: OTHER
**Error Message**: Not captured

**Code Sample**:
```typescript
import { ok, err, map, toString } from 'true-myth/result';
const double = n => n * 2;

const anOk = ok(12);
const mappedOk = map(double, anOk);
console.log(toString(mappedOk)); // Ok(24)

const anErr = err("nothing here!");
const mappedErr = map(double, anErr);
console.log(toString(mappedErr)); // Err(nothing here!)
```

**Suggested Fix**: Manual review required - check types, imports, or context

---

## Error 195

**File**: `unknown`
**Category**: OTHER
**Error Message**: Not captured

**Code Sample**:
```typescript
import { ok, err, map, toString } from 'true-myth/result';
const double = n => n * 2;

const anOk = ok(12);
const mappedOk = map(double, anOk);
console.log(toString(mappedOk)); // Ok(24)

const anErr = err("nothing here!");
const mappedErr = map(double, anErr);
console.log(toString(mappedErr)); // Err(nothing here!)
```

**Suggested Fix**: Manual review required - check types, imports, or context

---
