import Maybe, { Just, Nothing } from '../maybe';

// This is to deal with TS not knowing what to do with the fact that `Just` and
// `Nothing` are sort of sub-exported from the maybe module.
// tslint:disable
Just;
Nothing;
// tslint:enable

export const map = <T, U>(mapFn: (t: T) => U) => (maybe: Maybe<T>) => Maybe.map(mapFn, maybe);
