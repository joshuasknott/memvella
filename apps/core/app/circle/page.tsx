"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { ArrowRight, Clock3, Plus, Tablet, MessageCircle } from "lucide-react";
import { api } from "@memvella/backend";
import { MemoryCard } from "@/components/MemoryCard";
import { useCircleProfile } from "@/lib/use-circle-profile";

export default function TodayPage() {
  const { profile, isAuthenticated, isOrganiser, seniorDisplayName } =
    useCircleProfile();
  const timeline = useQuery(
    api.organiser.getTodayTimeline,
    isAuthenticated && profile ? {} : "skip",
  );
  const memories = useQuery(
    api.memories.listMemoryRecords,
    isAuthenticated && profile ? {} : "skip",
  );
  const reviewCount = useQuery(
    api.insights.getQueuedOrganiserInsightCount,
    isOrganiser ? {} : "skip",
  );
  const sessions = useQuery(
    api.sessions.listAssistedDeviceSessions,
    isOrganiser ? {} : "skip",
  );
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const date = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="page-stack">
      <section className="page-heading" data-testid="circle-current-status">
        <div>
          <p className="eyebrow" suppressHydrationWarning>
            {date}
          </p>
          <h1>A little closer, every day.</h1>
          <p>A familiar face. A favourite story. A gentle reminder.</p>
        </div>
        <Link
          href="/circle/add-memory"
          className="action-button"
          data-testid="circle-add-memory-action"
        >
          <Plus size={20} aria-hidden="true" /> Add a memory
        </Link>
      </section>
      <div className="today-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>Today&apos;s routines</h2>
            <Link href="/circle/routines" className="quiet-link">
              View all <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          {timeline === undefined ? (
            <p className="loading-message" role="status">
              Loading routines…
            </p>
          ) : timeline.length === 0 ? (
            <div className="empty-inline">
              <Clock3 size={28} aria-hidden="true" />
              <h3>A little rhythm to the day.</h3>
              <p>No routines scheduled today.</p>
              {isOrganiser ? (
                <Link
                  href="/circle/add-routine"
                  className="quiet-link"
                  data-testid="circle-add-routine-action"
                >
                  Add a routine <ArrowRight size={18} aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          ) : (
            <ul className="routine-list">
              {timeline.slice(0, 4).map((item) => (
                <li key={item.id}>
                  <Clock3 size={24} aria-hidden="true" />
                  <time>{item.time}</time>
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="companion-card">
          <Tablet size={44} strokeWidth={1.5} aria-hidden="true" />
          <h2>A companion for {seniorDisplayName}</h2>
          <p>Familiar memories and gentle reminders, ready on their tablet.</p>
          {isOrganiser ? (
            <Link href="/circle/settings/pairing" className="quiet-link">
              {sessions === undefined
                ? "Companion tablet"
                : sessions.length
                  ? "Manage tablet access"
                  : "Connect a tablet"}{" "}
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          ) : (
            <p className="text-sm">
              A Supporter with owner access can connect a tablet.
            </p>
          )}
        </section>
      </div>
      {isOrganiser && !!reviewCount && (
        <Link href="/circle/insights" className="review-notice">
          <MessageCircle size={22} aria-hidden="true" />
          <span>
            {reviewCount} update{reviewCount === 1 ? "" : "s"} to review
          </span>
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
      )}
      <section>
        <div className="section-heading">
          <h2>Memories to come back to</h2>
          <Link href="/circle/memories" className="quiet-link">
            All memories <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        {memories === undefined ? (
          <p className="loading-message" role="status">
            Loading memories…
          </p>
        ) : memories.length === 0 ? (
          <div className="empty-state">
            <h3>Start with a favourite moment.</h3>
            <p>
              A photo, a few words, or a familiar voice. Something{" "}
              {seniorDisplayName} will recognise.
            </p>
            <Link className="quiet-link" href="/circle/add-memory">
              Add the first memory <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="memory-grid">
            {memories.slice(0, 3).map((record) => (
              <MemoryCard key={record.id} record={record} eager />
            ))}
          </div>
        )}
      </section>
      <p className="page-footnote">Made for the moments that matter.</p>
    </div>
  );
}
