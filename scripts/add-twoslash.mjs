#!/usr/bin/env node
// Script to add twoslash markers and namespace-based import preambles to JSDoc code blocks

import { readFileSync, writeFileSync } from 'node:fs';

const PREAMBLES = {
  'src/maybe.ts': `import Maybe, * as maybe from 'true-myth/maybe';`,
  'src/result.ts': `import Result, * as result from 'true-myth/result';\nimport { Unit } from 'true-myth';`,
  'src/task.ts': `import Task, * as task from 'true-myth/task';`,
  'src/standard-schema.ts': null, // each block is different, handle manually
};

function processFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const preamble = PREAMBLES[filePath];

  // Match ```ts code blocks (not already twoslash)
  const result = content.replace(
    /^(\s*)(```ts)\s*\n([\s\S]*?)^(\s*)(```)\s*$/gm,
    (match, indent1, fence, body, indent2, closeFence) => {
      // Don't process if already has twoslash
      if (fence.includes('twoslash')) return match;

      const newFence = `${indent1}\`\`\`ts twoslash`;

      // Check if the body already starts with an import
      const trimmedBody = body.trimStart();
      const hasImport = trimmedBody.startsWith('import ');

      if (hasImport || !preamble) {
        // Just add twoslash, no preamble needed
        return `${newFence}\n${body}${indent2}\`\`\``;
      }

      // Add preamble + ---cut---
      const preambleLines = preamble.split('\n').map(l => indent1 + l).join('\n');
      return `${newFence}\n${preambleLines}\n${indent1}// ---cut---\n${body}${indent2}\`\`\``;
    }
  );

  writeFileSync(filePath, result);
  console.log(`Processed ${filePath}`);
}

for (const file of Object.keys(PREAMBLES)) {
  processFile(file);
}
