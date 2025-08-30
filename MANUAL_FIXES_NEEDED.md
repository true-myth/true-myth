# Manual Fixes Needed for Twoslash Integration

This file tracks specific code examples that have Twoslash errors and need manual review. Each entry includes the exact code sample and reported issue.

Generated: 2025-08-30

## Current Status
- **Total Remaining Errors**: 197
- **Categories**: 9 different error types
- **High Priority**: 8 undeclared variables, 41 syntax errors

## 2. SYNTAX_ERROR (41 errors - HIGH PRIORITY)

These are mapped to their exact source file locations:

### Error 47: `src/task.ts` - `and` method example
```typescript
import Task from 'true-myth/task';

let resolvedA = Task.resolve<string, string>('A');
let resolvedB = Task.resolve<string, string>('B');
let rejectedA = Task.reject<string, string>('bad');
```
**Source**: Task `and` method documentation
**Issue**: Unknown Twoslash issue

### Error 52: `src/result.ts` - immutable.js `ap` example
```typescript
import { ok } from 'true-myth/result';
import { is as immutableIs, Set } from 'immutable';

const is = (first: unknown) =>  (second: unknown) =>
  immutableIs(first, second);
```
**Source**: Line ~1291 in `src/result.ts` `ap` method documentation
**Fix**: Either add immutable.js as dev dependency or mark as `// @noErrors`

### Error 56: `src/result.ts` - curriedMerge example 1
```typescript
import Result from 'true-myth/result';
import { curry } from 'lodash';

const merge3Strs = (a: string, b: string, c: string) => string;
const curriedMerge = curry(merge3Strs);
const fn = Result.ok<typeof curriedMerge, string>(curriedMerge);
```
**Source**: Line ~1373 in `src/result.ts` `ap` documentation
**Fix**: Complete the example with proper function implementation

### Error 57: `src/result.ts` - curriedMerge example 2
```typescript
const fn = Result.ok<(a: string) => (b: string) => (c: string) => string, string>(curriedMerge);
```
**Source**: Line ~1381 in `src/result.ts` `ap` documentation
**Fix**: Include the `curriedMerge` definition or mark as fragment

### Error 58: `src/result.ts` - incomplete `match` example 2
```typescript
one.match({
  Ok: n => five.match({
    Ok: o => ok<number, string>(n + o),
    Err: e => err<number, string>(e),
  }),
  Err: e  => err<number, string>(e),
}); // Ok(6)

one.match({
```
**Source**: Line ~1265 in `src/result.ts` `match` documentation
**Fix**: Complete the match block or remove incomplete portion

### Error 59: `src/maybe.ts` - immutable.js `ap` example
```typescript
import Maybe from 'true-myth/maybe';
import { is as immutableIs, Set } from 'immutable';

const is = (first: unknown) =>  (second: unknown) =>
  immutableIs(first, second);
```
**Source**: Line ~1139 in `src/maybe.ts` `ap` method documentation
**Fix**: Either add immutable.js as dev dependency or mark as `// @noErrors`

### Error 68: `src/maybe.ts` - `find` method example
```typescript
fetch('https://arrays.example.com')
  .then(response => response.json() as Response)
  .then(findAtLeast100)
  .then(found => {
    if (found.isJust) {
      console.log(`The matching value is ${found.value.name}!`);
    }  // Missing closing braces
```
**Source**: `src/maybe.ts` `find` method documentation
**Fix**: Complete the Promise chain with proper closing braces

### Error 70: `src/task.ts` - `safe` function example
```typescript
import { safe } from 'true-myth/task';

const fetch = safe(window.fetch);
const toJson = safe((response: Response) => response.json() as unknown);
let json = fetch('https://www.example.com/api/users').andThen(toJson);
```
**Source**: `src/task.ts` `safe` function documentation
**Issue**: Unknown Twoslash issue - appears syntactically correct

### Error 73: Node.js callback example
```typescript
import { readFile } from 'node:fs';

readFile('does-not-exist.lol', (err, data) => {
  console.log(data.length);
});
```
**Source**: Task documentation showing unsafe callback usage
**Fix**: Add error handling or mark as intentional unsafe example

### Error 74: Function declaration
```typescript
function readFile(path: string): Promise<string>;
```
**Source**: Type declaration example in Task documentation
**Fix**: Mark as `// @noErrors` for type declaration only

### Error 81: `src/task.ts` - `and` with Result example
```typescript
import Task from 'true-myth/task';

let resolved = Task.resolve<string, string>('A');
let rejected = Task.reject<string, string>('bad');
let ok = Result.ok<string, string>('B');
let err = Result.err<string, string>('lame');
```
**Source**: Task `and` method documentation
**Fix**: Add `import Result from 'true-myth/result';`

