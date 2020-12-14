import { expectTypeOf } from 'expect-type';
import Unit from '../src/unit';

test('the unit type', () => {
  expectTypeOf<Unit>().toEqualTypeOf();
  expectTypeOf({}).not.toMatchTypeOf(Unit);

  expect(Unit).not.toEqual({});
});
