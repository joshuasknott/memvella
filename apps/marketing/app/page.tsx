import { ArrowRight, MessageCircleHeart, Sparkles, TabletSmartphone, Users } from "lucide-react";
import Link from "next/link";
import { MarketingShell } from "@/components/site/MarketingShell";

const roleCards = [
  {
    title: "Organiser",
    body: "Create the Circle, add routines and memories, pair the tablet, and keep the day on track from your phone.",
  },
  {
    title: "Member",
    body: "Join an existing Circle to help with routines, memories, and shared family context without needing organiser-level controls.",
  },
  {
    title: "Tablet User",
    body: "Use a paired device with a calm, voice-led experience anchored around time, routines, and familiar memories.",
  },
  {
    title: "Independent User",
    body: "Sign in with SMS, then optionally enable Face ID or Touch ID for faster access on the same device.",
  },
];

export default function MarketingHomePage() {
  return (
    <MarketingShell activePage="home">
      <main>
        <section className="relative overflow-hidden px-6 py-20 md:px-8 md:py-28">
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-purple-200/50 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-pink-200/40 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-purple-900 shadow-sm">
                <Sparkles className="h-4 w-4" />
                Voice-first orientation, routines, and memories
              </p>
              <h1 className="max-w-4xl font-headline text-5xl font-extrabold tracking-tight text-slate-950 md:text-7xl">
                A digital wellness companion built for the Circle around a senior, not around admin overhead.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
                Memvella keeps the senior-facing experience simple, gives family a shared operational surface, and makes voice the easiest way to create and recall what matters.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/waitlist"
                  className="inline-flex min-h-[64px] items-center justify-center rounded-full bg-[#6B21A8] px-8 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  Request Early Access
                </Link>
                <Link
                  href="/experience"
                  className="inline-flex min-h-[64px] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 text-base font-semibold text-slate-800 shadow-sm transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  Explore the Experience
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[32px] bg-white p-6 shadow-[0_20px_60px_rgba(76,29,149,0.12)]">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-900">
                  <MessageCircleHeart className="h-7 w-7" />
                </div>
                <h2 className="font-headline text-2xl font-bold text-slate-900">
                  Calm senior-side voice loops
                </h2>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  One primary action at a time, explicit confirmations, and orientation anchors that stay legible on tablets and phones.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[28px] bg-[#1f1033] p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                  <Users className="h-7 w-7 text-purple-200" />
                  <h2 className="mt-4 font-headline text-2xl font-bold">
                    Shared family workspace
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-purple-100/90">
                    Organisers and Members work from the same Circle context while permissions stay explicit.
                  </p>
                </div>
                <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.1)]">
                  <TabletSmartphone className="h-7 w-7 text-[#6B21A8]" />
                  <h2 className="mt-4 font-headline text-2xl font-bold text-slate-900">
                    No new hardware story
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Pair a tablet, or let an independent user start with SMS and optional biometrics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 pb-20 md:px-8 md:pb-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-700">
                Four connected roles
              </p>
              <h2 className="mt-3 font-headline text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
                One product, four clear experiences.
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {roleCards.map((card) => (
                <article key={card.title} className="rounded-[28px] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                  <h3 className="font-headline text-2xl font-bold text-slate-900">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-slate-600">
                    {card.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-20 md:px-8 md:pb-28">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
            <article className="rounded-[32px] bg-white p-8 shadow-[0_20px_60px_rgba(76,29,149,0.1)]">
              <h3 className="font-headline text-3xl font-bold text-slate-900">
                Voice stays primary
              </h3>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Independent and tablet experiences are designed around spoken creation, low-friction confirmations, and explicit rejection states when AI drafts something incorrectly.
              </p>
            </article>
            <article className="rounded-[32px] bg-white p-8 shadow-[0_20px_60px_rgba(76,29,149,0.1)]">
              <h3 className="font-headline text-3xl font-bold text-slate-900">
                Permissions stay real
              </h3>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Members can contribute to the Circle, but organiser-only controls stay separate for invites, tablet pairing, and circle-wide operational settings.
              </p>
            </article>
            <article className="rounded-[32px] bg-white p-8 shadow-[0_20px_60px_rgba(76,29,149,0.1)]">
              <h3 className="font-headline text-3xl font-bold text-slate-900">
                Onboarding meets the moment
              </h3>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Start a new Circle, join an existing one, pair a tablet, or sign in independently with SMS and optional biometrics on the same device.
              </p>
            </article>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
