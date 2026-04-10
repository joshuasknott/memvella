const rows = [
  {
    label: "Independent User",
    headline: "Maintain independence with a voice-first companion.",
    body: "Designed for self-managed seniors. Secure, passwordless entry using Passkeys ensures frustration-free access to daily routines and voice-led memory recall. No caregiver required to get started.",
    imageAlt: "Independent User interface — voice-led daily routines",
    imagePosition: "right" as const,
    // Phone-shaped canvas
    imageAspect: "aspect-[9/16] lg:aspect-[3/4]",
    imageWrapper: "max-w-md mx-auto w-full",
  },
  {
    label: "The Family Circle",
    headline: "Coordinate care without the overhead.",
    body: "For seniors needing more support, pair a tablet to create a calm, assisted surface. The Family Circle manages routines, memories, and alerts from their own phones—sharing context seamlessly without turning every family member into an administrator.",
    imageAlt: "Family Circle dashboard — shared care coordination",
    imagePosition: "left" as const,
    // Tablet/dashboard canvas
    imageAspect: "aspect-[4/3]",
    imageWrapper: "w-full",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-50 py-24 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Left-anchored section header */}
        <div className="mb-20 max-w-3xl">
          <p className="text-base font-extrabold tracking-widest text-slate-600 uppercase">
            How it Works
          </p>
          <h2 className="mt-4 font-headline text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl text-balance">
            Two paths to care. One cohesive experience.
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-slate-600">
            Memvella is built around two primary senior experiences, both designed to feel calm and grounded in familiar rhythms.
          </p>
        </div>

        {/* Alternating rows */}
        <div className="flex flex-col gap-24 lg:gap-36">
          {rows.map((row) => (
            <div
              key={row.label}
              className={`grid items-center gap-16 lg:grid-cols-12 lg:gap-24 xl:gap-32 ${
                row.imagePosition === "left" ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              {/* Text — narrow column */}
              <div className="lg:col-span-5">
                <p className="mb-4 text-base font-extrabold tracking-widest text-slate-600 uppercase">
                  {row.label}
                </p>
                <h3 className="font-headline text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl text-balance">
                  {row.headline}
                </h3>
                <p className="mt-6 text-lg leading-relaxed text-slate-600">
                  {row.body}
                </p>
              </div>

              {/* Image — dominant column */}
              <div className={`lg:col-span-7 ${row.imageWrapper}`}>
                <div
                  className={`${row.imageAspect} w-full rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-400`}
                  role="img"
                  aria-label={row.imageAlt}
                >
                  <span className="text-sm font-medium">{row.imageAlt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
