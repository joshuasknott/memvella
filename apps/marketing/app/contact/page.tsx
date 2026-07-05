import { StaticPageLayout } from '@/components/layout/StaticPageLayout';

const inputBase =
    'w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-text-primary placeholder:text-text-muted shadow-sm transition focus:border-family-primary focus:outline-none focus:ring-2 focus:ring-family-primary/20 disabled:opacity-60';

const CONTACT_EMAIL = 'hello@memvella.com';

export default function ContactPage() {
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
                <form
                    action={`mailto:${CONTACT_EMAIL}`}
                    method="get"
                    encType="text/plain"
                    className="flex flex-col gap-5"
                >
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="contact-name" className="text-sm font-semibold text-text-secondary">
                            Your name
                        </label>
                        <input
                            id="contact-name"
                            name="name"
                            type="text"
                            placeholder="Jane Smith"
                            required
                            className={inputBase}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="contact-email" className="text-sm font-semibold text-text-secondary">
                            Email address
                        </label>
                        <input
                            id="contact-email"
                            name="email"
                            type="email"
                            placeholder="jane@example.com"
                            required
                            className={inputBase}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="contact-message" className="text-sm font-semibold text-text-secondary">
                            Message
                        </label>
                        <textarea
                            id="contact-message"
                            name="body"
                            rows={5}
                            placeholder="Tell us what's on your mind..."
                            required
                            className={`${inputBase} resize-none`}
                        />
                    </div>

                    <p className="text-sm text-text-tertiary">
                        This opens your email app so you can send the message directly.
                    </p>

                    <button
                        type="submit"
                        className="inline-flex h-14 w-full items-center justify-center rounded-full bg-family-primary px-10 text-base font-bold text-white shadow-md transition-all hover:scale-[1.01] active:scale-95 sm:w-auto"
                    >
                        Send email
                    </button>
                </form>
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
