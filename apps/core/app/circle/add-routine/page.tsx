"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { CalendarDays, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@memvella/backend";
import { PrimaryButton, SecondaryButton, TextInput } from "@memvella/ui";
import { FormCard } from "@/components/ui/FormCard";
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
  return left.length === right.length && left.every((day, index) => day === right[index]);
}

export default function AddRoutinePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { seniorDisplayName } = useCircleProfile();
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

  const isFormValid = title.trim().length > 0 && startTime.trim().length > 0 && daysOfWeek.length > 0;
  const selectedDayLabels = DAY_OPTIONS.filter((option) => daysOfWeek.includes(option.value)).map(
    (option) => option.label,
  );

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
        description: `${title.trim()} is now scheduled in this Circle.`,
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

  return (
    <div className="flex min-h-dvh w-full flex-col justify-between px-4 pb-32">
      <div className="space-y-6">
        <section className="rounded-xl border border-family-primary/15 bg-surface p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-family-primary">
                Structured Routine
              </p>
              <h1 className="mt-2 font-family text-3xl font-extrabold tracking-tight text-text-primary">
                Add a routine
              </h1>
              <p className="mt-2 text-lg leading-relaxed text-text-secondary">
                Build a dependable schedule for {seniorDisplayName} using exact days and times.
              </p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-family-primary/10 text-family-primary">
              <CalendarDays className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-4 inline-flex rounded-full bg-family-accent/10 px-4 py-2 text-sm font-semibold text-family-accent">
            Timezone: {timezone}
          </div>
        </section>

        <FormCard as="section" className="space-y-6">
          <div className="space-y-2">
            <label className="font-family text-lg font-bold tracking-tight text-text-primary" htmlFor="routine_title">
              Routine title
            </label>
            <TextInput
              id="routine_title"
              data-testid="routine-title-input"
              type="text"
              required
              placeholder="Morning tea"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="font-family text-lg font-bold tracking-tight text-text-primary" htmlFor="routine_time">
              Start time
            </label>
            <TextInput
              id="routine_time"
              data-testid="routine-time-input"
              type="time"
              required
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="font-family text-lg font-bold tracking-tight text-text-primary">
              Repeat on
            </label>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {DAY_PRESETS.map((preset) => {
                const isSelected = sameDays(daysOfWeek, [...preset.daysOfWeek]);

                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setDaysOfWeek([...preset.daysOfWeek])}
                    className={`min-h-[48px] rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors ${
                      isSelected
                        ? "border-family-primary bg-family-primary text-white"
                        : "border-family-accent/15 bg-family-accent/10 text-family-accent"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {DAY_OPTIONS.map((option) => {
                const isSelected = daysOfWeek.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleDay(option.value)}
                    className={`min-h-[48px] rounded-xl border text-sm font-bold transition-colors ${
                      isSelected
                        ? "border-family-primary bg-family-primary text-white"
                        : "border-border bg-surface text-text-primary"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <p className="text-sm font-medium text-text-secondary">
              Selected: {selectedDayLabels.length > 0 ? selectedDayLabels.join(", ") : "Choose at least one day."}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="font-family text-lg font-bold tracking-tight text-text-primary" htmlFor="routine_notes">
                Support notes
              </label>
              <Sparkles className="h-5 w-5 text-family-primary" />
            </div>
            <textarea
              id="routine_notes"
              data-testid="routine-notes-input"
              placeholder={`Example: Mention ${seniorDisplayName}'s blue mug when this routine starts.`}
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-[100px] w-full resize-none rounded-xl border border-border bg-surface p-4 text-base text-text-primary shadow-sm outline-none transition-all placeholder:text-text-secondary focus:border-family-primary focus:ring-2 focus:ring-family-primary/20"
            />
            <p className="text-sm font-medium text-text-secondary">
              Optional context helps Memvella present this routine naturally.
            </p>
          </div>
        </FormCard>

        <section className="rounded-xl border border-family-accent/15 bg-family-accent/10 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-family-accent">
            Preview
          </p>
          <p className="mt-3 text-lg font-bold text-text-primary">
            {title.trim() || "Untitled routine"}
          </p>
          <p className="mt-1 text-lg font-medium text-text-secondary">
            {startTime} on {selectedDayLabels.length > 0 ? selectedDayLabels.join(", ") : "selected days"}
          </p>
        </section>
      </div>

      <div className="mt-8 space-y-3">
        {error ? <p className="px-1 text-sm font-medium text-status-alert">{error}</p> : null}

        <PrimaryButton
          onClick={handleSaveRoutine}
          disabled={isSaving || !isFormValid}
          data-testid="routine-save-button"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              Saving routine...
            </>
          ) : (
            "Save routine"
          )}
        </PrimaryButton>

        <SecondaryButton href="/circle/routines">
          Back to routines
        </SecondaryButton>
      </div>
    </div>
  );
}
