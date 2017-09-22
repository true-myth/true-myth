enum Variant {
  Some = 'Some',
  None = 'None',
}

interface OptionType<T> {
  type: Variant
  isSome(value: Option<T>): boolean
}

type Map<T, U> = (t: T) => U

export class Some<T> implements OptionType<T> {
  type = Variant.Some
  __value: T

  private constructor(value: T) {
    this.__value = value
  }

  map<U>(this: Some<T>, mapper: Map<T, U>) {
    return map(mapper, this)
  }

  isSome(this: Option<T>): boolean {
    return isSome(this)
  }

  static of<T>(value: T) {
    return new Some(value)
  }
}

export function isSome<T>(option: Option<T>): option is Some<T> {
  return option.type === Variant.Some
}

export function map<T, U>(mapper: (t: T) => U, option: Option<T>): Option<U> {
  return isSome(option) ? Some.of(mapper(option.__value)) : option
}

export interface None extends OptionType<never> {
  type: Variant.None
}

export const None = { type: Variant.None }

export type Option<T> = Some<T> | None
