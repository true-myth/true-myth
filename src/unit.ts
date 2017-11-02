import { Brand } from './utils';

/**
  The `Unit` type exists for the cases where you want a type-safe equivalent of
  `undefined` or `null`. It's a concrete instance, which won't blow up on you,
  and you can safely use it with e.g. [`Result`](../modules/_result_.html)
  without being concerned that you'll accidentally introduce `null` or
  `undefined` back into your application.
 */
export type Unit = typeof Unit;
export const Unit = new Brand('unit');
export default Unit;
