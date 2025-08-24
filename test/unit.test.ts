import { expect, expectTypeOf, test } from "vitest";

import Unit, { Unit as RexportedUnit } from "true-myth/unit";

test("the unit type", () => {
  expectTypeOf<Unit>().not.toEqualTypeOf<{}>();
  expectTypeOf({}).not.toEqualTypeOf(Unit);
  expectTypeOf<Unit>().toEqualTypeOf<RexportedUnit>();

  expect(Unit).toEqual({});
  expect(RexportedUnit).toEqual({});
});
