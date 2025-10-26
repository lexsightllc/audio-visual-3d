#!/usr/bin/env node
/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const deps = Object.entries({ ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) });

deps.sort(([a], [b]) => a.localeCompare(b));

console.log('Dependency inventory (update manually as needed):\n');
for (const [name, version] of deps) {
  console.log(`- ${name} @ ${version}`);
}

console.log('\nRun `npm outdated` in a networked environment to fetch suggested updates.');
