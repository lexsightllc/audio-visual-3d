#!/usr/bin/env node
/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const EXCLUDES = new Set([
  'node_modules',
  '.git',
  'dist',
  'coverage',
  'artifacts',
  'logs',
  'sbom',
]);

const patterns = [
  /AKIA[0-9A-Z]{16}/g,
  /AIza[0-9A-Za-z\-_]{35}/g,
  /sk-[a-zA-Z0-9]{32,}/g,
];

let foundSecret = false;

const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    if (EXCLUDES.has(entry)) continue;
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walk(fullPath);
    } else if (stats.isFile()) {
      const content = readFileSync(fullPath, 'utf8');
      for (const pattern of patterns) {
        if (pattern.test(content)) {
          console.error(`Potential secret detected in ${fullPath}`);
          foundSecret = true;
        }
        pattern.lastIndex = 0;
      }
    }
  }
};

walk(process.cwd());

if (foundSecret) {
  console.error('Secret scan failed. Remove the secrets before committing.');
  process.exit(1);
}

console.log('Secret scan passed.');
