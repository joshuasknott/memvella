"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function IndependentSetupPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 px-6 py-12 font-body text-gray-900">
      <div className="max-w-md w-full mx-auto">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-[#4e0078] font-medium mb-6 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={24} /> Back
        </button>

        <div className="mb-8">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight mb-2 text-[#4e0078]">
            Set up your Memvella account.
          </h1>
          <p className="text-gray-500 text-lg">Create an account to start managing routines and memories.</p>
        </div>

        <form className="space-y-6 flex flex-col" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <label className="font-headline font-medium text-lg text-gray-700" htmlFor="name">What is your name?</label>
            <input 
              id="name" 
              type="text" 
              placeholder="e.g., David" 
              className="appearance-none w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="font-headline font-medium text-lg text-gray-700" htmlFor="email">Your Email Address</label>
            <input 
              id="email" 
              type="email" 
              placeholder="hello@example.com" 
              className="appearance-none w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none" 
            />
          </div>

          <div className="space-y-2">
            <label className="font-headline font-medium text-lg text-gray-700" htmlFor="password">Create a Password</label>
            <input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              className="appearance-none w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none" 
            />
          </div>

          <Link href="/senior" className="w-full bg-[#4e0078] text-white rounded-2xl py-4 font-semibold text-lg mt-10 hover:bg-[#3d005e] active:scale-95 transition-all shadow-sm flex items-center justify-center">
            Create My Account
          </Link>
        </form>
      </div>
    </div>
  );
}
