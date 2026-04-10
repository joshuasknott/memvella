import { FadeIn } from "@/components/ui/FadeIn";

const rows = [
  {
    label: "Independent User",
    headline: "Maintain independence with a voice-first companion.",
    body: "Designed for self-managed seniors. Secure, passwordless entry using Passkeys ensures frustration-free access to daily routines and voice-led memory recall. No caregiver required to get started.",
    imageAlt: "Independent User interface — voice-led daily routines",
    imagePosition: "right" as const,
    imageAspect: "aspect-[4/3]",
    imageWrapper: "w-full",
  },
  {
    label: "The Family Circle",
    headline: "Coordinate care without the overhead.",
    body: "For seniors needing more support, pair a tablet to create a calm, assisted surface. The Family Circle manages routines, memories, and alerts from their own phones—sharing context seamlessly without turning every family member into an administrator.",
    imageAlt: "Family Circle dashboard — shared care coordination",
    imagePosition: "left" as const,
    imageAspect: "aspect-[9/16] lg:aspect-[3/4]",
    imageWrapper: "max-w-sm lg:max-w-md mx-auto w-full",
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
          {rows.map((row, i) => (
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

              {/* Image — dominant column, premium device silhouette */}
              <FadeIn className={`lg:col-span-7 ${row.imageWrapper}`} delay={200}>
                <div
                  className={`${row.imageAspect} w-full rounded-[2.5rem] lg:rounded-[3rem] border-[12px] border-slate-100 bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] flex items-center justify-center text-slate-400`}
                  role="img"
                  aria-label={row.imageAlt}
                >
                  <span className="text-sm font-medium">{row.imageAlt}</span>
                </div>
              </FadeIn>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
