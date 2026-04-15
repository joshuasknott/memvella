import { FadeIn } from "@/components/ui/FadeIn";

const cards = [
  {
    label: "For Your Loved One",
    headline: "Their day, their voice, their pace.",
    bullets: [
      "Just say \"good morning\". No screens, no menus, no learning curve.",
      "Routines, reminders, and familiar stories delivered through calm conversation.",
      "Works the same way every single day. No surprises, no confusion.",
    ],
    imageAlt: "Senior comfortably using voice assistant at home",
    uiSnippet: "\"Good morning, Margaret. Here's what's on for today.\"",
    imagePosition: "right" as const,
    imageAspect: "aspect-[4/3]",
    imageWrapper: "w-full",
  },
  {
    label: "For Your Family",
    headline: "Everyone on the same page. Finally.",
    bullets: [
      "See at a glance that they're safe, settled, and on track for the day.",
      "Get quiet updates without making another phone call.",
      "Share the caregiving load across siblings, partners, and friends.",
    ],
    imageAlt: "Family member checking Memvella updates on their phone",
    uiSnippet: "Dad's morning check-in — completed at 9:12 AM",
    imagePosition: "left" as const,
    imageAspect: "aspect-[9/16] lg:aspect-[3/4]",
    imageWrapper: "max-w-sm lg:max-w-md mx-auto w-full",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface-muted py-32 lg:py-48">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Section header */}
        <FadeIn>
          <div className="mb-24 max-w-3xl">
            <p className="text-base font-extrabold tracking-widest text-text-secondary uppercase">
              How it Works
            </p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold tracking-tighter text-text-primary md:text-5xl text-balance leading-[1.05]">
              Built for two people. The one who needs it, and the one who worries.
            </h2>
          </div>
        </FadeIn>

        {/* Two-path cards */}
        <div className="flex flex-col gap-24 lg:gap-40">
          {cards.map((card) => (
            <div
              key={card.label}
              className={`grid items-center gap-16 lg:grid-cols-12 lg:gap-24 xl:gap-32 ${
                card.imagePosition === "left" ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              {/* Text column */}
              <FadeIn className="lg:col-span-5" delay={100}>
                <p className="mb-4 text-base font-extrabold tracking-widest text-text-secondary uppercase">
                  {card.label}
                </p>
                <h3 className="font-headline text-3xl font-extrabold tracking-tighter text-text-primary md:text-4xl text-balance leading-[1.05]">
                  {card.headline}
                </h3>
                <ul className="mt-6 space-y-4">
                  {card.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-3 text-lg leading-relaxed text-text-secondary"
                    >
                      <span className="mt-1.5 block h-2 w-2 shrink-0 rounded-full bg-family-muted" aria-hidden="true" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </FadeIn>

              {/* Image placeholder with glass UI card overlay */}
              <FadeIn className={`lg:col-span-7 ${card.imageWrapper}`} delay={200}>
                <div className={`${card.imageAspect} relative w-full`}>
                  <div
                    className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[2.5rem] border-[12px] border-white bg-surface-muted shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] lg:rounded-[3rem]"
                    role="img"
                    aria-label={card.imageAlt}
                  >
                    <p className="px-6 text-center text-sm font-medium text-text-muted">
                      {card.imageAlt}
                    </p>
                  </div>

                  {/* Glass UI card */}
                  <div
                    className="absolute -bottom-2 -right-2 md:-bottom-6 md:-right-6 z-10 bg-surface/80 backdrop-blur-2xl shadow-xl border border-white/60 rounded-xl md:rounded-2xl p-3 md:p-6 w-[85%] md:w-3/4 max-w-sm"
                    aria-hidden="true"
                  >
                    <div className="mb-2 md:mb-3 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-family-muted" aria-hidden="true" />
                      <span className="text-xs font-semibold uppercase tracking-widest text-family-muted">
                        Memvella
                      </span>
                    </div>
                    <p className="text-xs md:text-base font-semibold leading-snug text-text-primary">
                      {card.uiSnippet}
                    </p>
                    <div className="mt-2 md:mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                      <div className="h-full w-2/3 rounded-full bg-family-muted" aria-hidden="true" />
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
