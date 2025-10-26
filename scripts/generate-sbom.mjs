#!/usr/bin/env node
/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import { readFileSync, writeFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const sbom = {
  metadata: {
    name: pkg.name,
    version: pkg.version,
    generatedAt: new Date().toISOString(),
  },
  dependencies: {
    production: pkg.dependencies || {},
    development: pkg.devDependencies || {},
  },
};

writeFileSync('sbom/sbom.json', JSON.stringify(sbom, null, 2));
console.log('SBOM generated at sbom/sbom.json');
