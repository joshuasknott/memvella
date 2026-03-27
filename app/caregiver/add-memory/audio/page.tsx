"use client";

import { useRouter } from 'next/navigation';
import { Music, Upload } from 'lucide-react';

export default function AudioMemoryPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-8 px-4 w-full">
      {/* Soft Icon Hero */}
      <section className="flex justify-center mt-2 mb-2">
         <div className="w-24 h-24 bg-pink-50 rounded-4xl flex items-center justify-center shadow-sm border border-pink-100">
           <Music className="w-10 h-10 text-pink-500" />
         </div>
      </section>

      {/* Form Essentials */}
      <section className="space-y-6">
        <div className="space-y-2">
          <label className="font-headline font-bold text-lg text-gray-900 tracking-tight" htmlFor="song_link">Spotify or Apple Music Link</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="https://open.spotify.com/track/..." 
              className="appearance-none w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-headline font-bold text-lg text-gray-900 tracking-tight" htmlFor="song_context">Why does Mom love this?</label>
          <div className="relative">
            <textarea 
              placeholder="They played this at her wedding..." 
              rows={4}
              className="appearance-none w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 mt-2" 
            ></textarea>
          </div>
        </div>
      </section>

      <section className="space-y-4 pt-2">
        <h3 className="font-headline font-bold text-lg text-gray-900 tracking-tight">Or upload a file directly</h3>
        <button className="w-full bg-purple-50 text-purple-700 rounded-2xl p-4 flex items-center justify-center gap-2 border border-purple-100 hover:bg-purple-100 active:scale-95 transition-colors">
          <Upload className="w-5 h-5" />
          <span className="font-bold">Upload Audio or Video (MP4)</span>
        </button>
      </section>

      <button 
        className="w-full bg-[#4e0078] text-white rounded-2xl py-4 font-semibold text-lg mt-10 hover:bg-[#3d005e] active:scale-95 transition-all shadow-sm"
      >
        Save Audio Memory
      </button>
    </div>
  );
}
