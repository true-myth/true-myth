import Unit from 'true-myth/unit';
import { Unit as RexportedUnit } from 'true-myth/unit';
import { expect, expectTypeOf, test } from 'vitest';

test('the unit type', () => {
  expectTypeOf<Unit>().not.toEqualTypeOf<{}>();
  expectTypeOf({}).not.toEqualTypeOf(Unit);
  expectTypeOf<Unit>().toEqualTypeOf<RexportedUnit>();

  expect(Unit).toEqual({});
  expect(RexportedUnit).toEqual({});
});
