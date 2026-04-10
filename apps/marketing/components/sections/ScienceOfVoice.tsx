import { FadeIn } from "@/components/ui/FadeIn";

const pillars = [
  {
    title: "Zero Cognitive Friction",
    body: "No passwords to remember. No menus to decipher. No tiny keyboards to fumble with. Voice removes the barriers that make everyday technology feel like a test—so the person using it can focus on their day, not the device.",
  },
  {
    title: "Preserved Dignity",
    body: "When someone can still manage their own morning routine, set their own reminders, and tell their own stories, they stay connected to who they are. Memvella keeps those independent rhythms intact—because autonomy isn't a feature, it's the whole point.",
  },
  {
    title: "Family Peace of Mind",
    body: "Everyone in the Circle sees the same context—routines, updates, moments worth remembering—without a single group text. Less second-guessing, fewer frantic calls, and more room to just be family again.",
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
                    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
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
