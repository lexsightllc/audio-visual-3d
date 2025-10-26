SHELL := /bin/bash
.DEFAULT_GOAL := help

NODE_VERSION ?= 20.12.2

.PHONY: help bootstrap dev lint fmt typecheck test e2e coverage build package release update-deps security-scan sbom gen-docs migrate clean check

help:
@echo "Available targets:"
@echo "  bootstrap     Install dependencies, configure hooks, and validate the toolchain."
@echo "  dev           Launch the Vite development server."
@echo "  lint          Run ESLint across the project."
@echo "  fmt           Format the codebase (use -- ARGS=--check for verification)."
@echo "  typecheck     Execute strict TypeScript checks."
@echo "  test          Run unit tests."
@echo "  e2e           Run end-to-end browser tests."
@echo "  coverage      Generate coverage reports."
@echo "  build         Build production assets."
@echo "  package       Produce distributable artifacts."
@echo "  release       Prepare and tag a semantic release."
@echo "  update-deps   Suggest dependency updates using batching rules."
@echo "  security-scan Perform dependency and secret scans."
@echo "  sbom          Generate a CycloneDX software bill of materials."
@echo "  gen-docs      Rebuild API documentation."
@echo "  migrate       Run schema migrations if present."
@echo "  clean         Remove build artifacts."
@echo "  check         Execute the complete quality gate locally."

bootstrap:
./scripts/bootstrap.sh

dev:
./scripts/dev.sh

lint:
./scripts/lint.sh $(ARGS)

fmt:
./scripts/fmt.sh $(ARGS)

typecheck:
./scripts/typecheck.sh

test:
./scripts/test.sh

e2e:
./scripts/e2e.sh

coverage:
./scripts/coverage.sh

build:
./scripts/build.sh

package:
./scripts/package.sh

release:
./scripts/release.sh $(ARGS)

update-deps:
./scripts/update-deps.sh $(ARGS)

security-scan:
./scripts/security-scan.sh

sbom:
./scripts/sbom.sh

gen-docs:
./scripts/gen-docs.sh

migrate:
./scripts/migrate.sh $(ARGS)

clean:
./scripts/clean.sh

check:
./scripts/check.sh
