import Link from "next/link";
import { notFound } from "next/navigation";
import { getRunbook, runbooks } from "@/lib/runbooks";
import { HealthCard, StatusPill } from "@/components/hq-primitives";

export function generateStaticParams() {
  return runbooks.map((runbook) => ({ slug: runbook.slug }));
}

export default async function RunbookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const runbook = getRunbook(slug);

  if (!runbook) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section className="hq-panel rounded-lg p-6">
        <Link className="text-sm font-bold text-family-primary" href="/runbooks">
          Back to runbooks
        </Link>
        <div className="mt-4">
          <StatusPill tone="info">{runbook.owner}</StatusPill>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-text-primary">{runbook.title}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-text-secondary">
          {runbook.summary}
        </p>
      </section>

      {runbook.sections.map((section) => (
        <HealthCard
          key={section.title}
          title={section.title}
          status="runbook"
          tone="neutral"
        >
          <ul className="list-disc space-y-2 pl-5">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </HealthCard>
      ))}
    </div>
  );
}
