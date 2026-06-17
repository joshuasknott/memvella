'use client';

import { StaticPageLayout } from '@/components/layout/StaticPageLayout';
import { useState } from 'react';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const inputBase =
    'w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-text-primary placeholder:text-text-muted shadow-sm transition focus:border-family-primary focus:outline-none focus:ring-2 focus:ring-family-primary/20 disabled:opacity-60';

export default function ContactPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<FormStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setError(null);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message }),
            });

            if (!res.ok) throw new Error('Something went wrong. Please try again.');

            setStatus('success');
        } catch (err) {
            setStatus('error');
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        }
    };

    return (
        <StaticPageLayout title="Contact Us">
            <p>
                We&apos;re a small team building something we care deeply about. Whether
                you&apos;re a family member exploring options for a parent, have questions
                about how Memvella works, or just want to say hello - we&apos;d love to
                hear from you. A real person will get back to you.
            </p>

            {/* Contact form: not-prose escapes Tailwind Typography's input overrides. */}
            <div className="not-prose mt-10">
                {status === 'success' ? (
                    <div className="rounded-2xl border border-status-success/30 bg-status-success/10 px-6 py-8 text-center">
                        <p className="text-lg font-semibold text-status-success">Message received - thank you.</p>
                        <p className="mt-1 text-sm text-status-success">We&apos;ll get back to you as soon as we can.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                        {/* Name */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="contact-name" className="text-sm font-semibold text-text-secondary">
                                Your name
                            </label>
                            <input
                                id="contact-name"
                                type="text"
                                placeholder="Jane Smith"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                disabled={status === 'loading'}
                                className={inputBase}
                            />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="contact-email" className="text-sm font-semibold text-text-secondary">
                                Email address
                            </label>
                            <input
                                id="contact-email"
                                type="email"
                                placeholder="jane@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={status === 'loading'}
                                className={inputBase}
                            />
                        </div>

                        {/* Message */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="contact-message" className="text-sm font-semibold text-text-secondary">
                                Message
                            </label>
                            <textarea
                                id="contact-message"
                                rows={5}
                                placeholder="Tell us what's on your mind..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                disabled={status === 'loading'}
                                className={`${inputBase} resize-none`}
                            />
                        </div>

                        {/* API error */}
                        {status === 'error' && error && (
                            <p className="text-sm text-status-alert">{error}</p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="inline-flex h-14 w-full items-center justify-center rounded-full bg-family-primary px-10 text-base font-bold text-white shadow-md transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-70 disabled:active:scale-100 sm:w-auto"
                        >
                            {status === 'loading' ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                                    Sending...
                                </span>
                            ) : (
                                'Send Message'
                            )}
                        </button>
                    </form>
                )}
            </div>

            {/* Fallback direct contacts */}
            <h2>Prefer email?</h2>
            <p>
                General enquiries:{' '}
                <a href="mailto:hello@memvella.com">hello@memvella.com</a>
            </p>
            <p>
                Privacy concerns:{' '}
                <a href="mailto:privacy@memvella.com">privacy@memvella.com</a>
            </p>
        </StaticPageLayout>
    );
}
