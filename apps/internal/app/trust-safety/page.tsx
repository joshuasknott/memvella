import Link from "next/link";
import { getTrustSafetyOverview } from "@/lib/hq-convex";
import {
  formatAge,
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

export default async function TrustSafetyPage() {
  const trustSafety = await getTrustSafetyOverview();

  return (
    <div className="space-y-8">
      <section className="hq-panel rounded-lg p-6">
        <StatusPill tone="good">evidence hidden</StatusPill>
        <h1 className="mt-4 text-3xl font-bold text-text-primary">Trust & Safety</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-text-secondary">
          Privacy, safety-boundary metadata, redaction posture, Alert and Insight
          queue health, and review boundaries for an elder-tech company.
        </p>
      </section>

      {!trustSafety.ok ? (
        <EmptyState title="Trust & Safety read model unavailable">{trustSafety.message}</EmptyState>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Queued Insights"
              tone={trustSafety.data.insightStatusMix.queued.value > 0 ? "warn" : "good"}
              value={formatBoundedCount(trustSafety.data.insightStatusMix.queued)}
            />
            <MetricCard
              label="Queued Alerts"
              tone={trustSafety.data.alertStatusMix.queued.value > 0 ? "warn" : "good"}
              value={formatBoundedCount(trustSafety.data.alertStatusMix.queued)}
            />
            <MetricCard
              label="Oldest queued"
              tone={trustSafety.data.oldestQueuedAt ? "warn" : "good"}
              value={formatAge(trustSafety.data.oldestQueuedAt)}
            />
            <MetricCard label="Evidence policy" tone="good" value="Hidden" />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div>
              <SectionHeader title="Queued Priority Mix" />
              <DataTable columns={["Priority", "Count"]} rows={mixToRows(trustSafety.data.priorityMix)} />
            </div>
            <HealthCard title="Review Boundary Principles" status="policy" tone="good">
              <ul className="list-disc space-y-2 pl-5">
                <li>Use metadata first: status, type, priority, age, and timing.</li>
                <li>Do not show evidence transcripts in HQ v1.</li>
                <li>Treat distress and medical-boundary flags as product safety metadata only.</li>
                <li>Keep review language non-clinical.</li>
              </ul>
            </HealthCard>
          </section>

          <section>
            <SectionHeader title="Oldest Queue Items">
              <Link className="font-bold text-family-primary" href="/runbooks/trust-safety-review-boundaries">
                Runbook
              </Link>
            </SectionHeader>
            <DataTable
              columns={["Item", "Kind", "Type", "Priority", "Age", "Created"]}
              rows={trustSafety.data.recentQueue.map((item) => [
                item.itemLabel,
                item.kind,
                titleCase(item.type),
                item.priority,
                formatAge(item.createdAt),
                formatDateTime(item.createdAt),
              ])}
            />
          </section>
        </>
      )}
    </div>
  );
}
