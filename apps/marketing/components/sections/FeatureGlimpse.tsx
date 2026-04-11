import { FadeIn } from "@/components/ui/FadeIn";

const rows = [
  {
    imagePosition: "left" as const,
    headline: "They just talk. Memvella handles the rest.",
    body: "No apps to open, no buttons to find. Your parent speaks naturally and Memvella responds — guiding them through their day with the patience and warmth of a familiar voice.",
  },
  {
    imagePosition: "right" as const,
    headline: "No more worrying if Mum took her morning pill.",
    body: "Gentle medication reminders, morning check-ins, and daily rhythms — set once by you, delivered through calm conversation to them. Consistent structure without the friction.",
  },
  {
    imagePosition: "left" as const,
    headline: "Filled with the stories only your family knows.",
    body: "Upload wedding photos, a grandchild’s voice note, Dad’s favourite song. Memvella weaves them into conversations — so your parent hears their own life, not a stranger’s script.",
  },
];

export function FeatureGlimpse() {
  return (
    <section id="features" className="bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* Section header */}
        <FadeIn>
          <div className="mb-20 max-w-3xl">
            <p className="text-base font-extrabold tracking-widest text-slate-600 uppercase">
              What Memvella Does
            </p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold tracking-tighter text-slate-900 md:text-5xl text-balance leading-[1.05]">
              Everything they need. Nothing they don’t.
            </h2>
          </div>
        </FadeIn>

        {/* Z-pattern alternating rows */}
        <div className="flex flex-col gap-24 lg:gap-32">
          {rows.map((row) => (
            <div
              key={row.headline}
              className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20"
            >
              {/* Image placeholder */}
              <FadeIn
                delay={100}
                className={row.imagePosition === "right" ? "lg:order-2" : ""}
              >
                <div
                  className="w-full aspect-[4/3] bg-slate-100 rounded-2xl border border-slate-200/50 shadow-inner"
                  aria-hidden="true"
                />
              </FadeIn>

              {/* Text column */}
              <FadeIn delay={200}>
                <h3 className="font-headline text-3xl font-extrabold tracking-tighter text-slate-900 md:text-4xl text-balance leading-[1.05]">
                  {row.headline}
                </h3>
                <p className="mt-6 text-lg leading-relaxed text-slate-600">
                  {row.body}
                </p>
              </FadeIn>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
