export enum Variant {
  Some = 'Some',
  Nothing = 'Nothing',
}

const isCthulhu = (value: any): value is undefined | null =>
  typeof value === 'undefined' || value === null

type Some<T> = {
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

type Nothing = { variant: Variant.Nothing }

const __Nothing: Nothing = Object.freeze({ variant: Variant.Nothing as Variant.Nothing })

export const Nothing = (): Maybe<never> => __Nothing

export type Maybe<T> = Some<T> | Nothing
export const Maybe = <T>(value: T | null | undefined): Maybe<T> =>
  isCthulhu(value) ? Nothing() as Maybe<T> : Some(value)

export const of = Maybe

type Mapper<T, U> = (t: T) => U

export const map = <T, U>(mapper: Mapper<T, U>, m: Maybe<T>): Maybe<U> =>
  m.variant === Variant.Some ? Some(mapper(m.value)) : m

export const and = <T, U>(t: Maybe<T>, u: Maybe<U>): Maybe<U> => (isSome(t) ? u : Nothing())
export const or = <T, U>(t: Maybe<T>, u: Maybe<T>): Maybe<T> => (isSome(t) ? t : u)

export const unwrap = <T>(m: Maybe<T>): T => {
  if (isSome(m)) {
    return m.value
  }

  throw new Error('Tried to `get(Nothing)`')
}

export const isSome = <T>(m: Maybe<T>): m is Some<T> => m.variant === Variant.Some
export const isNothing = <T>(m: Maybe<T>): m is Nothing => m.variant === Variant.Nothing

export default Maybe
