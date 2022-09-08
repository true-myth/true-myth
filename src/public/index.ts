/**
  This is just here to re-export {@link Maybe}, {@link Result}, {@link Unit},
  and {@link Toolbelt}  – that is, to provide a root-level entry amenable to use
  with Node with TypeScript versions before 4.7 and its ESM support, or for
  convenience.

  @packageDocumentation
 */

export { Maybe } from './maybe.js';
export { Result } from './result.js';
export { Unit } from './unit.js';
export * as Toolbelt from './toolbelt.js';
