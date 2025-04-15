/**
  @module
  @internal
*/

/**
 * Check if the value here is an all-consuming monstrosity which will consume
 * everything in its transdimensional rage. A.k.a. `null` or `undefined`.
 *
 * @internal
 */
export const isVoid = (value: unknown): value is undefined | null =>
  typeof value === 'undefined' || value === null;

/** @internal */
export function curry1<T, U>(op: (t: T) => U, item?: T): U | ((t: T) => U) {
  return item !== undefined ? op(item) : op;
}

/**
 * Check whether a given key is in an object
 * @internal
 */
function has<T, K extends PropertyKey>(value: T, key: K): value is T & { [Key in K]: unknown } {
  return typeof value === 'object' && value !== null && key in value;
}

export function safeToString(value: unknown): string {
  if (has(value, 'toString') && typeof value['toString'] === 'function') {
    const fnResult = value.toString();
    return typeof fnResult === 'string' ? fnResult : JSON.stringify(value);
  } else {
    return JSON.stringify(value);
  }
}

/**
  This is the standard *correct* definition for a function which is a proper
  subtype of all other functions: parameters of a function subtype must be
  *wider* than those of the base type, and return types must be *narrower*.
  Everything is wider than `never[]` and narrower than `unknown`, so any
  function is assignable to places this is used.
 */
export type AnyFunction = (...params: never[]) => unknown;
