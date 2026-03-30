"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Calendar } from "lucide-react";
import { api } from "@/convex/_generated/api";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function RoutineSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-surface-container-lowest p-5 shadow-sm animate-pulse">
      <div className="h-14 w-14 shrink-0 rounded-2xl bg-surface-container-high" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-16 rounded bg-surface-container-high" />
        <div className="h-4 w-36 rounded bg-surface-container-high" />
        <div className="h-3 w-24 rounded bg-surface-container-high" />
      </div>
    </div>
  );
}

export default function SupporterRoutinesPage() {
  const timeline = useQuery(api.supporter.getTodayTimeline);

  return (
    <div className="flex w-full flex-col gap-6 px-4">
      <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
        Routines
      </h1>

      {timeline === undefined ? (
        <div className="space-y-3">
          <RoutineSkeleton />
          <RoutineSkeleton />
          <RoutineSkeleton />
        </div>
      ) : timeline.length === 0 ? (
        <div className="mt-20 flex flex-col items-center justify-center text-center">
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-[28px] bg-surface-container-high shadow-xs">
            <Calendar className="h-10 w-10 -translate-y-[2px] text-on-surface-variant" strokeWidth={2} />
            <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-primary/5 blur-xl" />
          </div>
          <p className="mb-2 font-headline text-xl font-bold text-on-surface">
            No routines yet
          </p>
          <p className="mb-8 max-w-[250px] text-lg leading-relaxed text-outline">
            Daily schedules and reminders will appear here.
          </p>
          <Link
            href="/supporter/add-routine"
            className="flex h-14 w-full items-center justify-center rounded-full bg-surface-container-high font-headline text-lg font-bold text-on-surface shadow-sm transition-colors hover:bg-surface-container-highest"
          >
            Add Routine
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {timeline.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-2xl bg-surface-container-lowest p-5 shadow-sm transition-colors hover:bg-surface-container-low"
            >
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-primary/10">
                <span className="font-mono text-xs font-bold leading-none text-primary">
                  {item.time.split(" ")[0]}
                </span>
                <span className="mt-1 font-mono text-[11px] font-bold leading-none text-primary/60">
                  {item.time.split(" ")[1]}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-headline text-lg font-bold leading-tight text-on-surface">
                  {item.title}
                </p>
                <p className="mt-1 text-sm font-medium text-outline">
                  {item.frequency.join(", ")}
                </p>
              </div>

              <div className="flex shrink-0 gap-1">
                {DAYS.filter((day) =>
                  item.frequency.includes("Daily") ||
                  (item.frequency.includes("Weekends") &&
                    (day === "Sat" || day === "Sun")) ||
                  (item.frequency.includes("Weekly") && day === "Mon") ||
                  item.frequency.includes(day),
                ).map((day) => (
                  <span
                    key={day}
                    className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary"
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <Link
            href="/supporter/add-routine"
            className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-[#6B21A8] font-headline text-lg font-bold text-white shadow-sm transition-transform active:scale-95"
          >
            Add Routine
          </Link>
        </div>
      )}
    </div>
  );
}
