/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';

const ART = 'artifacts';
const LOG = 'logs';
for (const d of [ART, LOG, 'reports']) if (!existsSync(d)) mkdirSync(d, { recursive: true });

// Deterministic 1x1 PNG (black pixel) encoded as data URL
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAn8B9i5AXxsAAAAASUVORK5CYII=';
const dataUrl = `data:image/png;base64,${pngBase64}`;
const shot = join(ART, 'first-frame.txt');
writeFileSync(shot, dataUrl + '\n');

// minimal log
const logPath = join(LOG, 'synthetic.jsonl');
writeFileSync(logPath, JSON.stringify({ ts: new Date().toISOString(), type: 'synthetic', msg: 'preview failed' }) + '\n');

// checksums
function sha256(buf) { return createHash('sha256').update(buf).digest('hex'); }
const checksums = [
  { file: 'artifacts/first-frame.txt', sha256: sha256(Buffer.from(dataUrl)) },
  { file: logPath, sha256: sha256(readFileSync(logPath)) }
];
writeFileSync(join(ART, 'checksums.json'), JSON.stringify(checksums, null, 2) + '\n');

// minimal report
const commit = execSync('git rev-parse HEAD').toString().trim();
writeFileSync('reports/run.json', JSON.stringify({
  startedAt: new Date().toISOString(),
  seed: process.env.VITE_SEED || '00000000',
  url: null,
  commit,
  dirty: execSync('git status --porcelain').toString().trim() !== '',
  synthetic: true,
  artifacts: checksums
}, null, 2) + '\n');
