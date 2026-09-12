"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@memvella/backend";
import type { Id } from "@memvella/backend/dataModel";
import RoutineEditor from "@/components/RoutineEditor";
import { useCircleProfile } from "@/lib/use-circle-profile";

export default function EditRoutinePage() {
  const { routineId } = useParams<{ routineId: string }>();
  const { isAuthenticated, isOrganiser, isLoading, profile } =
    useCircleProfile();
  const schedule = useQuery(
    api.routines.getRoutineSchedule,
    isAuthenticated && isOrganiser && profile
      ? { routineScheduleId: routineId as Id<"routineSchedules"> }
      : "skip",
  );
  if (isLoading || !profile) return <p role="status">Loading routine…</p>;
  if (!isOrganiser)
    return (
      <div className="empty-state">
        <h1>Routines are managed by the Workspace owner.</h1>
        <Link href="/circle/routines" className="quiet-link">
          Back to routines
        </Link>
      </div>
    );
  if (schedule === undefined) return <p role="status">Loading routine…</p>;
  if (!schedule)
    return (
      <div className="empty-state">
        <h1>Routine not found</h1>
        <p>This routine is no longer available in your Workspace.</p>
        <Link href="/circle/routines" className="quiet-link">
          Back to routines
        </Link>
      </div>
    );
  return <RoutineEditor key={schedule.id} schedule={schedule} />;
}
