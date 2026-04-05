import Link from "next/link";
import { MarketingShell } from "@/components/site/MarketingShell";

const experienceSections = [
  {
    title: "Organiser workspace",
    body: "Phone-first, high-context, and optimized for setup, pairing, routines, memories, alerts, and invitations.",
  },
  {
    title: "Member workspace",
    body: "Uses the same Circle context for shared contribution while keeping organiser-only controls separate.",
  },
  {
    title: "Tablet User device flow",
    body: "Pairs through a 6-digit code and then stays anchored around time, date, routines, and familiar content.",
  },
  {
    title: "Independent User access",
    body: "Signs in with SMS and can add Face ID or Touch ID on the same device for faster return visits.",
  },
];

export default function ExperiencePage() {
  return (
    <MarketingShell activePage="experience">
      <main className="px-6 py-20 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-700">
            Product Experience
          </p>
          <h1 className="mt-4 max-w-4xl font-headline text-5xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            The product is built around the Circle and the senior profile, not around disconnected screens.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600">
            Every route exists to lower friction: quicker family-side coordination, clearer senior orientation, and voice flows that feel deliberate instead of chaotic.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {experienceSections.map((section) => (
              <section key={section.title} className="rounded-[30px] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <h2 className="font-headline text-3xl font-bold text-slate-900">
                  {section.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  {section.body}
                </p>
              </section>
            ))}
          </div>

          <section className="mt-12 rounded-[36px] bg-[#1f1033] p-10 text-white shadow-[0_24px_80px_rgba(31,16,51,0.28)]">
            <h2 className="font-headline text-4xl font-extrabold tracking-tight">
              Current onboarding paths
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-white/10 p-6">
                <h3 className="text-2xl font-bold">Family-side</h3>
                <p className="mt-3 text-base leading-relaxed text-purple-100">
                  Start a new Circle as an Organiser, or join an existing Circle as a Member with a 6-digit invite code.
                </p>
              </div>
              <div className="rounded-[24px] bg-white/10 p-6">
                <h3 className="text-2xl font-bold">Senior-side</h3>
                <p className="mt-3 text-base leading-relaxed text-purple-100">
                  Pair a tablet through the Organiser, or let an Independent User sign in with SMS and enable biometrics for future access.
                </p>
              </div>
            </div>
            <Link
              href="/waitlist"
              className="mt-8 inline-flex min-h-[60px] items-center justify-center rounded-full bg-white px-7 text-base font-semibold text-[#1f1033] shadow-sm transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              Join the Waitlist
            </Link>
          </section>
        </div>
      </main>
    </MarketingShell>
  );
}
