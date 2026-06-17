import { FadeIn } from "@/components/ui/FadeIn";
import { ProductMockup } from "@/components/ui/ProductMockup";

const cards = [
  {
    label: "Paired tablet",
    headline: "The senior experience stays simple.",
    bullets: [
      "A family pairs the tablet with a short setup code.",
      "The tablet shows time, the next routine, familiar memories, and live voice.",
      "No family-side navigation, account settings, or setup work appears on the senior surface.",
    ],
    visual: "senior" as const,
    imagePosition: "right" as const,
    imageWrapper: "w-full",
  },
  {
    label: "Shared Workspace",
    headline: "The support setup work happens in one place.",
    bullets: [
      "Someone creates an account, sets up a Workspace, and invites trusted Supporters.",
      "Routines, memories, People, insights, and alerts live in the shared workspace.",
      "Supporters can contribute and stay informed while key controls stay with the Workspace owner.",
    ],
    visual: "circle" as const,
    imagePosition: "left" as const,
    imageWrapper: "max-w-sm lg:max-w-md mx-auto w-full",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface-muted py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn>
          <div className="mb-16 max-w-3xl">
            <p className="text-base font-extrabold uppercase tracking-widest text-text-secondary">
              How it works
            </p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold leading-[1.05] text-text-primary text-balance md:text-5xl">
              One calm tablet surface. One practical support workspace.
            </h2>
          </div>
        </FadeIn>

        <div className="flex flex-col gap-20 lg:gap-28">
          {cards.map((card) => (
            <div
              key={card.label}
              className={`grid items-center gap-12 lg:grid-cols-12 lg:gap-20 ${
                card.imagePosition === "left" ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <FadeIn className="lg:col-span-5" delay={100}>
                <p className="mb-4 text-base font-extrabold uppercase tracking-widest text-text-secondary">
                  {card.label}
                </p>
                <h3 className="font-headline text-3xl font-extrabold leading-[1.05] text-text-primary text-balance md:text-4xl">
                  {card.headline}
                </h3>
                <ul className="mt-6 space-y-4">
                  {card.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-3 text-lg leading-relaxed text-text-secondary"
                    >
                      <span
                        className="mt-2 block h-2 w-2 shrink-0 rounded-full bg-family-muted"
                        aria-hidden="true"
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </FadeIn>

              <FadeIn className={`lg:col-span-7 ${card.imageWrapper}`} delay={200}>
                <ProductMockup variant={card.visual} />
              </FadeIn>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
