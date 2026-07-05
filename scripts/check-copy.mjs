#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const allowComment = "copy-guardrail: allow";

const ignoredDirectories = new Set([
  ".git",
  ".agents",
  ".next",
  ".turbo",
  ".vercel",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "playwright-report",
  "test-results",
]);

const ignoredFiles = new Set([
  "pnpm-lock.yaml",
  "skills-lock.json",
  "docs/legacy-removal.md",
  "docs/terminology.md",
  "docs/product.md",
  "docs/architecture.md",
  "apps/core/design.md",
  "apps/marketing/design.md",
  "scripts/check-copy.mjs",
  "apps/backend-convex/convex/voiceSafety.ts",
  "apps/backend-convex/convex/voiceShared.ts",
]);

const scannedExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".mdx",
  ".mjs",
  ".ts",
  ".tsx",
]);

const rules = [
  {
    id: "retired-admin",
    message: "Use Workspace owner or Supporter instead of retired Admin copy.",
    pattern: /\bAdmin\b/g,
  },
  {
    id: "retired-familyspace",
    message: "Use Workspace/circle instead of retired FamilySpace wording.",
    pattern: /\bFamilySpace\b/g,
  },
  {
    id: "retired-connection-code",
    message: "Use invite code or tablet code instead of Connection Code.",
    pattern: /\bConnection Code\b/g,
  },
  {
    id: "retired-personal-profile",
    message: "Use account, profile, or Person context instead of Personal Profile.",
    pattern: /\bPersonal Profile\b/g,
  },
  {
    id: "medical-device-claim",
    message: "Avoid medical-device framing outside approved disclaimers.",
    pattern: /\bmedical device\b/gi,
  },
  {
    id: "diagnostic-claim",
    message: "Avoid diagnostic framing or claims.",
    pattern: /\b(diagnos(?:e|es|ed|ing|is|tic)|diagnostic tool)\b/gi,
  },
  {
    id: "treatment-claim",
    message: "Avoid treatment or treatment-advice framing.",
    pattern: /\b(treatment|prescription|dosage)\b/gi,
  },
  {
    id: "clinical-claim",
    message: "Avoid clinical claims or clinical framing.",
    pattern: /\bclinical(?:ly)?\b/gi,
  },
  {
    id: "patient-framing",
    message: "Use senior or person instead of patient framing.",
    pattern: /\bpatients?\b/gi,
  },
  {
    id: "dementia-label",
    message: "Do not use dementia as broad product positioning.",
    pattern: /\bdementia\b/gi,
  },
  {
    id: "cure-claim",
    message: "Avoid cure claims.",
    pattern: /\b(cure|cures|cured|curing)\b/gi,
  },
];

const allowedLinePatterns = [
  /\bnot a medical device\b/i,
  /\bnot a diagnostic tool\b/i,
  /\bnot a substitute for\b/i,
  /\bnot a replacement for professional care\b/i,
  /\bNever give medical, dosage, diagnosis, or treatment advice\b/i,
  /\bI can't tell you which pill or treatment to use\b/i,
  /\blicensed clinician\b/i,
  /\bclinically necessary\b/i,
];

function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function isIgnored(relativePath) {
  const normalized = toPosix(relativePath);
  return (
    ignoredFiles.has(normalized) ||
    normalized.startsWith("docs/archive/") ||
    normalized.includes("/_generated/")
  );
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...(await collectFiles(path.join(directory, entry.name))));
      }
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const filePath = path.join(directory, entry.name);
    const relativePath = path.relative(root, filePath);
    if (
      scannedExtensions.has(path.extname(entry.name)) &&
      !isIgnored(relativePath)
    ) {
      files.push(filePath);
    }
  }

  return files;
}

function lineAndColumnForIndex(text, index) {
  const prefix = text.slice(0, index);
  const lines = prefix.split("\n");
  return {
    line: lines.length,
    column: lines.at(-1).length + 1,
  };
}

function isAllowedLine(line) {
  return line.includes(allowComment) || allowedLinePatterns.some((pattern) => pattern.test(line));
}

const failures = [];

for (const filePath of await collectFiles(root)) {
  const text = await readFile(filePath, "utf8");
  const lines = text.split(/\r?\n/);
  const relativePath = toPosix(path.relative(root, filePath));

  for (const rule of rules) {
    rule.pattern.lastIndex = 0;
    for (const match of text.matchAll(rule.pattern)) {
      const location = lineAndColumnForIndex(text, match.index ?? 0);
      const line = lines[location.line - 1] ?? "";
      if (isAllowedLine(line)) {
        continue;
      }

      failures.push({
        rule,
        relativePath,
        location,
        excerpt: line.trim(),
      });
    }
  }
}

if (failures.length > 0) {
  console.error("Copy guardrail found launch-sensitive terms or claims:\n");
  for (const failure of failures) {
    console.error(
      `${failure.relativePath}:${failure.location.line}:${failure.location.column} ` +
        `[${failure.rule.id}] ${failure.rule.message}`,
    );
    console.error(`  ${failure.excerpt}`);
  }
  process.exit(1);
}

console.log("Copy guardrail passed.");
