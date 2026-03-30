"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { AlarmClockCheck, CalendarClock, Clock3, Plus } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { PrimaryButton } from "@/components/ui/Button";

function RoutineSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="h-4 w-24 rounded bg-gray-100" />
      <div className="mt-3 h-6 w-40 rounded bg-gray-100" />
      <div className="mt-4 h-4 w-full rounded bg-gray-100" />
      <div className="mt-2 h-4 w-2/3 rounded bg-gray-100" />
    </div>
  );
}

export default function SupporterRoutinesPage() {
  const timeline = useQuery(api.supporter.getTodayTimeline);
  const schedules = useQuery(api.routines.listRoutineSchedules);
  const summary = useQuery(api.supporter.getSupporterDashboardSummary);

  const isLoading = timeline === undefined || schedules === undefined || summary === undefined;
  const hasSchedules = (schedules?.length ?? 0) > 0;

  return (
    <div className="flex w-full flex-col gap-6 px-4 pb-6">
      <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-800">
              Routine Center
            </p>
            <h1 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-gray-900">
              Routines
            </h1>
            <p className="mt-2 text-lg leading-relaxed text-gray-600">
              Structured schedules power the Senior dashboards and today&apos;s timeline.
            </p>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-800">
            <CalendarClock className="h-7 w-7" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-blue-50 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-blue-800">
              Next up
            </p>
            <p className="mt-2 text-lg font-bold text-gray-900">
              {summary?.statusSummary ?? "Preparing your timeline..."}
            </p>
          </div>
          <div className="rounded-3xl bg-purple-50 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-purple-800">
              Today
            </p>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">
              {timeline?.length ?? 0}
            </p>
            <p className="text-base font-medium text-gray-600">
              scheduled item{timeline && timeline.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-2xl font-bold text-gray-900">
              Today&apos;s timeline
            </h2>
            <p className="mt-1 text-base text-gray-500">
              Ordered by the exact times the dashboards will use.
            </p>
          </div>
          <Link
            href="/supporter/add-routine"
            className="inline-flex min-h-[56px] items-center justify-center rounded-full bg-[#1D4ED8] px-5 text-base font-semibold text-white"
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
            {timeline.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-purple-50">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-purple-800">
                      {item.time.split(" ")[1] ?? ""}
                    </span>
                    <span className="mt-1 text-lg font-extrabold text-purple-900">
                      {item.time.split(" ")[0] ?? item.time}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xl font-bold text-gray-900">{item.title}</p>
                    <p className="mt-1 text-base font-medium text-gray-600">
                      {item.frequency.join(", ")}
                    </p>
                    {item.aiInstructions ? (
                      <p className="mt-2 text-sm leading-relaxed text-gray-500">
                        {item.aiInstructions}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-800">
              <Clock3 className="h-7 w-7" />
            </div>
            <p className="mt-4 text-xl font-bold text-gray-900">Nothing scheduled today</p>
            <p className="mt-2 text-lg leading-relaxed text-gray-500">
              Add a structured routine to populate the Senior dashboards and today&apos;s timeline.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-headline text-2xl font-bold text-gray-900">
            All schedules
          </h2>
          <p className="mt-1 text-base text-gray-500">
            Every routine anchored to this FamilySpace.
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
                className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-800">
                      {schedule.status}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {schedule.title}
                    </p>
                    <p className="mt-1 text-lg font-medium text-gray-600">
                      {schedule.time}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-800">
                    <AlarmClockCheck className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {schedule.frequency.map((label) => (
                    <span
                      key={`${schedule.id}-${label}`}
                      className="rounded-full bg-purple-50 px-3 py-2 text-sm font-semibold text-purple-800"
                    >
                      {label}
                    </span>
                  ))}
                </div>

                {schedule.aiInstructions ? (
                  <p className="mt-4 text-base leading-relaxed text-gray-600">
                    {schedule.aiInstructions}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-xl font-bold text-gray-900">No routine schedules yet</p>
            <p className="mt-2 text-lg leading-relaxed text-gray-500">
              Add your first schedule to create dependable daily structure for this FamilySpace.
            </p>
          </div>
        )}
      </section>

      <PrimaryButton href="/supporter/add-routine">
        Add a routine
      </PrimaryButton>
    </div>
  );
}
