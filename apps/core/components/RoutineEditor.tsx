"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@memvella/backend";
import type { Id } from "@memvella/backend/dataModel";
import { useCircleProfile } from "@/lib/use-circle-profile";

const DAY_OPTIONS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
] as const;

const DAY_PRESETS = [
  { label: "Every day", daysOfWeek: [0, 1, 2, 3, 4, 5, 6] },
  { label: "Weekdays", daysOfWeek: [1, 2, 3, 4, 5] },
  { label: "Weekends", daysOfWeek: [0, 6] },
] as const;

function sameDays(left: number[], right: number[]) {
  return (
    left.length === right.length &&
    left.every((day, index) => day === right[index])
  );
}

type RoutineSchedule = {
  id: Id<"routineSchedules">;
  title: string;
  startTimeMinutes: number;
  daysOfWeek: number[];
  aiInstructions: string | null;
  timezone: string;
  status: "active" | "paused";
  durationMinutes: number | null;
  startDate: string | null;
  endDate: string | null;
};

export default function RoutineEditor({
  schedule,
}: {
  schedule?: RoutineSchedule;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { seniorDisplayName, isOrganiser, isLoading, profile } =
    useCircleProfile();
  const createRoutineSchedule = useMutation(api.routines.createRoutineSchedule);
  const updateRoutineSchedule = useMutation(api.routines.updateRoutineSchedule);
  const deleteRoutineSchedule = useMutation(api.routines.deleteRoutineSchedule);

  const [title, setTitle] = useState(schedule?.title ?? "");
  const [startTime, setStartTime] = useState(
    schedule
      ? `${String(Math.floor(schedule.startTimeMinutes / 60)).padStart(2, "0")}:${String(schedule.startTimeMinutes % 60).padStart(2, "0")}`
      : "09:00",
  );
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(
    schedule?.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6],
  );
  const [notes, setNotes] = useState(schedule?.aiInstructions ?? "");
  const [timezone, setTimezone] = useState(schedule?.timezone ?? "UTC");
  const [isPaused, setIsPaused] = useState(schedule?.status === "paused");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (schedule) return;
    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTimeZone) {
      setTimezone(browserTimeZone);
    }
  }, [schedule]);

  const toggleDay = (day: number) => {
    setDaysOfWeek((currentDays) =>
      currentDays.includes(day)
        ? currentDays.filter((value) => value !== day)
        : [...currentDays, day].sort((left, right) => left - right),
    );
  };

  const isFormValid =
    title.trim().length > 0 &&
    startTime.trim().length > 0 &&
    daysOfWeek.length > 0;

  const handleSaveRoutine = async () => {
    if (!isFormValid) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const values = {
        title: title.trim(),
        startTime,
        daysOfWeek,
        timezone,
        aiInstructions: notes.trim() || undefined,
      };
      if (schedule) {
        await updateRoutineSchedule({
          ...values,
          routineScheduleId: schedule.id,
          status: isPaused ? "paused" : "active",
          durationMinutes: schedule.durationMinutes ?? undefined,
          startDate: schedule.startDate ?? undefined,
          endDate: schedule.endDate ?? undefined,
        });
      } else {
        await createRoutineSchedule(values);
      }
      toast({
        tone: "success",
        title: schedule ? "Routine updated" : "Routine saved",
        description: isPaused
          ? "Reminders are paused. You can resume them here any time."
          : `${title.trim()} is scheduled.`,
      });
      router.push("/circle/routines");
    } catch {
      const message =
        "This routine couldn’t save. Check your connection and try again.";
      setError(message);
      toast({
        tone: "error",
        title: "Routine did not save",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!schedule || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteRoutineSchedule({ routineScheduleId: schedule.id });
      deleteDialog.current?.close();
      toast({
        tone: "success",
        title: "Routine deleted",
        description: schedule.title,
      });
      router.push("/circle/routines");
    } catch {
      setDeleteError("This routine couldn’t be deleted. Please try again.");
      setIsDeleting(false);
    }
  };

  if (isLoading || !profile) return <p role="status">Loading…</p>;
  if (!isOrganiser)
    return (
      <div className="empty-state">
        <h1>Routines are managed by the Workspace owner.</h1>
        <Link href="/circle/routines" className="quiet-link">
          Back to routines
        </Link>
      </div>
    );

  return (
    <div className="memory-editor">
      <section className="page-heading">
        <div>
          <p className="eyebrow">A gentle reminder</p>
          <h1>{schedule ? "Edit routine" : "Add a routine"}</h1>
          <p>Something familiar in {seniorDisplayName}&apos;s day.</p>
        </div>
      </section>
      <form
        aria-busy={isSaving}
        onSubmit={(event) => {
          event.preventDefault();
          if (!isSaving) void handleSaveRoutine();
        }}
      >
        <fieldset disabled={isSaving} className="contents">
          <div>
            <label htmlFor="routine-title">
              What would you like to remind them about?
            </label>
            <input
              id="routine-title"
              data-testid="routine-title-input"
              placeholder="Morning tea"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={200}
            />
          </div>
          <div>
            <label htmlFor="routine-time">At what time?</label>
            <input
              type="time"
              id="routine-time"
              data-testid="routine-time-input"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              required
            />
            <p className="editor-help">
              Times use {timezone.replaceAll("_", " ")}.
            </p>
          </div>
          <fieldset>
            <legend className="mb-3 font-semibold">Repeat</legend>
            <div className="editor-tools">
              {DAY_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  aria-pressed={sameDays(daysOfWeek, [...preset.daysOfWeek])}
                  onClick={() => setDaysOfWeek([...preset.daysOfWeek])}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <details className="mt-3">
              <summary className="quiet-link">Choose individual days</summary>
              <div className="editor-tools mt-2">
                {DAY_OPTIONS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    aria-pressed={daysOfWeek.includes(day.value)}
                    onClick={() => toggleDay(day.value)}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </details>
            {daysOfWeek.length === 0 ? (
              <p role="alert" className="form-error">
                Choose at least one day.
              </p>
            ) : null}
          </fieldset>
          <div>
            <label htmlFor="routine-notes">
              A helpful detail <span className="optional">(optional)</span>
            </label>
            <textarea
              id="routine-notes"
              data-testid="routine-notes-input"
              placeholder="Their favourite mug is the blue one."
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={2000}
            />
          </div>
          {schedule ? (
            <label className="routine-pause-control">
              <input
                type="checkbox"
                checked={isPaused}
                onChange={(event) => setIsPaused(event.target.checked)}
              />
              <span>
                Pause reminders
                <span className="editor-help block">
                  Keep this routine and resume it whenever you’re ready.
                </span>
              </span>
            </label>
          ) : null}
        </fieldset>
        {error ? (
          <p role="alert" className="form-error">
            {error}
          </p>
        ) : null}
        <div className="editor-footer">
          <Link className="quiet-link" href="/circle/routines">
            Cancel
          </Link>
          <button
            type="submit"
            className="action-button"
            disabled={isSaving || !isFormValid}
            data-testid="routine-save-button"
          >
            {isSaving ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Saving…
              </>
            ) : schedule ? (
              "Save changes"
            ) : (
              "Save routine"
            )}
          </button>
        </div>
      </form>
      {schedule ? (
        <>
          <button
            type="button"
            className="quiet-link routine-delete-link"
            disabled={isSaving || isDeleting}
            onClick={() => {
              setDeleteError(null);
              deleteDialog.current?.showModal();
            }}
          >
            Delete routine
          </button>
          <dialog
            ref={deleteDialog}
            className="confirm-dialog"
            aria-labelledby="delete-routine-title"
            aria-describedby="delete-routine-description"
            onCancel={(event) => {
              if (isDeleting) event.preventDefault();
            }}
          >
            <h2 id="delete-routine-title">Delete this routine?</h2>
            <p id="delete-routine-description">
              “{schedule.title}” and its reminders will be removed. This cannot
              be undone.
            </p>
            {deleteError ? (
              <p role="alert" className="form-error">
                {deleteError}
              </p>
            ) : null}
            <div className="editor-footer">
              <button
                type="button"
                className="quiet-link"
                autoFocus
                disabled={isDeleting}
                onClick={() => deleteDialog.current?.close()}
              >
                Keep routine
              </button>
              <button
                type="button"
                className="action-button danger-button"
                disabled={isDeleting}
                onClick={() => void handleDelete()}
              >
                {isDeleting ? "Deleting…" : "Delete routine"}
              </button>
            </div>
          </dialog>
        </>
      ) : null}
    </div>
  );
}
