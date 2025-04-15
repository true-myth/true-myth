[True Myth](../index.md) / toolbelt

# toolbelt

Tools for working easily with `Maybe` and `Result` *together*... but which do
not *require* you to use both. If they were in the `true-myth/maybe` or
`true-myth/result` modules, then importing either would always include the
other. While that is not usually a concern with bundlers, it *is* an issue
when using dynamic imports or otherwise doing runtime resolution in a browser
or similar environment.

The flip side of that is: importing from *this* module *does* require access
to both `Maybe` and `Result` modules.

## Functions

- [fromMaybe](functions/fromMaybe.md)
- [fromResult](functions/fromResult.md)
- [toMaybe](functions/toMaybe.md)
- [toOkOrElseErr](functions/toOkOrElseErr.md)
- [toOkOrErr](functions/toOkOrErr.md)
- [transposeMaybe](functions/transposeMaybe.md)
- [transposeResult](functions/transposeResult.md)
