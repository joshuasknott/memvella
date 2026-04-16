"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Coffee,
  Heart,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useCircleProfile } from "@/lib/use-circle-profile";

const ROUTINE_ICON_MAP: Record<string, React.ElementType> = {
  Daily: Coffee,
  Weekly: Calendar,
  Weekends: Calendar,
};

function TimelineSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((item) => (
        <div
          key={item}
          className="flex items-center gap-5 rounded-xl bg-surface p-4 animate-pulse"
        >
          <div className="h-12 w-12 rounded-full bg-surface-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 rounded bg-surface-muted" />
            <div className="h-4 w-40 rounded bg-surface-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrganiserDashboard() {
  const { isAuthenticated, isLoading, seniorDisplayName } = useCircleProfile();
  const summary = useQuery(
    api.organiser.getOrganiserDashboardSummary,
    isAuthenticated ? undefined : "skip",
  );
  const queuedInsightCount = useQuery(
    api.insights.getQueuedOrganiserInsightCount,
    isAuthenticated ? undefined : "skip",
  );
  const timeline = useQuery(
    api.organiser.getTodayTimeline,
    isAuthenticated ? undefined : "skip",
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="text-lg font-medium text-text-secondary">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 px-4">
      <section
        className="relative overflow-hidden rounded-xl bg-surface p-6 shadow-sm"
        data-testid="circle-current-status"
      >
        <div className="relative z-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-family-primary" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-family-primary/70">
              Current Status
            </span>
          </div>
          <h2 className="mb-2 font-family text-lg font-bold leading-tight text-text-primary">
            {summary?.statusSummary ?? "Preparing your Circle..."}
          </h2>
          <p className="text-lg leading-relaxed text-text-secondary">
            Memvella is ready to support {seniorDisplayName} today.
          </p>
        </div>
        <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-family-primary/5 blur-2xl" />
      </section>

      <section className="relative z-10">
        <div className="flex justify-between gap-4">
          <Link
            href="/circle/add-person"
            data-testid="circle-add-person-action"
            className="flex min-h-[100px] flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-surface p-4 shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-transform active:scale-95"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-family-primary/10">
              <UserPlus className="h-6 w-6 text-family-primary" />
            </div>
            <span className="text-center text-base font-bold text-text-primary">
              Add Person
            </span>
          </Link>

          <Link
            href="/circle/add-memory"
            data-testid="circle-add-memory-action"
            className="flex min-h-[100px] flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-surface p-4 shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-transform active:scale-95"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-family-primary/10">
              <BookOpen className="h-6 w-6 text-family-primary" />
            </div>
            <span className="text-center text-base font-bold text-text-primary">
              Add Memory
            </span>
          </Link>

          <Link
            href="/circle/add-routine"
            data-testid="circle-add-routine-action"
            className="flex min-h-[100px] flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-surface p-4 shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-transform active:scale-95"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-family-accent/15">
              <Calendar className="h-6 w-6 text-family-accent" />
            </div>
            <span className="text-center text-base font-bold text-text-primary">
              Add Routine
            </span>
          </Link>
        </div>
      </section>

      <section className="-mt-2 relative z-20">
        {summary === undefined ? (
          <div className="rounded-xl border border-primary/5 bg-family-primary/10 p-5 shadow-sm animate-pulse">
            <div className="mb-3 flex items-start justify-between">
              <div className="h-8 w-8 rounded-full bg-on-primary-container/20" />
              <div className="h-6 w-24 rounded-full bg-on-primary-container/10" />
            </div>
            <div className="mb-4 space-y-2">
              <div className="h-4 w-full rounded bg-on-primary-container/10" />
              <div className="h-4 w-2/3 rounded bg-on-primary-container/10" />
            </div>
            <div className="h-12 w-full rounded-full bg-on-primary-container/10" />
          </div>
        ) : (
          <Link
            href="/circle/insights"
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
                <MessageSquare className="h-5 w-5 text-family-accent" />
              </div>
              <div>
                <p className="text-lg font-bold text-text-primary">
                  Insights Ready for Review
                </p>
                <p className="text-base text-text-secondary">
                  {queuedInsightCount && queuedInsightCount > 0
                    ? `${queuedInsightCount} insight${queuedInsightCount === 1 ? "" : "s"} waiting in your queue.`
                    : "Open the queue to review the latest transcript signals."}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-text-secondary" />
          </Link>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="px-2 font-family text-lg font-bold">Today&apos;s Updates</h3>

        {timeline === undefined ? (
          <TimelineSkeleton />
        ) : timeline.length === 0 ? (
          <div className="flex items-center gap-5 rounded-xl bg-surface p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-sm">
              <Calendar className="h-6 w-6 text-text-secondary" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-medium text-text-secondary">
                No routines scheduled yet.
              </p>
              <Link
                href="/circle/add-routine"
                className="mt-1 block text-base font-bold text-family-primary"
              >
                Add a routine
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {timeline.map((item: NonNullable<typeof timeline>[number]) => {
              const Icon = ROUTINE_ICON_MAP[item.type] ?? Calendar;

              return (
                <div
                  key={item.id}
                  className="rounded-xl bg-surface p-4 transition-colors hover:bg-surface-muted"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-sm">
                      <Icon className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-bold uppercase tracking-[0.2em] text-text-secondary">
                        {item.time}
                      </p>
                      <p className="text-lg font-medium text-text-primary">
                        {item.title}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="group cursor-pointer overflow-hidden rounded-xl bg-surface shadow-sm transition-colors hover:bg-surface-muted">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-family-primary/10">
                <Heart className="h-4 w-4 fill-family-primary text-family-primary" />
              </div>
              <p className="text-lg font-medium text-text-primary">
                {summary
                  ? `${summary.totalPeople} person${summary.totalPeople !== 1 ? "s" : ""} and ${summary.totalRoutines} routine${summary.totalRoutines !== 1 ? "s" : ""} set up.`
                  : "Loading people summary..."}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-text-secondary transition-colors group-hover:text-family-primary" />
          </div>
        </div>
      </section>
    </div>
  );
}
