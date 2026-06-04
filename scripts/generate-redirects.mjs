#!/usr/bin/env node
// @ts-check

import { readdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST_DIR = join(ROOT, 'docs/.vitepress/dist');
const TARGET_ORIGIN = 'https://true-myth.dev';

/** @param {string} targetUrl */
function redirectPage(targetUrl) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Redirecting…</title>
  <link rel="canonical" href="${targetUrl}">
  <meta http-equiv="refresh" content="0; url=${targetUrl}">
  <script>location.replace(${JSON.stringify(targetUrl)})</script>
</head>
<body>
  <p>This page has moved. <a href="${targetUrl}">Go to the new location</a>.</p>
</body>
</html>
`;
}

// For 404.html GitHub Pages serves this for any path not found, so redirect
// to the same path at the new origin rather than a fixed URL.
function catchAllPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Redirecting…</title>
  <script>location.replace(${JSON.stringify(TARGET_ORIGIN)} + location.pathname + location.search + location.hash)</script>
</head>
<body>
  <p>This page has moved to <a href="${TARGET_ORIGIN}">${TARGET_ORIGIN}</a>.</p>
</body>
</html>
`;
}

/** @param {string} dir @returns {AsyncGenerator<string>} */
async function* walkHtml(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkHtml(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      yield fullPath;
    }
  }
}

let count = 0;
for await (const filePath of walkHtml(DIST_DIR)) {
  const rel = relative(DIST_DIR, filePath).replace(/\\/g, '/');

  let html;
  if (rel === '404.html') {
    html = catchAllPage();
  } else {
    let urlPath;
    if (rel === 'index.html') {
      urlPath = '/';
    } else if (rel.endsWith('/index.html')) {
      urlPath = '/' + rel.slice(0, -'index.html'.length);
    } else {
      urlPath = '/' + rel.slice(0, -'.html'.length);
    }
    html = redirectPage(TARGET_ORIGIN + urlPath);
  }

  await writeFile(filePath, html, 'utf-8');
  count++;
}

console.log(`Replaced ${count} HTML files with redirects to ${TARGET_ORIGIN}.`);
