"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Clock3, Plus } from "lucide-react";
import { api } from "@memvella/backend";
import { useCircleProfile } from "@/lib/use-circle-profile";

export default function RoutinesPage() {
  const { profile, isAuthenticated, isOrganiser, seniorDisplayName } =
    useCircleProfile();
  const schedules = useQuery(
    api.routines.listRoutineSchedules,
    isAuthenticated && profile ? {} : "skip",
  );
  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">A familiar rhythm</p>
          <h1>Routines</h1>
          <p>Gentle reminders for {seniorDisplayName}&apos;s day.</p>
        </div>
        {isOrganiser ? (
          <Link
            href="/circle/add-routine"
            className="action-button"
            data-testid="open-add-routine-link"
          >
            <Plus size={20} aria-hidden="true" /> Add a routine
          </Link>
        ) : null}
      </section>
      {schedules === undefined ? (
        <p role="status" className="loading-message">
          Loading routines…
        </p>
      ) : schedules.length === 0 ? (
        <div className="empty-state">
          <Clock3 size={32} aria-hidden="true" />
          <h2>A little structure. At their pace.</h2>
          <p>
            No routines yet. Start with something familiar, like morning tea or
            an afternoon walk.
          </p>
          {isOrganiser ? (
            <Link className="quiet-link" href="/circle/add-routine">
              Add the first routine
            </Link>
          ) : null}
        </div>
      ) : (
        <section
          className="panel routine-schedules"
          aria-label="Routine schedules"
        >
          {schedules.map((schedule) => (
            <article
              key={schedule.id}
              data-testid={`routine-card-${schedule.id}`}
            >
              <div className="routine-time">
                <Clock3 size={22} aria-hidden="true" />
                <time>{schedule.time}</time>
              </div>
              <div>
                <h2>{schedule.title}</h2>
                <p>
                  {schedule.frequency.join(", ")}
                  {schedule.status !== "active" ? ` · ${schedule.status}` : ""}
                </p>
                {schedule.aiInstructions ? (
                  <p className="routine-note">{schedule.aiInstructions}</p>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      )}
      <p className="text-text-secondary">
        Reminders appear on the companion tablet. They are invitations, never
        demands.
      </p>
    </div>
  );
}
