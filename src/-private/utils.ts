/** @internal */

/**
 * Check if the value here is an all-consuming monstrosity which will consume
 * everything in its transdimensional rage. A.k.a. `null` or `undefined`.
 *
 * @internal
 */
export const isVoid = (value: any): value is undefined | null =>
  typeof value === 'undefined' || value === null;

/** @internal */
export function curry1<T, U>(op: (t: T) => U, item?: T) {
  return item !== undefined ? op(item) : op;
}

/** @internal */
export class Brand<Tag extends string> {
  protected readonly _brand: Tag;

  constructor(tag: Tag) {
    this._brand = tag;
  }
}
