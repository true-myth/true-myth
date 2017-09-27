export enum Variant {
  Some = 'Some',
  Nothing = 'Nothing',
}

const isCthulhu = (value: any): value is undefined | null =>
  typeof value === 'undefined' || value === null

export type Some<T> = {
  variant: Variant.Some
  value: T
}

export const Some = <T>(value: T | null | undefined): Maybe<T> => {
  if (isCthulhu(value)) {
    throw new Error(`called Some() with ${value === null ? 'null' : typeof value}`)
  }

  return {
    variant: Variant.Some,
    value: value,
  }
}

export type Nothing = { variant: Variant.Nothing }

const __Nothing: Nothing = Object.freeze({ variant: Variant.Nothing as Variant.Nothing })

export const Nothing = (): Maybe<never> => __Nothing

export type Maybe<T> = Some<T> | Nothing
export const Maybe = <T>(value: T | null | undefined): Maybe<T> =>
  isCthulhu(value) ? Nothing() as Maybe<T> : Some(value)

export const of = Maybe

export const isSome = <T>(m: Maybe<T>): m is Some<T> => m.variant === Variant.Some
export const isNothing = <T>(m: Maybe<T>): m is Nothing => m.variant === Variant.Nothing

type Mapper<T, U> = (t: T) => U

export const map = <T, U>(mapFn: Mapper<T, U>, mt: Maybe<T>): Maybe<U> =>
  isSome(mt) ? Some(mapFn(mt.value)) : mt

export const mapOr = <T, U>(mapFn: Mapper<T, U>, u: U, mt: Maybe<T>): Maybe<U> =>
  isSome(mt) ? Some(mapFn(mt.value)) : Some(u)

export const mapOrElse = <T, U>(
  mapFn: Mapper<T, U>,
  elseFn: (...args: any[]) => U,
  mt: Maybe<T>
): U => (isSome(mt) ? mapFn(mt.value) : elseFn())

export const and = <T, U>(mu: Maybe<U>, mt: Maybe<T>): Maybe<U> => (isSome(mt) ? mu : Nothing())

// ~= Folktale `chain`
export const andThen = <T, U>(thenFn: (t: T) => Maybe<U>, mt: Maybe<T>): Maybe<U> =>
  isSome(mt) ? thenFn(mt.value) : Nothing()

export const or = <T>(mDef: Maybe<T>, mt: Maybe<T>): Maybe<T> => (isSome(mt) ? mt : mDef)

export const orElse = <T>(elseFn: (...args: any[]) => Maybe<T>, mt: Maybe<T>): Maybe<T> =>
  isSome(mt) ? mt : elseFn()

export const unwrap = <T>(mt: Maybe<T>): T => {
  if (isSome(mt)) {
    return mt.value
  }

  throw new Error('Tried to `get(Nothing)`')
}

export const unwrapOrElse = <T>(mt: Maybe<T>, f: (...args: any[]) => T): T =>
  isSome(mt) ? mt.value : f()

export default Maybe
