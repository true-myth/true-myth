#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script to analyze twoslash errors from VitePress build output
 * and categorize them for systematic fixing
 */

// Common error patterns we expect to see
const ERROR_PATTERNS = {
  MISSING_IMPORTS: /Cannot find name|is not defined/,
  TYPE_ERRORS: /Type .* is not assignable to type/,
  SYNTAX_ERRORS: /Expected|Unexpected token/,
  MODULE_RESOLUTION: /Cannot find module|Module .* has no exported member/,
  UNDEFINED_VARIABLES: /Cannot find name '.*'/,
  WRONG_IMPORT_PATH: /true-utils/,
  MISSING_DECLARATIONS: /Property .* does not exist/
};

const KNOWN_ISSUES = {
  // Variables used without declaration
  undeclaredVariables: [
    'nothing()',
    'Result',
    'Maybe',
    'Task',
    'DeepType',
    'map',
    'mapOr',
    'mapOrElse',
    'first',
    'last',
    'unsafelyGetErr',
    'getStyle',
    'maybe.property'
  ],

  // Wrong import paths
  wrongImportPaths: [
    'true-utils/maybe' // Should be 'true-myth/maybe'
  ],

  // Missing semicolons or syntax issues
  syntaxIssues: [
    'Missing comma',
    'Missing closing brace',
    'Incomplete statements'
  ]
};

