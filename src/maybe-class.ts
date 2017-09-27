const isCthulhu = (value: any): value is undefined | null =>
  typeof value === 'undefined' || value === null;

export enum Variant {
  Some = 'Some',
  Nothing = 'Nothing',
}

export type MapFn<T, U> = (t: T) => U;

export interface IMaybe<T> {
  variant: Variant;
  map<U>(this: Maybe<T>, mapFn: MapFn<T, U>): Maybe<U>;
  mapOr<U>(this: Maybe<T>, orU: U, mapFn: MapFn<T, U>): U;
  mapOrElse<U>(this: Maybe<T>, orElseFn: (...args: any[]) => U, mapFn: MapFn<T, U>): U;
  or(this: Maybe<T>, mOr: Maybe<T>): Maybe<T>;
  orElse(this: Maybe<T>, orElseFn: (...args: any[]) => Maybe<T>): Maybe<T>;
  and<U>(this: Maybe<T>, mAnd: Maybe<U>): Maybe<U>;
  andThen<U>(this: Maybe<T>, andThenFn: (t: T) => Maybe<U>): Maybe<U>;
  unwrap(): T | never;
  unwrapOrElse(this: Maybe<T>, elseFn: (...args: any[]) => T): T;
}

export class Some<T> implements IMaybe<T> {
  private value: T;

  variant = Variant.Some;

  constructor(value: T | null | undefined) {
    if (isCthulhu(value)) {
      throw new Error('Tried to construct `Some` with `null` or `undefined`');
    }

    this.value = value;
  }

  map<U>(this: Maybe<T>, mapFn: MapFn<T, U>): Maybe<U> {
    return map(mapFn, this);
  }

  mapOr<U>(this: Maybe<T>, orU: U, mapFn: MapFn<T, U>): U {
    return mapOr(orU, mapFn, this);
  }

  mapOrElse<U>(this: Maybe<T>, orElseFn: (...args: any[]) => U, mapFn: MapFn<T, U>): U {
    return mapOrElse(orElseFn, mapFn, this);
  }

  or(this: Maybe<T>, mOr: Maybe<T>): Maybe<T> {
    return or(mOr, this);
  }

  orElse(this: Maybe<T>, orElseFn: (...args: any[]) => Maybe<T>): Maybe<T> {
    return orElse(orElseFn, this);
  }

  and<U>(this: Maybe<T>, mAnd: Maybe<U>): Maybe<U> {
    return and(mAnd, this);
  }

  andThen<U>(this: Maybe<T>, andThenFn: (t: T) => Maybe<U>): Maybe<U> {
    return andThen(andThenFn, this);
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOrElse(this: Maybe<T>, elseFn: (...args: any[]) => T): T {
    return unwrapOrElse(elseFn, this);
  }
}

export class Nothing<T> implements IMaybe<T> {
  variant = Variant.Nothing;

  map<U>(this: Maybe<T>, mapFn: MapFn<T, U>): Maybe<U> {
    return map(mapFn, this);
  }

  mapOr<U>(this: Maybe<T>, orU: U, mapFn: MapFn<T, U>): U {
    return mapOr(orU, mapFn, this);
  }

  mapOrElse<U>(this: Maybe<T>, orElseFn: (...args: any[]) => U, mapFn: MapFn<T, U>): U {
    return mapOrElse(orElseFn, mapFn, this);
  }

  or(this: Maybe<T>, mOr: Maybe<T>): Maybe<T> {
    return or(mOr, this);
  }

  orElse(this: Maybe<T>, orElseFn: (...args: any[]) => Maybe<T>): Maybe<T> {
    return orElse(orElseFn, this);
  }

  and<U>(this: Maybe<T>, mAnd: Maybe<U>): Maybe<U> {
    return and(mAnd, this);
  }

  andThen<U>(this: Maybe<T>, andThenFn: (t: T) => Maybe<U>): Maybe<U> {
    return andThen(andThenFn, this);
  }

  unwrap(): never {
    throw new Error('Tried to `unwrap(Nothing)`');
  }

  unwrapOrElse(this: Maybe<T>, elseFn: (...args: any[]) => T): T {
    return unwrapOrElse(elseFn, this);
  }
}

export const isSome = <T>(m: Maybe<T>): m is Some<T> => m.variant === Variant.Some;
export const isNothing = <T>(m: Maybe<T>): m is Nothing<T> => m.variant === Variant.Nothing;

export const some = <T>(value: T) => new Some<T>(value);
export const nothing = <T>() => new Nothing<T>();

export type Maybe<T> = Some<T> | Nothing<T>;
export const of = <T>(value: T | undefined | null): Maybe<T> =>
  isCthulhu(value) ? nothing<T>() : some(value);

export const map = <T, U>(mapFn: MapFn<T, U>, mt: Maybe<T>): Maybe<U> =>
  isSome(mt) ? some(mapFn(unwrap(mt))) : nothing<U>();

export const mapOr = <T, U>(orU: U, mapFn: MapFn<T, U>, mt: Maybe<T>): U =>
  isSome(mt) ? mapFn(unwrap(mt)) : orU;

export const mapOrElse = <T, U>(
  orElseFn: (...args: any[]) => U,
  mapFn: MapFn<T, U>,
  mt: Maybe<T>
): U => (isSome(mt) ? mapFn(unwrap(mt)) : orElseFn());

export const and = <T, U>(mu: Maybe<U>, mt: Maybe<T>): Maybe<U> => (isSome(mt) ? mu : nothing());

export const andThen = <T, U>(thenFn: (t: T) => Maybe<U>, mt: Maybe<T>): Maybe<U> =>
  isSome(mt) ? thenFn(unwrap(mt)) : nothing();

export const or = <T>(mDef: Maybe<T>, mt: Maybe<T>): Maybe<T> => (isSome(mt) ? mt : mDef);

export const orElse = <T>(elseFn: (...args: any[]) => Maybe<T>, mt: Maybe<T>): Maybe<T> =>
  isSome(mt) ? mt : elseFn();

export const unwrap = <T>(mt: Maybe<T>): T => {
  return mt.unwrap();
};

export const unwrapOrElse = <T>(orElseFn: (...args: any[]) => T, mt: Maybe<T>): T =>
  isSome(mt) ? unwrap(mt) : orElseFn();
