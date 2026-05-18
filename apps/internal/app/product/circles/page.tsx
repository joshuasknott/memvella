import Link from "next/link";
import { listProductCircles } from "@/lib/hq-convex";
import { formatAge, formatDateTime, titleCase } from "@/lib/format";
import {
  DataTable,
  EmptyState,
  SectionHeader,
  StatusPill,
} from "@/components/hq-primitives";

export default async function ProductCirclesPage() {
  const circles = await listProductCircles();

  return (
    <div className="space-y-8">
      <section className="hq-panel rounded-lg p-6">
        <StatusPill tone="info">names hidden by default</StatusPill>
        <h1 className="mt-4 text-3xl font-bold text-text-primary">Circle Directory</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-text-secondary">
          Redacted Circle references with participant role counts, linked senior
          profile metadata, last activity metadata, and notification failure signals.
        </p>
      </section>

      {!circles.ok ? (
        <EmptyState title="Circle directory unavailable">{circles.message}</EmptyState>
      ) : (
        <>
          <SectionHeader title="Circles">
            {circles.data.isDone ? "Showing bounded page" : "More pages available"}
          </SectionHeader>
          <DataTable
            columns={[
              "Circle",
              "Created",
              "Organisers",
              "Members",
              "Senior profiles",
              "Mode mix",
              "Last activity",
              "Failures",
            ]}
            rows={circles.data.page.map((circle) => [
              <Link
                className="font-bold text-family-primary"
                href={`/product/circles/${circle.id}`}
                key={circle.id}
              >
                {circle.label}
              </Link>,
              formatDateTime(circle.createdAt),
              circle.organiserCount,
              circle.memberCount,
              circle.seniorProfileCount,
              Object.entries(circle.seniorModeMix)
                .map(([key, value]) => `${titleCase(key)}: ${value}`)
                .join(", ") || "None",
              formatAge(circle.lastActivityAt),
              circle.recentNotificationFailureCount,
            ])}
          />
        </>
      )}
    </div>
  );
}
