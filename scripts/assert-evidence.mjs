/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import { existsSync, readdirSync } from 'node:fs';

function expect(cond, msg) {
  if (!cond) {
    console.error(msg);
    process.exit(1);
  }
}

expect(existsSync('artifacts/first-frame.txt'), 'missing artifacts/first-frame.txt');
expect(existsSync('artifacts/checksums.json'), 'missing artifacts/checksums.json');
expect(existsSync('reports/run.json'), 'missing reports/run.json');
expect(existsSync('reports/executive-summary.md'), 'missing reports/executive-summary.md');
expect(existsSync('reports/metrics.json'), 'missing reports/metrics.json');
expect(readdirSync('logs').length > 0, 'missing logs');

console.log('All evidence present');
