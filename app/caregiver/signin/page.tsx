"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function CaregiverSignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const { data, error: signInError } = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message ?? 'Sign-in failed. Please check your credentials.');
        return;
      }

      router.push('/caregiver');
    } catch (err) {
      console.error('Sign-in error:', err);
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
            <h1 className="font-headline text-4xl font-extrabold tracking-tight mb-2 text-[#4e0078]">Welcome Back</h1>
            <p className="text-gray-500 text-lg">Sign in to your caregiver account to continue.</p>
          </div>

          <form className="space-y-6 flex flex-col" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="font-headline font-bold text-lg" htmlFor="email">Email Address</label>
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
              <label className="font-headline font-bold text-lg" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none w-full h-14 px-5 bg-white border border-gray-200 rounded-2xl text-lg font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
              />
            </div>

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
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <p className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/onboarding/caregiver" className="text-[#4e0078] font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
