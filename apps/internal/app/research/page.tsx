import Link from "next/link";
import { companyConfig } from "@/lib/company-config";
import {
  DataTable,
  EmptyState,
  HealthCard,
  SectionHeader,
  StatusPill,
} from "@/components/hq-primitives";

export default function ResearchPage() {
  return (
    <div className="space-y-8">
      <section className="hq-panel rounded-lg p-6">
        <StatusPill tone="info">static learning foundation</StatusPill>
        <h1 className="mt-4 text-3xl font-bold text-text-primary">Research</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-text-secondary">
          Lightweight elder-tech learning and discovery area. This is not a medical
          research system and does not contain clinical claims or fake studies.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <HealthCard title="Elder-Tech Learning Foundations" status="active" tone="info">
          <ul className="list-disc space-y-2 pl-5">
            {companyConfig.researchFoundations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </HealthCard>
        <HealthCard title="Accessibility Principles" status="active" tone="good">
          <ul className="list-disc space-y-2 pl-5">
            {companyConfig.accessibilityPrinciples.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </HealthCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div>
          <SectionHeader title="Discovery Areas" />
          <DataTable
            columns={["Area", "Current state"]}
            rows={[
              ["Voice-first creation", "Observe confirmation and rejection friction"],
              ["Routine support", "Learn where reminders help without adding complexity"],
              ["Memory recall", "Evaluate whether resurfacing is useful and dignified"],
              ["Circle coordination", "Keep family-side workflows efficient and role-clear"],
            ]}
          />
        </div>
        <div>
          <SectionHeader title="Backlog Placeholders" />
          <DataTable
            columns={["Placeholder", "Policy"]}
            rows={[
              ["Feedback library", "Future repo-backed or database-backed notes after privacy review"],
              ["Learning evidence index", "Future internal library; no fake studies"],
              ["Accessibility review log", "Future structured checklist per release"],
            ]}
          />
        </div>
      </section>

      <EmptyState title="Relevant runbook">
        Start with{" "}
        <Link className="font-bold text-family-primary" href="/runbooks/research-accessibility-principles">
          Research And Accessibility Principles
        </Link>
        .
      </EmptyState>
    </div>
  );
}
