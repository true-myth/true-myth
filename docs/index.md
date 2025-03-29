---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "True Myth"
  text: Really safe types.
  tagline: |
    Safe, idiomatic null, error, and async code handling in TypeScript, with <code>Maybe</code>, <code>Result</code>, and <code>Task</code> types that are <em>really nice</em>.
  actions:
    - theme: brand
      text: Guide
      link: /guide/introduction/
    - theme: brand
      text: API Docs
      link: /api/
    - theme: alt
      text: Releases
      link: /releases/
    - theme: alt
      text: GitHub
      link: https://github.com/true-myth/true-myth

features:
  - title: <a href="/guide/understanding/maybe/">Maybe</a>
    details: Better than <code>null</code> and <code>undefined</code> everywhere.
  - title: <a href="/guide/understanding/result/">Result</a>
    details: Treat errors like they matter (because they do).
  - title: <a href="/guide/understanding/task/">Task</a>
    details: If <code>Promise</code> had more features <em>and</em> handled errors!
  - title: A nice <a href="/api/toolbelt/">toolbelt</a>
    details: Helpers for many common situations.
  - title: Idiomatic APIs
    details: Feels like working with built-in JavaScript and TypeScript types.
  - title: Functional-friendly
    details: Like to <code>pipe(your, data, around)</code>? We’ve got you.

---

True Myth provides standard, type-safe wrappers and helper functions to help you with three _extremely_ common cases in programming:

- not having a value
- having a _result_ where you need to deal with either success or failure
- having an asynchronous operation which may fail

You could implement all of these yourself—but it's much better to just have one extremely well-tested library you can use everywhere to solve this problem once and for all.

[Read the docs](./guide/introduction/) for more!
