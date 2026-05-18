import { companyConfig, departmentLinks } from "@/lib/company-config";
import { getMissionControlSnapshot } from "@/lib/hq-convex";
import {
  boundedCountLabel,
  formatAge,
  formatBoundedCount,
  formatDateTime,
  mixToRows,
} from "@/lib/format";
import {
  DataTable,
  DepartmentLink,
  EmptyState,
  HealthCard,
  KeyValueList,
  MetricCard,
  SectionHeader,
  StatusPill,
} from "@/components/hq-primitives";

export default async function MissionControlPage() {
  const snapshot = await getMissionControlSnapshot();

  return (
    <div className="space-y-8">
      <section className="hq-panel rounded-lg p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-text-tertiary">
              Founder mission control
            </p>
            <h1 className="mt-2 text-4xl font-bold text-text-primary">
              Memvella HQ
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-text-secondary">
              {companyConfig.mission}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="good">HQ enabled</StatusPill>
            <StatusPill tone="good">read-only</StatusPill>
            <StatusPill tone="info">founder v1</StatusPill>
          </div>
        </div>
      </section>

      {!snapshot.ok ? (
        <EmptyState title="Live HQ data is unavailable">
          {snapshot.message} Static company foundations and runbooks remain available.
        </EmptyState>
      ) : (
        <>
          <section>
            <SectionHeader title="Company Snapshot" eyebrow="Now">
              Data freshness: {formatDateTime(snapshot.data.generatedAt)}
            </SectionHeader>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                detail={boundedCountLabel(snapshot.data.product.circleCount)}
                label="Circles"
                tone="info"
                value={formatBoundedCount(snapshot.data.product.circleCount)}
              />
              <MetricCard
                detail={boundedCountLabel(snapshot.data.product.seniorProfileCount)}
                label="Senior profiles"
                tone="info"
                value={formatBoundedCount(snapshot.data.product.seniorProfileCount)}
              />
              <MetricCard
                detail={boundedCountLabel(snapshot.data.growth.waitlistTotal)}
                label="Waitlist"
                tone="good"
                value={formatBoundedCount(snapshot.data.growth.waitlistTotal)}
              />
              <MetricCard
                detail={`Oldest queued item: ${formatAge(snapshot.data.trustSafety.oldestQueuedAt)}`}
                label="Trust & Safety queue"
                tone={
                  snapshot.data.trustSafety.oldestQueuedAt ? "warn" : "good"
                }
                value={
                  snapshot.data.trustSafety.insightStatusMix.queued.value +
                  snapshot.data.trustSafety.alertStatusMix.queued.value
                }
              />
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <HealthCard title="Product Health" status="metadata" tone="info">
              <KeyValueList
                items={[
                  {
                    label: "Assisted / independent mix",
                    value: JSON.stringify(snapshot.data.product.seniorModeMix),
                  },
                  {
                    label: "Active sessions",
                    value: formatBoundedCount(snapshot.data.product.activeSessionCount),
                  },
                  {
                    label: "Routines",
                    value: formatBoundedCount(snapshot.data.product.routineCount),
                  },
                  {
                    label: "Memories",
                    value: formatBoundedCount(snapshot.data.product.memoryCount),
                  },
                ]}
              />
            </HealthCard>
            <HealthCard title="Operations" status="read-only" tone="warn">
              <KeyValueList
                items={[
                  {
                    label: "Failed deliveries",
                    value: formatBoundedCount(
                      snapshot.data.operations.notificationDeliveryStatusMix.failed,
                    ),
                  },
                  {
                    label: "Active push subscriptions",
                    value: formatBoundedCount(
                      snapshot.data.operations.activePushSubscriptionCount,
                    ),
                  },
                  {
                    label: "Senior sessions",
                    value: formatBoundedCount(
                      snapshot.data.operations.seniorSessionCount,
                    ),
                  },
                ]}
              />
            </HealthCard>
            <HealthCard title="Voice & AI" status="redacted" tone="info">
              <KeyValueList
                items={[
                  {
                    label: "Recent interactions",
                    value: formatBoundedCount(snapshot.data.voiceAi.interactionCount),
                  },
                  {
                    label: "Unknown intents",
                    value: snapshot.data.voiceAi.unknownIntentCount,
                  },
                  {
                    label: "AI pending",
                    value: formatBoundedCount(
                      snapshot.data.voiceAi.aiInsightStatusMix.pending,
                    ),
                  },
                  {
                    label: "Transcript policy",
                    value: snapshot.data.voiceAi.transcriptPolicy,
                  },
                ]}
              />
            </HealthCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div>
              <SectionHeader title="Growth Signals" />
              <DataTable
                columns={["Source", "Count"]}
                rows={mixToRows(snapshot.data.growth.sourcePathMix)}
              />
            </div>
            <div>
              <SectionHeader title="Observability Signals" />
              <DataTable
                columns={["Severity", "Count"]}
                rows={mixToRows(snapshot.data.observability.severityMix)}
              />
            </div>
          </section>
        </>
      )}

      <section>
        <SectionHeader title="Founder Priorities" eyebrow="Static company foundation" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {companyConfig.priorities.map((priority) => (
            <HealthCard
              key={priority.title}
              title={priority.title}
              status="priority"
              tone="neutral"
            >
              {priority.detail}
            </HealthCard>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Next Actions" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {departmentLinks.map((link) => (
            <DepartmentLink href={link.href} key={link.href} title={link.title}>
              {link.detail}
            </DepartmentLink>
          ))}
        </div>
      </section>
    </div>
  );
}
