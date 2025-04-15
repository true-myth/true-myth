[True Myth](../index.md) / result

# result

A [`Result<T, E>`](classes/Result.md) is a type representing the value result of a
synchronous operation which may fail, with a successful value of type `T` or
an error of type `E`.

If the result is a success, it is [`Ok(value)`](interfaces/Ok.md). If the result is a
failure, it is [`Err(reason)`](interfaces/Err.md).

For a deep dive on the type, see [the guide](/guide/understanding/result.md).

## Classes

- [Result](classes/Result.md)

## Interfaces

- [Err](interfaces/Err.md)
- [ErrJSON](interfaces/ErrJSON.md)
- [Ok](interfaces/Ok.md)
- [OkJSON](interfaces/OkJSON.md)
- [ResultConstructor](interfaces/ResultConstructor.md)

## Type Aliases

- [Matcher](type-aliases/Matcher.md)
- [ResultJSON](type-aliases/ResultJSON.md)
- [Variant](type-aliases/Variant.md)

## Variables

- [err](variables/err.md)
- [ok](variables/ok.md)
- [Variant](variables/Variant.md)

## Functions

- [and](functions/and.md)
- [andThen](functions/andThen.md)
- [ap](functions/ap.md)
- [equals](functions/equals.md)
- [isErr](functions/isErr.md)
- [isInstance](functions/isInstance.md)
- [isOk](functions/isOk.md)
- [map](functions/map.md)
- [mapErr](functions/mapErr.md)
- [mapOr](functions/mapOr.md)
- [mapOrElse](functions/mapOrElse.md)
- [match](functions/match.md)
- [or](functions/or.md)
- [orElse](functions/orElse.md)
- [safe](functions/safe.md)
- [toJSON](functions/toJSON.md)
- [toString](functions/toString.md)
- [tryOr](functions/tryOr.md)
- [tryOrElse](functions/tryOrElse.md)
- [unwrapOr](functions/unwrapOr.md)
- [unwrapOrElse](functions/unwrapOrElse.md)

## References

### default

Renames and re-exports [Result](classes/Result.md)
