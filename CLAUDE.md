# LLM Agent Plan: Integrating Twoslash into True Myth Documentation

## Overview
This plan outlines how to use LLM-based agents (like Cursor or Claude Code) to integrate the twoslash package into True Myth's VitePress documentation, enabling interactive TypeScript code examples with hover information, error checking, and autocomplete.

## Phase 1: Analysis and Setup ✅

### 1.1 Repository Analysis ✅
**Agent Task**: Analyze the current True Myth codebase structure
```bash
# Commands for the agent to run
find . -name "*.md" -type f | head -20
find . -name "vitepress*" -type f
find . -name "package.json" | xargs cat
find . -name "tsconfig.json" | xargs cat
ls -la docs/ || ls -la documentation/
```

**Expected Outputs**:
- Current VitePress configuration location
- Existing TypeScript setup
- Documentation structure and markdown files
- Current code example patterns

### 1.2 Dependency Assessment ✅
**Agent Task**: Check current dependencies and compatibility
```typescript
// Agent should analyze package.json for:
// - VitePress version
// - Existing Shiki configuration
// - TypeScript version
// - Any conflicting packages
```

## Phase 2: Configuration Implementation ✅

### 2.1 Install Required Dependencies ✅
**Agent Task**: Update package.json with twoslash dependencies
```bash
npm install -D @shikijs/vitepress-twoslash @shikijs/twoslash
# or
yarn add -D @shikijs/vitepress-twoslash @shikijs/twoslash
```

### 2.2 VitePress Configuration ✅
**Agent Task**: Modify `.vitepress/config.js` or `.vitepress/config.ts`

**Key Integration Points**:
```typescript
import { defineConfig } from 'vitepress'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'

export default defineConfig({
  markdown: {
    codeTransformers: [
      transformerTwoslash()
    ]
  },
  vite: {
    // Ensure proper TypeScript resolution
    resolve: {
      alias: {
        'true-myth': path.resolve(__dirname, '../src')
      }
    }
  }
})
```

### 2.3 TypeScript Configuration ✅
**Agent Task**: Create or update `tsconfig.json` for documentation
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "paths": {
      "true-myth": ["./src/index.ts"],
      "true-myth/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "docs/**/*.md"]
}
```

## Phase 3: Content Migration Strategy

### 3.0 Identify Code with Errors ✅
**Agent Task**: Run the updated VitePress config and read its output, and list all failing code samples so the human author can fix them or mark them as expected errors, using the output from the script..

**Analysis Complete**: Found 317 code samples with twoslash errors, categorized as follows:
- 58 × Missing import statements (UNDECLARED_VARIABLE)
- 45 × Syntax issues (SYNTAX_ERROR) - missing semicolons, braces
- 50 × Incomplete code examples (INCOMPLETE_CODE)
- 8 × Wrong import paths (WRONG_IMPORT_PATH) - "true-utils" instead of "true-myth"
- 79 × Other issues requiring investigation

**Priority Fix Order**:
1. **Low effort, high impact**: Fix wrong import paths (8 errors)
2. **Low effort, medium impact**: Fix syntax errors (45 errors)
3. **Medium effort, high impact**: Add missing imports (58 errors)
4. **High effort, medium impact**: Complete or mark incomplete examples (50+ errors)

**DO NOT** try to create a script to fix these patterns automatically. Just work through them one by one and fix them manually.

For files that appear in `docs/api`, do not modify them directly. Instead, fix the error in the docstring that appears in the corresponding TypeScript source code.

### 3.1 Identify Code Examples ✅
**Agent Task**: Scan documentation for existing code blocks

**Files with TypeScript code blocks**: 75 files containing ````typescript` blocks, including:
- Guide documentation: tutorial files, understanding sections
- API documentation: auto-generated TypeDoc files with examples
- Mixed content: both basic examples and complex demonstrations

**Key patterns identified**:
- Import statements missing or incorrect
- Standalone code fragments without proper context
- Examples using variables not defined in scope
- Incomplete code blocks (intentionally or accidentally)

### 3.2 Conversion Patterns
**Agent Task**: Create conversion templates for common patterns

**Before (Standard Markdown)**:
```markdown
```typescript
import { Result } from 'true-myth';

const success = Result.ok(42);
const failure = Result.err('Something went wrong');
```
```

**After (Twoslash Enhanced)**:
```markdown
```typescript twoslash
import { Result } from 'true-myth';

const success = Result.ok(42);
//    ^?
const failure = Result.err('Something went wrong');
//    ^?
```
```

### 3.3 Progressive Enhancement Areas
**Agent Focus Areas**:
1. **API Examples**: Add hover information for method signatures
2. **Error Scenarios**: Show TypeScript errors for invalid usage
3. **Type Inference**: Demonstrate how True Myth's types flow through code
4. **Composition Examples**: Show complex chaining with type information

