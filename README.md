# Audio Visual 3D

Audio Visual 3D demonstrates a real-time, voice-driven 3D experience powered by
React, Three.js, and Vite. Spoken input is analysed to generate responsive
visualisations in an immersive scene.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Developer Tasks](#developer-tasks)
- [Project Structure](#project-structure)
- [Testing Strategy](#testing-strategy)
- [Observability](#observability)
- [Security](#security)
- [Documentation](#documentation)
- [License](#license)

## Prerequisites

- Node.js 20.12.x (see `.nvmrc`)
- npm 10.x (bundled with Node 20)
- Docker (optional, for `docker-compose` workflows)

## Getting Started

1. **Bootstrap the toolchain**
   ```bash
   scripts/bootstrap.sh
   ```
   The bootstrap step installs dependencies, configures Git hooks, installs
   Playwright browsers, and enforces the Conventional Commit template.

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Update values as needed without committing secrets
   ```

3. **Launch the developer server**
   ```bash
   scripts/dev.sh
   ```
   The Vite dev server will be available at http://localhost:5173 by default.

4. **Alternative: Docker Compose**
   ```bash
   docker compose up
   ```

## Developer Tasks

> Offline-friendly linting and formatting scripts are provided to keep automation working without third-party downloads.

| Command | Description |
| ------- | ----------- |
| `scripts/bootstrap.sh` / `.ps1` | Install dependencies, Playwright browsers, Husky hooks, and commit template. |
| `scripts/dev.sh` / `.ps1` | Start the Vite development server with hot reloading. |
| `scripts/lint.sh [--fix]` / `.ps1` | Run structural lint checks (console/debugger/TODO detection) with optional `--fix` support for replacing `var`. |
| `scripts/fmt.sh [--check]` / `.ps1` | Normalize trailing whitespace and final newlines (`--check` for verification). |
| `scripts/typecheck.sh` / `.ps1` | Execute strict TypeScript checks with `tsc --noEmit`. |
| `scripts/test.sh` / `.ps1` | Run unit tests via Vitest. |
| `scripts/e2e.sh` / `.ps1` | Run Playwright end-to-end scenarios. |
| `scripts/coverage.sh` / `.ps1` | Generate combined coverage reports (text and LCOV). |
| `scripts/build.sh` / `.ps1` | Produce production-ready bundles using Vite. |
| `scripts/package.sh` / `.ps1` | Create an npm package tarball inside `artifacts/`. |
| `scripts/release.sh` / `.ps1` | Compile release notes from the changelog and write them to reports/release-notes.md. |
| `scripts/update-deps.sh` / `.ps1` | Print dependency inventory for manual update planning in restricted environments. |
| `scripts/security-scan.sh` / `.ps1` | Run custom secret heuristics and attempt `npm audit` (tolerant to offline mode). |
| `scripts/sbom.sh` / `.ps1` | Generate a lightweight SBOM summary under `sbom/`. |
| `scripts/gen-docs.sh` / `.ps1` | Summarise exported symbols into `docs/api/README.md`. |
| `scripts/migrate.sh` / `.ps1` | Execute server-side migrations when defined. |
| `scripts/clean.sh` / `.ps1` | Remove build artifacts and recreate staging directories. |
| `scripts/check.sh` / `.ps1` | Orchestrate lint, typecheck, formatting check, unit, e2e, coverage, and security scans. |
| `npm run license:headers` | Apply the canonical MPL-2.0 header to all tracked JS/TS sources (use `--check` to verify without modifying). |

Each script is mirrored in PowerShell to keep macOS/Linux and Windows workflows
in sync. The `Makefile` provides matching phony targets for integration with CI
pipelines and developer tooling.

## Project Structure

```
.
├── assets/                # Shared static assets
├── ci/                    # Future CI provisioning assets
├── configs/               # Configuration templates and overrides
├── data/                  # Sample datasets
├── docs/
│   ├── adr/               # Architecture decision records
│   └── api/               # Generated API docs (ignored)
├── sbom/                  # Generated software bills of materials
├── scripts/               # Developer automation toolbelt
├── src/                   # Application source (React + Three.js)
├── tests/
│   ├── unit/              # Vitest unit suites
│   ├── integration/       # Integration tests
│   └── e2e/               # Playwright end-to-end scenarios
└── reports/               # Status reports and evidence artifacts
```

## Testing Strategy

- **Unit tests** live in `tests/unit` and mirror module structure. Vitest is
  configured with jsdom and strict coverage thresholds.
- **Integration tests** belong in `tests/integration` and should isolate external
  dependencies via fixtures in `tests/fixtures`.
- **End-to-end tests** in `tests/e2e` use Playwright with Given/When/Then
  commentary to emphasise user-visible behaviour.
- Run `make test` for unit tests and `make e2e` for browser coverage. Execute
  `make check` to reproduce the CI quality gate locally.

## Observability

Structured logging, metrics, and tracing hooks are being introduced. Refer to
`project.yaml` and future ADRs for implementation milestones. Contributions
should prefer structured logs and avoid leaking sensitive data.

## Security

- Follow the [Code of Conduct](CODE_OF_CONDUCT.md) and
  [Contributing Guidelines](CONTRIBUTING.md).
- Never commit secrets; use `.env.example` as the baseline template.
- Run `make security-scan` before raising a pull request.
- Dependency updates are batched through the Renovate/Dependabot-friendly rules
  in `scripts/update-deps.sh`.

## Documentation

Key documents:

- [CHANGELOG](CHANGELOG.md) for release history.
- [CONTRIBUTING](CONTRIBUTING.md) for contribution workflow.
- [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md) for community expectations.
- [project.yaml](project.yaml) for metadata and ownership.
- [docs/adr](docs/adr) for architectural decisions.

## License

This project is licensed under the Mozilla Public License 2.0. See [LICENSE](LICENSE)
and [NOTICE](NOTICE) for details.
