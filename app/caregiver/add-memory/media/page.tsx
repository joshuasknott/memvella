"use client";

import { useRouter } from 'next/navigation';
import { Camera, Image as ImageIcon, Check } from 'lucide-react';

export default function MediaMemoryPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8 px-4 w-full">
      {/* Dropzone */}
      <section className="relative group">
        <div className="w-full aspect-4/3 rounded-3xl bg-blue-50/50 flex flex-col items-center justify-center border-2 border-dashed border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer overflow-hidden shadow-sm">
          <div className="bg-white p-5 rounded-full shadow-lg shadow-blue-900/5 mb-4 group-active:scale-95 transition-transform">
            <ImageIcon className="w-8 h-8 text-blue-600" />
          </div>
          <p className="font-headline font-bold text-lg text-blue-900">Upload File</p>
          <p className="text-sm text-blue-600/70 mt-1 font-medium">Tap to select from camera roll</p>
        </div>
      </section>

      {/* Form Essentials */}
      <section className="space-y-4">
        <div className="space-y-2">
          <label className="font-headline font-bold text-lg text-gray-900 tracking-tight" htmlFor="media_story">The Story</label>
          <div className="relative">
            <input 
              id="media_story" 
              placeholder="Where were you? Who is in this?" 
              type="text" 
              className="w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl text-base font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none placeholder:text-gray-400" 
            />
          </div>
        </div>
      </section>

      {/* Fixed Bottom Action Area */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-6 pb-8 pt-4 bg-linear-to-t from-surface via-surface/90 to-transparent z-40">
        <button 
          className="w-full h-16 rounded-full bg-linear-to-r from-blue-600 to-blue-500 text-white font-headline font-bold text-xl shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Check className="w-6 h-6" />
          Save Media
        </button>
      </footer>
    </div>
  );
}
