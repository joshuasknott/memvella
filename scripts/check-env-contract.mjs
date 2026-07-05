#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  formatResults,
  parseMarkdownContract,
  readActualTargets,
  validateContract,
} from "./env-contract.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contract = parseMarkdownContract(fs.readFileSync(path.join(rootDir, "docs/env.md"), "utf8"));
const results = validateContract({
  contract,
  actualByTarget: readActualTargets(rootDir),
});

console.log(formatResults(results));
if (results.length > 0) {
  process.exitCode = 1;
}
