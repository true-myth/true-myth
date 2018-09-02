# Maybe

A [`Maybe<T>`](#maybe) represents a value of type `T` which may, or may not, be present.

If the value is present, it is `Just(value)`. If it's absent, it's `Nothing`. This provides a type-safe container for dealing with the possibility that there's nothing here – a container you can do many of the same things you might with an array – so that you can avoid nasty `null` and `undefined` checks throughout your codebase.

The behavior of this type is checked by TypeScript or Flow at compile time, and bears no runtime overhead other than the very small cost of the container object and some lightweight wrap/unwrap functionality.

The `Nothing` variant has a type parameter `<T>` so that type inference works correctly in TypeScript when operating on `Nothing` instances with functions which require a `T` to behave properly, e.g. [`map`][map], which cannot check that the map function satisfies the type constraints for `Maybe<T>` unless `Nothing` has a parameter `T` to constrain it on invocation.

[map]: https://chriskrycho.github.io/true-myth/modules/_maybe_.html#map

Put simply: without the type parameter, if you had a `Nothing` variant of a `Maybe<string>`, and you tried to use it with a function which expected a `Maybe<number>` it would still type check – because TypeScript doesn't have enough information to check that it _doesn't_ meet the requirements.

## Using `Maybe`

The library is designed to be used with a functional style, allowing you to compose operations easily. Thus, standalone pure function versions of every operation are supplied. However, the same operations also exist on the `Just` and `Nothing` types directly, so you may also write them in a more traditional "fluent" object style.

### Examples: functional style

```ts
import Maybe from 'true-myth/maybe';

// Construct a `Just` where you have a value to use, and the function accepts
// a `Maybe`.
const aKnownNumber = Maybe.just(12);

// Construct a `Nothing` where you don't have a value to use, but the
// function requires a value (and accepts a `Maybe`).
const aKnownNothing = Maybe.nothing<string>();

// Construct a `Maybe` where you don't know whether the value will exist or
// not, using `of`.
type WhoKnows = { mightBeAThing?: boolean[] };

const whoKnows: WhoKnows = {};
const wrappedWhoKnows = Maybe.of(whoKnows.mightBeAThing);
console.log(toString(wrappedWhoKnows)); // Nothing

const whoElseKnows: WhoKnows = { mightBeAThing: [true, false] };
const wrappedWhoElseKnows = Maybe.of(whoElseKnows.mightBeAThing);
console.log(toString(wrappedWhoElseKnows)); // "Just(true,false)"
```

### Examples: fluent object invocation

**Note:** in the "class"-style, if you are constructing a `Maybe` from an unknown source, you must either do the work to check the value yourself, or use `Maybe.of` – you can't know at that point whether it's safe to construct a `Just` without checking, but `of` will always work correctly!

```typescript
import { isVoid } from 'true-myth/utils';
import Maybe, { Just, Nothing } from 'true-myth/maybe';

// Construct a `Just` where you have a value to use, and the function accepts
// a `Maybe`.
const aKnownNumber = new Just(12);

// Once the item is constructed, you can apply methods directly on it.
const fromMappedJust = aKnownNumber.map(x => x * 2).unwrapOr(0);
console.log(fromMappedJust); // 24

// Construct a `Nothing` where you don't have a value to use, but the
// function requires a value (and accepts a `Maybe<string>`).
const aKnownNothing = new Nothing();

// The same operations will behave safely on a `Nothing` as on a `Just`:
const fromMappedNothing = aKnownNothing.map(x => x * 2).unwrapOr(0);
console.log(fromMappedNothing); // 0

// Construct a `Maybe` where you don't know whether the value will exist or
// not, using `isVoid` to decide which to construct.
type WhoKnows = { mightBeAThing?: boolean[] };

const whoKnows: WhoKnows = {};
const wrappedWhoKnows = !isVoid(whoKnows.mightBeAThing)
  ? new Just(whoKnows.mightBeAThing)
  : new Nothing();

console.log(wrappedWhoKnows.toString()); // Nothing

const whoElseKnows: WhoKnows = { mightBeAThing: [true, false] };
const wrappedWhoElseKnows = !isVoid(whoElseKnows.mightBeAThing)
  ? new Just(whoElseKnows.mightBeAThing)
  : new Nothing();

console.log(wrappedWhoElseKnows.toString()); // "Just(true,false)"
```

As you can see, it's often advantageous to use `Maybe.of` even if you're otherwise inclined to use the class method approach; it dramatically cuts down the boilerplate you have to write (since, under the hood, it's doing exactly this check!).

### Prefer [`Maybe.of`][of]

[of]: https://chriskrycho.github.io/true-myth/modules/_maybe_.html#of

In fact, if you're dealing with data you are not constructing directly yourself, **_always_** prefer to use [`Maybe.of`] to create a new `Maybe`. If an API lies to you for some reason and hands you an `undefined` or a `null` (even though you expect it to be an actual `T` in a specific scenario), the `.of()` function will still construct it correctly for you.

By contrast, if you do `Maybe.just(someVariable)` and `someVariable` is `null` or `undefined`, the program will throw at that point. This is a simple consequence of the need to make the `new Just()` constructor work; we cannot construct `Just` safely in a way that excludes a type of `Maybe<null>` or `Maybe<undefined>` otherwise – and that would defeat the whole purpose of using a `Maybe`!

### Writing type constraints

Especially when constructing a `Nothing`, you may need to specify what _kind_ of `Nothing` it is. The TypeScript and Flow type systems can figure it out based on the value passed in for a `Just`, but there's no value to use with a `Nothing`, so you may have to specify it. In that case, you can write the type explicitly:

```typescript
import Maybe, { nothing } from 'true-myth/maybe';

function takesAMaybeString(thingItTakes: Maybe<string>) {
  console.log(thingItTakes.unwrapOr(''));
}

// Via type definition
const nothingHere: Maybe<string> = nothing();
takesAMaybeString(nothingHere);

// Via type coercion
const nothingHereEither = nothing<string>();
takesAMaybeString(nothingHereEither);
```

Note that this _is_ necessary if you declare the `Maybe` in a statement inside a function, but is _not_ necessary when you have an expression-bodied arrow function or when you return the item directly:

```typescript
import Maybe, { nothing } from 'true-myth/maybe';

// ERROR: Type 'Maybe<{}>' is not assignable to type 'Maybe<number>'.
const getAMaybeNotAssignable = (): Maybe<number> => {
  const theMaybe = nothing();
  return theMaybe;
};

// Succeeds
const getAMaybeExpression = (shouldBeJust: boolean): Maybe<number> => nothing();

// Succeeds
const getAMaybeReturn = (shouldBeJust: boolean): Maybe<number> => {
  return nothing();
};
```

## Using `Maybe` Effectively

The best times to create and safely unwrap `Maybe`s are at the _boundaries_ of your application. When you are deserializing data from an API, or when you are handling user input, you can use a `Maybe` instance to handle the possibility that there's just nothing there, if there is no good default value to use _everywhere_ in the application. Within the business logic of your application, you can then safely deal with the data by using the `Maybe` functions or method until you hit another boundary, and then you can choose how best to handle it at that point.

You won't normally need to unwrap it at any point _other_ than the boundaries, because you can simply apply any transformations using the helper functions or methods, and be confident that you'll have either correctly transformed data, or a `Nothing`, at the end, depending on your inputs.

If you are handing data off to another API, for example, you might convert a `Nothing` right back into a `null` in a JSON payload, as that's a reasonable way to send the data across the wire – the consumer can then decide how to handle it as is appropriate in its own context.

If you are rendering a UI, having a `Nothing` when you need to render gives you an opportunity to provide default/fallback content – whether that's an explanation that there's nothing there, or a sensible substitute, or anything else that might be appropriate at that point in your app.

You may also be tempted to use `Maybe`s to replace boolean flags or similar approaches for defining branching behavior or output from a function. You should avoid that, in general. Reserve `Maybe` for modeling the possible _absence of data_, and nothing else. Prefer to use `Result` or `Either` for _fallible_ or _disjoint_ scenarios instead – or construct your own union types if you have more than two boundaries!

Finally, and along similar lines, if you find yourself building a data structure with a lot of `Maybe` types in it, you should consider it a "code smell" – something wrong with your model. It usually means you should find a way to refactor the data structure into a union of smaller data structures which more accurately capture the domain you're modeling.
