/**
  This is just here to re-export [`Maybe`](./_maybe_.html) and
  [`Result`](./_result_.html). It doesn't do anything else.
 */

import * as MaybeNamespace from './maybe';
export type Maybe<T> = import('./maybe').Maybe<T>;
export const Maybe = MaybeNamespace;

import * as ResultNamespace from './result';
export type Result<T, E> = import('./result').Result<T, E>;
export const Result = ResultNamespace;

import * as UnitNamespace from './unit';
export type Unit = import('./unit').Unit;
export const Unit = UnitNamespace;
