"use client";

import { useRouter } from 'next/navigation';
import { Calendar, Sparkles, Lightbulb, Check } from 'lucide-react';

export default function AddRoutinePage() {
  const router = useRouter();
  const handleSaveRoutine = () => {
    // // TODO: Convex mutation to save the new routine
    console.log("Saving new routine...");
  };

  return (
    <div className="flex flex-col gap-8 px-4 w-full pb-32">
      {/* Soft Icon Hero */}
      <section className="relative group flex justify-center mt-2 mb-2">
        <div className="w-40 h-40 rounded-[2.5rem] bg-linear-to-br from-primary to-secondary flex flex-col items-center justify-center shadow-2xl shadow-primary/20 group-active:scale-95 transition-transform">
           <Calendar className="w-16 h-16 text-white mb-2" strokeWidth={1.5} />
           <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        </div>
      </section>

      {/* Form Essentials */}
      <section className="space-y-8">
        <div className="space-y-3">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="routine_name">Routine Name</label>
          <div className="relative">
            <input 
              id="routine_name" 
              placeholder="Morning Tea" 
              type="text" 
              className="w-full h-16 px-6 bg-surface-container-highest border-none rounded-md text-xl font-medium focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50" 
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="routine_time">What time?</label>
          <div className="relative">
            <input 
              id="routine_time" 
              placeholder="10:00 AM" 
              type="text" 
              className="w-full h-16 px-6 bg-surface-container-highest border-none rounded-md text-xl font-medium focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50" 
            />
          </div>
        </div>

        {/* Frequency Dropdown/Pill-Selector */}
        <div className="space-y-4">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight">Frequency</label>
          <div className="flex flex-wrap gap-3">
            <button className="h-12 px-6 rounded-full bg-primary text-on-primary font-medium shadow-lg shadow-primary/20 flex items-center gap-2">
              <Check className="w-4 h-4 font-bold" strokeWidth={3} />
              Daily
            </button>
            <button className="h-12 px-6 rounded-full bg-secondary-fixed text-on-secondary-container font-medium hover:bg-secondary-container/30 transition-colors">
              Weekly
            </button>
            <button className="h-12 px-6 rounded-full bg-secondary-fixed text-on-secondary-container font-medium hover:bg-secondary-container/30 transition-colors">
              Weekends
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="ai_instructions">AI Instructions</label>
            <Sparkles className="text-primary w-5 h-5 fill-primary/20" />
          </div>
          <div className="relative">
            <textarea 
              id="ai_instructions" 
              placeholder="E.g., Remind Mom to use her favorite blue mug." 
              rows={4} 
              className="w-full p-6 bg-surface-container-highest border-none rounded-md text-lg leading-relaxed focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50 resize-none" 
            ></textarea>
            <p className="mt-2 text-sm text-outline font-label px-1">Give Memvella specific directions for how to handle this routine.</p>
          </div>
        </div>
      </section>

      <div className="bg-primary-fixed/30 p-6 rounded-lg relative overflow-hidden group">
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

      <button 
        onClick={handleSaveRoutine}
        className="w-full bg-[#4e0078] text-white rounded-2xl py-4 font-semibold text-lg mt-10 hover:bg-[#3d005e] active:scale-95 transition-all shadow-sm"
      >
        Save Routine
      </button>
    </div>
  );
}
