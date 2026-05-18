import { getObservabilityOverview } from "@/lib/hq-convex";
import {
  formatBoundedCount,
  formatDateTime,
  mixToRows,
  titleCase,
} from "@/lib/format";
import {
  DataTable,
  EmptyState,
  HealthCard,
  MetricCard,
  SectionHeader,
  StatusPill,
} from "@/components/hq-primitives";

export default async function ObservabilityPage() {
  const observability = await getObservabilityOverview();

  return (
    <div className="space-y-8">
      <section className="hq-panel rounded-lg p-6">
        <StatusPill tone="info">sanitized appEvents</StatusPill>
        <h1 className="mt-4 text-3xl font-bold text-text-primary">Observability</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-text-secondary">
          First-party sanitized app event signals and future extension points. No
          request bodies, IP addresses, names, emails, transcripts, evidence, tokens,
          hashes, or secrets are stored.
        </p>
      </section>

      {!observability.ok ? (
        <EmptyState title="Observability read model unavailable">{observability.message}</EmptyState>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Recent events"
              tone="info"
              value={formatBoundedCount(observability.data.eventCount)}
            />
            <MetricCard
              label="External providers"
              tone="neutral"
              value={observability.data.externalProviders.length}
              detail="Sentry/PostHog/Vercel-style integrations are placeholders only."
            />
            <MetricCard label="PII policy" tone="good" value="Blocked" />
            <MetricCard label="Raw body policy" tone="good" value="Not stored" />
          </section>

          <section className="grid gap-6 xl:grid-cols-3">
            <div>
              <SectionHeader title="Severity Mix" />
              <DataTable columns={["Severity", "Count"]} rows={mixToRows(observability.data.severityMix)} />
            </div>
            <div>
              <SectionHeader title="Status Mix" />
              <DataTable columns={["Status", "Count"]} rows={mixToRows(observability.data.statusMix)} />
            </div>
            <div>
              <SectionHeader title="Source App Mix" />
              <DataTable columns={["Source", "Count"]} rows={mixToRows(observability.data.sourceAppMix)} />
            </div>
          </section>

          <section>
            <SectionHeader title="Recent Sanitized Events" />
            <DataTable
              columns={["Type", "Source", "Route", "Severity", "Status", "Code", "Created"]}
              rows={observability.data.recentEvents.map((event) => [
                titleCase(event.eventType),
                event.sourceApp,
                event.sourceRoute ?? "none",
                event.severity,
                event.status,
                event.messageCode,
                formatDateTime(event.createdAt),
              ])}
            />
          </section>
        </>
      )}

      <HealthCard title="Future Integrations" status="not installed" tone="neutral">
        External observability providers can be added later, but HQ does not pretend
        Sentry, PostHog, Vercel analytics, or cost dashboards exist today.
      </HealthCard>
    </div>
  );
}
