"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@memvella/backend";
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

export default function AddRoutinePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { seniorDisplayName, isOrganiser, isLoading, profile } =
    useCircleProfile();
  const createRoutineSchedule = useMutation(api.routines.createRoutineSchedule);

  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [notes, setNotes] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTimeZone) {
      setTimezone(browserTimeZone);
    }
  }, []);

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
      await createRoutineSchedule({
        title: title.trim(),
        startTime,
        daysOfWeek,
        timezone,
        aiInstructions: notes.trim() || undefined,
      });
      toast({
        tone: "success",
        title: "Routine saved",
        description: `${title.trim()} is now scheduled in this Workspace.`,
      });
      router.push("/circle/routines");
    } catch (saveError) {
      console.error(saveError);
      const message =
        saveError instanceof Error
          ? saveError.message
          : "Unable to save this schedule. Please try again.";
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
          <h1>Add a routine</h1>
          <p>Something familiar in {seniorDisplayName}&apos;s day.</p>
        </div>
      </section>
      <form
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
            />
          </div>
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
            ) : (
              "Save routine"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
