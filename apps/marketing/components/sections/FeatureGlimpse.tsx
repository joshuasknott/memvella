import { FadeIn } from "@/components/ui/FadeIn";
import { ProductMockup } from "@/components/ui/ProductMockup";

const rows = [
  {
    imagePosition: "left" as const,
    visual: "senior" as const,
    headline: "Voice stays the easiest way through the day.",
    body: "The paired tablet keeps the next action obvious: talk, listen, and respond. It avoids dense menus and keeps daily orientation visible.",
  },
  {
    imagePosition: "right" as const,
    visual: "routine" as const,
    headline: "Routines create a dependable daily shape.",
    body: "Supporters add routines in the Workspace, then Memvella presents them through a calm companion tablet and a clear support-side timeline.",
  },
  {
    imagePosition: "left" as const,
    visual: "memory" as const,
    headline: "Memories make the companion feel familiar.",
    body: "Photos, stories, audio, and voice notes give Memvella context it can bring back naturally, so the tablet feels familiar without asking the senior to manage setup.",
  },
];

export function FeatureGlimpse() {
  return (
    <section id="features" className="bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn>
          <div className="mb-16 max-w-3xl">
            <p className="text-base font-extrabold uppercase tracking-widest text-text-secondary">
              What Memvella does
            </p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold leading-[1.05] text-text-primary text-balance md:text-5xl">
              Practical support for daily rhythm, memory, and shared coordination.
            </h2>
          </div>
        </FadeIn>

        <div className="flex flex-col gap-20 lg:gap-28">
          {rows.map((row) => (
            <div
              key={row.headline}
              className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20"
            >
              <FadeIn
                delay={100}
                className={row.imagePosition === "right" ? "lg:order-2" : ""}
              >
                <ProductMockup variant={row.visual} />
              </FadeIn>

              <FadeIn delay={200}>
                <h3 className="font-headline text-3xl font-extrabold leading-[1.05] text-text-primary text-balance md:text-4xl">
                  {row.headline}
                </h3>
                <p className="mt-6 text-lg leading-relaxed text-text-secondary">
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
