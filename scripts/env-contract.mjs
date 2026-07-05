import fs from "node:fs";
import path from "node:path";

export const TARGETS = {
  core: {
    label: "apps/core/.env.example",
    path: "apps/core/.env.example",
    kind: "envExample",
  },
  backendExample: {
    label: "apps/backend-convex/.env.example",
    path: "apps/backend-convex/.env.example",
    kind: "envExample",
  },
  marketing: {
    label: "apps/marketing/.env.example",
    path: "apps/marketing/.env.example",
    kind: "envExample",
  },
  internal: {
    label: "apps/internal/.env.example",
    path: "apps/internal/.env.example",
    kind: "envExample",
  },
  convexConfig: {
    label: "apps/backend-convex/convex/convex.config.ts",
    path: "apps/backend-convex/convex/convex.config.ts",
    kind: "convexConfig",
    allowedUndocumented: new Set(["NODE_ENV"]),
  },
};

const INTERNAL_ONLY_PREFIX = "MEMVELLA_HQ_";

function stripBackticks(value) {
  return value.trim().replace(/^`|`$/g, "");
}

function splitMarkdownRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function parseMarkdownContract(markdown) {
  const rows = markdown
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("|"));

  const headerIndex = rows.findIndex((line) => splitMarkdownRow(line)[0] === "Variable");
  if (headerIndex === -1 || headerIndex + 2 >= rows.length) {
    throw new Error("Could not find the env variable contract table in docs/env.md.");
  }

  const headers = splitMarkdownRow(rows[headerIndex]).map((header) => header.toLowerCase());
  const records = [];

  for (const line of rows.slice(headerIndex + 2)) {
    const cells = splitMarkdownRow(line);
    if (cells.length !== headers.length || !cells[0]?.startsWith("`")) {
      break;
    }

    const record = Object.fromEntries(
      headers.map((header, index) => [header, cells[index] ?? ""]),
    );
    records.push({
      variable: stripBackticks(record.variable),
      required: record.required,
      scope: record.scope,
      usedBy: record["used by"],
      notes: record.notes,
    });
  }

  return records;
}

export function parseEnvExample(content) {
  return new Set(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.match(/^([A-Z0-9_]+)\s*=/)?.[1])
      .filter(Boolean),
  );
}

export function parseConvexConfigEnv(content) {
  const envStart = content.match(/env:\s*\{/);
  if (!envStart) {
    throw new Error("Could not find the env block in convex.config.ts.");
  }

  const blockStart = envStart.index + envStart[0].lastIndexOf("{");
  let depth = 0;
  let blockEnd = -1;
  for (let index = blockStart; index < content.length; index += 1) {
    if (content[index] === "{") {
      depth += 1;
    } else if (content[index] === "}") {
      depth -= 1;
      if (depth === 0) {
        blockEnd = index;
        break;
      }
    }
  }

  if (blockEnd === -1) {
    throw new Error("Could not find the end of the env block in convex.config.ts.");
  }

  const envBlock = content.slice(blockStart + 1, blockEnd);
  return new Set(
    [...envBlock.matchAll(/^\s*([A-Z0-9_]+)\s*:/gm)].map((match) => match[1]),
  );
}

function text(record) {
  return `${record.scope} ${record.usedBy} ${record.notes}`.toLowerCase();
}

export function targetKeysForRecord(record) {
  const haystack = text(record);
  const scope = record.scope.toLowerCase();
  const variable = record.variable;
  const keys = new Set();

  if (haystack.includes("marketing") || variable === "CONVEX_URL") {
    keys.add("marketing");
    return keys;
  }

  if (haystack.includes("apps/internal") || variable.startsWith(INTERNAL_ONLY_PREFIX)) {
    keys.add("internal");
    return keys;
  }

  if (variable === "MEMVELLA_ENV") {
    keys.add("internal");
    return keys;
  }

  if (variable === "MEMVELLA_TEST_MODE") {
    keys.add("core");
    keys.add("backendExample");
    keys.add("internal");
    keys.add("convexConfig");
    return keys;
  }

  if (haystack.includes("client") || variable.startsWith("NEXT_PUBLIC_")) {
    keys.add("core");
  }

  if (haystack.includes("server")) {
    keys.add("core");
  }

  if (scope.includes("convex") || variable === "CONVEX_DEPLOYMENT") {
    keys.add("backendExample");
    keys.add("convexConfig");
  }

  return keys;
}

export function expectedTargets(contract) {
  const expected = Object.fromEntries(Object.keys(TARGETS).map((key) => [key, new Set()]));
  for (const record of contract) {
    for (const targetKey of targetKeysForRecord(record)) {
      expected[targetKey].add(record.variable);
    }
  }
  return expected;
}

function setDifference(left, right) {
  return [...left].filter((value) => !right.has(value)).sort();
}

export function validateContract({ contract, actualByTarget }) {
  const documented = new Set(contract.map((record) => record.variable));
  const expectedByTarget = expectedTargets(contract);
  const results = [];

  for (const [targetKey, target] of Object.entries(TARGETS)) {
    const actual = actualByTarget[targetKey] ?? new Set();
    const expected = expectedByTarget[targetKey];
    const allowedUndocumented = target.allowedUndocumented ?? new Set();
    const allowedActual = new Set([...documented, ...allowedUndocumented]);
    const missing = setDifference(expected, actual);
    const undocumented = setDifference(actual, allowedActual);

    if (missing.length > 0 || undocumented.length > 0) {
      results.push({
        targetKey,
        label: target.label,
        missing,
        undocumented,
      });
    }
  }

  return results;
}

export function readActualTargets(rootDir) {
  return Object.fromEntries(
    Object.entries(TARGETS).map(([targetKey, target]) => {
      const content = fs.readFileSync(path.join(rootDir, target.path), "utf8");
      const variables =
        target.kind === "convexConfig" ? parseConvexConfigEnv(content) : parseEnvExample(content);
      return [targetKey, variables];
    }),
  );
}

export function formatResults(results) {
  if (results.length === 0) {
    return "Environment contract check passed.";
  }

  const lines = ["Environment contract check failed:"];
  for (const result of results) {
    lines.push(`\n${result.label}`);
    if (result.missing.length > 0) {
      lines.push(`  Missing documented variables: ${result.missing.join(", ")}`);
    }
    if (result.undocumented.length > 0) {
      lines.push(`  Undocumented variables: ${result.undocumented.join(", ")}`);
    }
  }
  return lines.join("\n");
}
