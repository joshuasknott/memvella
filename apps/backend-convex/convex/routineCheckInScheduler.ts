import { internal } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";
import type { ScheduledRoutineOccurrence } from "./routineHelpers";

export async function scheduleRoutineCheckIns(
  ctx: MutationCtx,
  occurrences: ScheduledRoutineOccurrence[],
) {
  for (const occurrence of occurrences) {
    await ctx.scheduler.runAt(
      occurrence.softCheckInAt,
      internal.routines.queueRoutineCheckIn,
      {
        routineOccurrenceId: occurrence.occurrenceId,
      },
    );
  }
}
