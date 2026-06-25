'use client';

import React, { useState } from 'react';
import { normalizeWaitlistEmail } from '@/lib/waitlist-submission';

export default function WaitlistForm() {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string | null>(null);

    function validateEmail(value: string): boolean {
        if (!normalizeWaitlistEmail(value)) {
            setEmailError('Please enter a valid email address.');
            return false;
        }
        setEmailError(null);
        return true;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (emailError) validateEmail(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateEmail(email)) return;

        setStatus('loading');
        setMessage(null);

        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, sourcePath: window.location.pathname }),
            });
            const payload = (await response.json()) as {
                status?: 'joined' | 'already_joined' | 'rejoined';
                error?: string;
            };

            if (!response.ok) {
                throw new Error(payload.error ?? 'Memvella could not save your request.');
            }

            setStatus('success');
            setMessage(
                payload.status === 'already_joined'
                    ? 'This email is already on the waitlist. We will be in touch when access opens.'
                    : 'You are on the waitlist. We will reach out when new access opens.'
            );
        } catch (error) {
            setStatus('error');
            setMessage(error instanceof Error ? error.message : 'Memvella could not save your request.');
        }
    };

    if (status === 'success') {
        return (
            <div className="p-6 rounded-[40px] flex items-center justify-center bg-surface-inverse-muted border border-border-inverse">
                <p className="text-xl font-bold text-white text-center">{message}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <form
                noValidate
                onSubmit={handleSubmit}
                className="relative p-2 rounded-[40px] flex flex-col md:flex-row items-center bg-surface-inverse-muted border border-border-inverse transition-all hover:border-text-tertiary group"
            >
                <label htmlFor="waitlist-email" className="sr-only">
                    Email address
                </label>
                <input
                    id="waitlist-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={handleChange}
                    disabled={status === 'loading'}
                    aria-invalid={emailError ? 'true' : 'false'}
                    aria-describedby={emailError ? 'waitlist-email-error' : undefined}
                    className="bg-transparent border-none focus:ring-0 px-8 py-6 w-full text-lg placeholder:text-text-tertiary font-medium text-white"
                />
                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full md:w-auto whitespace-nowrap bg-family-primary hover:shadow-xl text-white font-bold h-[72px] px-12 rounded-full transition-all focus:scale-95 active:scale-95 disabled:opacity-75 disabled:active:scale-100 flex items-center justify-center"
                >
                    <div aria-live="polite" aria-atomic="true" className="flex items-center justify-center">
                        {status === 'loading' ? (
                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" aria-label="Submitting, please wait" role="status" />
                        ) : (
                            'Request early access'
                        )}
                    </div>
                </button>
            </form>

            {/* Validation error below the pill. */}
            {emailError && (
                <p id="waitlist-email-error" className="text-sm text-status-alert mt-2 px-4">
                    {emailError}
                </p>
            )}

            {/* API error below the pill. */}
            {status === 'error' && message && (
                <p className="text-sm text-status-alert mt-2 px-4">{message}</p>
            )}
        </div>
    );
}
