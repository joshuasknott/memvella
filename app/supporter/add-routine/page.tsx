"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { Check, Lightbulb, Loader2, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { FormCard } from "@/components/ui/FormCard";
import { useFamilySpaceProfile } from "@/lib/use-family-space-profile";

const FREQUENCY_OPTIONS = ["Daily", "Weekly", "Weekends"];

export default function AddRoutinePage() {
  const router = useRouter();
  const { seniorDisplayName } = useFamilySpaceProfile();
  const addRoutine = useMutation(api.supporter.addRoutine);

  const [routineName, setRoutineName] = useState("");
  const [time, setTime] = useState("");
  const [frequency, setFrequency] = useState<string[]>(["Daily"]);
  const [aiInstructions, setAiInstructions] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFrequency = (option: string) => {
    setFrequency([option]);
  };

  const isFormValid =
    routineName.trim().length > 0 && time.trim().length > 0 && frequency.length > 0;

  const handleSaveRoutine = async () => {
    if (!isFormValid) {
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await addRoutine({
        routineName: routineName.trim(),
        time: time.trim(),
        frequency,
        aiInstructions: aiInstructions.trim(),
      });
      router.push("/supporter/routines");
    } catch (saveError) {
      console.error(saveError);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 px-4 pb-32">
      <FormCard as="section" className="space-y-8">
        <div className="space-y-6">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="routine_name">
            Routine Name
          </label>
          <input
            id="routine_name"
            placeholder="Morning Tea"
            type="text"
            required
            value={routineName}
            onChange={(event) => setRoutineName(event.target.value)}
            className="h-16 w-full rounded-2xl border border-gray-200 bg-white px-6 text-lg transition-all focus:border-[#4e0078] focus:outline-none focus:ring-2 focus:ring-[#4e0078]/30"
          />
        </div>

        <div className="space-y-6">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="routine_time">
            What time?
          </label>
          <input
            id="routine_time"
            type="time"
            required
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className="h-16 w-full rounded-2xl border border-gray-200 bg-white px-6 text-lg transition-all focus:border-[#4e0078] focus:outline-none focus:ring-2 focus:ring-[#4e0078]/30"
          />
        </div>

        <div className="space-y-6">
          <label className="font-headline text-2xl font-bold tracking-tight text-on-surface">
            Frequency
          </label>
          <div className="flex flex-wrap gap-3">
            {FREQUENCY_OPTIONS.map((option) => {
              const isSelected = frequency.includes(option);

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleFrequency(option)}
                  className={`flex h-12 items-center gap-2 rounded-full px-6 font-medium transition-colors ${
                    isSelected
                      ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                      : "bg-secondary-fixed text-on-secondary-container hover:bg-secondary-container/30"
                  }`}
                >
                  {isSelected ? <Check className="h-4 w-4" strokeWidth={3} /> : null}
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <label className="font-headline text-2xl font-bold tracking-tight text-on-surface" htmlFor="ai_instructions">
              AI Instructions <span className="ml-2 text-sm font-normal italic text-outline">(Optional)</span>
            </label>
            <Sparkles className="h-5 w-5 fill-primary/20 text-primary" />
          </div>
          <textarea
            id="ai_instructions"
            placeholder={`E.g. Remind ${seniorDisplayName} to use their favorite blue mug.`}
            rows={4}
            value={aiInstructions}
            onChange={(event) => setAiInstructions(event.target.value)}
            className="min-h-[120px] w-full resize-none rounded-2xl border border-gray-200 bg-white p-6 text-lg transition-all placeholder:text-outline/50 focus:border-[#4e0078] focus:outline-none focus:ring-2 focus:ring-[#4e0078]/30"
          />
          <p className="px-1 text-sm text-outline">
            Give Memvella specific directions for how to handle this routine.
          </p>
        </div>
      </FormCard>

      <div className="group relative overflow-hidden rounded-3xl bg-primary-fixed/30 p-6">
        <div className="relative z-10 flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-primary-fixed">
              Gentle Nudges
            </h4>
            <p className="mt-1 text-sm leading-snug text-on-primary-fixed-variant">
              Memvella will weave this routine into conversation without sounding like an alarm.
            </p>
          </div>
        </div>
        <div className="absolute -bottom-4 -right-4 h-24 w-24 scale-150 rounded-full bg-primary/5 transition-transform duration-700 group-hover:scale-110" />
      </div>

      {error ? <p className="-mt-4 px-1 text-sm font-medium text-red-500">{error}</p> : null}

      <button
        type="button"
        onClick={handleSaveRoutine}
        disabled={isSaving || !isFormValid}
        className="mb-8 flex h-16 w-full items-center justify-center gap-2 rounded-full bg-[#6B21A8] text-xl font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Routine"
        )}
      </button>
    </div>
  );
}
