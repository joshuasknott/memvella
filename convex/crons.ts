import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "process supporter insights",
  { hours: 1 },
  internal.insightsEngine.processPendingInsights,
  {},
);

export default crons;
