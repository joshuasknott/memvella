"use client";

import { User, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AccountSettingsPage() {
  const router = useRouter();
  const lovedOneName = "your loved one"; // TODO: wire to Convex profile

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
            defaultValue={`${lovedOneName}'s Caregiver`}
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

      <button 
        className="w-full bg-[#4e0078] text-white rounded-2xl py-4 font-semibold text-lg mt-10 hover:bg-[#3d005e] active:scale-95 transition-all shadow-sm"
      >
        Update Account Details
      </button>
    </div>
  );
}
