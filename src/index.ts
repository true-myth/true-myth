/**
  This is just here to re-export {@link Maybe}, {@link Result}, {@link Unit},
  and {@link Toolbelt}  – that is, to provide a root-level entry amenable to use
  with Node with TypeScript versions before 4.7 and its ESM support, or for
  convenience.

  @packageDocumentation
 */

export { default as Maybe } from './maybe.js';
export * as MaybeNS from './maybe.js';

export { default as Result } from './result.js';
export * as ResultNS from './result.js';

export { default as Unit } from './unit.js';

export { default as Task } from './task.js';

export * as Toolbelt from './toolbelt.js';
