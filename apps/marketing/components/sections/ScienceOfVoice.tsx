import { FadeIn } from "@/components/ui/FadeIn";

const pillars = [
  {
    title: "Zero Cognitive Friction",
    body: "No passwords to remember. No menus to decipher. No tiny keyboards to fumble with. Voice removes the barriers that make everyday technology feel like a test—so the person using it can focus on their day, not the device.",
    icon: (
      // Brain — mental clarity
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66Z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66Z" />
      </svg>
    ),
  },
  {
    title: "Preserved Dignity",
    body: "When someone can still manage their own morning routine, set their own reminders, and tell their own stories, they stay connected to who they are. Memvella keeps those independent rhythms intact—because autonomy isn't a feature, it's the whole point.",
    icon: (
      // Heart — individual care and autonomy
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    title: "Family Peace of Mind",
    body: "Everyone in the Circle sees the same context—routines, updates, moments worth remembering—without a single group text. Less second-guessing, fewer frantic calls, and more room to just be family again.",
    icon: (
      // Users — the family Circle
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export function ScienceOfVoice() {
  return (
    <section id="science-of-voice" className="bg-white py-32 lg:py-48">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn>
          <div className="mb-20 max-w-3xl">
            <p className="text-base font-extrabold tracking-widest text-slate-600 uppercase">
              The Science of Voice
            </p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold tracking-tighter text-slate-900 md:text-5xl text-balance leading-[1.05]">
              The most natural interface is the one they already know.
            </h2>
            <p className="mt-6 text-xl leading-relaxed text-slate-600">
              Voice isn&apos;t a novelty—it&apos;s how humans have communicated for millennia. Memvella is built on that instinct.
            </p>
          </div>
        </FadeIn>

        <div className="grid gap-12 md:grid-cols-3 lg:gap-16">
          {pillars.map((pillar, i) => (
            <FadeIn key={pillar.title} delay={i * 100}>
              <div className="flex flex-col gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                  {pillar.icon}
                </div>
                <div>
                  <h3 className="font-headline text-xl font-extrabold tracking-tighter text-slate-900 leading-[1.05]">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-slate-600">
                    {pillar.body}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
