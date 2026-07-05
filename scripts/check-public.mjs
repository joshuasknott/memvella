#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const TEXT_FILE_MAX_BYTES = 1024 * 1024;

const trackedFiles = execFileSync("git", ["ls-files", "-z"], {
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean)
  .map((path) => path.replaceAll("\\", "/"));

const blockedPathRules = [
  {
    name: "local environment file",
    test: (path) => /(^|\/)\.env($|\.)(?!example$)/.test(path),
    message: "Commit .env.example only; keep local environment files untracked.",
  },
  {
    name: "internal status file",
    test: (path) => path === "STATE.md" || path.endsWith("/STATE.md"),
    message: "STATE.md is an internal status file and must not be tracked.",
  },
  {
    name: "generated or runtime artifact",
    test: (path) =>
      /(^|\/)(node_modules|\.next|\.turbo|playwright-report|test-results|\.convex)(\/|$)/.test(
        path,
      ),
    message: "Generated and runtime artifacts must not be tracked.",
  },
  {
    name: "private key material file",
    test: (path) => /\.(pem|key|p12|pfx)$/i.test(path),
    message: "Private key material must not be tracked.",
  },
  {
    name: "legacy lockfile",
    test: (path) => path === "package-lock.json" || path === "yarn.lock",
    message: "This repo uses pnpm; legacy lockfiles should stay untracked.",
  },
];

// Intentional public placeholders/examples:
// - .env.example files document required variables with blank or example values.
// - .github/workflows/verify.yml uses ci-* and example domains for deterministic CI.
// - tests use configured-secret, prod:test-deployment, and similar dummy values.
// - documentation may mention placeholder syntax such as <your-key>.
const allowedValuePatterns = [
  /^$/,
  /^ci[-_a-z0-9]*$/i,
  /^example$/i,
  /^example\./i,
  /^https?:\/\/(example\.|memvella\.example|127\.0\.0\.1|localhost)/i,
  /^mailto:(support|ci|accounts)@example\.com$/i,
  /^<[^>]+>$/,
  /^\$\{\{\s*(secrets|vars)\.[A-Z0-9_]+\s*\}\}$/,
  /^configured-secret$/,
  /^secret$/,
  /^test[-_a-z0-9]*$/i,
  /^dev:ci$/,
  /^prod:test-deployment$/,
  /^gemini-live-ci$/,
  /^Memvella <accounts@example\.com>$/,
  /^v\./,
];

const contentRules = [
  {
    name: "private key block",
    pattern: /-----BEGIN (?:RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/,
    message: "Private key blocks must never be tracked.",
  },
  {
    name: "OpenAI-style API key",
    pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/,
    message: "Looks like a real API key.",
  },
  {
    name: "Google API key",
    pattern: /\bAIza[0-9A-Za-z_-]{20,}\b/,
    message: "Looks like a real Google API key.",
  },
  {
    name: "GitHub token",
    pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b/,
    message: "Looks like a real GitHub token.",
  },
  {
    name: "Slack token",
    pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/,
    message: "Looks like a real Slack token.",
  },
  {
    name: "Resend API key",
    pattern: /\bre_[A-Za-z0-9_]{20,}\b/,
    message: "Looks like a real Resend API key.",
  },
  {
    name: "Vercel token",
    pattern: /\bvercel_[A-Za-z0-9]{20,}\b/i,
    message: "Looks like a real Vercel token.",
  },
  {
    name: "personal local path",
    pattern: /\b(?:[A-Z]:\\Users\\[^\\\s"'`<>]+|\/Users\/[^/\s"'`<>]+|\/home\/[^/\s"'`<>]+)/,
    message: "Personal local paths should not be committed.",
  },
];

const assignmentPattern =
  /^\s*(?:export\s+)?([A-Z0-9_]*(?:SECRET|TOKEN|API_KEY|PRIVATE_KEY|ACCESS_KEY|COOKIE_SECRET|AUTH_PEPPER|CONVEX_DEPLOYMENT|CONVEX_URL|SITE_URL|TRUSTED_ORIGINS)[A-Z0-9_]*)\s*[:=]\s*["']?([^"'\s#]+(?:\s<[^>]+>)?)["']?\s*(?:#.*)?$/i;

const findings = [];

for (const path of trackedFiles) {
  for (const rule of blockedPathRules) {
    if (rule.test(path)) {
      findings.push({
        path,
        rule: rule.name,
        message: rule.message,
      });
    }
  }

  const content = readTextFile(path);
  if (content === null) {
    continue;
  }

  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const rule of contentRules) {
      if (rule.pattern.test(line)) {
        findings.push({
          path,
          line: index + 1,
          rule: rule.name,
          message: rule.message,
        });
      }
    }

    const assignment = line.match(assignmentPattern);
    if (!assignment) {
      return;
    }

    const [, name, rawValue] = assignment;
    if (!/^[A-Z0-9_]+$/.test(name)) {
      return;
    }

    const value = rawValue.trim();
    if (isSourceIdentifierReference(path, value)) {
      return;
    }

    if (isAllowedPublicValue(value)) {
      return;
    }

    if (looksSensitiveAssignment(name, value)) {
      findings.push({
        path,
        line: index + 1,
        rule: "sensitive environment value",
        message: `Tracked ${name} appears to contain a non-placeholder value.`,
      });
    }
  });
}

if (findings.length > 0) {
  console.error("Public repository safety check failed:\n");
  for (const finding of findings) {
    const location = finding.line ? `${finding.path}:${finding.line}` : finding.path;
    console.error(`- ${location} [${finding.rule}] ${finding.message}`);
  }
  console.error(
    "\nIf a finding is an intentional public placeholder, add a narrow allowlist entry in scripts/check-public.mjs.",
  );
  process.exit(1);
}

console.log(`Public repository safety check passed (${trackedFiles.length} tracked files scanned).`);

function readTextFile(path) {
  const buffer = readFileSync(path);
  if (buffer.length > TEXT_FILE_MAX_BYTES || buffer.includes(0)) {
    return null;
  }
  return buffer.toString("utf8");
}

function isAllowedPublicValue(value) {
  return allowedValuePatterns.some((pattern) => pattern.test(value));
}

function isSourceIdentifierReference(path, value) {
  return (
    /\.(?:js|mjs|cjs|ts|tsx)$/.test(path) &&
    /^[a-z][A-Za-z0-9_]*,?$/.test(value)
  );
}

function looksSensitiveAssignment(name, value) {
  if (value.length < 12) {
    return false;
  }

  if (/[()]/.test(value)) {
    return false;
  }

  if (/^(?:true|false|null|undefined)$/i.test(value)) {
    return false;
  }

  if (/^(?:local|development|production|preview|staging)$/i.test(value)) {
    return false;
  }

  if (/^(?:https?:\/\/)?(?:localhost|127\.0\.0\.1)(?::\d+)?/i.test(value)) {
    return false;
  }

  if (/example|placeholder|your-|dummy|test|ci/i.test(value)) {
    return false;
  }

  if (/CONVEX_DEPLOYMENT/i.test(name) && /^(?:dev|prod):[a-z0-9-]{6,}$/i.test(value)) {
    return true;
  }

  if (/(SECRET|TOKEN|API_KEY|PRIVATE_KEY|ACCESS_KEY|COOKIE_SECRET|AUTH_PEPPER)/i.test(name)) {
    return true;
  }

  if (/(CONVEX_URL|SITE_URL|TRUSTED_ORIGINS)/i.test(name)) {
    return !/\.example(?:\/|$)|example\.convex\.cloud/i.test(value);
  }

  return false;
}
