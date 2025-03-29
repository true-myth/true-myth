# The type names

## `Maybe`

The existing options in this space include `Option`, `Optional`, and `Maybe`. You could also point to "nullable," but that actually means the _opposite_ of what we're doing here – these represent types which can _not_ be nullable!

`Option` implies a choice between several different _options_; in this case that's not really what's going on. It's also not really a great word for the type in the sense that it's weird to read aloud: "an Option string" doesn't make any sense in English.

`Optional` is much better than `Option`. The semantics are much more accurate, in that it captures that the thing is allowed to be absent. It's also the nicest grammatically: "an Optional string". On the other hand, it's also the _longest_.

`Maybe` seems to be the best type name semantically: we're modeling something which _may_ be there – or may _not_ be there! Grammatically, it's comparable to "optional": "a Maybe string" isn't great – but "maybe a string" is the most natural _accurate_ way to answer the question, "What's in this field?" It's also the shortest!

`Optional` or `Maybe` are both good names; `Maybe` just seemed slightly better.

### The `Maybe` variants: `Just` and `Nothing`

Similar consideration was given to the names of the type variants. Options for the "present" type in other libraries are `Some` and `Just`. Options for the "absent" type are `None` or `Nothing`.

#### Why `Just`?

Both `Just` and `Some` are reasonable choices for this, and both have things to recommend them semantically:

- When talking about the _type_ of given item, "some" makes a lot of sense: "What's in this field? Some number." You can get the same idea across with "just" but it's a bit less clear: "What's in this field? Just a number."
- On the other hand, when talking about or constructing a given _value_, "just" makes more sense: "What is this? It's just 12." When you try to use "some" there, it reads oddly: "What is this? It's some 12."

Given that "just a number" _works_ (even if it's strictly a little less nice than "some number") and that "just 12" works but "some 12" doesn't, `Just` seems to be a slightly better option.

#### Why `Nothing`?

Given the choice between `None` and `Nothing`, the consideration just came down to the most natural _language_ choice. "What's here? Nothing!" makes sense, while "What's here? None" does not. `None` also implies that there might be more than one of the items. It's entirely unnatural to say "There is none of a number here"; you'd normally say "there is no number here" or "there is nothing here" instead. So `Nothing` it is!

## `Result`

In some languages and libraries, a more general type named `Either` is used instead of the more specific `Result` name. The two are equivalent in functionality – both provide two variants, each of which wraps a value. In the `Either` implementations, those are usually named `Left` and `Right`. In the `Result` implementations (both here and in other libraries and languages), they are named `Ok` and `Err`.

The main difference between `Either` and `Result` is precisely that question of generality. `Either` can meaningfully capture _any_ scenario where there are two possible values resulting from a given function application, or applicable as arguments to a function. `Result` _only_ captures the idea of something succeeding or failing. In that sense, `Either` might seem to be better: it can capture what `Result` captures (traditionally with `Left` being the error case and `Right` being the success, or _right_, case), and many more besides.

However, in practice, the idea of a result is far and away the most common case for using an `Either`, and it's also the easiest to explain.

### The `Result` variants: `Ok` and `Err`

Given a "result" type, we need to be able to express the idea of "success" and "failure." The most obvious names here would be `Success` and `Failure`. Those are actually really good names with a single problem: they're _long_. Needing to write `success(12)` or `failure({ oh: 'no' })` is a _lot_ to write over and over again. Especially when there some options which _also_ work well: `Ok` and `Err`.

Both `Ok` and `Err` could be written out long-form: `Okay` and `Error`. But in this case, the longer names don't add any particular clarity; they require more typing; and the `Error` case also overloads the existing name of the base exception type in JavaScript. So: `Ok` and `Err` it is.

## `Task`

There are a handful of names for async operations used by various languages and frameworks:[^other-task-names]

- `Promise` (JavaScript and TypeScript, Scala)
- `Task` (Swift, C#, F#, Elm, Roc)
- `Future` (Rust, Scala)
- `Async` (Haskell)

The first one is a non-starter for True Myth for what we think is a pretty obvious reason: that’s the name JavaScript and TypeScript already use for this! Likewise, although `Async` could probably work here, it is very close to the existing JavaScript and TypeScript keyword, and it would be extremely unsurprising to see it appear as a dedicated type (_a la_ `Awaited`) in a future version of TypeScript.

That leaves `Future` and `Task`. `Future` is slightly less common between the two, and “a future” is a slightly stranger thing to say than “a task”. Since the type is a data structure representing an ongoing asynchronous operation, “task” is a natural way to describe it (which is why so many languages do!).

Beyond that we chose to match the nomenclature from `Promise` and our own `Result` to make it easy to remember: if you have used either of those APIs, the `Task` API is exactly the same.

[^other-task-names]: There may be others as well; these are just the ones we know of off the top of our heads!

## The library itself

For slightly quirky [historical reasons][history], libraries which borrow ideas from typed functional programming in JavaScript often use names related to the phrase "fantasy land" – especially [Fantasy Land][fl] itself and [Folktale][folktale].

[history]: https://github.com/promises-aplus/promises-spec/issues/94#issuecomment-16176966
[fl]: https://github.com/fantasyland/fantasy-land
[folktale]: http://folktale.origamitower.com

"True Myth" leans on that history (and serves, hopefully, as a respectful nod to Folktale in particular, as both Folktale and Sanctuary are huge inspirations for this library), and borrows an idea from J.R.R. Tolkien and C.S. Lewis: what if all myths appeal to us because they point ultimately at something true – and what if some story with the structure of a myth _were_ true in history? It's a beautiful idea, and the name of this library was picked as an homage to it.
