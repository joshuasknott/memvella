"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { UserPlus, BookOpen, Calendar, MessageSquare, ArrowRight, Coffee, Heart } from 'lucide-react';

// Icon map for timeline row types
const ROUTINE_ICON_MAP: Record<string, React.ElementType> = {
  Daily: Coffee,
  Weekly: Calendar,
  Weekends: Calendar,
};

function TimelineSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-5 p-4 bg-surface-container-low rounded-lg animate-pulse">
          <div className="w-12 h-12 rounded-full bg-surface-container" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 bg-surface-container rounded w-16" />
            <div className="h-3 bg-surface-container rounded w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CaregiverDashboard() {
  const summary = useQuery(api.caregiver.getCaregiverDashboardSummary);
  const timeline = useQuery(api.caregiver.getTodayTimeline);
  const createProfile = useMutation(api.caregiver.createCaregiverProfile);

  // Flush the lovedOneName that was bridged via localStorage during sign-up.
  // Runs once on mount. Removes the key immediately after a successful write
  // so this never fires again on subsequent dashboard visits.
  useEffect(() => {
    const lovedOneName = localStorage.getItem('memvella_lovedOneName');
    if (!lovedOneName) return;
    createProfile({ lovedOneName })
      .then(() => localStorage.removeItem('memvella_lovedOneName'))
      .catch((err) => console.warn('Profile creation deferred:', err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-6 px-4 w-full">
      {/* Connection Hero: Engagement Summary */}
      <section className="bg-linear-to-br from-primary-fixed to-secondary-fixed rounded-lg p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label text-xs font-semibold tracking-widest uppercase text-primary/60">Current Status</span>
          </div>
          <h2 className="font-headline font-bold text-2xl leading-tight text-on-primary-fixed mb-2">
            {summary?.statusSummary ?? 'Loading status…'}
          </h2>
          <p className="text-[#1a1c1a] leading-relaxed">She chatted with Memvella this morning and looked at the family photos.</p>
        </div>
        {/* Decorative Asymmetry */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
      </section>

      {/* Quick Actions */}
      <section className="relative z-10">
        <div className="flex justify-between gap-4">
          <Link href="/caregiver/add-person" className="flex-1 min-h-[100px] flex flex-col items-center justify-center gap-3 p-4 bg-surface-container-lowest rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.03)] active:scale-95 transition-transform">
            <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center">
              <UserPlus className="text-on-secondary-fixed-variant w-6 h-6" />
            </div>
            <span className="font-label text-[10px] font-bold text-on-surface text-center">Add Person</span>
          </Link>
          <Link href="/caregiver/add-memory" className="flex-1 min-h-[100px] flex flex-col items-center justify-center gap-3 p-4 bg-surface-container-lowest rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.03)] active:scale-95 transition-transform">
            <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center">
              <BookOpen className="text-on-primary-fixed-variant w-6 h-6" />
            </div>
            <span className="font-label text-[10px] font-bold text-on-surface text-center">Add Memory</span>
          </Link>
          <Link href="/caregiver/add-routine" className="flex-1 min-h-[100px] flex flex-col items-center justify-center gap-3 p-4 bg-surface-container-lowest rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.03)] active:scale-95 transition-transform">
            <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center">
              <Calendar className="text-on-tertiary-fixed-variant w-6 h-6" />
            </div>
            <span className="font-label text-[10px] font-bold text-on-surface text-center">Add Routine</span>
          </Link>
        </div>
      </section>

      {/* The Review Card */}
      <section className="-mt-4 relative z-20">
        <div className="bg-primary p-6 rounded-lg shadow-[0_25px_50px_rgba(78,0,120,0.2)] border border-primary/5">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-on-primary-container/20 flex items-center justify-center">
              <MessageSquare className="text-on-primary-container fill-on-primary-container/20 w-6 h-6" />
            </div>
            <span className="bg-on-primary-container/10 text-on-primary-container text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">New Insights</span>
          </div>
          <p className="text-on-primary font-medium text-sm mb-6 leading-relaxed">
            Memvella identified that Emily prefers Earl Grey tea with honey.
          </p>
          <Link href="/caregiver/insights" className="w-full h-14 bg-on-primary text-primary font-bold rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
            Review New Info
            <ArrowRight className="w-4 h-4 outline-none" />
          </Link>
        </div>
      </section>

      {/* Today's Updates — Live from Convex */}
      <section className="space-y-4">
        <h3 className="font-headline font-bold text-xl px-2">Today&apos;s Updates</h3>
        {timeline === undefined ? (
          <TimelineSkeleton />
        ) : timeline.length === 0 ? (
          <div className="flex items-center gap-5 p-4 bg-surface-container-low rounded-lg">
            <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm">
              <Calendar className="text-on-surface-variant w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-on-surface-variant text-sm">No routines scheduled yet.</p>
              <Link href="/caregiver/add-routine" className="text-primary text-xs font-bold mt-0.5 block">+ Add a routine</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {timeline.map((item) => {
              const Icon = ROUTINE_ICON_MAP[item.type] ?? Calendar;
              return (
                <div key={item.id} className="flex items-center gap-5 p-4 bg-surface-container-low rounded-lg group hover:bg-surface-container transition-colors">
                  <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm">
                    <Icon className="text-secondary w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">{item.time}</p>
                    <p className="font-medium text-on-surface">{item.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Family connection summary card — kept for visual richness */}
        <div className="bg-surface-container-lowest rounded-lg overflow-hidden shadow-sm">
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center">
                <Heart className="text-on-tertiary-fixed-variant w-4 h-4 fill-on-tertiary-fixed-variant" />
              </div>
              <p className="font-medium text-on-surface">
                {summary
                  ? `${summary.totalFamilyMembers} family member${summary.totalFamilyMembers !== 1 ? 's' : ''} & ${summary.totalRoutines} routine${summary.totalRoutines !== 1 ? 's' : ''} set up.`
                  : 'Loading family summary…'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
