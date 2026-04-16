"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, Sparkles, TriangleAlert, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function OrganiserInsightsPage() {
  const insights = useQuery(api.insights.listOrganiserInsights);
  const reviewOrganiserInsight = useMutation(api.insights.reviewOrganiserInsight);
  const { toast } = useToast();

  const updateInsightStatus = async (
    insightId: Id<"insights"> | Id<"alerts">,
    status: "reviewed" | "dismissed",
  ) => {
    try {
      await reviewOrganiserInsight({
        insightId,
        status,
      });
      toast({
        tone: "success",
        title: status === "reviewed" ? "Insight reviewed" : "Insight dismissed",
        description: "The Organiser queue was updated.",
      });
    } catch (error) {
      toast({
        tone: "error",
        title: "Insight status did not update",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
    }
  };

  if (insights === undefined) {
    return (
      <div className="flex flex-1 flex-col gap-4 px-4 py-2">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-xl bg-surface p-5 shadow-sm animate-pulse"
          >
            <div className="mb-4 h-5 w-32 rounded bg-surface-muted" />
            <div className="mb-2 h-4 w-full rounded bg-surface-muted" />
            <div className="h-4 w-2/3 rounded bg-surface-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (insights.queued.length === 0 && insights.reviewed.length === 0) {
    return (
      <div className="flex flex-1 w-full flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-family-accent/20 bg-family-accent/10">
          <Sparkles className="h-8 w-8 text-family-accent" />
        </div>
        <p className="mb-2 font-family text-lg font-bold text-text-primary">
          No new insights to review right now.
        </p>
        <p className="mb-6 max-w-[260px] text-base leading-relaxed text-text-secondary">
          New transcript signals and AI summaries will appear here for Organiser review.
        </p>
        <Link
          href="/circle"
          className="rounded-full bg-surface-muted px-6 py-4 text-base font-bold text-text-secondary shadow-sm transition-transform active:scale-95"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 px-4 pb-4">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-family-accent">
              Review Queue
            </p>
            <h1 className="font-family text-lg font-bold text-text-primary">
              Organiser Insights
            </h1>
          </div>
          <div className="rounded-full bg-family-accent px-4 py-2 text-sm font-bold text-white">
            {insights.queued.length} waiting
          </div>
        </div>

        <div className="space-y-4">
          {insights.queued.map((insight) => (
            <article
              key={insight.id}
              className="rounded-[28px] bg-surface p-5 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full ${
                      insight.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : "bg-family-accent/15 text-family-accent"
                    }`}
                  >
                    <TriangleAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-text-tertiary">
                      {insight.priority === "high" ? "High Priority" : "Actionable"}
                    </p>
                    <h2 className="font-family text-lg font-bold text-text-primary">
                      {insight.title}
                    </h2>
                  </div>
                </div>
                <span className="text-sm font-semibold text-text-tertiary">
                  {formatTimestamp(insight.createdAt)}
                </span>
              </div>

              <p className="text-lg leading-relaxed text-text-secondary">
                {insight.summary}
              </p>

              <div className="mt-4 rounded-xl bg-surface-muted p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-text-tertiary">
                  Suggested Action
                </p>
                <p className="mt-2 text-lg leading-relaxed text-text-primary">
                  {insight.suggestedAction}
                </p>
              </div>

              {insight.evidenceTranscript ? (
                <div className="mt-4 rounded-xl border border-border bg-surface-muted p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-text-tertiary">
                    Transcript Evidence
                  </p>
                  <p className="mt-2 text-lg leading-relaxed text-text-primary">
                    “{insight.evidenceTranscript}”
                  </p>
                </div>
              ) : null}

              <p className="mt-4 text-base font-medium text-text-tertiary">
                Linked senior: {insight.seniorName}
              </p>

              <div className="mt-5 flex flex-col gap-3 md:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    void updateInsightStatus(insight.id, "reviewed");
                  }}
                  className="flex min-h-[60px] flex-1 items-center justify-center gap-2 rounded-full bg-family-accent px-6 text-lg font-bold text-white shadow-sm transition-transform active:scale-95"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Mark Reviewed
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void updateInsightStatus(insight.id, "dismissed");
                  }}
                  className="flex min-h-[60px] flex-1 items-center justify-center gap-2 rounded-full bg-surface px-6 text-lg font-bold text-text-primary shadow-sm transition-transform active:scale-95"
                >
                  <XCircle className="h-5 w-5" />
                  Dismiss
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {insights.reviewed.length > 0 ? (
        <section>
          <h2 className="mb-4 font-family text-lg font-bold text-text-primary">
            Recently Reviewed
          </h2>
          <div className="space-y-3">
            {insights.reviewed.map((insight) => (
              <div
                key={insight.id}
                className="rounded-xl border border-border bg-surface p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-text-primary">{insight.title}</p>
                    <p className="mt-1 text-base text-text-secondary">{insight.summary}</p>
                  </div>
                  <span className="text-sm font-semibold text-text-tertiary">
                    {insight.reviewedAt ? formatTimestamp(insight.reviewedAt) : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
