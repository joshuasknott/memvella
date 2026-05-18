import Link from "next/link";
import { getProductOverview } from "@/lib/hq-convex";
import {
  boundedCountLabel,
  formatBoundedCount,
  mixToRows,
} from "@/lib/format";
import {
  DataTable,
  DepartmentLink,
  EmptyState,
  MetricCard,
  SectionHeader,
  StatusPill,
} from "@/components/hq-primitives";

export default async function ProductPage() {
  const overview = await getProductOverview();

  return (
    <div className="space-y-8">
      <section className="hq-panel rounded-lg p-6">
        <StatusPill tone="info">Companion product</StatusPill>
        <h1 className="mt-4 text-3xl font-bold text-text-primary">Product</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-text-secondary">
          Privacy-safe operating view for the current Memvella companion product:
          Circle, Organiser, Member, Tablet User, Independent User, routines,
          memories, People, voice, Alerts, and Insights.
        </p>
        <Link className="mt-4 inline-flex text-sm font-bold text-family-primary" href="/product/circles">
          Open Circle directory
        </Link>
      </section>

      {!overview.ok ? (
        <EmptyState title="Product read model unavailable">{overview.message}</EmptyState>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              detail={boundedCountLabel(overview.data.circleCount)}
              label="Circles"
              tone="info"
              value={formatBoundedCount(overview.data.circleCount)}
            />
            <MetricCard
              detail={boundedCountLabel(overview.data.seniorProfileCount)}
              label="Senior profiles"
              tone="info"
              value={formatBoundedCount(overview.data.seniorProfileCount)}
            />
            <MetricCard
              detail={boundedCountLabel(overview.data.routineCount)}
              label="Routine schedules"
              tone="neutral"
              value={formatBoundedCount(overview.data.routineCount)}
            />
            <MetricCard
              detail={boundedCountLabel(overview.data.memoryCount)}
              label="Memory records"
              tone="neutral"
              value={formatBoundedCount(overview.data.memoryCount)}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div>
              <SectionHeader title="Assisted And Independent Mix" />
              <DataTable columns={["Mode", "Count"]} rows={mixToRows(overview.data.seniorModeMix)} />
            </div>
            <div>
              <SectionHeader title="Memory Type Mix" />
              <DataTable columns={["Type", "Count"]} rows={mixToRows(overview.data.memoryTypeMix)} />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <DepartmentLink href="/operations" title="Operations">
              Notification, push, pairing, and session diagnostics.
            </DepartmentLink>
            <DepartmentLink href="/trust-safety" title="Trust & Safety">
              Alert and Insight queue metadata with evidence hidden.
            </DepartmentLink>
            <DepartmentLink href="/voice-ai" title="Voice & AI">
              Voice interaction and AI processing metadata without transcripts.
            </DepartmentLink>
          </section>
        </>
      )}
    </div>
  );
}
