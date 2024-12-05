// @ts-check

import { spawnSync } from 'node:child_process';
import { readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import miniglob from 'miniglob';

let cwd = dirname(fileURLToPath(import.meta.url));

cleanup();
publishTypes('esm');
publishTypes('cjs');
rewriteForCJS();

function cleanup() {
  rmSync(resolve(cwd, '..', 'dist'), { recursive: true, force: true });
}

/** @param {'esm' | 'cjs'} type */
function publishTypes(type) {
  let project = join(cwd, `publish.${type}.tsconfig.json`);
  spawnSync('pnpm', ['tsc', '--project', project]);
}

/**
  The dumbest possible "codemod" that gets us what we need: in the CommonJS
  output, rewrite the file extensions:

  - `.js` → `.cjs`
  - `.d.ts` → `.d.cts`
 */
function rewriteForCJS() {
  /** @type {Array<string>} */
  let rewrites = [];

  for (let js of miniglob.glob('dist/cjs/**/*.js')) {
    let cjs = js.replace('.js', '.cjs');
    renameSync(js, cjs);
    rewrites.push(cjs);
  }

  for (let jsMap of miniglob.glob('dist/cjs/**/*.js.map')) {
    let cjsMap = jsMap.replace('.js', '.cjs');
    renameSync(jsMap, cjsMap);
    rewrites.push(cjsMap);
  }

  for (let dts of miniglob.glob('dist/cjs/**/*.d.ts')) {
    let cdts = dts.replace('.d.ts', '.d.cts');
    renameSync(dts, cdts);
    rewrites.push(cdts);
  }

  for (let dtsMap of miniglob.glob('dist/cjs/**/*.d.ts.map')) {
    let cdtsMap = dtsMap.replace('.d.ts', '.d.cts');
    renameSync(dtsMap, cdtsMap);
    rewrites.push(cdtsMap);
  }

  for (let path of rewrites) {
    let contents = readFileSync(path, 'utf-8');
    writeFileSync(path, contents.replaceAll('.js', '.cjs'));
  }
}
