"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { CalendarDays, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/convex/_generated/api";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { FormCard } from "@/components/ui/FormCard";
import { TextInput } from "@/components/ui/Input";
import { useFamilySpaceProfile } from "@/lib/use-family-space-profile";

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
  const { seniorDisplayName } = useFamilySpaceProfile();
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
        description: `${title.trim()} is now scheduled in this FamilySpace.`,
      });
      router.push("/supporter/routines");
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
    <div className="flex min-h-[100dvh] w-full flex-col justify-between px-4 pb-32">
      <div className="space-y-6">
        <section className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-800">
                Structured Routine
              </p>
              <h1 className="mt-2 font-headline text-3xl font-extrabold tracking-tight text-gray-900">
                Add a routine
              </h1>
              <p className="mt-2 text-lg leading-relaxed text-gray-600">
                Build a dependable schedule for {seniorDisplayName} using exact days and times.
              </p>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-800">
              <CalendarDays className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-4 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">
            Timezone: {timezone}
          </div>
        </section>

        <FormCard as="section" className="space-y-8">
          <div className="space-y-3">
            <label className="font-headline text-2xl font-bold tracking-tight text-gray-900" htmlFor="routine_title">
              Routine title
            </label>
            <TextInput
              id="routine_title"
              type="text"
              required
              placeholder="Morning tea"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="font-headline text-2xl font-bold tracking-tight text-gray-900" htmlFor="routine_time">
              Start time
            </label>
            <TextInput
              id="routine_time"
              type="time"
              required
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </div>

          <div className="space-y-4">
            <label className="font-headline text-2xl font-bold tracking-tight text-gray-900">
              Repeat on
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {DAY_PRESETS.map((preset) => {
                const isSelected = sameDays(daysOfWeek, [...preset.daysOfWeek]);

                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setDaysOfWeek([...preset.daysOfWeek])}
                    className={`min-h-[72px] rounded-3xl border px-4 py-3 text-left text-base font-semibold transition-colors ${
                      isSelected
                        ? "border-purple-800 bg-purple-800 text-white"
                        : "border-blue-100 bg-blue-50 text-blue-800"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-4 gap-3">
              {DAY_OPTIONS.map((option) => {
                const isSelected = daysOfWeek.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleDay(option.value)}
                    className={`min-h-[72px] rounded-3xl border text-lg font-bold transition-colors ${
                      isSelected
                        ? "border-purple-800 bg-purple-800 text-white"
                        : "border-gray-200 bg-white text-gray-700"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <p className="text-sm font-medium text-gray-500">
              Selected: {selectedDayLabels.length > 0 ? selectedDayLabels.join(", ") : "Choose at least one day."}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="font-headline text-2xl font-bold tracking-tight text-gray-900" htmlFor="routine_notes">
                Support notes
              </label>
              <Sparkles className="h-5 w-5 text-purple-800" />
            </div>
            <textarea
              id="routine_notes"
              placeholder={`Example: Mention ${seniorDisplayName}'s blue mug when this routine starts.`}
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-[120px] w-full resize-none rounded-3xl border-2 border-gray-200 bg-white p-6 text-lg text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-purple-800 focus:ring-2 focus:ring-purple-800/20"
            />
            <p className="text-sm font-medium text-gray-500">
              Optional context helps Memvella present this routine naturally.
            </p>
          </div>
        </FormCard>

        <section className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-800">
            Preview
          </p>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {title.trim() || "Untitled routine"}
          </p>
          <p className="mt-1 text-lg font-medium text-gray-700">
            {startTime} on {selectedDayLabels.length > 0 ? selectedDayLabels.join(", ") : "selected days"}
          </p>
        </section>
      </div>

      <div className="mt-8 space-y-3">
        {error ? <p className="px-1 text-sm font-medium text-red-600">{error}</p> : null}

        <PrimaryButton onClick={handleSaveRoutine} disabled={isSaving || !isFormValid}>
          {isSaving ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              Saving routine...
            </>
          ) : (
            "Save routine"
          )}
        </PrimaryButton>

        <SecondaryButton href="/supporter/routines">
          Back to routines
        </SecondaryButton>
      </div>
    </div>
  );
}
