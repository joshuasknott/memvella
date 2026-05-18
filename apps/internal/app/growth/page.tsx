import { companyConfig } from "@/lib/company-config";
import { getGrowthOverview } from "@/lib/hq-convex";
import {
  boundedCountLabel,
  formatBoundedCount,
  formatDateTime,
  mixToRows,
} from "@/lib/format";
import {
  DataTable,
  EmptyState,
  HealthCard,
  MetricCard,
  SectionHeader,
  StatusPill,
} from "@/components/hq-primitives";

export default async function GrowthPage() {
  const growth = await getGrowthOverview();

  return (
    <div className="space-y-8">
      <section className="hq-panel rounded-lg p-6">
        <StatusPill tone="info">first-party demand signals</StatusPill>
        <h1 className="mt-4 text-3xl font-bold text-text-primary">Growth</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-text-secondary">
          Waitlist, source-path, referrer-domain, channel, and partnership foundations.
          No external analytics provider is represented as installed.
        </p>
      </section>

      {!growth.ok ? (
        <EmptyState title="Growth read model unavailable">{growth.message}</EmptyState>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              detail={boundedCountLabel(growth.data.waitlistTotal)}
              label="Waitlist total"
              tone="good"
              value={formatBoundedCount(growth.data.waitlistTotal)}
            />
            <MetricCard
              detail={boundedCountLabel(growth.data.recent7DayTotal)}
              label="Recent 7-day growth"
              tone="info"
              value={formatBoundedCount(growth.data.recent7DayTotal)}
            />
            <MetricCard label="Analytics provider" tone="neutral" value="None" />
            <MetricCard label="Email visibility" tone="warn" value="Redacted" />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div>
              <SectionHeader title="Source Paths" />
              <DataTable columns={["Source", "Count"]} rows={mixToRows(growth.data.sourcePathMix)} />
            </div>
            <div>
              <SectionHeader title="Referrer Domains" />
              <DataTable columns={["Domain", "Count"]} rows={mixToRows(growth.data.referrerDomainMix)} />
            </div>
          </section>

          <section>
            <SectionHeader title="Recent Waitlist Entries" />
            <DataTable
              columns={["Email", "Source", "Referrer", "Created", "Status"]}
              rows={growth.data.recentEntries.map((entry) => [
                entry.email,
                entry.sourcePath,
                entry.referrerDomain,
                formatDateTime(entry.createdAt),
                entry.status,
              ])}
            />
          </section>
        </>
      )}

      <section>
        <SectionHeader title="Channel Foundations" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {companyConfig.growthChannels.map((channel) => (
            <HealthCard
              key={channel.name}
              title={channel.name}
              status={channel.status}
              tone={channel.status.includes("live") ? "good" : "neutral"}
            >
              Static channel foundation. Add live metrics only when a real system exists.
            </HealthCard>
          ))}
        </div>
      </section>
    </div>
  );
}
