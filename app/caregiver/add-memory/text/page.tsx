"use client";

import { Check, Sparkles, Lightbulb, Mic, Camera } from 'lucide-react';

export default function TextMemoryPage() {
  const handleSaveMemory = () => {
    // // TODO: Convex mutation to save the new memory
    console.log("Saving new memory...");
  };

  return (
    <div className="flex flex-col gap-8 px-4 w-full">
      {/* Form Essentials */}
      <section className="space-y-8">
        <div className="space-y-3">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="memory_title">Memory Title</label>
          <div className="relative">
            <input 
              id="memory_title" 
              placeholder="David's Graduation" 
              type="text" 
              className="appearance-none w-full h-16 px-6 bg-surface-container-highest border-none rounded-md text-xl font-medium focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50" 
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="memory_date">When was this?</label>
          <div className="relative">
            <input 
              id="memory_date" 
              placeholder="Spring 2019" 
              type="text" 
              className="appearance-none w-full h-16 px-6 bg-surface-container-highest border-none rounded-md text-xl font-medium focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all placeholder:text-outline/50" 
            />
          </div>
        </div>

        <div className="space-y-3">
           <div className="flex items-center gap-2">
            <label className="font-headline font-bold text-2xl text-on-surface tracking-tight" htmlFor="ai_context">The Story</label>
            <Sparkles className="text-primary w-5 h-5 fill-primary/20" />
          </div>
          <div className="w-full">
            <div className="relative w-full">
              <textarea 
                placeholder="David graduated from college and we had a big family picnic..."
                rows={5}
                className="appearance-none w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 pt-4 pb-14 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              ></textarea>
              <button type="button" className="absolute bottom-3 right-3 p-2.5 bg-purple-100 text-purple-700 rounded-full shadow-sm active:scale-95 transition-transform">
                <Mic size={20} />
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-outline font-label px-1">What happened? How did it make you feel?</p>
        </div>
      </section>

      {/* Contextual Tip Card */}
      <div className="bg-primary-fixed/30 p-6 rounded-lg relative overflow-hidden group">
        <div className="relative z-10 flex gap-4">
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
            <Lightbulb className="text-primary w-6 h-6" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-primary-fixed">Memory Curation</h4>
            <p className="text-sm text-on-primary-fixed-variant leading-snug mt-1 font-body">Adding stories triggers Memvella to organically bring them up during conversations with Mom.</p>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full transform scale-150 group-hover:scale-110 transition-transform duration-700"></div>
      </div>

      <button type="button" className="w-full bg-white border border-gray-200 shadow-sm rounded-2xl p-4 flex items-center justify-center gap-3 text-gray-700 font-medium active:bg-gray-50 transition-colors">
        <Camera size={22} className="text-blue-600" />
        Add Photo (Optional)
      </button>

      {/* Fixed Bottom Action Area */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-6 pb-8 pt-4 bg-linear-to-t from-surface via-surface/90 to-transparent z-40 space-y-3">
        <button 
          onClick={handleSaveMemory}
          className="w-full h-16 rounded-full bg-linear-to-r from-primary to-primary-container text-white font-headline font-bold text-xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <Check className="w-6 h-6" />
          Save Memory
        </button>
      </footer>
    </div>
  );
}
