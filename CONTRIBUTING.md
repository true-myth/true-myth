# Contributing

We welcome [contributions](https://www.youtube.com/watch?v=Abu2BNixXak) to True Myth! However, the library is fairly stable and mature, so please follow this basic approach:

For bugs or ideas, please start a conversation *before* opening a PR:

- For bugs, start by [opening an issue][issues] with a clear reproduction. For one, there may be a reason for the existing behavior. For another

- Do you have an idea for a new feature? Open a [discussion][discussions] about your idea—and check to see if it has already been discussed there (or in the [issues][issues] from before we had Discussions).

For typos or docs improvements, feel free to go ahead and [open a pull request][pr] fixing it directly!

[issues]: https://github.com/true-myth/true-myth/issues
[discussions]: https://github.com/true-myth/true-myth/discussions
[pr]: https://github.com/true-myth/true-myth/pulls

## Working in the project

Once you have followed the steps above and are working on a new contribution, you can use this basic workflow:

-   Check out the repository:

    ```sh
    $ git clone git@github.com:true-myth/true-myth.git
    ```

    Or, using the GitHub CLI:

    ```sh
    $ gh repo clone true-myth/true-myth
    ```

-   Install its dependencies:

    ```sh
    $ yarn
    ```

    Note that we use [Volta](https://volta.sh) to manage our JavaScript toolchain. If you are having problems getting the project, you should start by installing Volta, which will give you the same versions of Node and Yarn we use for development and testing.

-   Run the tests as you work, using `yarn test` or `yarn test --watch`.

-   Run `yarn type-check` or `yarn type-check --watch` to proactively check for type errors.

-   Once you have made the changes, commit the changes with a [good commit message](https://blog.stephcrown.com/writing-better-commit-messages). Then [open a pull request][pr], linking it to the issue or discussion it relates to.