### 3.2 Systematic Error Fixing Strategy
**Agent Task**: Execute fixes in priority order for maximum impact

**Phase 3.2.1 - Quick Wins (Low Effort, High Impact)**:
- Fix 8 wrong import paths: `true-utils` → `true-myth`
- Fix basic syntax errors: missing semicolons, incomplete statements
- Add missing imports for commonly used types (Maybe, Result, Task)

**Phase 3.2.2 - Medium Impact Fixes**:
- Complete incomplete code examples or mark as intentionally partial
- Fix variable declaration issues
- Correct property access errors (e.g., `Maybe.mightBeANumber` → `mightBeANumber`)

**Phase 3.2.3 - Complex Cases**:
- Handle examples requiring external dependencies (immutable.js)
- Fix complex type annotation issues
- Address edge cases and "OTHER" category errors

## Phase 4: Content Enhancement

### 4.1 True Myth Specific Enhancements
**Agent Task**: After fixing errors, enhance examples with twoslash features

**Enhanced Result Type Examples**:
```typescript twoslash
import Result from 'true-myth/result';

const parseNumber = (input: string): Result<number, string> => {
  const num = parseInt(input, 10);
  return isNaN(num) ? Result.err('Invalid number') : Result.ok(num);
};

const result = parseNumber('42');
//    ^?

result.map(n => n * 2)
//     ^?
      .unwrapOr(0);
//     ^?
```

**Enhanced Maybe Type Examples**:
```typescript twoslash
import Maybe from 'true-myth/maybe';

const safeDivide = (a: number, b: number): Maybe<number> => {
  return b === 0 ? Maybe.nothing() : Maybe.just(a / b);
};

safeDivide(10, 2)
// ^?
  .map(x => x.toString())
// ^?
  .unwrapOr('Division by zero');
// ^?
```

### 4.2 Interactive Examples
**Agent Task**: Add interactive elements using twoslash features

**Error Demonstrations**:
```typescript twoslash
// @errors: 2345
import Result from 'true-myth/result';

// This should show a TypeScript error
const bad: Result<string, number> = Result.ok(42);
```

**Autocomplete Hints**:
```typescript twoslash
import Maybe from 'true-myth/maybe';

const value = Maybe.just(42);
value.
//    ^|
```

## Phase 5: Automation and Validation

### 5.1 Content Validation Script ✅
**Agent Task**: Create a validation script

**Script Created**: `scripts/analyze-twoslash-errors.js`
- Captures and categorizes twoslash compilation errors
- Provides fix suggestions for common patterns
- Generates priority-ordered action plans
- Outputs detailed JSON report for systematic fixing

**Current Status**: 317 errors identified and categorized, ready for systematic fixing

### 5.2 CI Integration
**Agent Task**: Update GitHub Actions workflow
```yaml
- name: Validate Documentation Examples
  run: |
    npm run docs:validate
    npm run docs:build
```

## Phase 6: Testing and Refinement

### 6.1 Local Development Setup
**Agent Task**: Ensure smooth development experience
```bash
# Commands to test the setup
npm run docs:dev
# Verify twoslash is working in browser
# Check that hover information appears
# Confirm error highlighting works
```

### 6.2 Performance Optimization
**Agent Considerations**:
- Lazy loading of TypeScript compiler
- Caching of type information
- Bundle size impact assessment

## Implementation Strategy for LLM Agents

### Best Practices for Agent Execution

1. **Incremental Approach**
   - Start with Phase 1 analysis
   - Implement one configuration change at a time
   - Test after each major change

2. **Error Handling**
   - Have the agent check build status after each change
   - Implement rollback procedures for failed changes
   - Log all modifications for review

3. **Context Preservation**
   - Keep track of True Myth's API surface
   - Maintain awareness of existing documentation patterns
   - Preserve the library's documentation voice and style

4. **Validation Steps**
   ```bash
   # Agent should run these checks frequently
   npm run type-check
   npm run docs:build
   npm run lint
   ```

### Agent Communication Strategy

1. **Progress Updates**: Agent should provide clear status updates for each phase
2. **Decision Points**: Flag areas where human review is needed
3. **Alternative Solutions**: Present options when multiple approaches are viable
4. **Rollback Plans**: Always have a way to undo changes

## Expected Outcomes

- Enhanced documentation with interactive TypeScript examples
- Improved developer experience with hover information
- Better error demonstration for common mistakes
- Increased confidence in True Myth's type safety
- More engaging and educational documentation

## Success Metrics

- All existing code examples enhanced with twoslash
- Zero TypeScript compilation errors in documentation
- Successful docs build and deployment
- Improved documentation engagement metrics (if tracked)

## Potential Challenges and Mitigations

1. **Build Performance**: Monitor build times and optimize if needed
2. **TypeScript Complexity**: Ensure examples remain beginner-friendly
3. **Maintenance Overhead**: Create templates for future documentation
4. **Browser Compatibility**: Test across different browsers and devices
