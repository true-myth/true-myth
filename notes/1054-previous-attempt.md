# Previous attempt: Shiki + Twoslash migration (issue #1054)

Reference: https://github.com/true-myth/true-myth/issues/1054

## Branch: `twoslash-and-fix-docs`

This branch contains 4 commits on top of `main`, all marked WIP:

1. `infra: set up VitePress for Shiki+twoslash` — initial wiring
2. `docs(pt. 3.0): fixing existing errors in the docs` — error analysis and src changes
3. `[WIP] docs(pt. 3.0)` — more src changes and analysis scripts
4. `[WIP] MOAR docs fixing` — doc markdown changes, partial src reverts

## What was done

### Infrastructure (commit 1)

- Added `@shikijs/twoslash` and `@shikijs/vitepress-twoslash` as devDependencies.
- Added `transformerTwoslash()` to `docs/.vitepress/config.ts` under
  `markdown.codeTransformers`.
- Created `docs/.vitepress/theme/index.ts` with the default VitePress theme
  extended to load `TwoslashFloatingVue` on the client side.
- Added a Vite `resolve.alias` mapping `'true-myth'` to `../src` so that
  `import ... from 'true-myth'` works in documentation code blocks.
- Modified `docs/tsconfig.json`:
  - Added `"**/*.md"` to `include`.
  - Added `target`, `module`, and `moduleResolution` overrides.
  - Added `paths` entries for `"true-myth"` and `"true-myth/*"` pointing at
    `../src`.

### Error analysis (commits 2–3)

- Created `scripts/analyze-twoslash-errors.js` and
  `scripts/extract-specific-errors.js` to programmatically categorize twoslash
  failures.
- Generated `docs/.vitepress/twoslash-error-analysis.json` (3,263 lines) and a
  companion `.md` summary cataloging 317 total errors across the documentation.
- Generated `MANUAL_FIXES_NEEDED.md` and `SPECIFIC_ERRORS_DETAIL.md` at the
  repo root with detailed per-block error listings.

### Documentation changes (commit 4)

- Changed many code fences from ` ```ts ` to ` ```typescript ` in multiple
  guide pages. This effectively **opts those blocks out of twoslash processing**
  (twoslash only processes `ts` blocks by default).
- Made minor content fixes in several guide pages.

### Source code changes (commits 2–4) — **problematic**

- Modified `src/maybe.ts`, `src/result.ts`, `src/task.ts`, and
  `src/standard-schema.ts` across all three later commits.
- These changes altered JSDoc examples, type signatures, and internal
  documentation in the library source.
- The final commit partially reverted some of the source changes but still left
  the source in a modified state relative to `main`.

## Status at abandonment

- Still broken: the branch was never completed or merged.
- The VitePress build with twoslash enabled was not passing.
- Many documentation code blocks were switched to `typescript` fences to avoid
  twoslash checking rather than being fixed to type-check correctly.
- Source code was modified (violating the constraint that the library
  implementation must not change).

## Key problems identified

1. **Source modifications.** The attempt modified library source files to try to
   make doc examples pass. This is backwards: the documentation should be
   updated to match the implementation, not the other way around.

2. **Avoidance instead of fixing.** Changing ` ```ts ` to ` ```typescript ` hid
   errors instead of fixing them. The goal should be to make all TypeScript code
   blocks valid and type-checkable.

3. **`explicitTrigger: false` without preparation.** Setting
   `explicitTrigger: false` means every `ts` code block is checked by twoslash.
   This surfaced 317 errors at once because many doc examples were incomplete
   (missing imports, using undeclared variables, pseudocode fragments).

4. **No `test:docs` script.** There was no dedicated script for running twoslash
   validation independent of the full VitePress build.

5. **Analysis artifacts committed.** Large JSON/Markdown error analysis files
   and throwaway scripts were committed to the repo.

6. **SSR issue in theme.** The initial theme import of
   `TwoslashFloatingVue` was later wrapped in a `typeof window` check to avoid
   SSR issues, but the resulting code had a syntax error
   (`app.use(TwoslashFloatingVue)m.default)` — a merge of two different
   approaches).

## Lessons for a new attempt

- Do not modify any source files under `src/`.
- Fix documentation code blocks to be self-contained and type-correct rather
  than opting them out of checking.
- For code blocks that are intentionally illustrative or pseudocode (not
  runnable TypeScript), use appropriate twoslash directives (`// @errors`,
  `// @noErrors`) or a non-`ts` fence language.
- Create a dedicated `test:docs` script for validation.
- Keep the VitePress theme setup simple and correct (no SSR/client mismatch).
- Use a documentation-specific `tsconfig.json` that extends the base config
  with only the minimum overrides needed.
- Do not commit analysis artifacts or throwaway scripts.
