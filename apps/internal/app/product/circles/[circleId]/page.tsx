import { notFound } from "next/navigation";
import { getProductCircleDetail } from "@/lib/hq-convex";
import {
  boundedCountLabel,
  formatAge,
  formatBoundedCount,
  formatDateTime,
  titleCase,
} from "@/lib/format";
import {
  DataTable,
  EmptyState,
  KeyValueList,
  MetricCard,
  SectionHeader,
  StatusPill,
} from "@/components/hq-primitives";

export default async function ProductCircleDetailPage({
  params,
}: {
  params: Promise<{ circleId: string }>;
}) {
  const { circleId } = await params;
  const detail = await getProductCircleDetail(circleId);

  if (!detail.ok) {
    return <EmptyState title="Circle detail unavailable">{detail.message}</EmptyState>;
  }

  if (!detail.data) {
    notFound();
  }

  const circle = detail.data;

  return (
    <div className="space-y-8">
      <section className="hq-panel rounded-lg p-6">
        <StatusPill tone="info">{circle.privacyMode}</StatusPill>
        <h1 className="mt-4 text-3xl font-bold text-text-primary">{circle.label}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-text-secondary">
          Redacted operational summary. Names, stories, People context, transcripts,
          evidence, tokens, hashes, and push auth values are not returned.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Senior profiles" tone="info" value={circle.seniorProfiles.length} />
        <MetricCard
          detail={boundedCountLabel(circle.pushSubscriptionCount)}
          label="Push subscriptions"
          tone="neutral"
          value={formatBoundedCount(circle.pushSubscriptionCount)}
        />
        <MetricCard
          detail={boundedCountLabel(circle.queuedInsightCount)}
          label="Queued Insights"
          tone={circle.queuedInsightCount.value > 0 ? "warn" : "good"}
          value={formatBoundedCount(circle.queuedInsightCount)}
        />
        <MetricCard
          detail={boundedCountLabel(circle.queuedAlertCount)}
          label="Queued Alerts"
          tone={circle.queuedAlertCount.value > 0 ? "warn" : "good"}
          value={formatBoundedCount(circle.queuedAlertCount)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div>
          <SectionHeader title="Circle Metadata" />
          <KeyValueList
            items={[
              { label: "Created", value: formatDateTime(circle.createdAt) },
              {
                label: "Participant roles",
                value:
                  Object.entries(circle.participantRoleMix)
                    .map(([key, value]) => `${titleCase(key)}: ${value}`)
                    .join(", ") || "None",
              },
              {
                label: "Timezone configured",
                value: circle.timezoneConfigured ? "Yes" : "No",
              },
              {
                label: "Locale configured",
                value: circle.localeConfigured ? "Yes" : "No",
              },
            ]}
          />
        </div>
        <div>
          <SectionHeader title="Notification Settings" />
          <KeyValueList
            items={
              circle.notificationSettings
                ? [
                    {
                      label: "Daily summary",
                      value: circle.notificationSettings.dailySummary ? "On" : "Off",
                    },
                    {
                      label: "Urgent Alerts",
                      value: circle.notificationSettings.urgentAlerts ? "On" : "Off",
                    },
                    {
                      label: "Routine reminders",
                      value: circle.notificationSettings.routineReminders ? "On" : "Off",
                    },
                    {
                      label: "Updated",
                      value: formatDateTime(circle.notificationSettings.updatedAt),
                    },
                  ]
                : [{ label: "Settings", value: "No settings record yet" }]
            }
          />
        </div>
      </section>

      <section>
        <SectionHeader title="Senior Profile Summaries" />
        <DataTable
          columns={[
            "Profile",
            "Mode",
            "Access",
            "Routines",
            "Memories",
            "People",
            "Sessions",
            "Voice",
            "Last voice",
          ]}
          rows={circle.seniorProfiles.map((senior) => [
            senior.label,
            titleCase(senior.seniorMode),
            titleCase(senior.accessStatus),
            formatBoundedCount(senior.routineCount),
            formatBoundedCount(senior.memoryCount),
            formatBoundedCount(senior.peopleCount),
            `${senior.activeSessionCount} active / ${formatBoundedCount(senior.sessionCount)} total`,
            formatBoundedCount(senior.voiceInteractionCount),
            senior.lastVoiceInteractionAt ? formatAge(senior.lastVoiceInteractionAt) : "None",
          ])}
        />
      </section>
    </div>
  );
}
