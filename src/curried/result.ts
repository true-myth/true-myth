import Result, { Err, Ok } from '../result';

// This is to deal with TS not knowing what to do with the fact that `Ok` and
// `Err` are sort of sub-exported from the maybe module.
// tslint:disable
Ok;
Err;
// tslint:enable

export const map = <T, U, E>(mapFn: (t: T) => U) => (result: Result<T, E>) =>
  Result.map(mapFn, result) as Result<U, E>;
