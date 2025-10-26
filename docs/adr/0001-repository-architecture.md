# ADR 0001: Repository Architecture Standardization

## Status
Accepted

## Context
The project originally lacked a consistent structure for automation scripts,
documentation, and configuration. Multiple ad-hoc scripts existed without a
unified developer toolbelt, making onboarding and maintenance difficult.

## Decision
We adopted a canonical repository layout championed by the Structure Steward
program. The solution introduces:

- Standard top-level documentation (README, CODE_OF_CONDUCT, CONTRIBUTING,
  CHANGELOG).
- Environment automation via `scripts/` with POSIX and PowerShell shims and a
  matching `Makefile`.
- Unified configuration for linting, formatting, testing, and security scanning.
- Lightweight linting and formatting scripts emulate ESLint/Prettier behaviour to remain functional in offline environments.
- GitHub Actions workflow running `make check` across a Node.js version matrix.
- Metadata documentation (`project.yaml`) and operational guides in `docs/`.

## Consequences
- Onboarding is simplified by `scripts/bootstrap` and the documented Developer
  Tasks.
- Quality gates run consistently in local and CI environments.
- Future structural changes must extend this ADR and keep tooling idempotent.
