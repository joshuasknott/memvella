"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function CaregiverSetupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [lovedOneName, setLovedOneName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // 1. Create the Better Auth account
      const { data, error: signUpError } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (signUpError) {
        setError(signUpError.message ?? 'Sign-up failed. Please try again.');
        return;
      }

      // 2. Persist lovedOneName to localStorage so the dashboard can read it
      //    on first load. A dedicated "createCaregiverProfile" mutation can
      //    persist it to Convex once the auth session JWT is fully established.
      if (lovedOneName.trim()) {
        localStorage.setItem('memvella_lovedOneName', lovedOneName.trim());
      }

      // 3. Redirect to the caregiver dashboard
      router.push('/caregiver');
    } catch (err) {
      console.error('Sign-up error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 px-6 py-12 font-body text-gray-900">
      <div className="max-w-md w-full mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#4e0078] font-medium mb-6 hover:opacity-80 transition-opacity">
          <ArrowLeft size={24} /> Back
        </button>

        <div className="space-y-8">
          <div>
            <h1 className="font-headline text-4xl font-extrabold tracking-tight mb-2 text-[#4e0078]">Caregiver Setup</h1>
            <p className="text-gray-500 text-lg">Let&apos;s create your account to support your loved one.</p>
          </div>

          <form className="space-y-6 flex flex-col" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="font-headline font-bold text-lg" htmlFor="name">What is your name?</label>
              <input
                id="name"
                type="text"
                placeholder="e.g., Sarah"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="appearance-none w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="font-headline font-bold text-lg" htmlFor="loved_one">Who are we supporting today?</label>
              <input
                id="loved_one"
                type="text"
                placeholder="e.g., Mom, or David"
                value={lovedOneName}
                onChange={(e) => setLovedOneName(e.target.value)}
                className="appearance-none w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
              />
              <p className="text-xs text-gray-400 px-1">Optional — you can add this later from your dashboard.</p>
            </div>

            <div className="space-y-2">
              <label className="font-headline font-bold text-lg" htmlFor="email">Your Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="hello@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="appearance-none w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="font-headline font-bold text-lg" htmlFor="password">Create a Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="appearance-none w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
              />
              <p className="text-xs text-gray-400 px-1">Minimum 8 characters.</p>
            </div>

            {/* Inline error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                <p className="text-red-600 font-medium text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#4e0078] text-white rounded-2xl py-4 font-semibold text-lg mt-10 hover:bg-[#3d005e] active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account…
                </>
              ) : (
                'Create Caregiver Account'
              )}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/caregiver/signin" className="text-[#4e0078] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
