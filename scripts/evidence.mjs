/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
// bundle raw logs, SBOM, report into artifacts for audit
import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
if (!existsSync("artifacts")) mkdirSync("artifacts");
execSync("npx @cyclonedx/cyclonedx-npm --output-file artifacts/sbom.json", { stdio: "inherit" });
console.log("SBOM generated at artifacts/sbom.json");
