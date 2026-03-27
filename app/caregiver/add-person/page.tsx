"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Check, Plus, Sparkles, Lightbulb } from 'lucide-react';

export default function AddPersonPage() {
  const router = useRouter();
  const [isLiving, setIsLiving] = useState(true);
  const handleSavePerson = () => {
    // // TODO: Convex mutation to save the new person and context
    console.log("Saving new person...");
  };

  return (
    <div className="flex flex-col gap-8 px-4 w-full pb-32">
      {/* Photo Upload Hero */}
      <section className="relative group">
        <div className="w-full aspect-square rounded-lg bg-surface-container-low flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30 hover:bg-surface-container-high transition-colors cursor-pointer overflow-hidden shadow-sm">
          <div className="bg-white p-6 rounded-full shadow-xl shadow-primary/5 mb-4 group-active:scale-90 transition-transform">
            <Camera className="w-10 h-10 text-primary" strokeWidth={1.5} />
          </div>
          <p className="font-headline font-bold text-lg text-primary">Add Photo</p>
          <p className="text-sm text-outline mt-1 font-light italic">Make it a favorite memory</p>
          {/* Decorative tonal bleed */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-secondary/5 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Form Essentials */}
      <section className="space-y-8">
        {/* Name Input */}
        <div className="space-y-3">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="person_name">What is their name?</label>
          <div className="relative">
            <input 
              id="person_name" 
              placeholder="David" 
              type="text" 
              className="w-full h-16 px-6 bg-surface-container-highest border-none rounded-md text-xl font-medium focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50" 
            />
          </div>
        </div>

        {/* Relationship Dropdown/Pill-Selector */}
        <div className="space-y-4">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight">Relationship to Mom</label>
          <div className="flex flex-wrap gap-3">
            <button className="h-12 px-6 rounded-full bg-primary text-on-primary font-medium shadow-lg shadow-primary/20 flex items-center gap-2">
              <Check className="w-4 h-4 font-bold" strokeWidth={3} />
              Son
            </button>
            <button className="h-12 px-6 rounded-full bg-secondary-fixed text-on-secondary-container font-medium hover:bg-secondary-container/30 transition-colors">
              Daughter
            </button>
            <button className="h-12 px-6 rounded-full bg-secondary-fixed text-on-secondary-container font-medium hover:bg-secondary-container/30 transition-colors">
              Grandchild
            </button>
            <button className="h-12 px-6 rounded-full bg-secondary-fixed text-on-secondary-container font-medium hover:bg-secondary-container/30 transition-colors">
              Friend
            </button>
            <button className="h-12 w-12 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-container-highest">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Life Status Selection */}
        <div className="space-y-4">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight">
            Status
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setIsLiving(true)}
              className={`h-14 flex-1 rounded-xl border-2 font-medium text-lg transition-all ${
                isLiving 
                  ? 'bg-[#4e0078]/10 border-[#4e0078] text-[#4e0078] shadow-sm' 
                  : 'bg-surface-container-highest border-transparent text-outline hover:bg-surface-container-highest/80'
              }`}
            >
              Living
            </button>
            <button
              onClick={() => setIsLiving(false)}
              className={`h-14 flex-1 rounded-xl border-2 font-medium text-lg transition-all ${
                !isLiving 
                  ? 'bg-[#4e0078]/10 border-[#4e0078] text-[#4e0078] shadow-sm' 
                  : 'bg-surface-container-highest border-transparent text-outline hover:bg-surface-container-highest/80'
              }`}
            >
              Passed Away
            </button>
          </div>
          <p className="mt-2 text-sm text-outline font-label px-1">
            This helps Memvella understand how to talk about them contextually.
          </p>
        </div>

        {/* AI Context Box */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="ai_context">Memvella Context</label>
            <Sparkles className="text-primary w-5 h-5 fill-primary/20" />
          </div>
          <div className="relative">
            <textarea 
              id="ai_context" 
              placeholder="E.g., David lives in Chicago and loves baseball." 
              rows={4} 
              className="w-full p-6 bg-surface-container-highest border-none rounded-md text-lg leading-relaxed focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50 resize-none" 
            ></textarea>
            <p className="mt-2 text-sm text-outline font-label px-1">What should Memvella know about them to help Mom remember?</p>
          </div>
        </div>
      </section>

      {/* Contextual Tip Card (Compassionate Curator Style) */}
      <div className="bg-primary-fixed/30 p-6 rounded-lg relative overflow-hidden group">
        <div className="relative z-10 flex gap-4">
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
            <Lightbulb className="text-primary w-6 h-6" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-primary-fixed">Family Connections</h4>
            <p className="text-sm text-on-primary-fixed-variant leading-snug mt-1 font-body">Adding detailed context helps us create more meaningful reminders during Mom&apos;s morning wellness check-in.</p>
          </div>
        </div>
        {/* Asymmetric decorative element */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full transform scale-150 group-hover:scale-110 transition-transform duration-700"></div>
      </div>

      <button 
        onClick={handleSavePerson}
        className="w-full bg-[#4e0078] text-white rounded-2xl py-4 font-semibold text-lg mt-10 hover:bg-[#3d005e] active:scale-95 transition-all shadow-sm"
      >
        Save to Family
      </button>
    </div>
  );
}
