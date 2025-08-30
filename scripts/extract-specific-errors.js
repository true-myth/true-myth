#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract specific error details with code samples for manual fixing
 */

async function runBuildAndCaptureErrors() {
  console.log('🔄 Running docs:build to capture detailed twoslash errors...');

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
    return parseDetailedErrors(output);
  }
}

function parseDetailedErrors(output) {
  const errors = [];
  const lines = output.split('\n');

  let currentError = null;
  let errorNumber = 0;
  let inCodeBlock = false;
  let codeLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for error indicators
    if (line.includes('Twoslash error in code:')) {
      // Save previous error if exists
      if (currentError) {
        currentError.code = codeLines.join('\n').trim();
        errors.push(currentError);
      }

      errorNumber++;
      currentError = {
        number: errorNumber,
        file: 'unknown',
        code: '',
        errorMessage: '',
        category: 'UNKNOWN'
      };
      codeLines = [];
      inCodeBlock = false;
    }

    // Look for file information
    if (line.includes('at ') && line.includes('.md:')) {
      if (currentError) {
        const match = line.match(/at (.+\.md):(\d+):(\d+)/);
        if (match) {
          currentError.file = match[1];
          currentError.line = match[2];
          currentError.column = match[3];
        }
      }
    }

    // Detect code block boundaries
    if (line === '--------' && currentError) {
      if (inCodeBlock) {
        // End of code block
        inCodeBlock = false;
      } else {
        // Start of code block
        inCodeBlock = true;
      }
    }

    // Capture code within blocks
    if (inCodeBlock && currentError && line !== '--------') {
      codeLines.push(line);
    }

    // Capture error messages
    if (line.includes('Error:') || line.includes('TypeError:') || line.includes('SyntaxError:')) {
      if (currentError) {
        currentError.errorMessage = line;
      }
    }
  }

  // Add the last error
  if (currentError && codeLines.length > 0) {
    currentError.code = codeLines.join('\n').trim();
    errors.push(currentError);
  }

  return errors;
}

function categorizeError(error) {
  const code = error.code;
  const message = error.errorMessage;
  const categories = [];

  // Check for undeclared variables
  if (message.includes('Cannot find name') || code.includes('Result.') && !code.includes('import.*Result')) {
    categories.push('UNDECLARED_VARIABLE');
  }

  // Check for syntax errors
  if (message.includes('Expected') || message.includes('Unexpected') || message.includes('SyntaxError')) {
    categories.push('SYNTAX_ERROR');
  }

  // Check for incomplete code
  if (code.match(/\{\s*$/m) || code.includes('...') || code.match(/=>\s*$/m)) {
    categories.push('INCOMPLETE_CODE');
  }

  // Check for wrong import paths
  if (code.includes('true-utils')) {
    categories.push('WRONG_IMPORT_PATH');
  }

  return categories.length > 0 ? categories : ['OTHER'];
}

function generateSpecificReport(errors, targetErrorNumbers) {
  console.log(`\n📝 SPECIFIC ERROR DETAILS for errors: ${targetErrorNumbers.join(', ')}\n`);

  const targetErrors = errors.filter(error => targetErrorNumbers.includes(error.number));

  targetErrors.forEach(error => {
    const categories = categorizeError(error);
    error.category = categories.join(', ');

    console.log(`### Error ${error.number}`);
    console.log(`**File**: ${error.file || 'unknown'}`);
    console.log(`**Category**: ${error.category}`);
    console.log(`**Error Message**: ${error.errorMessage || 'Not captured'}`);
    console.log(`**Code**:`);
    console.log('```typescript');
    console.log(error.code);
    console.log('```');
    console.log('');
  });

  return targetErrors;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node extract-specific-errors.js <error-numbers>');
    console.log('Example: node extract-specific-errors.js 20,21,43,44,45');
    return;
  }

  const targetErrorNumbers = args[0].split(',').map(n => parseInt(n.trim()));

  console.log('🚀 Extracting specific Twoslash errors...');
  console.log(`🎯 Target errors: ${targetErrorNumbers.join(', ')}\n`);

  const errors = await runBuildAndCaptureErrors();

  if (errors.length === 0) {
    console.log('🎉 No errors found!');
    return;
  }

  console.log(`📊 Found ${errors.length} total errors`);

  const specificErrors = generateSpecificReport(errors, targetErrorNumbers);

  // Write detailed markdown
  let markdownContent = `# Specific Error Details\n\nGenerated: ${new Date().toISOString()}\n\n`;

  specificErrors.forEach(error => {
    markdownContent += `## Error ${error.number}\n\n`;
    markdownContent += `**File**: \`${error.file || 'unknown'}\`\n`;
    markdownContent += `**Category**: ${error.category}\n`;
    markdownContent += `**Error Message**: ${error.errorMessage || 'Not captured'}\n\n`;
    markdownContent += `**Code Sample**:\n`;
    markdownContent += '```typescript\n';
    markdownContent += error.code;
    markdownContent += '\n```\n\n';

    // Add fix suggestions based on category
    if (error.category.includes('UNDECLARED_VARIABLE')) {
      markdownContent += `**Suggested Fix**: Add missing import statement\n\n`;
    }
    if (error.category.includes('SYNTAX_ERROR')) {
      markdownContent += `**Suggested Fix**: Check for missing semicolons, braces, or other syntax issues\n\n`;
    }
    if (error.category.includes('INCOMPLETE_CODE')) {
      markdownContent += `**Suggested Fix**: Complete the code example or add \`// @noErrors\`\n\n`;
    }
    if (error.category.includes('OTHER')) {
      markdownContent += `**Suggested Fix**: Manual review required - check types, imports, or context\n\n`;
    }

    markdownContent += '---\n\n';
  });

  const outputPath = path.join(__dirname, '../SPECIFIC_ERRORS_DETAIL.md');
  fs.writeFileSync(outputPath, markdownContent);

  console.log(`\n📄 Detailed report written to: ${outputPath}`);
  console.log(`\n✅ Found ${specificErrors.length} of ${targetErrorNumbers.length} requested errors`);
}

main().catch(console.error);
