/**
  Provide a type which is effectively a type-safe, non-interchangeable empty
  object to use instead of `null` or `undefined`.

  @module
 */

declare const Tag: unique symbol;

/**
 * Create a unique, nominalish type.
 * @internal
 */
declare class _Unit {
  private readonly [Tag]: '()';
}

/**
  The `Unit` type exists for the cases where you want a type-safe equivalent of
  `undefined` or `null`. It's a concrete instance, which won't blow up on you,
  and you can safely use it with e.g. `Result` without being concerned that
  you'll accidentally introduce `null` or `undefined` back into your
  application.

  Equivalent to `()` or "unit" in many functional or functional-influenced
  languages.
 */
export const Unit = Object.create(null) as Unit;
export interface Unit extends _Unit {}

export default Unit;
