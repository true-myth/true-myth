/**
 * Check if the value here is an all-consuming monstrosity which will consume
 * everything in its transdimensional rage. A.k.a. `null` or `undefined`.
 */
export const isVoid = (value: any): value is undefined | null =>
  typeof value === 'undefined' || value === null;

export function curry1<T, U>(op: (t: T) => U, item?: T) {
  return item !== undefined ? op(item) : op;
}

export type AndThenAliases = 'andThen' | 'chain' | 'flatMap';

// tslint:disable-next-line:class-name
export class _Brand<Tag extends string> {
  // @ts-ignore
  private _brand: Tag;
  constructor(t: Tag) {
    this._brand = t;
  }
}