### Error 82: `src/task.ts` - `map` example
```typescript
import Task from 'true-myth/task';
const double = n => n * 2;

const aResolvedTask = Task.resolve(12);
let resolvedResult = await aResolvedTask;
console.log(resolvedResult.toString()); // Ok(24)
```
**Source**: Task `map` method documentation
**Fix**: May need Result import or typing correction

### Error 86: `src/task.ts` - generic type undefined
```typescript
import { safelyTry } from 'true-myth/task';

function throws(): Promise<T> {  // T is not defined
  throw new Error("Uh oh!");
}
```
**Source**: `safelyTry` documentation example
**Fix**: Define generic `T` or use `Promise<never>`

### Error 87: `src/maybe.ts` - `mapOr` example
```typescript
import Maybe, { mapOr } from 'true-myth/maybe';

function acceptsANullOhNo(value: number | null): Maybe<string> {
  const maybeNumber = Maybe.of(value);
  return mapOr('0', (n) => n.toString(), maybeNumber);
}
```
**Source**: `src/maybe.ts` `mapOr` documentation
**Issue**: Function appears complete but flagged - may need explicit typing

### Error 97: Promise.withResolvers example
```typescript
let { promise, reject } = Promise.withResolvers<number>();

let theTask = Task.tryOrElse(
  promise,
  (reason) => new Error("Promise was rejected", { cause: reason })
);
```
**Source**: Task documentation
**Issue**: Unknown Twoslash issue with Promise.withResolvers (may need polyfill)

### Error 98: Task typo
```typescript
let resolved = Task.resolve(123);
let rejected = Task.rejecte("something went wrong");  // Typo: rejecte
```
**Source**: Task documentation
**Fix**: Change `rejecte` to `reject`

### Error 109: `src/task.ts` - `and` with Result (duplicate of 81)
**Source**: Task `and` method documentation
**Fix**: Add `import Result from 'true-myth/result';`

### Error 110: `src/task.ts` - `map` example (duplicate of 82)
**Source**: Task `map` method documentation
**Fix**: Add Result import or typing correction

### Error 111: `src/task.ts` - `mapRejected` example (duplicate of 50)
**Source**: Line ~374 in `src/task.ts` `mapRejected` documentation
**Fix**: Fix variable name issues

### Error 141: `src/maybe.ts` - `and` variable shadowing
```typescript
import Maybe, { nothing } from 'true-myth/maybe';

const nothing: Maybe<number> = nothing();  // Variable shadows import
console.log(Maybe.and(justB, nothing).toString());
```
**Source**: `src/maybe.ts` `and` method documentation
**Fix**: Rename `nothing` variable to `nothingValue`

### Error 142: Deep type definition
```typescript
type DeepOptionalType = {
  something?: {
    with?: {
      deeperKeys?: string;
    }
  }
};
```
**Source**: Deep optional type example in Maybe documentation
**Issue**: May need usage context

### Error 159-160: `src/maybe.ts` - `get` function example
```typescript
import { get, just } from 'true-myth/maybe';

type Person = { name?: string };
const lookupName = get('name');
const me: Person = { name: 'Chris' };
console.log(lookupName(me)); // Just('Chris')
```
**Source**: Line ~1604 in `src/maybe.ts` `get` function documentation
**Issue**: Unknown Twoslash issue - appears syntactically correct

### Error 165-166: `src/maybe.ts` - `or` method variable shadowing
```typescript
import Maybe, { nothing } from 'true-myth/maybe';

const aNothing: Maybe<string> = nothing();  // Variable shadows import
console.log(Maybe.or(aNothing, justA).toString());
```
**Source**: Line ~803 in `src/maybe.ts` `or` method documentation
**Fix**: Rename `aNothing` to avoid shadowing `nothing` import

### Error 174-175: `src/maybe.ts` - `unwrapOrElse` missing import
```typescript
import Maybe from 'true-myth/maybe';

const aNothing = nothing<number>();  // nothing not imported
console.log(Maybe.unwrapOrElse(handleNothing, aNothing));
```
**Source**: Line ~902 in `src/maybe.ts` `unwrapOrElse` documentation
**Fix**: Add `import { nothing } from 'true-myth/maybe';`

### Error 178-179: `src/maybe.ts` - additional `unwrapOrElse` examples
**Source**: Additional examples in `unwrapOrElse` documentation
**Fix**: Similar import fixes needed

### Error 194-195: Various source locations
**Source**: Multiple locations in source documentation
**Fix**: Individual review required for each specific case

## 3. SYNTAX_ERROR + UNDECLARED_VARIABLE (9 errors)

These need both imports and syntax fixes:

### Error 60: `src/maybe.ts` - `property` example
```typescript
type Person = { name?: string };

const me: Person = { name: 'Chris' };
console.log(Maybe.property('name', me)); // Just('Chris')
```
**Source**: Line ~1503 in `src/maybe.ts` `property` method documentation
**Fix**: Add `import Maybe from "true-myth/maybe";`

