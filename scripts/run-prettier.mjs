#!/usr/bin/env node
/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');
const ROOT = process.cwd();
const TARGET_EXT = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.scss', '.mjs', '.cjs'];
const DIRECTORIES = ['src', 'tests', 'scripts', 'docs', 'configs'];

const issues = [];

const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.')) continue;
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      walk(full);
    } else if (TARGET_EXT.some((ext) => entry.endsWith(ext))) {
      formatFile(full);
    }
  }
};

const stripTrailingWhitespace = (text) => text.replace(/[ \t]+$/gm, '');

const ensureFinalNewline = (text) => (text.endsWith('\n') ? text : `${text}\n`);

const formatFile = (file) => {
  const rel = relative(ROOT, file);
  const original = readFileSync(file, 'utf8');
  const trimmed = stripTrailingWhitespace(original);
  const formatted = ensureFinalNewline(trimmed);

  if (original !== formatted) {
    if (checkOnly) {
      issues.push(`${rel} is not formatted correctly.`);
    } else {
      writeFileSync(file, formatted);
    }
  }
};

for (const dir of DIRECTORIES) {
  try {
    walk(join(ROOT, dir));
  } catch (error) {
    // ignore missing directories
  }
}

if (checkOnly && issues.length > 0) {
  console.error('Formatting check failed:\n');
  for (const issue of issues) {
    console.error(` - ${issue}`);
  }
  process.exit(1);
}

if (checkOnly) {
  console.log('Formatting check passed.');
} else {
  console.log('Formatting completed.');
}
