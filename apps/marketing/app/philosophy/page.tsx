import Link from "next/link";
import { MarketingShell } from "@/components/site/MarketingShell";

const principles = [
  {
    title: "Preserve dignity",
    body: "Senior-facing flows should stay cognitively light, direct, and calm. Voice should reduce effort, not add ceremony.",
  },
  {
    title: "Keep the Circle operational",
    body: "Family coordination should feel fast on a phone. The product should expose shared context without turning every user into an administrator.",
  },
  {
    title: "Avoid fake certainty",
    body: "Memvella is not a medical device. Product copy should stay concrete, believable, and anchored in real shipped behavior.",
  },
  {
    title: "Use one vocabulary",
    body: "Organiser, Member, Tablet User, Independent User, and Circle are the active product terms. They should stay aligned across UI, docs, and marketing.",
  },
];

export default function PhilosophyPage() {
  return (
    <MarketingShell activePage="philosophy">
      <main className="px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-700">
            Product Philosophy
          </p>
          <h1 className="mt-4 max-w-4xl font-headline text-5xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            Product truth comes before flourish.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600">
            The product is meant to feel warm and humane without becoming vague. Every interaction should reduce friction, preserve orientation, and keep family coordination grounded in what is actually happening.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {principles.map((principle) => (
              <section key={principle.title} className="rounded-[30px] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <h2 className="font-headline text-3xl font-bold text-slate-900">
                  {principle.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  {principle.body}
                </p>
              </section>
            ))}
          </div>

          <section className="mt-12 rounded-[36px] border border-purple-100 bg-white p-10 shadow-[0_20px_60px_rgba(76,29,149,0.08)]">
            <h2 className="font-headline text-4xl font-extrabold tracking-tight text-slate-950">
              The standard for shipping
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
              No placeholder routes, no draft claims about unsupported flows, and no parallel naming for the same concept. When the product changes, the docs and marketing surface should change with it.
            </p>
            <Link
              href="/waitlist"
              className="mt-8 inline-flex min-h-[60px] items-center justify-center rounded-full bg-[#6B21A8] px-7 text-base font-semibold text-white shadow-sm transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              Request Early Access
            </Link>
          </section>
        </div>
      </main>
    </MarketingShell>
  );
}
