#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const TARGET_EXT = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
const DIRECTORIES = ['src', 'tests'];

const args = new Set(process.argv.slice(2));
const shouldFix = args.has('--fix');

const problems = [];

const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.')) continue;
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      walk(full);
    } else {
      if (TARGET_EXT.some((ext) => entry.endsWith(ext))) {
        lintFile(full);
      }
    }
  }
};

const lintFile = (file) => {
  const rel = relative(ROOT, file);
  const original = readFileSync(file, 'utf8');
  const lines = original.split(/\r?\n/);
  let modified = false;

  lines.forEach((line, idx) => {
    const lineNumber = idx + 1;
    if (/TODO|FIXME|TBD/.test(line)) {
      problems.push(`${rel}:${lineNumber} contains unresolved placeholder.`);
    }
    if (/console\.(log|debug)\s*\(/.test(line) && !rel.includes('lib/logger.ts')) {
      problems.push(`${rel}:${lineNumber} uses console logging. Use structured logging utilities.`);
    }
    if (/debugger\s*;/.test(line)) {
      problems.push(`${rel}:${lineNumber} contains debugger statement.`);
    }
    if (/\bvar\b/.test(line)) {
      if (shouldFix) {
        lines[idx] = line.replace(/\bvar\b/g, 'let');
        modified = true;
      } else {
        problems.push(`${rel}:${lineNumber} uses var. Prefer let/const.`);
      }
    }
  });

  if (shouldFix && modified) {
    writeFileSync(file, lines.join('\n'));
  }
};

for (const dir of DIRECTORIES) {
  try {
    walk(join(ROOT, dir));
  } catch (error) {
    // Directory may not exist; skip gracefully.
  }
}

if (problems.length > 0) {
  console.error('Lint issues detected:\n');
  for (const problem of problems) {
    console.error(` - ${problem}`);
  }
  process.exit(1);
}

console.log('Lint checks passed.');
