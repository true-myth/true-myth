/**
 * Check if the value here is an all-consuming monstrosity which will consume
 * everything in its transdimensional rage. A.k.a. `null` or `undefined`.
 */
export const isVoid = (value: any): value is undefined | null =>
  typeof value === 'undefined' || value === null;

export type AndThenAliases = 'andThen' | 'chain' | 'flatMap';
