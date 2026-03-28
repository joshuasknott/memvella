"use client";

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Calendar } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function RoutineSkeleton() {
  return (
    <div className="flex items-center gap-4 p-5 bg-surface-container-lowest rounded-2xl shadow-sm animate-pulse">
      <div className="w-14 h-14 rounded-2xl bg-surface-container-high shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-2.5 bg-surface-container-high rounded w-16" />
        <div className="h-3.5 bg-surface-container-high rounded w-36" />
        <div className="h-2.5 bg-surface-container-high rounded w-24" />
      </div>
    </div>
  );
}

export default function CaregiverRoutinesPage() {
  const timeline = useQuery(api.caregiver.getTodayTimeline);

  return (
    <div className="flex flex-col gap-6 px-4 w-full">
      <h1 className="font-headline font-extrabold text-3xl text-on-surface tracking-tight">Care Routines</h1>

      {/* Loading */}
      {timeline === undefined && (
        <div className="space-y-3">
          <RoutineSkeleton />
          <RoutineSkeleton />
          <RoutineSkeleton />
        </div>
      )}

      {/* Empty State */}
      {timeline !== undefined && timeline.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <div className="w-24 h-24 rounded-4xl bg-surface-container-high flex items-center justify-center mb-6 shadow-xs relative overflow-hidden">
            <Calendar className="w-10 h-10 text-on-surface-variant translate-y-[-2px]" strokeWidth={2} />
            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-primary/5 blur-xl"></div>
          </div>
          <p className="font-headline font-bold text-xl text-on-surface mb-2">No routines yet</p>
          <p className="text-outline text-sm leading-relaxed max-w-[250px] mb-8">
            Your daily schedules and reminders will appear here.
          </p>
          <Link
            href="/caregiver/add-routine"
            className="w-full h-14 bg-surface-container-high hover:bg-surface-container-highest transition-colors text-on-surface font-headline font-bold rounded-full flex items-center justify-center shadow-sm"
          >
            Add Routine
          </Link>
        </div>
      )}

      {/* Routine List */}
      {timeline !== undefined && timeline.length > 0 && (
        <div className="space-y-3">
          {timeline.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-5 bg-surface-container-lowest rounded-2xl shadow-sm group hover:bg-surface-container-low transition-colors">
              {/* Time block */}
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                <span className="font-mono font-bold text-primary text-xs leading-none">{item.time.split(' ')[0]}</span>
                <span className="font-mono font-bold text-primary/60 text-[10px] leading-none mt-0.5">{item.time.split(' ')[1]}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-headline font-bold text-on-surface text-base leading-tight">{item.title}</p>
                <p className="text-outline text-xs font-medium mt-0.5">
                  {item.frequency.join(' · ')}
                </p>
              </div>

              {/* Frequency pills */}
              <div className="flex gap-1 shrink-0">
                {DAYS.filter((d) =>
                  item.frequency.includes('Daily') ||
                  (item.frequency.includes('Weekends') && (d === 'Sat' || d === 'Sun')) ||
                  (item.frequency.includes('Weekly') && d === 'Mon') ||
                  item.frequency.includes(d)
                ).map((d) => (
                  <span key={d} className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <Link
            href="/caregiver/add-routine"
            className="w-full h-14 bg-surface-container-high hover:bg-surface-container-highest transition-colors text-on-surface font-headline font-bold rounded-full flex items-center justify-center shadow-sm mt-4"
          >
            + Add Routine
          </Link>
        </div>
      )}
    </div>
  );
}
