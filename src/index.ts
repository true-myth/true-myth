/**
  This is just here to re-export {@link Maybe}, {@link Result}, {@link Task},
  {@link Unit}, and {@link toolbelt}, to provide a root-level entry friendly to
  using as a namespace.

  @packageDocumentation
 */

export { default as Maybe } from './maybe.js';
export * as maybe from './maybe.js';

export { default as Result } from './result.js';
export * as result from './result.js';

export { default as Unit } from './unit.js';

export { default as Task } from './task.js';
export * as task from './task.js';

export * as toolbelt from './toolbelt.js';
