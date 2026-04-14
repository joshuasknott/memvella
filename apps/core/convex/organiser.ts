import { query } from "./_generated/server";
import { getOptionalCircleMembership, getSeniorProfileByMode } from "./circleAuth";
import {
  getNextRoutineEventForCircle,
  listTodayTimelineForCircle,
} from "./routineHelpers";
import { CIRCLE_LABEL } from "./terminology";
import { listPeopleForCircle } from "./people";

export const getTodayTimeline = query({
  args: {},
  handler: async (ctx) => {
    const circleContext = await getOptionalCircleMembership(
      ctx,
      "family_side",
    );
    if (!circleContext) {
      return [];
    }

    const circleId = circleContext.circleMembership?.circleId ?? circleContext.circle?._id;
    if (!circleId) {
      return [];
    }

    return await listTodayTimelineForCircle(
      ctx,
      circleId,
    );
  },
});

export const getOrganiserDashboardSummary = query({
  args: {},
  handler: async (ctx) => {
    const circleContext = await getOptionalCircleMembership(
      ctx,
      "family_side",
    );
    if (!circleContext) {
      return { totalPeople: 0, totalRoutines: 0, statusSummary: "" };
    }

    const circleId = circleContext.circleMembership?.circleId ?? circleContext.circle?._id;
    if (!circleId) {
      return { totalPeople: 0, totalRoutines: 0, statusSummary: "" };
    }

    const seniorProfile =
      (circleContext.membership.seniorProfileId
        ? await ctx.db.get(circleContext.membership.seniorProfileId)
        : null) ??
      (await getSeniorProfileByMode(ctx, circleContext.membership.circleId, "assisted")) ??
      (await getSeniorProfileByMode(ctx, circleContext.membership.circleId, "independent"));
    if (!seniorProfile) {
      return {
        totalPeople: 0,
        totalRoutines: 0,
        statusSummary: `Your ${CIRCLE_LABEL} is ready for today.`,
      };
    }

    const [members, routines, nextRoutine] = await Promise.all([
      listPeopleForCircle(ctx, circleContext.membership.circleId, 200),
      ctx.db
        .query("routineSchedules")
        .withIndex("by_seniorProfileId", (query) =>
          query.eq("seniorProfileId", seniorProfile._id),
        )
        .take(200),
      getNextRoutineEventForCircle(
        ctx,
        circleId,
      ),
    ]);

    return {
      totalPeople: members.length,
      totalRoutines: routines.length,
      statusSummary: nextRoutine
        ? `${nextRoutine.title} is next at ${nextRoutine.time}.`
        : `Your ${CIRCLE_LABEL} is ready for today.`,
    };
  },
});
