import { FadeIn } from "@/components/ui/FadeIn";

const rows = [
  {
    label: "Independent User",
    headline: "Maintain independence with a voice-first companion.",
    body: "Designed for self-managed seniors. Secure, passwordless entry using Passkeys ensures frustration-free access to daily routines and voice-led memory recall. No complex setup required to get started.",
    lifestyleAlt: "Lifestyle Photo: Senior smiling, at ease at home",
    uiSnippet: "Got it, saved to today's memory timeline.",
    uiLabel: "UI Component: Voice confirmation",
    imagePosition: "right" as const,
    imageAspect: "aspect-[4/3]",
    imageWrapper: "w-full",
    cardCorner: "-bottom-4 -right-4",
  },
  {
    label: "The Family Circle",
    headline: "Coordinate without the overhead.",
    body: "For seniors needing more support, pair a tablet to create a calm, assisted surface. The family Circle manages routines, memories, and alerts from their own phones—sharing context without turning everyone into an administrator.",
    lifestyleAlt: "Lifestyle Photo: Family member checking phone, reassured",
    uiSnippet: "Dad's Heart Medication — 9:00 AM",
    uiLabel: "UI Component: Routine reminder card",
    imagePosition: "left" as const,
    imageAspect: "aspect-[9/16] lg:aspect-[3/4]",
    imageWrapper: "max-w-sm lg:max-w-md mx-auto w-full",
    cardCorner: "-bottom-4 -left-4",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#f5f5f7] py-32 lg:py-48">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Left-anchored section header */}
        <FadeIn>
          <div className="mb-24 max-w-3xl">
            <p className="text-base font-extrabold tracking-widest text-slate-600 uppercase">
              How it Works
            </p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold tracking-tighter text-slate-900 md:text-5xl text-balance leading-[1.05]">
              Two paths to care. One cohesive experience.
            </h2>
            <p className="mt-6 text-xl leading-relaxed text-slate-600">
              Memvella is built around two primary senior experiences, both designed to feel calm and grounded in familiar rhythms.
            </p>
          </div>
        </FadeIn>

        {/* Alternating rows */}
        <div className="flex flex-col gap-24 lg:gap-40">
          {rows.map((row) => (
            <div
              key={row.label}
              className={`grid items-center gap-16 lg:grid-cols-12 lg:gap-24 xl:gap-32 ${
                row.imagePosition === "left" ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              {/* Text — narrow column */}
              <FadeIn className="lg:col-span-5" delay={100}>
                <p className="mb-4 text-base font-extrabold tracking-widest text-slate-600 uppercase">
                  {row.label}
                </p>
                <h3 className="font-headline text-3xl font-extrabold tracking-tighter text-slate-900 md:text-4xl text-balance leading-[1.05]">
                  {row.headline}
                </h3>
                <p className="mt-6 text-lg leading-relaxed text-slate-600">
                  {row.body}
                </p>
              </FadeIn>

              {/* Composite placeholder — lifestyle base + glass UI card overlay */}
              <FadeIn className={`lg:col-span-7 ${row.imageWrapper}`} delay={200}>
                <div className={`${row.imageAspect} relative w-full`}>
                  {/* Base layer: lifestyle photo placeholder */}
                  <div
                    className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[2.5rem] border-[12px] border-white bg-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] lg:rounded-[3rem]"
                    role="img"
                    aria-label={row.lifestyleAlt}
                  >
                    <p className="px-6 text-center text-sm font-medium text-slate-400">
                      {row.lifestyleAlt}
                    </p>
                  </div>

                  {/* Overlay layer: glass UI card */}
                  <div
                    className={`absolute ${row.cardCorner} z-10 w-[75%] max-w-sm rounded-2xl border border-white/60 bg-white/80 p-5 shadow-2xl backdrop-blur-2xl`}
                    aria-label={row.uiLabel}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-purple-500" aria-hidden="true" />
                      <span className="text-xs font-semibold uppercase tracking-widest text-purple-600">
                        Memvella
                      </span>
                    </div>
                    <p className="text-sm font-semibold leading-snug text-slate-900">
                      {row.uiSnippet}
                    </p>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full w-2/3 rounded-full bg-purple-500" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
