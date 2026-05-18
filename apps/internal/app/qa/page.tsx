import Link from "next/link";
import { getQaDevOverview } from "@/lib/hq-convex";
import { getHqAccessState } from "@/lib/hq-auth";
import {
  DataTable,
  EmptyState,
  HealthCard,
  SectionHeader,
  StatusPill,
} from "@/components/hq-primitives";

function envStatus(name: string, present: boolean, sensitive = false) {
  return [
    name,
    <StatusPill key={name} tone={present ? "good" : "bad"}>
      {present ? "set" : "missing"}
    </StatusPill>,
    sensitive ? "value hidden" : "non-secret indicator",
  ];
}

export default async function QaPage() {
  const qa = await getQaDevOverview();
  const accessState = getHqAccessState();
  const envRows = [
    envStatus("MEMVELLA_HQ_ENABLED", process.env.MEMVELLA_HQ_ENABLED === "1"),
    envStatus("MEMVELLA_HQ_ACCESS_KEY", Boolean(process.env.MEMVELLA_HQ_ACCESS_KEY), true),
    envStatus("MEMVELLA_HQ_COOKIE_SECRET", Boolean(process.env.MEMVELLA_HQ_COOKIE_SECRET), true),
    envStatus("MEMVELLA_HQ_READ_TOKEN", Boolean(process.env.MEMVELLA_HQ_READ_TOKEN), true),
    envStatus("NEXT_PUBLIC_CONVEX_URL", Boolean(process.env.NEXT_PUBLIC_CONVEX_URL)),
    envStatus("MEMVELLA_TEST_MODE", process.env.MEMVELLA_TEST_MODE === "1"),
  ];

  return (
    <div className="space-y-8">
      <section className="hq-panel rounded-lg p-6">
        <StatusPill tone={accessState.testMode ? "warn" : "good"}>
          test mode {accessState.testMode ? "on" : "off"}
        </StatusPill>
        <h1 className="mt-4 text-3xl font-bold text-text-primary">QA / Dev</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-text-secondary">
          Environment readiness, guarded test support, and disabled production-safe
          states. Test and fixture utilities are visible only as readiness metadata.
        </p>
      </section>

      {!qa.ok ? (
        <EmptyState title="QA read model unavailable">{qa.message}</EmptyState>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          <HealthCard
            title="Test Support"
            status={qa.data.testSupport}
            tone={qa.data.testMode ? "warn" : "good"}
          >
            {qa.data.testMode
              ? "MEMVELLA_TEST_MODE=1 is active. Existing test support remains guarded by its own token and route checks."
              : "Test support is disabled outside test/dev mode."}
          </HealthCard>
          <HealthCard title="Guarded Actions" status="policy" tone="good">
            <ul className="list-disc space-y-2 pl-5">
              {qa.data.guardedActions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </HealthCard>
        </section>
      )}

      <section>
        <SectionHeader title="Environment Readiness" />
        <DataTable columns={["Variable", "State", "Visibility"]} rows={envRows} />
      </section>

      <EmptyState title="Testing docs">
        Use{" "}
        <Link className="font-bold text-family-primary" href="/runbooks/deployment-release-checklist">
          Deployment And Release Checklist
        </Link>{" "}
        and the canonical repo testing docs for the full verification loop.
      </EmptyState>
    </div>
  );
}
