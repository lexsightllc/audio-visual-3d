#!/usr/bin/env node
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
