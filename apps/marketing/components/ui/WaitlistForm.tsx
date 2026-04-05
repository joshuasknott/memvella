'use client';

import React, { useState } from 'react';

export default function WaitlistForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        setMessage(null);

        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    sourcePath: window.location.pathname,
                }),
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
            <div className="bg-surface-container-high p-6 rounded-[40px] flex items-center justify-center shadow-ambient animate-in fade-in zoom-in duration-500">
                <p className="text-xl font-bold text-primary">{message}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="relative bg-surface-container-low p-2 rounded-[40px] flex flex-col md:flex-row items-center shadow-ambient transition-all hover:bg-surface-container-high group">
            <input
                className="bg-transparent border-none focus:ring-0 px-8 py-6 w-full text-lg placeholder:text-zinc-400 font-medium text-on-surface" 
                id="waitlist-email" 
                placeholder="Enter your email address" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === 'loading'}
            />
            <button 
                type="submit"
                disabled={status === 'loading'}
                className="w-full md:w-auto whitespace-nowrap bg-gradient-to-br from-primary-container to-primary text-white font-bold h-[72px] px-12 rounded-full transition-all focus:scale-95 active:scale-95 hover:shadow-xl disabled:opacity-75 disabled:active:scale-100 flex items-center justify-center"
            >
                {status === 'loading' ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    "Request Early Access"
                )}
            </button>
            {status === 'error' && message ? (
                <p className="w-full px-6 pb-4 pt-1 text-center text-sm font-medium text-red-600 md:absolute md:translate-y-[96px]">
                    {message}
                </p>
            ) : null}
        </form>
    );
}
