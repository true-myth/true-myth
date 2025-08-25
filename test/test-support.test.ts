import { describe, expect, expectTypeOf, test } from 'vitest';

import { Result, Maybe } from 'true-myth';
import { unwrap, unwrapErr } from 'true-myth/test-support';

describe('`unwrap`', () => {
  test('works on a `Just`', () => {
    let it = Maybe.of('hello');
    let unwrapped = unwrap(it);
    expect(unwrapped).toBe('hello');
    expectTypeOf(unwrapped).toBeString();
  });

  test('throws on a `Nothing`', () => {
    let it = Maybe.nothing<string>();
    expect(() => unwrap(it)).toThrow();
  });

  test('works on an `Ok`', () => {
    let it = Result.ok('hello');
    let unwrapped = unwrap(it);
    expect(unwrapped).toBe('hello');
    expectTypeOf(unwrapped).toBeString();
  });
});

describe('`unwrapErr`', () => {
  test('throws on an `Ok`', () => {
    let it = Result.ok('hello');
    expect(() => unwrapErr(it)).toThrow();
  });

  test('unwrap throws on a Nothing', () => {
    let it = Result.err('oh no');
    let unwrapped = unwrapErr(it);
    expect(unwrapped).toBe('oh no');
    expectTypeOf(unwrapped).toBeString();
  });
});
