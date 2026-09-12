import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { buildMemorySearchText } from "./memoryHelpers";

export const migrations = new Migrations<DataModel>(components.migrations);

export const backfillMemorySearch = migrations.define({
  table: "memoryRecords",
  batchSize: 50,
  migrateOne: (_ctx, record) => ({ searchText: buildMemorySearchText(record) }),
});

export const runMemorySearchBackfill = migrations.runner(internal.migrations.backfillMemorySearch);
