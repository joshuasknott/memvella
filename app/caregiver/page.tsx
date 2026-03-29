"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { UserPlus, BookOpen, Calendar, MessageSquare, ArrowRight, Coffee, Heart, ChevronRight, Edit2, Trash2 } from 'lucide-react';

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
  // ── Auth state must be declared FIRST — before any useQuery calls.
  // This prevents Convex from executing queries before the JWT is established,
  // which is what was causing the "Unauthenticated" error in requireCaregiver().
  const { isAuthenticated, isLoading } = useConvexAuth();

  // All three queries are gated on isAuthenticated. Passing "skip" tells
  // Convex to hold the subscription entirely until the session is ready.
  const summary = useQuery(api.caregiver.getCaregiverDashboardSummary, isAuthenticated ? undefined : "skip");
  const timeline = useQuery(api.caregiver.getTodayTimeline, isAuthenticated ? undefined : "skip");
  const profile = useQuery(api.caregiver.getCaregiverProfile, isAuthenticated ? undefined : "skip");
  const createProfile = useMutation(api.caregiver.createCaregiverProfile);

  const lovedOneName = profile?.lovedOneName ?? 'Your loved one';

  // Flush the lovedOneName bridged via localStorage during sign-up.
  // Guarded by both isAuthenticated AND !isLoading — ensures the Convex JWT
  // is fully established before firing the mutation, preventing the
  // "Unauthenticated" race condition on post-signup redirect.
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const lovedOneName = localStorage.getItem('memvella_lovedOneName');
    if (!lovedOneName) return;
    createProfile({ lovedOneName })
      .then(() => localStorage.removeItem('memvella_lovedOneName'))
      .catch((err) => console.warn('Profile creation deferred:', err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, createProfile]);

  const handleUpdate = (id: string, type: string) => {
    console.log(`Update ${type}: ${id}`);
  };

  const handleDelete = (id: string, type: string) => {
    console.log(`Delete ${type}: ${id}`);
  };

  // While the Convex session is being established, render a clean loading
  // state to prevent unauthenticated queries from firing.
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-on-surface-variant text-sm font-medium">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 w-full">
      {/* Connection Hero: Engagement Summary */}
      <section className="bg-linear-to-br from-primary-fixed to-secondary-fixed rounded-lg p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="font-label text-xs font-semibold tracking-widest uppercase text-primary/60">Current Status</span>
          </div>
          <h2 className="font-headline font-bold text-xl leading-tight text-on-primary-fixed mb-1">
            {summary?.statusSummary ?? 'Loading status…'}
          </h2>
          <p className="text-[#1a1c1a] text-sm leading-relaxed">{lovedOneName} chatted with Memvella this morning and looked at the family photos.</p>
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
      <section className="-mt-2 relative z-20">
        {summary === undefined ? (
          <div className="bg-primary p-5 rounded-lg shadow-sm border border-primary/5 animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-full bg-on-primary-container/20" />
              <div className="w-24 h-6 rounded-full bg-on-primary-container/10" />
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-on-primary-container/10 rounded w-full" />
              <div className="h-4 bg-on-primary-container/10 rounded w-2/3" />
            </div>
            <div className="w-full h-12 bg-on-primary-container/10 rounded-full" />
          </div>
        ) : (
          <div className="bg-surface-container-low p-5 rounded-lg border border-outline-variant/30 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-3">
              <MessageSquare className="text-on-surface-variant w-5 h-5 opacity-50" />
            </div>
            <p className="text-on-surface-variant font-medium text-sm">
              Memvella is gathering insights today...
            </p>
          </div>
        )}
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
                <div key={item.id} className="flex flex-col p-4 bg-surface-container-low rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-sm">
                        <Icon className="text-secondary w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">{item.time}</p>
                        <p className="font-medium text-on-surface text-sm">{item.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.preventDefault(); handleUpdate(item.id, 'routine'); }} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.preventDefault(); handleDelete(item.id, 'routine'); }} className="p-2 text-error hover:bg-error/10 rounded-full transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Family connection summary card — kept for visual richness */}
        <div className="bg-surface-container-lowest rounded-lg overflow-hidden shadow-sm hover:bg-gray-50 cursor-pointer transition-colors group">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center">
                <Heart className="text-on-tertiary-fixed-variant w-4 h-4 fill-on-tertiary-fixed-variant" />
              </div>
              <p className="font-medium text-on-surface text-sm">
                {summary
                  ? `${summary.totalFamilyMembers} connection${summary.totalFamilyMembers !== 1 ? 's' : ''} & ${summary.totalRoutines} routine${summary.totalRoutines !== 1 ? 's' : ''} set up.`
                  : 'Loading connections summary…'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors shrink-0" />
          </div>
        </div>
      </section>
    </div>
  );
}
