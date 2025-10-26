/*
 * Copyright 2025 Lexsight LLC
 * SPDX-License-Identifier: MPL-2.0
 */
import { readFileSync, readdirSync } from "node:fs";
import Ajv from "ajv/dist/2020.js";
const ajv = new Ajv({ allErrors: true, strict: true });

const files = readdirSync("schema").filter(f => f.endsWith(".json"));
for (const f of files) {
  const s = JSON.parse(readFileSync(`schema/${f}`, "utf8"));
  ajv.compile(s); // throws if invalid
  console.log(`OK schema/${f}`);
}
