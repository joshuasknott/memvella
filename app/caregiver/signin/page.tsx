"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { PrimaryButton } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/Input';
import { FormCard } from '@/components/ui/FormCard';

export default function CaregiverSignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') ?? '/caregiver';

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

      router.push(nextPath);
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface px-6 py-8 md:py-12 font-body text-gray-900 overflow-hidden relative selection:bg-[#4e0078]/20">
      
      {/* Soft gradient blur background for premium feel */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#4e0078]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[#7a2e9e]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col flex-1">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-[#4e0078] font-semibold hover:opacity-80 transition-opacity mb-8 self-start w-fit"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} /> Back
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
          <div className="space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1a1a1a] text-center mb-2 font-headline">Welcome Back</h1>
            <p className="text-on-surface-variant text-lg text-center mx-auto max-w-sm mb-6">Sign in to your organizer account to continue.</p>
          </div>

          <FormCard as="form" className="space-y-6 flex flex-col" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="font-headline font-bold text-lg" htmlFor="email">Email Address</label>
              <TextInput
                id="email"
                type="email"
                placeholder="hello@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-headline font-bold text-lg" htmlFor="password">Password</label>
              <TextInput
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
                <p className="text-red-600 font-medium text-sm">{error}</p>
              </div>
            )}

            <PrimaryButton
              type="submit"
              disabled={isSubmitting}
              className="mt-10"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </PrimaryButton>

            <p className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/onboarding/caregiver" className="text-[#4e0078] font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </FormCard>
        </div>
      </div>
      </div>
    </div>
  );
}