### Error 61-63: `src/maybe.ts` - additional `property` examples
**Source**: Multiple Person type examples in `property` documentation
**Fix**: Add `import Maybe from "true-myth/maybe";` to each

### Error 112: `src/maybe.ts` - `property` method example
```typescript
type Person = { name?: string };

const me: Person = { name: 'Chris' };
console.log(Maybe.property('name', me)); // Just('Chris')
```
**Source**: Line ~1503 in `src/maybe.ts` `property` method documentation
**Fix**: Add `import Maybe from "true-myth/maybe";`

### Error 167-170: `src/maybe.ts` - additional Person type examples
**Source**: Multiple locations in Maybe method documentation using Person type
**Fix**: Add `import Maybe from "true-myth/maybe";` to each example

## 4. TASK Import Issues (2 errors)

### Error 115: `src/task.ts` - Task resolve/map example
```typescript
let theTask = Task.resolve(123);
let doubled = theTask.map((n) => n * 2);
let theResult = await doubled;
console.log(theResult.toString()); // Ok(246)
```
**Source**: Task documentation showing basic usage
**Fix**: Add `import Task from "true-myth/task";`

### Error 116: `src/task.ts` - duplicate Task example
**Source**: Same Task resolve/map pattern in documentation
**Fix**: Add `import Task from "true-myth/task";`

## 5. INCOMPLETE_CODE (58 errors - MEDIUM PRIORITY)

These are code fragments that need completion or `@noErrors` annotation:

### Error 2
```typescript
import { just, nothing } from 'true-myth/maybe';

const one = just(1);
const five = just(5);
const none = nothing();
```
**Decision needed**: Complete example or mark as `// @noErrors`

### Error 4, 8, 10, 13, 16-19, 22, 24, 29, 31, 39-42
Similar incomplete code fragments

### Error 36: DOM querySelector example
```typescript
const foo = document.querySelector('#foo');
let width: number;
if (foo !== null) {
  width = foo.getBoundingClientRect().width;
} else {
  // Incomplete else block
```
**Source**: Task or Maybe documentation showing DOM usage
**Fix**: Complete the else block and ensure DOM types are available

## 6. INCOMPLETE_CODE + SYNTAX_ERROR (12 errors)

### Error 76
```typescript
import { just, map, type Just } from 'true-myth/maybe';

const anObjectToWrap = {
  desc: ['this', ' ', 'is a string'],
  val: 42,
```
**Fix**: Complete object definition and fix syntax

### Error 93, 117 (also UNDECLARED_VARIABLE)
```typescript
usersTask.match({
  Resolved: (users) => {
    for (let user of users) {
      const today = new Date();
      console.log("Hello,", user.name ?? "someone", "!");
```
**Fix**: Complete function body, close braces, add imports

### Errors 101-107, 136-137, 143-146
Similar incomplete code with syntax issues

## 7. OTHER Category (60 errors - NEEDS INVESTIGATION)

These errors don't fit standard categories and need manual review:

### Error 1
```typescript
import { just, nothing } from 'true-myth/maybe';

const one = just(1);
const five = just(5);
const none = nothing();
```
**Issue**: Unknown - appears correct but flagged by Twoslash

### Errors 3, 5-7, 9, 11-12, 23, 25-27, 30, 32-34, 37-38, 45-46, 53-55, 64-65, 67, 69, 71-72, 79-80, 89, 95-96, 99, 120, 123, 125, 127, 129-130, 134, 147, 149, 151-153, 155, 157-158, 172-173, 181, 183-185, 188, 190-192
Similar unknown issues requiring investigation

## Action Plan

### Phase 1: Quick Wins (Low Effort, High Impact)
1. **Fix 8 undeclared variable errors** - Add missing Result/Task imports
2. **Fix Task import errors** - Add `import Task from "true-myth/task"`
3. **Fix Person type errors** - Add Maybe imports where missing

### Phase 2: Syntax Reviews (Medium Effort)
1. **Review 41 syntax errors** - Check for missing semicolons, braces
2. **Fix 9 combined syntax/import errors**
3. **Complete 12 incomplete code with syntax issues**

### Phase 3: Content Decisions (Higher Effort)
1. **Review 58 incomplete code examples** - Decide to complete or mark `@noErrors`
2. **Investigate 60 "OTHER" category errors** - May need type annotations or context

### Phase 4: Final Validation
1. Run Twoslash analysis again
2. Verify all fixes work correctly
3. Update documentation as needed

## Notes for Reviewers

- Many "syntax error" examples appear syntactically correct - may need explicit type annotations
- "OTHER" category likely contains type inference issues
- Some examples may be intentionally incomplete for demonstration purposes
- Consider adding `// @noErrors` for code fragments meant to show partial examples
- Consider adding `// @errors: XXXX` for examples meant to demonstrate error cases
