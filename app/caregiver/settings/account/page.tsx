"use client";

import { User } from 'lucide-react';

export default function AccountSettingsPage() {
  return (
    <div className="flex flex-col gap-6 px-4 w-full">
      <div className="flex flex-col items-center mb-2">
         <div className="w-20 h-20 bg-gray-100 rounded-full flex flex-col items-center justify-center mb-4 border border-gray-200">
           <User className="w-8 h-8 text-gray-400" />
         </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="font-headline font-semibold text-sm text-gray-700">Your Name</label>
          <input 
            type="text" 
            defaultValue="Emily's Caregiver"
            className="w-full h-14 px-4 bg-white border border-gray-200 rounded-xl text-base font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
          />
        </div>

        <div className="space-y-2">
          <label className="font-headline font-semibold text-sm text-gray-700">Email Address</label>
          <input 
            type="email" 
            defaultValue="hello@example.com"
            className="w-full h-14 px-4 bg-white border border-gray-200 rounded-xl text-base font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" 
          />
        </div>
      </div>

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-6 pb-8 pt-4 bg-linear-to-t from-surface via-surface/90 to-transparent z-40">
        <button 
          className="w-full h-14 rounded-full bg-primary text-white font-headline font-bold text-lg shadow-xl shadow-primary/20 flex items-center justify-center active:scale-95 transition-all"
        >
          Save Changes
        </button>
      </footer>
    </div>
  );
}
