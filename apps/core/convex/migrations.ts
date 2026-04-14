import { internalQuery } from "./_generated/server";
import { Migrations } from "@convex-dev/migrations";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

export const migrations = new Migrations<DataModel>(components.migrations);

// TEMP: Pre-deletion verification query.
// Run via `npx convex run migrations:verifyLegacyTablesEmpty` and confirm
// both counts are 0 before deploying the schema change that removes these tables.
// Delete this function once the routines and memories tables are gone from schema.ts.
export const verifyLegacyTablesEmpty = internalQuery({
  args: {},
  handler: async (ctx) => {
    const routinesPage = await ctx.db.query("routines").take(1);
    const memoriesPage = await ctx.db.query("memories").take(1);

    // Collect full counts only if the fast-path found something,
    // so we don't scan large tables unnecessarily.
    const routinesCount =
      routinesPage.length === 0
        ? 0
        : (await ctx.db.query("routines").collect()).length;

    const memoriesCount =
      memoriesPage.length === 0
        ? 0
        : (await ctx.db.query("memories").collect()).length;

    return {
      routines: routinesCount,
      memories: memoriesCount,
      safeToDelete: routinesCount === 0 && memoriesCount === 0,
    };
  },
});
