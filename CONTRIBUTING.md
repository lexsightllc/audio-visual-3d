# Contributing Guidelines

Thank you for investing time to contribute to **audio-visual-3d**. This document
explains how to propose improvements while keeping the project stable,
accessible, and secure.

## Code of Conduct

Please review and follow our [Code of Conduct](CODE_OF_CONDUCT.md). We are
committed to building an inclusive and respectful community.

## Development Workflow

1. Fork the repository and clone your fork.
2. Run `scripts/bootstrap.sh` (or `scripts/bootstrap.ps1` on Windows) to install
   toolchains, configure Git hooks, and validate your environment.
3. Create a feature branch using Conventional Commits, e.g.,
   `feat/runtime-telemetry`.
4. Implement the change with accompanying unit tests and documentation updates.
5. Ensure `make check` passes locally.
6. Open a pull request, filling out the template completely.
7. Request a review from the owners listed in `CODEOWNERS`.

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/) for all
commit messages. Hooks installed by the bootstrap script will validate your
messages automatically.

## Testing Expectations

- Unit tests belong in `tests/unit` and should mirror the source tree
  structure.
- Integration tests live in `tests/integration` and may rely on lightweight
  fixtures.
- End-to-end tests belong in `tests/e2e` and must express behavior with
  Given/When/Then comments.
- Run `scripts/test.sh` for unit tests and `scripts/e2e.sh` for full flows.

## Documentation

Significant architectural decisions must be captured as an Architecture Decision
Record (ADR) under `docs/adr`. Update the README’s Developer Tasks section when
adding or modifying automation scripts.

## Security

Never commit secrets. Use the `.env.example` template and configure real values
locally. Report vulnerabilities privately to the maintainers listed in
`project.yaml`.

## Release Management

Use `scripts/release.sh` to prepare a release. The script validates the changelog
and uses semantic versioning to tag releases and push them to origin.
