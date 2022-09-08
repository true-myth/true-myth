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
export function curry1<T, U>(op: (t: T) => U, item?: T) {
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
