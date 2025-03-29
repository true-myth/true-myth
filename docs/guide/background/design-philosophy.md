# Design philosophy

The design aims for True Myth are:

- to be as idiomatic as possible in JavaScript
- to support a natural functional programming style
- to have zero runtime cost beyond simple object construction and function invocation
- to lean heavily on TypeScript to enable all of the above

## Idiomatic and functional-friendly

- You can construct the variant types in the traditional JavaScript way or with a pure function:

  ```typescript
  import Maybe, { just, nothing } from 'true-myth/maybe';

  const classicalJust = new Maybe('value');
  const classicalNothing = new Maybe<string>();

  const functionalJust = just('value');
  const functionalNothing = nothing();
  ```

- Similarly, you can use methods or pure functions:

  ```typescript
  import { ok, map } from 'true-myth/result';

  const numberResult = ok(42);
  const ok84 = numberResult.map((x) => x * 2);
  const ok21 = map((x) => x / 2, numberResult);
  ```

  As this second example suggests, the aim has been to support the most idiomatic approach for each style. This means that yes, you might find it a bit confusing if you're actively switching between the two of them. (Why would you do that?!?)

The overarching themes are flexibility and approachability.

The hope is that a team just picking up these ideas for the first time can use them without adapting their whole style to a "traditional" functional programming approach, but a team comfortable with functional idioms will find themselves at home with the style of data-last pure functions. (For a brief discussion of why you want the data last in a functional style, see [this blog post].)

## Performance

Any place you try to treat a `Maybe`, a `Result`, or a `Task` as just the underlying value rather than the container, the type systems will complain, of course. And you'll also get help from smart editors with suggestions about what kinds of values (including functions) you need to interact with any given helper or method, since the type definitions are supplied.

By leaning on TypeScript to handle the checking, we also get all these benefits with _no_ runtime overhead other than the cost of constructing the actual container objects (which is to say: _very_ low!) and, in the case of `Task`, one additional microtask queue tick.

Using the library with TypeScript will _just work_ and will provide you with considerable safety out of the box.

## TypeScript assumed

On the other hand, using True Myth with JavaScript is possible, but somewhat inadvisable. Because this is a TypeScript-first library, we intentionally leave out any runtime type checking. That in turn means you can and will end up with inscrutable error messages about accessing invalid data.

Many of the functions simply assume that the types are checked, and _will_ throw errors if you pass in items of the wrong type. This is true of even the basic helpers like `isJust` and `isNothing`. These assumptions have been made precisely _because_ this is a TypeScript-first library.

As such, you _should_ make use of the type systems if you want the benefits of the system.

See the discussion in [Comparison](./comparison) comparing True Myth to Folktale and Sanctuary if you aren't using TypeScript and *do* need runtime checks.

[this blog post]: http://www.chriskrycho.com/2017/collection-last-auto-curried-functions.html
[ramda]: http://ramdajs.com
[lodash]: https://lodash.com
