#!/usr/bin/env node
/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const args = new Set(process.argv.slice(2));
const checkMode = args.has('--check');

const ALLOWED_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.d.ts',
]);

const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  'artifacts',
  'logs',
  '.vite',
  '.turbo',
  '.next',
  '.idea',
  '.vscode',
]);

const headerLines = [
  '/*',
  ' * Copyright 2025 Lexsight LLC',
  ' * SPDX-License-Identifier: MPL-2.0',
  ' */',
  '',
];
const HEADER = headerLines.join('\n');

const missingHeaders = [];

async function walk(currentDir) {
  const entries = await readdir(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.git')) {
      continue;
    }

    const fullPath = join(currentDir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        continue;
      }
      await walk(fullPath);
      continue;
    }

    const ext = extname(entry.name);
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      continue;
    }

    await processFile(fullPath);
  }
}

async function processFile(filePath) {
  const content = await readFile(filePath, 'utf8');
  if (content.includes('SPDX-License-Identifier: MPL-2.0')) {
    return;
  }

  if (checkMode) {
    missingHeaders.push(filePath);
    return;
  }

  let newContent;
  if (content.startsWith('#!')) {
    const index = content.indexOf('\n');
    if (index === -1) {
      newContent = `${content}\n${HEADER}`;
    } else {
      const shebang = content.slice(0, index + 1);
      const rest = content.slice(index + 1);
      newContent = `${shebang}${HEADER}${rest}`;
    }
  } else {
    newContent = `${HEADER}${content}`;
  }

  await writeFile(filePath, newContent, 'utf8');
}

(async () => {
  const rootStat = await stat(projectRoot);
  if (!rootStat.isDirectory()) {
    throw new Error('Project root is not a directory');
  }

  await walk(projectRoot);

  if (missingHeaders.length > 0) {
    missingHeaders.sort();
    console.error('Files missing MPL-2.0 SPDX headers:');
    for (const file of missingHeaders) {
      console.error(` - ${file}`);
    }
    process.exit(1);
  }
})();
