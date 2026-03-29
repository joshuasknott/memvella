import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// MIGRATION — migrateSeniorRoles
// =============================================================================
// Run once to fix caregiverProfiles documents written under the old schema:
//   1. role === "senior"  →  role: "independent_senior"
//   2. caregiverName === ""  →  remove the field (treat as undefined/optional)
//
// Usage:
//   npx convex run migrations:migrateSeniorRoles
// =============================================================================
export const migrateSeniorRoles = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Process in bounded batches to stay within Convex transaction limits.
    const BATCH = 100;
    let patchedRole = 0;
    let patchedName = 0;

    const allProfiles = await ctx.db.query("caregiverProfiles").take(BATCH);

    for (const profile of allProfiles) {
      const updates: Record<string, unknown> = {};

      // Fix stale "senior" literal → "independent_senior"
      if ((profile.role as string) === "senior") {
        updates.role = "independent_senior";
        patchedRole++;
      }

      // Remove empty-string caregiverName so it becomes truly undefined
      if (profile.caregiverName === "") {
        updates.caregiverName = undefined;
        patchedName++;
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(profile._id, updates);
      }
    }

    console.log(
      `[migrateSeniorRoles] done. ` +
        `role patched: ${patchedRole}, caregiverName cleared: ${patchedName}`
    );

    return { patchedRole, patchedName };
  },
});