async function runBuildAndCaptureErrors() {
  console.log('🔄 Running docs:build to capture twoslash errors...');

  try {
    execSync('npm run docs:build', {
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    console.log('✅ Build succeeded - no twoslash errors found!');
    return [];
  } catch (error) {
    const stdout = error.stdout?.toString() || '';
    const stderr = error.stderr?.toString() || '';
    const output = stdout + stderr;
    console.log(`📝 Captured ${output.length} characters of build output`);
    return parseErrorsFromOutput(output);
  }
}

function parseErrorsFromOutput(output) {
  const errors = [];
  const lines = output.split('\n');

  let currentError = null;
  let inErrorBlock = false;

  for (const line of lines) {
    if (line.includes('Twoslash error in code:')) {
      if (currentError) {
        errors.push(currentError);
      }
      currentError = { code: '', file: 'unknown' };
      inErrorBlock = false;
    } else if (line === '--------' && currentError) {
      if (inErrorBlock) {
        // End of error block
        inErrorBlock = false;
      } else {
        // Start of error block
        inErrorBlock = true;
      }
    } else if (inErrorBlock && currentError) {
      currentError.code += line + '\n';
    }
  }

  // Add the last error if exists
  if (currentError) {
    errors.push(currentError);
  }

  return errors.filter(error => error.code.trim());
}

function categorizeError(errorCode) {
  const categories = [];

  // Check for missing imports
  if (errorCode.includes('Cannot find name') ||
    errorCode.includes('is not defined')) {
    categories.push('MISSING_IMPORTS');
  }

  // Check for wrong import paths
  if (errorCode.includes('true-utils')) {
    categories.push('WRONG_IMPORT_PATH');
  }

  // Check for missing variable declarations
  KNOWN_ISSUES.undeclaredVariables.forEach(variable => {
    if (errorCode.includes(variable) && !errorCode.includes(`import`) && !errorCode.includes(`from`)) {
      categories.push('UNDECLARED_VARIABLE');
    }
  });

  // Check for syntax issues
  if (errorCode.includes('Expected') ||
    errorCode.includes('Unexpected') ||
    !errorCode.trim().endsWith(';') && errorCode.includes('console.log')) {
    categories.push('SYNTAX_ERROR');
  }

  // Check for incomplete code blocks
  if (errorCode.includes('...') ||
    errorCode.match(/\{\s*$/m) ||
    errorCode.includes('// =>') && !errorCode.includes(';')) {
    categories.push('INCOMPLETE_CODE');
  }

  return categories.length > 0 ? categories : ['OTHER'];
}

function generateFixSuggestions(errorCode, categories) {
  const suggestions = [];

  if (categories.includes('WRONG_IMPORT_PATH')) {
    suggestions.push('Replace "true-utils" with "true-myth" in imports');
  }

  if (categories.includes('UNDECLARED_VARIABLE')) {
    if (errorCode.includes('nothing()') && !errorCode.includes('import.*nothing')) {
      suggestions.push('Add import: import { nothing } from "true-myth/maybe";');
    }
    if (errorCode.includes('Result.') && !errorCode.includes('import.*Result')) {
      suggestions.push('Add import: import Result from "true-myth/result";');
    }
    if (errorCode.includes('Maybe.') && !errorCode.includes('import.*Maybe')) {
      suggestions.push('Add import: import Maybe from "true-myth/maybe";');
    }
    if (errorCode.includes('map(') && !errorCode.includes('import.*map')) {
      suggestions.push('Add import for map function from appropriate module');
    }
    if (errorCode.includes('DeepType') && errorCode.includes('DeepOptionalType')) {
      suggestions.push('Fix type name: change DeepType to DeepOptionalType');
    }
    if (errorCode.includes('Maybe.mightBeANumber.isJust')) {
      suggestions.push('Fix property access: change Maybe.mightBeANumber to mightBeANumber');
    }
    if (errorCode.includes('maybe.property') && !errorCode.includes('Maybe.property')) {
      suggestions.push('Fix capitalization: change maybe.property to Maybe.property');
    }
  }

  if (categories.includes('SYNTAX_ERROR')) {
    suggestions.push('Fix syntax errors - missing semicolons, braces, etc.');
  }

  if (categories.includes('INCOMPLETE_CODE')) {
    suggestions.push('Complete the code example or mark as @noErrors if intentionally incomplete');
  }

  return suggestions;
}

function groupErrorsByPattern(errors) {
  const grouped = {};

  errors.forEach((error, index) => {
    const categories = categorizeError(error.code);
    const key = categories.sort().join(',');

    if (!grouped[key]) {
      grouped[key] = [];
    }

    grouped[key].push({
      index: index + 1,
      code: error.code,
      categories,
      suggestions: generateFixSuggestions(error.code, categories)
    });
  });

  return grouped;
}

async function main() {
  console.log('🚀 Starting Twoslash Error Analysis\n');

  const errors = await runBuildAndCaptureErrors();

  if (errors.length === 0) {
    console.log('🎉 No errors found!');
    return;
  }

  console.log(`📊 Found ${errors.length} code samples with twoslash errors\n`);

  const groupedErrors = groupErrorsByPattern(errors);

  // Generate summary report
  console.log('📋 ERROR SUMMARY BY CATEGORY:\n');

  Object.entries(groupedErrors).forEach(([categories, errorGroup]) => {
    console.log(`🏷️  ${categories.replace(/,/g, ', ')} (${errorGroup.length} errors)`);

    // Show first example
    const firstError = errorGroup[0];
    console.log('   Example:');
    console.log('   ```typescript');
    console.log(firstError.code.split('\n').slice(0, 3).map(line => `   ${line}`).join('\n'));
    console.log('   ```');
    console.log('   Suggestions:');
    firstError.suggestions.forEach(suggestion => {
      console.log(`   • ${suggestion}`);
    });
    console.log('');
  });

  // Write detailed report to markdown file
  let markdownReport = `# Twoslash Error Analysis Report

Generated: ${new Date().toISOString()}

## Summary

- **Total Errors**: ${errors.length}
- **Categories**: ${Object.keys(groupedErrors).length}

## Error Categories

`;

  Object.entries(groupedErrors).forEach(([categories, errorGroup]) => {
    markdownReport += `### ${categories.replace(/,/g, ', ')} (${errorGroup.length} errors)\n\n`;

    // Show first example
    const firstError = errorGroup[0];
    markdownReport += '**Example:**\n\n';
    markdownReport += '```typescript\n';
    markdownReport += firstError.code.split('\n').slice(0, 5).join('\n');
    markdownReport += '\n```\n\n';

    markdownReport += '**Fix suggestions:**\n';
    firstError.suggestions.forEach(suggestion => {
      markdownReport += `- ${suggestion}\n`;
    });

    markdownReport += '\n**All errors in this category:**\n';
    errorGroup.forEach((error, idx) => {
      markdownReport += `${idx + 1}. Error ${error.index}\n`;
    });
    markdownReport += '\n---\n\n';
  });

  const reportPath = path.join(__dirname, '../docs/.vitepress/twoslash-error-analysis.md');
  fs.writeFileSync(reportPath, markdownReport);

  console.log(`📄 Detailed report written to: ${reportPath}\n`);

  // Priority recommendations
  console.log('🎯 PRIORITY ACTIONS:\n');

  const priorities = [
    {
      category: 'WRONG_IMPORT_PATH',
      action: 'Fix import paths from "true-utils" to "true-myth"',
      effort: 'Low'
    },
    {
      category: 'UNDECLARED_VARIABLE',
      action: 'Add missing import statements',
      effort: 'Medium'
    },
    {
      category: 'SYNTAX_ERROR',
      action: 'Fix syntax issues (semicolons, braces)',
      effort: 'Low'
    },
    {
      category: 'INCOMPLETE_CODE',
      action: 'Complete examples or mark as expected incomplete',
      effort: 'High'
    }
  ];

  priorities.forEach(priority => {
    const count = groupedErrors[priority.category]?.length || 0;
    if (count > 0) {
      console.log(`${count} × ${priority.action} (${priority.effort} effort)`);
    }
  });

  console.log(`\n✨ Next steps: Review the detailed report and start with low-effort, high-impact fixes.`);
}

main().catch(console.error);
