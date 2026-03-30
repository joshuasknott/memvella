"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Calendar, Sparkles, Lightbulb, Check, Loader2 } from 'lucide-react';
import { FormCard } from '@/components/ui/FormCard';

const FREQUENCY_OPTIONS = ['Daily', 'Weekly', 'Weekends'];

export default function AddRoutinePage() {
  const router = useRouter();
  const addRoutine = useMutation(api.caregiver.addRoutine);

  const lovedOneName = "your loved one"; // TODO: wire to Convex profile

  const [routineName, setRoutineName] = useState('');
  const [time, setTime] = useState('');
  const [frequency, setFrequency] = useState<string[]>(['Daily']);
  const [aiInstructions, setAiInstructions] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleFrequency = (option: string) => {
    setFrequency([option]);
  };

  const isFormValid = routineName.trim().length > 0 && time.trim().length > 0 && frequency.length > 0;

  const handleSaveRoutine = async () => {
    if (!isFormValid) return;
    
    setError(null);
    setIsSaving(true);
    try {
      await addRoutine({
        routineName: routineName.trim(),
        time: time.trim(),
        frequency,
        aiInstructions: aiInstructions.trim(),
      });
      router.push('/supporter/routines');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 px-4 w-full pb-32">


      {/* Form Essentials inside Premium White Card */}
      <FormCard as="section" className="space-y-8">
        <div className="space-y-6">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="routine_name">Routine Name</label>
          <div className="relative">
            <input
              id="routine_name"
              placeholder="Morning Tea"
              type="text"
              required
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="appearance-none outline-none focus:outline-none focus:ring-2 focus:ring-[#4e0078]/30 focus:border-[#4e0078] border border-gray-200 transition-all bg-white rounded-2xl px-6 h-16 w-full text-lg"
            />
          </div>
        </div>

        <div className="space-y-6">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="routine_time">What time?</label>
          <div className="relative">
            <input
              id="routine_time"
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="appearance-none outline-none focus:outline-none focus:ring-2 focus:ring-[#4e0078]/30 focus:border-[#4e0078] border border-gray-200 transition-all bg-white rounded-2xl px-6 h-16 w-full text-lg"
            />
          </div>
        </div>

        {/* Frequency Pill-Selector — multi-select */}
        <div className="space-y-6">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight">Frequency</label>
          <div className="flex flex-wrap gap-3">
            {FREQUENCY_OPTIONS.map((option) => {
              const isSelected = frequency.includes(option);
              return (
                <button
                  key={option}
                  onClick={() => toggleFrequency(option)}
                  className={`h-12 px-6 rounded-full font-medium transition-colors flex items-center gap-2 ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                      : 'bg-secondary-fixed text-on-secondary-container hover:bg-secondary-container/30'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 font-bold" strokeWidth={3} />}
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="ai_instructions">
              AI Instructions <span className="text-sm font-normal text-outline italic ml-2">(Optional)</span>
            </label>
            <Sparkles className="text-primary w-5 h-5 fill-primary/20" />
          </div>
          <div className="relative">
            <textarea
              id="ai_instructions"
              placeholder={`E.g., Remind ${lovedOneName} to use her favorite blue mug.`}
              rows={4}
              value={aiInstructions}
              onChange={(e) => setAiInstructions(e.target.value)}
              className="appearance-none outline-none focus:outline-none focus:ring-2 focus:ring-[#4e0078]/30 focus:border-[#4e0078] border border-gray-200 transition-all bg-white rounded-2xl p-6 min-h-[120px] w-full text-lg resize-none placeholder:text-outline/50"
            ></textarea>
            <p className="mt-2 text-sm text-outline font-label px-1">Give Memvella specific directions for how to handle this routine.</p>
          </div>
        </div>
      </FormCard>

      <div className="bg-primary-fixed/30 p-6 rounded-3xl relative overflow-hidden group">
        <div className="relative z-10 flex gap-4">
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
            <Lightbulb className="text-primary w-6 h-6" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-primary-fixed">Gentle Nudges</h4>
            <p className="text-sm text-on-primary-fixed-variant leading-snug mt-1 font-body">Memvella will naturally weave this routine into conversation without feeling like an alarm clock.</p>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full transform scale-150 group-hover:scale-110 transition-transform duration-700"></div>
      </div>

      {/* Validation Error */}
      {error && (
        <p className="text-red-500 text-sm font-medium px-1 -mt-4">{error}</p>
      )}

      <button
        onClick={handleSaveRoutine}
        disabled={isSaving || !isFormValid}
        className="h-16 w-full rounded-full bg-linear-to-r from-[#4e0078] to-[#7a2e9e] text-white font-semibold text-xl mb-8 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Routine'
        )}
      </button>
    </div>
  );
}
