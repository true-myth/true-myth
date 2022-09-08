import { expectTypeOf } from 'expect-type';
import Unit from 'true-myth/unit';
import { Unit as RexportedUnit } from 'true-myth';

test('the unit type', () => {
  expectTypeOf<Unit>().toEqualTypeOf<{}>();
  expectTypeOf({}).toEqualTypeOf(Unit);
  expectTypeOf<Unit>().toEqualTypeOf<RexportedUnit>();

  expect(Unit).toEqual({});
  expect(RexportedUnit).toEqual({});
});
