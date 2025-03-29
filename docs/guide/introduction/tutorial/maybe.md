# Dealing with Nothingness: `Maybe`

How do you represent the concept of _not having anything_, programmatically? True Myth provides a `Maybe` type. Let’s look at JavaScript‘s defaults here to see why a `Maybe` type is useful!

## `null` and `undefined`

As a language, JavaScript uses `null` to represent this concept; if you have a variable `myNumber` to store numbers, you might assign the value `null` when you don't have any number at all. If you have a variable `myString`, you might set `myString = null;` when you don't have a string.

Some JavaScript programmers use `undefined` in place of `null` or in addition to `null`, so rather than setting a value to `null` they might just set `let myString;` or even `let myString = undefined;`.

Every language needs a way to express the concept of nothing, but `null` and `undefined` are a curse. Their presence in JavaScript (and in many other languages) introduce a host of problems, because they are not a particularly _safe_ way to represent the concept. Say, for a moment, that you have a function that takes an integer as a parameter:

```js
let myNumber = undefined;

function myFuncThatTakesAnInteger(anInteger) {
  return anInteger.toString();
}

myFuncThatTakesAnInteger(myNumber); // TypeError: anInteger is undefined
```

![this is fine](https://user-images.githubusercontent.com/2403023/31154374-ac25ce0e-a874-11e7-9399-73ad99d9d6cb.png)

When the function tries to convert the integer to a string, the function blows up because it was written with the assumption that the parameter being passed in (a) is defined and (b) has a `toString` method. Neither of these assumptions are true when `anInteger` is `null` or `undefined`. This leads JavaScript programmers to program defensively, with `if (!anInteger) return;` style guard blocks at the top of their functions. This leads to harder-to-read code, and what's more, _it doesn't actually solve the root problem._

You could imagine this situation playing itself out in a million different ways: arguments to functions go missing. Values on objects turn out not to exist. Arrays are absent instead of merely empty. The result is a steady stream not merely of programming frustrations, but of _errors_. The program does not function as the programmer intends. That means stuff doesn't work correctly for the user of the software.

You can program around `null` and `undefined`. But defensive programming is gross. You write a lot of things like this:

```js
function isNil(thingToCheck) {
  return thingToCheck === undefined || thingToCheck === null;
}

function doAThing(withAString) {
  if (isNil(withAString)) {
    withAString = 'some default value';
  }

  console.log(withAString.length);
}
```

If you forget that check, or simply assume, "Look, I'll _never_ call this without including the argument," eventually you or someone else will get it wrong. Usually somewhere far away from the actual invocation of `doAThing`, so that it's not obvious why that value ended up being `null` there.

## TypeScript

TypeScript takes us a big step in the right direction, so long as our type annotations are good enough. (Use of `any` will leave us sad, though.) We can specify that a given item _may_ be present, using the [optional] annotation. This at least helps keep us honest.

But we still end up writing a ton of repeated boilerplate to deal with this problem. Rather than just handling it once and being done with it, we play a never-ending game of whack-a-mole. It just uses [type narrowing][narrowing] to make it safe:

```ts
function isNil(thingToCheck: unknown): thingToCheck is null | undefined {
  return thingToCheck === undefined || thingToCheck === null;
}

function doAThing(withAString: string | undefined) {
  if (isNil(withAString)) {
    withAString = 'some default value';
  }

  console.log(withAString.length);
}
```

Even with TypeScript, we must be constantly vigilant and proactive so that our users don't get into broken error states; we still have to litter our code with these kinds of checks everywhere.

[optional]: http://www.typescriptlang.org/docs/handbook/interfaces.html#optional-properties
[narrowing]: https://www.typescriptlang.org/docs/handbook/2/narrowing.html

## Switching to `Maybe`

It turns out you probably already have a good idea of how this works, if you've spent much time writing JavaScript, because this is exactly how arrays work.

Imagine, for a moment, that you have a variable `myArray` and you want to map over it and print out every value to the console. You instantiate it as an empty array and then forget to load it up with values before mapping over it:

```js
let myArray = [];
// oops, I meant to load up the variable with an array, but I forgot!
myArray.forEach((n) => console.log(n)); // <nothing prints to the screen>
```

Even though this doesn't print anything to the screen, it doesn't unexpectedly blow up, either. In other words, it represents the concept of having nothing "inside the box" in a safe manner. By contrast, an integer has no such safe box around it. What if you could multiply an integer by two, and if your variable was "empty" for one reason or another, it wouldn't blow up?

```js
let myInteger = undefined;

myInteger * 3; // 😢
```

Let's try that again, but this time let's put the actual value in a container and give ourselves safe access methods:

```js
import Maybe from 'true-myth/maybe';

const myInteger = Maybe.of(undefined);
myInteger.map((x) => x * 3); // Nothing
```

![mind blown](https://user-images.githubusercontent.com/2403023/31098390-5d6573d0-a790-11e7-96f9-361d2e70522b.gif)

We received `Nothing` back as our value, which isn't particularly useful, but it also didn't halt our program in its tracks!

Best of all, when you use these with libraries like TypeScript, you can lean on their type systems to check aggressively for `null` and `undefined`, and actually _eliminate_ those from your codebase by replacing anywhere you would have used them with `Maybe`.

The behavior of this type is checked by TypeScript at compile time, and bears no runtime overhead other than the very small cost of the container object and some lightweight wrap/unwrap functionality.

The `Nothing` variant has a type parameter `Nothing<T>` so that type inference works correctly in TypeScript when operating on `Nothing` instances with functions which require a `T` to behave properly, e.g. [`map`][map], which cannot check that the map function satisfies the type constraints for `Maybe<T>` unless `Nothing` has a parameter `T` to constrain it on invocation.

[map]: https://true-myth.js.org/modules/maybe.html#map

Put simply: without the type parameter, if you had a `Nothing` variant of a `Maybe<string>`, and you tried to use it with a function which expected a `Maybe<number>` it would still type check – because TypeScript doesn't have enough information to check that it _doesn't_ meet the requirements.

:::warning 🚧 Under Construction 🚧

There will be more content here Soon™. We didn’t want to block getting the new docs site live on having fleshed out the whole tutorial!

:::
