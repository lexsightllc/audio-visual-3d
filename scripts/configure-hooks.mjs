#!/usr/bin/env node
/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import { existsSync } from 'node:fs';
import { chmodSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const ROOT = dirname(dirname(__filename));
const HUSKY_DIR = join(ROOT, '.husky');

if (!existsSync(HUSKY_DIR)) {
  console.warn('[configure-hooks] No .husky directory detected; skipping git hooks configuration.');
  process.exit(0);
}

const hookFiles = ['pre-commit', 'pre-push', 'commit-msg']
  .map((name) => join(HUSKY_DIR, name))
  .filter((path) => existsSync(path));

for (const file of hookFiles) {
  try {
    chmodSync(file, 0o755);
  } catch (error) {
    console.warn(`[configure-hooks] Unable to set executable bit on ${file}:`, error);
  }
}

const result = spawnSync('git', ['config', 'core.hooksPath', '.husky'], {
  cwd: ROOT,
  stdio: 'inherit',
});

if (result.error) {
  console.warn('[configure-hooks] Failed to configure git hooks path:', result.error);
} else if (result.status !== 0) {
  console.warn('[configure-hooks] git config exited with code', result.status);
}
