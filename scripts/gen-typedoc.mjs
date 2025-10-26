#!/usr/bin/env node
/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, 'src');
const OUTPUT_DIR = join(ROOT, 'docs', 'api');

const gatherExports = (dir) => {
  const summary = [];
  const walk = (current) => {
    for (const entry of readdirSync(current)) {
      if (entry.startsWith('.')) continue;
      const full = join(current, entry);
      const stats = statSync(full);
      if (stats.isDirectory()) {
        walk(full);
      } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
        const rel = relative(SRC_DIR, full);
        const contents = readFileSync(full, 'utf8');
        const exports = Array.from(
          contents.matchAll(/export\s+(?:const|function|class|interface|type)\s+(\w+)/g),
        ).map((match) => match[1]);
        if (exports.length > 0) {
          summary.push({ file: rel, exports });
        }
      }
    }
  };
  walk(dir);
  return summary;
};

const data = gatherExports(SRC_DIR);
const lines = ['# API Reference', '', `Generated: ${new Date().toISOString()}`, ''];
for (const item of data) {
  lines.push(`## ${item.file}`);
  for (const name of item.exports) {
    lines.push(`- \`${name}\``);
  }
  lines.push('');
}

writeFileSync(join(OUTPUT_DIR, 'README.md'), lines.join('\n'));
console.log('API reference generated at docs/api/README.md');
