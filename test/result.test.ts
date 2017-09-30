import { assertType } from './lib/assert';
import * as Result from '../src/result';

describe('`Result` pure functions', () => {
  test('`ok`', () => {
    const theOk = Result.ok(42);
    expect(theOk).toBeInstanceOf(Result.Ok);
    switch (theOk.variant) {
      case Result.Variant.Ok:
        expect(theOk.unsafelyUnwrap()).toBe(42);
        break;
      case Result.Variant.Err:
        expect(false).toBe(true); // because this should never happen
        break;
    }
  });

  test('`err`', () => {
    const reason = 'oh teh noes';
    const theErr = Result.err(reason);
    expect(theErr).toBeInstanceOf(Result.Err);
    switch (theErr.variant) {
      case Result.Variant.Ok:
        expect(true).toBe(false); // because this should never happen
        break;
      case Result.Variant.Err:
        expect(theErr.unwrapErr()).toBe(reason);
        break;
    }
  });

  test('`map`', () => {
    expect('to be implemented').toBe(false);
  });

  test('`mapOr`', () => {
    expect('to be implemented').toBe(false);
  });

  test('`mapOrElse`', () => {
    expect('to be implemented').toBe(false);
  });

  test('`mapErr`', () => {
    expect('to be implemented').toBe(false);
  });

  test('`and`', () => {
    expect('to be implemented').toBe(false);
  });

  test('`andThen`', () => {
    expect('to be implemented').toBe(false);
  });

  test('`or`', () => {
    expect('to be implemented').toBe(false);
  });

  test('`orElse`', () => {
    expect('to be implemented').toBe(false);
  });

  test('`unsafelyUnwrap`', () => {
    expect('to be implemented').toBe(false);
  });

  test('`unsafelyUnwrapErr`', () => {
    expect('to be implemented').toBe(false);
  });

  test('`unwrapOrElse`', () => {
    expect('to be implemented').toBe(false);
  });

  test('`toMaybe`', () => {
    expect('to be implemented').toBe(false);
  });
});

test('`Result.Ok` class', () => {
  expect('to be implemented').toBe(false);
});

test('`Result.Err` class', () => {
  expect('to be implemented').toBe(false);
});
