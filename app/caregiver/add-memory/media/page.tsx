"use client";

import { useRouter } from 'next/navigation';
import { Image as ImageIcon } from 'lucide-react';

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

      <button 
        className="w-full bg-purple-600 text-white rounded-2xl py-4 font-semibold text-lg mt-auto hover:bg-purple-700 active:scale-95 transition-all shadow-sm"
      >
        Save Photo/Video
      </button>
    </div>
  );
}
