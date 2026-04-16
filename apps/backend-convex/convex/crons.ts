import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "process circle insights",
  { hours: 1 },
  internal.insightsEngine.processPendingInsights,
  {},
);

crons.interval(
  "sweep routine reminder notifications",
  { minutes: 5 },
  internal.notificationsWorker.sweepRoutineReminderNotifications,
  {},
);

crons.interval(
  "sweep daily summary notifications",
  { minutes: 15 },
  internal.notificationsWorker.sweepDailySummaryNotifications,
  {},
);

crons.interval(
  "dispatch queued notifications",
  { minutes: 5 },
  internal.notificationsWorker.processNotificationQueue,
  {},
);

export default crons;
