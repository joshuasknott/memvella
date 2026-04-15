import { FadeIn } from "@/components/ui/FadeIn";

export function OriginStory() {
  return (
    <section id="origin-story" className="bg-surface-muted py-32 lg:py-48">
      <div className="mx-auto max-w-3xl px-6 text-center">

        {/* Overline */}
        <FadeIn>
          <p className="text-base font-extrabold tracking-widest text-text-secondary uppercase">
            Why We Built This
          </p>
        </FadeIn>

        {/* Pull-quote headline */}
        <FadeIn delay={100}>
          <h2 className="mt-8 font-headline text-4xl font-extrabold tracking-tighter text-text-primary md:text-5xl lg:text-6xl text-balance leading-[1.05]">
            No family should have to choose between caregiving and living.
          </h2>
        </FadeIn>

        {/* Two condensed paragraphs */}
        <FadeIn delay={200}>
          <div className="mt-12 space-y-6 text-left">
            <p className="text-xl leading-relaxed text-text-secondary">
              When my grandmother was diagnosed with dementia, my mother became her full-time caregiver. She answered the same questions on a loop, managed medications, and carried a weight that never let up. She wasn&apos;t just tired; she was drowning in logistics.
            </p>
            <p className="text-xl leading-relaxed text-text-secondary">
              And then there was the rest of the family. Siblings needed constant updates. Group chats ran endlessly. Every day she became the liaison, relaying what the doctor said, what Nan ate, and how the night went on top of everything else she was already doing.
            </p>
            <p className="text-xl leading-relaxed text-text-secondary">
              I built Memvella to carry that repetitive weight, and Circles to solve the communication overhead. It automatically keeps the whole family on the same page so no one has to be the go-between.
            </p>
          </div>
        </FadeIn>

        {/* Signature */}
        <FadeIn delay={300}>
          <span className="mt-12 block font-headline text-lg font-semibold tracking-tight text-text-primary">
            — Joshua Knott, Founder of Memvella
          </span>
        </FadeIn>

      </div>
    </section>
  );
}
