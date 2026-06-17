"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { AlarmClockCheck, CalendarClock, Clock3, Plus } from "lucide-react";
import { api } from "@memvella/backend";
import { PrimaryButton } from "@memvella/ui";

function RoutineSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="h-4 w-24 rounded bg-surface-muted" />
      <div className="mt-3 h-6 w-40 rounded bg-surface-muted" />
      <div className="mt-4 h-4 w-full rounded bg-surface-muted" />
      <div className="mt-2 h-4 w-2/3 rounded bg-surface-muted" />
    </div>
  );
}

export default function OrganiserRoutinesPage() {
  const timeline = useQuery(api.organiser.getTodayTimeline);
  const schedules = useQuery(api.routines.listRoutineSchedules);
  const summary = useQuery(api.organiser.getOrganiserDashboardSummary);

  const isLoading = timeline === undefined || schedules === undefined || summary === undefined;
  const hasSchedules = (schedules?.length ?? 0) > 0;

  return (
    <div className="flex w-full flex-col gap-6 px-4 pb-6">
      <section className="rounded-xl border border-family-primary/15 bg-surface p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-family-primary">
              Routine Center
            </p>
            <h1 className="mt-2 font-family text-3xl font-extrabold tracking-tight text-text-primary">
              Routines
            </h1>
            <p className="mt-2 text-lg leading-relaxed text-text-secondary">
              Structured schedules power the companion tablet and today&apos;s timeline.
            </p>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-family-primary/10 text-family-primary">
            <CalendarClock className="h-7 w-7" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-family-accent/10 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-family-accent">
              Next up
            </p>
            <p className="mt-2 text-lg font-bold text-text-primary">
              {summary?.statusSummary ?? "Preparing your timeline..."}
            </p>
          </div>
          <div className="rounded-xl bg-family-primary/10 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-family-primary">
              Today
            </p>
            <p className="mt-2 text-3xl font-extrabold text-text-primary">
              {timeline?.length ?? 0}
            </p>
            <p className="text-base font-medium text-text-secondary">
              scheduled item{timeline && timeline.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-family text-lg font-bold text-text-primary">
              Today&apos;s timeline
            </h2>
            <p className="mt-1 text-base text-text-secondary">
              Ordered by the exact times the dashboards will use.
            </p>
          </div>
          <Link
            href="/circle/add-routine"
            data-testid="open-add-routine-link"
            className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-family-accent px-5 text-base font-semibold text-white"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <RoutineSkeleton />
            <RoutineSkeleton />
          </div>
        ) : timeline && timeline.length > 0 ? (
          <div className="space-y-3">
            {timeline.map((item: NonNullable<typeof timeline>[number]) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-surface p-5 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-family-primary/10">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-family-primary">
                      {item.time.split(" ")[1] ?? ""}
                    </span>
                    <span className="mt-1 text-lg font-extrabold text-family-primary">
                      {item.time.split(" ")[0] ?? item.time}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-text-primary">{item.title}</p>
                    <p className="mt-1 text-base font-medium text-text-secondary">
                      {item.frequency.join(", ")}
                    </p>
                    {item.aiInstructions ? (
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                        {item.aiInstructions}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-16 items-center justify-center rounded-xl bg-family-accent/10 text-family-accent">
              <Clock3 className="h-7 w-7" />
            </div>
            <p className="mt-4 text-lg font-bold text-text-primary">Nothing scheduled today</p>
            <p className="mt-2 text-lg leading-relaxed text-text-secondary">
              Add a structured routine to populate the Senior dashboards and today&apos;s timeline.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-family text-lg font-bold text-text-primary">
            All schedules
          </h2>
          <p className="mt-1 text-base text-text-secondary">
            Every routine anchored to this Workspace.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <RoutineSkeleton />
            <RoutineSkeleton />
          </div>
        ) : hasSchedules ? (
          <div className="space-y-3">
            {schedules?.map((schedule) => (
              <div
                key={schedule.id}
                data-testid={`routine-card-${schedule.id}`}
                className="rounded-xl border border-border bg-surface p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-family-accent">
                      {schedule.status}
                    </p>
                    <p className="mt-2 text-lg font-bold text-text-primary">
                      {schedule.title}
                    </p>
                    <p className="mt-1 text-lg font-medium text-text-secondary">
                      {schedule.time}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-family-accent/10 text-family-accent">
                    <AlarmClockCheck className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {schedule.frequency.map((label) => (
                    <span
                      key={`${schedule.id}-${label}`}
                      className="rounded-full bg-family-primary/10 px-3 py-2 text-sm font-semibold text-family-primary"
                    >
                      {label}
                    </span>
                  ))}
                </div>

                {schedule.aiInstructions ? (
                  <p className="mt-4 text-base leading-relaxed text-text-secondary">
                    {schedule.aiInstructions}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center shadow-sm">
            <p className="text-lg font-bold text-text-primary">No routine schedules yet</p>
            <p className="mt-2 text-lg leading-relaxed text-text-secondary">
              Add your first schedule to create dependable daily structure for this Workspace.
            </p>
          </div>
        )}
      </section>

      <PrimaryButton href="/circle/add-routine">
        Add a routine
      </PrimaryButton>
    </div>
  );
}
