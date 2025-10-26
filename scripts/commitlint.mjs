#!/usr/bin/env node
/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const COMMIT_TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
];

const commitMsgFile = process.argv[2];
if (!commitMsgFile) {
  console.error('Commit message file must be provided.');
  process.exit(1);
}

const message = readFileSync(commitMsgFile, 'utf8').split('\n')[0].trim();

const conventionalRegex = new RegExp(
  `^(?:${COMMIT_TYPES.join('|')})(?:\\([^\\s()]+\\))?: .+`,
);

if (!conventionalRegex.test(message)) {
  console.error(`\nInvalid commit message: "${message}"`);
  console.error(
    'Commit messages must follow Conventional Commits, e.g. "feat(renderer): add stereo camera".',
  );
  process.exit(1);
}

console.log(`Commit message "${message}" from ${basename(commitMsgFile)} validated.`);
