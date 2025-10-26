#!/usr/bin/env node
/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import { spawnSync } from 'node:child_process';

const commands = [
  ['npm', ['run', 'lint']],
  ['npm', ['run', 'typecheck']],
  ['npm', ['run', 'format:check']],
  ['npm', ['run', 'license:headers:check']],
  ['npm', ['run', 'test:unit']],
  ['npm', ['run', 'test:e2e']],
  ['npm', ['run', 'coverage']],
  ['npm', ['run', 'security:scan']],
];

for (const [cmd, args] of commands) {
  const result = spawnSync(cmd, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
