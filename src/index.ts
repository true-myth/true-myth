/**
  This is just here to re-export {@link Maybe}, {@link Result}, {@link Task},
  {@link Unit}, and {@link toolbelt}, to provide a root-level entry friendly to
  using as a namespace.

  @packageDocumentation
 */

export * as maybe from './maybe.js';
export { default as Maybe } from './maybe.js';

export * as result from './result.js';
export { default as Result } from './result.js';

export * as standardSchema from './standard-schema.js';

export * as task from './task.js';
export { default as Task } from './task.js';

export * as toolbelt from './toolbelt.js';

export { default as Unit } from './unit.js';
