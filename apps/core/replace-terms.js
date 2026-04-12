console.error(
  [
    "replace-terms.js has been quarantined.",
    "",
    "This script previously performed unsafe global terminology rewrites, including",
    "rewriting canonical Circle names back to legacy FamilySpace names.",
    "",
    "Use scoped manual edits tied to docs/legacy-removal.md and docs/terminology.md instead.",
  ].join("\n"),
);

process.exit(1);
