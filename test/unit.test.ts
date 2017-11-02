import Unit from '../src/unit';
import { assertType } from './lib/assert';

test('the unit type', () => {
  expect(Unit).not.toEqual({});
  assertType<Unit>(Unit);
});
