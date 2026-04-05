import WaitlistForm from "@/components/ui/WaitlistForm";
import { MarketingShell } from "@/components/site/MarketingShell";

export default function WaitlistPage() {
  return (
    <MarketingShell activePage="waitlist">
      <main className="px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-700">
              Private Access
            </p>
            <h1 className="mt-4 font-headline text-5xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
              Join the waitlist for early Memvella access.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              We are opening access in controlled waves so we can keep the product stable while family-side coordination, tablet pairing, SMS onboarding, and biometric return flows continue to mature together.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <h2 className="font-headline text-2xl font-bold text-slate-900">
                  What you are joining
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  A voice-first Circle product designed around routines, memories, shared context, and low-friction senior access.
                </p>
              </div>
              <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <h2 className="font-headline text-2xl font-bold text-slate-900">
                  What happens next
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  We save your email, dedupe repeat requests, and contact you when new access opens.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[36px] bg-white p-8 shadow-[0_24px_80px_rgba(76,29,149,0.12)] md:p-10">
            <h2 className="font-headline text-3xl font-extrabold tracking-tight text-slate-950">
              Request Early Access
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Leave your email and we will contact you when the next access wave opens.
            </p>
            <div className="mt-8">
              <WaitlistForm />
            </div>
            <p className="mt-6 text-sm font-medium text-slate-500">
              Returning visitors can submit the same email again without creating duplicate waitlist entries.
            </p>
          </section>
        </div>
      </main>
    </MarketingShell>
  );
}
