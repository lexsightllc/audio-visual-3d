/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

if (!existsSync('reports')) mkdirSync('reports', { recursive: true });
const run = JSON.parse(readFileSync('reports/run.json', 'utf-8'));

const lines = [
  '# Executive Summary',
  '',
  `- Started At: ${run.startedAt}`,
  `- Seed: ${run.seed}`,
  `- Commit: ${run.commit}`,
  run.url ? `- URL: ${run.url}` : '- URL: (none)',
  run.playwrightVersion ? `- Playwright: ${run.playwrightVersion}` : '',
  run.fingerprint ? `- User Agent: ${run.fingerprint.userAgent}` : '',
];

writeFileSync('reports/executive-summary.md', lines.filter(Boolean).join('\n') + '\n');
