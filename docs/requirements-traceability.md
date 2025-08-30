# Requirements Traceability
| Requirement | Evidence | File/Script |
|---|---|---|
| Structural Completeness | Directories present | data/, logs/, reports/, artifacts/, schema/ |
| Reproducible Execution | One-command headless run | Makefile `demo`, scripts/smoke-e2e.mjs |
| Schema Validation | Ajv compile + zod parse | schema/scene-control.schema.json, src/schema/scene-control.ts, scripts/validate-schemas.mjs |
| Raw Logs & Evidence | JSONL console capture, checksums | logs/*.jsonl, artifacts/checksums.json |
| Proof of Replicability | Fixed seed + SHA256 | VITE_SEED, artifacts/checksums.json |
| High-Fidelity Reports | Machine + human outputs | reports/run.json, reports/executive-summary.md |
