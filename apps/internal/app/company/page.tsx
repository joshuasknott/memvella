import { companyConfig } from "@/lib/company-config";
import { getCompanyOverview } from "@/lib/hq-convex";
import {
  DataTable,
  HealthCard,
  KeyValueList,
  SectionHeader,
  StatusPill,
} from "@/components/hq-primitives";

export default async function CompanyPage() {
  const overview = await getCompanyOverview();

  return (
    <div className="space-y-8">
      <section className="hq-panel rounded-lg p-6">
        <StatusPill tone="info">Company operating system</StatusPill>
        <h1 className="mt-4 text-3xl font-bold text-text-primary">Company</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-text-secondary">
          {companyConfig.mission}
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <HealthCard title="Stage" status="static foundation" tone="info">
          <KeyValueList
            items={[
              { label: "Current stage", value: companyConfig.stage },
              {
                label: "Live source",
                value: overview.ok ? overview.data.source : overview.message,
              },
            ]}
          />
        </HealthCard>
        <HealthCard title="Privacy And Trust Posture" status="policy" tone="good">
          <ul className="list-disc space-y-2 pl-5">
            {companyConfig.privacyPosture.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </HealthCard>
      </section>

      <section>
        <SectionHeader title="Priorities" />
        <div className="grid gap-4 md:grid-cols-2">
          {companyConfig.priorities.map((priority) => (
            <HealthCard
              key={priority.title}
              title={priority.title}
              status="active"
              tone="neutral"
            >
              {priority.detail}
            </HealthCard>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div>
          <SectionHeader title="Milestones" />
          <DataTable
            columns={["Checkpoint"]}
            rows={companyConfig.milestones.map((milestone) => [milestone])}
          />
        </div>
        <div>
          <SectionHeader title="Readiness Checklist" />
          <DataTable
            columns={["Item", "Status"]}
            rows={companyConfig.readinessChecklist.map((item) => [
              item.label,
              <StatusPill key={item.label} tone={item.status === "done" ? "good" : "warn"}>
                {item.status}
              </StatusPill>,
            ])}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div>
          <SectionHeader title="Open Risks" />
          <div className="space-y-4">
            {companyConfig.risks.map((risk) => (
              <HealthCard key={risk.title} title={risk.title} status="open" tone="warn">
                {risk.posture}
              </HealthCard>
            ))}
          </div>
        </div>
        <div>
          <SectionHeader title="Product Portfolio" />
          <DataTable
            columns={["Product", "Status", "Scope"]}
            rows={companyConfig.productPortfolio.map((product) => [
              product.name,
              product.status,
              product.scope,
            ])}
          />
        </div>
      </section>

      <section>
        <SectionHeader title="Internal Operating Principles" />
        <DataTable
          columns={["Principle"]}
          rows={companyConfig.operatingPrinciples.map((principle) => [principle])}
        />
      </section>
    </div>
  );
}
