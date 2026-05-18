import Link from "next/link";
import { runbooks } from "@/lib/runbooks";
import { DataTable, SectionHeader, StatusPill } from "@/components/hq-primitives";

export default function RunbooksPage() {
  return (
    <div className="space-y-8">
      <section className="hq-panel rounded-lg p-6">
        <StatusPill tone="info">repo-backed content</StatusPill>
        <h1 className="mt-4 text-3xl font-bold text-text-primary">Runbooks</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-text-secondary">
          Editable internal procedures for operating Memvella HQ and the companion
          product safely.
        </p>
      </section>

      <section>
        <SectionHeader title="Runbook Library" />
        <DataTable
          columns={["Runbook", "Owner", "Summary"]}
          rows={runbooks.map((runbook) => [
            <Link
              className="font-bold text-family-primary"
              href={`/runbooks/${runbook.slug}`}
              key={runbook.slug}
            >
              {runbook.title}
            </Link>,
            runbook.owner,
            runbook.summary,
          ])}
        />
      </section>
    </div>
  );
}
