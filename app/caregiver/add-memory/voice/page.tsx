"use client";

import { Mic } from 'lucide-react';

export default function VoiceMemoryPage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 w-full flex-1">
       <div className="flex flex-col items-center justify-center w-full">
         <button className="bg-purple-100 text-purple-600 rounded-full p-8 shadow-sm animate-pulse mb-6">
           <Mic size={48} />
         </button>
         <h2 className="text-2xl font-bold text-gray-900 mb-2">Tap to dictate a memory.</h2>
         <p className="text-gray-500 text-center max-w-xs">
           Speak naturally. Memvella will automatically transcribe and format your story.
         </p>
       </div>
    </div>
  );
}
