import { Maybe } from 'true-myth/maybe';
import { Result } from 'true-myth/result';
import { describe, expect, test } from 'vitest';

describe('nested Result and Maybe', () => {
  test('Result of Maybe', () => {
    function inferenceFun(): Result<Maybe<string>, number> {
      return Result.ok(Maybe.nothing());
    }
    expect(inferenceFun()).toBeInstanceOf(Result);
  });
});
