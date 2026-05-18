import Link from "next/link";
import { getVoiceAiOverview } from "@/lib/hq-convex";
import {
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

export default async function VoiceAiPage() {
  const voiceAi = await getVoiceAiOverview();

  return (
    <div className="space-y-8">
      <section className="hq-panel rounded-lg p-6">
        <StatusPill tone="good">transcripts hidden</StatusPill>
        <h1 className="mt-4 text-3xl font-bold text-text-primary">Voice & AI</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-text-secondary">
          Voice interaction volume, intent mix, AI insight processing status, draft
          save metadata, and product safety-boundary flags. No transcripts or raw
          assistant responses are returned.
        </p>
      </section>

      {!voiceAi.ok ? (
        <EmptyState title="Voice & AI read model unavailable">{voiceAi.message}</EmptyState>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Recent interactions"
              tone="info"
              value={formatBoundedCount(voiceAi.data.interactionCount)}
            />
            <MetricCard
              label="Pending AI processing"
              tone={voiceAi.data.aiInsightStatusMix.pending.value > 0 ? "warn" : "good"}
              value={formatBoundedCount(voiceAi.data.aiInsightStatusMix.pending)}
            />
            <MetricCard label="Unknown intents" tone="warn" value={voiceAi.data.unknownIntentCount} />
            <MetricCard label="Medical-boundary flags" tone="warn" value={voiceAi.data.medicalBoundaryFlagCount} />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div>
              <SectionHeader title="Intent Type Mix" />
              <DataTable columns={["Intent", "Count"]} rows={mixToRows(voiceAi.data.intentTypeMix)} />
            </div>
            <HealthCard title="Future QA Annotation Hooks" status="placeholder" tone="neutral">
              Add annotation tooling only after role, audit, and privacy rules are defined.
              In HQ v1, this page exposes metadata and points to runbooks.
            </HealthCard>
          </section>

          <section>
            <SectionHeader title="Recent Voice Metadata">
              <Link className="font-bold text-family-primary" href="/runbooks/voice-ai-problems">
                Runbook
              </Link>
            </SectionHeader>
            <DataTable
              columns={["Circle", "Senior", "Session", "Intent", "AI status", "Flags", "Created"]}
              rows={voiceAi.data.recentMetadata.map((item) => [
                item.circleLabel,
                item.seniorProfileLabel,
                titleCase(item.sessionType),
                titleCase(item.intentType),
                item.aiInsightStatus,
                [
                  item.distressDetected ? "distress" : null,
                  item.medicalBoundaryFlag ? "medical-boundary" : null,
                ]
                  .filter(Boolean)
                  .join(", ") || "none",
                formatDateTime(item.createdAt),
              ])}
            />
          </section>
        </>
      )}
    </div>
  );
}
