import Link from "next/link";
import { HealthCard, SectionHeader, StatusPill } from "@/components/hq-primitives";

export default async function MissionControlPage() {
  return (
    <div className="space-y-6">
      <section className="hq-panel rounded-lg p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-text-tertiary">Internal</p>
            <h1 className="mt-2 text-3xl font-bold text-text-primary">Memvella HQ</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary">
              HQ is intentionally small for now. The real product, marketing site,
              and backend remain the places to test and build Memvella.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="good">HQ enabled</StatusPill>
            <StatusPill tone="info">founder-only</StatusPill>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="What remains here" />
        <div className="grid gap-4 md:grid-cols-3">
          <HealthCard title="Access gate" status="kept" tone="good">
            Founder-only login stays here so the internal app has a protected
            starting point when it becomes useful.
          </HealthCard>
          <HealthCard title="No dashboards" status="removed" tone="neutral">
            Product metrics, runbooks, department pages, and placeholder
            read-model views have been removed from the active route tree.
          </HealthCard>
          <HealthCard title="Build later" status="deliberate" tone="info">
            Add one internal workflow at a time only when it has a real owner and
            a clear operating need.
          </HealthCard>
        </div>
      </section>

      <section>
        <SectionHeader title="Useful links" />
        <div className="grid gap-3 md:grid-cols-2">
          <Link
            className="hq-panel rounded-lg p-4 text-sm font-semibold text-text-primary transition hover:border-family-primary/30"
            href="http://localhost:3000"
          >
            Open product app
          </Link>
          <Link
            className="hq-panel rounded-lg p-4 text-sm font-semibold text-text-primary transition hover:border-family-primary/30"
            href="http://localhost:3001"
          >
            Open marketing app
          </Link>
        </div>
      </section>
    </div>
  );
}
