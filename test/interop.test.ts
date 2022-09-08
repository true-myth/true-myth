import { Maybe, Result } from 'true-myth';

describe('nested Result and Maybe', () => {
  test('Result of Maybe', () => {
    function inferenceFun(): Result<Maybe<string>, number> {
      return Result.ok(Maybe.nothing());
    }
    expect(inferenceFun()).toBeInstanceOf(Result);
  });
});
