/**
  This is just here to re-export [`Maybe`](./_maybe_.html) and
  [`Result`](./_result_.html). It doesn't do anything else.
 */

/** (keep typedoc from getting confused by the imports) */
import Maybe from './maybe';
import Result from './result';
import Unit from './unit';

// These are here so that the export doesn't treat internal names as private.
// @ts-ignore
import * as TMMaybe from './maybe'; // tslint:disable-line:no-duplicate-imports
// @ts-ignore
import * as TMResult from './result'; // tslint:disable-line:no-duplicate-imports
// @ts-ignore
import * as TMUtils from './utils';

export { Maybe, Result, Unit };
export default { Maybe, Result, Unit };
