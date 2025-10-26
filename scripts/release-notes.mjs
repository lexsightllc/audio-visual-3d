#!/usr/bin/env node
/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const changelog = readFileSync('CHANGELOG.md', 'utf8');
if (!changelog.includes('## [Unreleased]')) {
  console.error('CHANGELOG.md must contain an "## [Unreleased]" section.');
  process.exit(1);
}

const notesPath = join('reports', 'release-notes.md');
const now = new Date().toISOString();
const content = `# Release Notes\n\nGenerated: ${now}\n\n${changelog}\n`;
writeFileSync(notesPath, content);
console.log(`Release notes written to ${notesPath}`);
