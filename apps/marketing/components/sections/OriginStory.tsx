import { FadeIn } from "@/components/ui/FadeIn";

export function OriginStory() {
  return (
    <section id="origin-story" className="bg-surface-muted py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <FadeIn>
          <p className="text-base font-extrabold uppercase tracking-widest text-text-secondary">
            Why we built this
          </p>
        </FadeIn>

        <FadeIn delay={100}>
          <h2 className="mt-8 font-headline text-4xl font-extrabold leading-[1.05] text-text-primary text-balance md:text-5xl">
            Families need coordination tools that still feel human.
          </h2>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="mt-10 space-y-6 text-left">
            <p className="text-xl leading-relaxed text-text-secondary">
              Memvella started from a simple observation: the small repeated moments of daily support can take over a family&apos;s attention, even when everyone is trying to help with care and respect.
            </p>
            <p className="text-xl leading-relaxed text-text-secondary">
              A senior-facing companion should be calm and familiar. The family-side workspace should be clear, shared, and quick to use on a phone.
            </p>
            <p className="text-xl leading-relaxed text-text-secondary">
              Memvella now does one job clearly: help family members and trusted supporters care for a senior through voice, routines, memories, People context, and a companion tablet.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={300}>
          <span className="mt-10 block font-headline text-lg font-semibold tracking-tight text-text-primary">
            Joshua Knott, Founder of Memvella
          </span>
        </FadeIn>
      </div>
    </section>
  );
}
