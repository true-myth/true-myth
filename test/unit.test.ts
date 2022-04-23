import { expectTypeOf } from 'expect-type';
import Unit from 'true-myth/unit';
import { Unit as RexportedUnit } from 'true-myth';

test('the unit type', () => {
  expectTypeOf<Unit>().toEqualTypeOf<{}>();
  expectTypeOf({}).not.toMatchTypeOf(Unit);
  expectTypeOf<Unit>().toEqualTypeOf<RexportedUnit>();

  expect(Unit).not.toEqual({});
  expect(RexportedUnit).not.toEqual({});
});
