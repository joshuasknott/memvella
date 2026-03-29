"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mic, Camera, Music, Type } from 'lucide-react';

export default function AddMemoryPage() {
  const lovedOneName = "your loved one"; // TODO: wire to Convex profile
  
  return (
    <div className="flex flex-col gap-6 px-4 w-full">
      <div>
        <h1 className="font-headline font-extrabold text-3xl text-gray-900 tracking-tight text-center">Add a Memory</h1>
        <p className="text-gray-500 text-sm mt-2 text-center mb-4">Choose a format to start capturing a moment for {lovedOneName}.</p>
      </div>

      <section className="space-y-4">
        <Link href="/caregiver/add-memory/voice" className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-5 active:bg-gray-50 transition-transform active:scale-[0.98]">
           <div className="bg-purple-50 text-purple-600 rounded-2xl w-14 h-14 flex items-center justify-center shrink-0">
              <Mic className="w-6 h-6" />
           </div>
           <div className="flex flex-col">
              <span className="font-headline font-bold text-gray-900 text-lg">Record Voice Note</span>
              <span className="text-gray-500 text-sm font-medium">Speak naturally, we'll transcribe</span>
           </div>
        </Link>

        <Link href="/caregiver/add-memory/media" className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-5 active:bg-gray-50 transition-transform active:scale-[0.98]">
           <div className="bg-blue-50 text-blue-600 rounded-2xl w-14 h-14 flex items-center justify-center shrink-0">
              <Camera className="w-6 h-6" />
           </div>
           <div className="flex flex-col">
              <span className="font-headline font-bold text-gray-900 text-lg">Photo or Video</span>
              <span className="text-gray-500 text-sm font-medium">Upload from your camera roll</span>
           </div>
        </Link>

        <Link href="/caregiver/add-memory/audio" className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-5 active:bg-gray-50 transition-transform active:scale-[0.98]">
           <div className="bg-pink-50 text-pink-600 rounded-2xl w-14 h-14 flex items-center justify-center shrink-0">
              <Music className="w-6 h-6" />
           </div>
           <div className="flex flex-col">
              <span className="font-headline font-bold text-gray-900 text-lg">Favorite Song</span>
              <span className="text-gray-500 text-sm font-medium">Link a Spotify or Apple Music track</span>
           </div>
        </Link>

        <Link href="/caregiver/add-memory/text" className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-5 active:bg-gray-50 transition-transform active:scale-[0.98]">
           <div className="bg-gray-100 text-gray-600 rounded-2xl w-14 h-14 flex items-center justify-center shrink-0">
              <Type className="w-6 h-6" />
           </div>
           <div className="flex flex-col">
              <span className="font-headline font-bold text-gray-900 text-lg">Write a Story</span>
              <span className="text-gray-500 text-sm font-medium">Type out a detailed context</span>
           </div>
        </Link>
      </section>
    </div>
  );
}
