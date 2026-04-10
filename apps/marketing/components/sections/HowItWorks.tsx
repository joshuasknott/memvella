const rows = [
  {
    label: "Independent User",
    headline: "Maintain independence with a voice-first companion.",
    body: "Designed for self-managed seniors. Secure, passwordless entry using Passkeys ensures frustration-free access to daily routines and voice-led memory recall. No caregiver required to get started.",
    imageAlt: "Independent User interface — voice-led daily routines",
    imagePosition: "right" as const,
  },
  {
    label: "The Family Circle",
    headline: "Coordinate care without the overhead.",
    body: "For seniors needing more support, pair a tablet to create a calm, assisted surface. The family Circle manages routines, memories, and alerts from their own phones—sharing context seamlessly without turning every family member into an administrator.",
    imageAlt: "Family Circle dashboard — shared care coordination",
    imagePosition: "left" as const,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-slate-50 py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="mb-20 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-700">
            How it Works
          </p>
          <h2 className="mt-4 font-headline text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl text-balance">
            Two paths to care. One cohesive experience.
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-slate-600">
            Memvella is built around two primary senior experiences, both designed to feel calm and grounded in familiar rhythms.
          </p>
        </div>

        <div className="flex flex-col gap-28 md:gap-36">
          {rows.map((row) => (
            <div
              key={row.label}
              className={`grid items-center gap-12 lg:grid-cols-2 ${
                row.imagePosition === "left" ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              {/* Text */}
              <div>
                <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-purple-700">
                  {row.label}
                </p>
                <h3 className="font-headline text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl text-balance">
                  {row.headline}
                </h3>
                <p className="mt-6 text-lg leading-relaxed text-slate-600">
                  {row.body}
                </p>
              </div>

              {/* Image placeholder */}
              <div
                className="aspect-[4/3] w-full rounded-2xl border border-slate-100 bg-slate-50 shadow-sm flex items-center justify-center text-slate-400"
                role="img"
                aria-label={row.imageAlt}
              >
                <span className="text-sm font-medium">{row.imageAlt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
