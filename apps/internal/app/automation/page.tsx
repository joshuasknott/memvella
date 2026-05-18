import { companyConfig } from "@/lib/company-config";
import { getAutomationOverview } from "@/lib/hq-convex";
import { formatBoundedCount } from "@/lib/format";
import {
  DataTable,
  EmptyState,
  HealthCard,
  MetricCard,
  SectionHeader,
  StatusPill,
} from "@/components/hq-primitives";

export default async function AutomationPage() {
  const automation = await getAutomationOverview();

  return (
    <div className="space-y-8">
      <section className="hq-panel rounded-lg p-6">
        <StatusPill tone="warn">no autonomous production actions</StatusPill>
        <h1 className="mt-4 text-3xl font-bold text-text-primary">Automation</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-text-secondary">
          Scheduled work visibility, queue signals, and a roadmap for future job,
          agent-run, and provider-cost monitoring foundations.
        </p>
      </section>

      {!automation.ok ? (
        <EmptyState title="Automation read model unavailable">{automation.message}</EmptyState>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Queued notifications"
              tone="warn"
              value={formatBoundedCount(automation.data.queueSignals.queuedNotificationDeliveries)}
            />
            <MetricCard
              label="Failed notifications"
              tone={automation.data.queueSignals.failedNotificationDeliveries.value > 0 ? "bad" : "good"}
              value={formatBoundedCount(automation.data.queueSignals.failedNotificationDeliveries)}
            />
            <MetricCard
              label="Pending AI insight processing"
              tone="warn"
              value={formatBoundedCount(automation.data.queueSignals.pendingAiInsightProcessing)}
            />
          </section>

          <section>
            <SectionHeader title="Scheduled Work" />
            <DataTable
              columns={["Name", "Source", "State"]}
              rows={automation.data.scheduledWork.map((job) => [
                job.name,
                job.source,
                job.state,
              ])}
            />
          </section>
        </>
      )}

      <section>
        <SectionHeader title="Automation Roadmap" />
        <div className="grid gap-4 md:grid-cols-2">
          {companyConfig.automationRoadmap.map((item) => (
            <HealthCard key={item} title={item} status="roadmap" tone="neutral">
              Foundation only. Add live job state when a real run log or integration exists.
            </HealthCard>
          ))}
        </div>
      </section>
    </div>
  );
}
