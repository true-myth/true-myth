import { assertType } from './lib/assert'
import * as Maybe from '../src/maybe'

test('the basics', () => {
  const someString: Maybe.Maybe<string> = Maybe.Some('string')
  const nothing: Maybe.Maybe<number> = Maybe.Nothing()

  type Neat = { neat: string }
  const shouldBeFine: Maybe.Maybe<Neat> = Maybe.Maybe({ neat: 'string' })
  const shouldBeNeat: Maybe.Maybe<Neat> = Maybe.Maybe<Neat>(undefined)
  const alsoNeat = Maybe.of<Neat>({ neat: 'strings' })
  const andThisToo = Maybe.of<Neat>(null)

  switch (someString.variant) {
    case Maybe.Variant.Some:
      expect(someString.value).toBe('string')
      break
    case Maybe.Variant.Nothing:
      expect(Maybe.unwrap(nothing)).toThrow()
      break
  }
})

test('`Maybe.map`', () => {
  const someString = Maybe.of('string')
  const itsLength = Maybe.map(s => s.length, someString)
  expect(itsLength).toEqual(Maybe.Some('string'.length))
  assertType<Maybe.Maybe<number>>(itsLength)

  const nada: number | undefined = undefined
  const none = Maybe.of<string>(nada)
  assertType<Maybe.Maybe<string>>(none)
  const mapped = Maybe.map(x => x + 2, none)
  expect(mapped).toEqual(Maybe.Nothing())
})

test('`Maybe.of` with `null', () => {
  const noneFromNull = Maybe.of<string>(null)
  assertType<Maybe.Maybe<string>>(noneFromNull)
  expect(Maybe.isSome(noneFromNull)).toBe(false)
  expect(Maybe.isNothing(noneFromNull)).toBe(true)
  expect(() => Maybe.unwrap(noneFromNull)).toThrow()
})

test('`Maybe.of` with `undefined`', () => {
  const noneFromUndefined = Maybe.of<number>(undefined)
  assertType<Maybe.Maybe<number>>(noneFromUndefined)
  expect(Maybe.isSome(noneFromUndefined)).toBe(false)
  expect(Maybe.isNothing(noneFromUndefined)).toBe(true)
  expect(() => Maybe.unwrap(noneFromUndefined)).toThrow()
})

test('`Maybe.of` with values', () => {
  const maybeNumber = Maybe.of(42)
  assertType<Maybe.Maybe<number>>(maybeNumber)
  expect(Maybe.isSome(maybeNumber)).toBe(true)
  expect(Maybe.isNothing(maybeNumber)).toBe(false)
  expect(Maybe.unwrap(maybeNumber)).toBe(42)
})

test('`Maybe.and', () => {
  expect(Maybe.and(Maybe.of('string'), Maybe.of(42))).toEqual(Maybe.Some(42))
  expect(Maybe.and(Maybe.of('string'), Maybe.Nothing())).toEqual(Maybe.Nothing())
  expect(Maybe.and(Maybe.Nothing(), Maybe.of(42))).toEqual(Maybe.Nothing())
  expect(Maybe.and(Maybe.Nothing(), Maybe.Nothing())).toEqual(Maybe.Nothing())
})

test('`Maybe.or', () => {
  expect(Maybe.or(Maybe.of('string'), Maybe.of('42'))).toEqual(Maybe.Some('string'))
  expect(Maybe.or(Maybe.of('string'), Maybe.Nothing())).toEqual(Maybe.Some('string'))
  expect(Maybe.or(Maybe.Nothing(), Maybe.of('42'))).toEqual(Maybe.Some('42'))
  expect(Maybe.or(Maybe.Nothing(), Maybe.Nothing())).toEqual(Maybe.Nothing())
})
