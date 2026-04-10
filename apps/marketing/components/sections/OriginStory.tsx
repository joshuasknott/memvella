import { FadeIn } from "@/components/ui/FadeIn";

export function OriginStory() {
  return (
    <section id="origin-story" className="bg-[#f5f5f7] py-32 lg:py-48">
      <div className="mx-auto max-w-3xl px-6 text-center">

        {/* Overline */}
        <FadeIn>
          <p className="text-base font-extrabold tracking-widest text-slate-600 uppercase">
            Why We Built This
          </p>
        </FadeIn>

        {/* Pull-quote headline */}
        <FadeIn delay={100}>
          <h2 className="mt-8 font-headline text-4xl font-extrabold tracking-tighter text-slate-900 md:text-5xl lg:text-6xl text-balance leading-[1.05]">
            &ldquo;I just wanted my mum to be a daughter again.&rdquo;
          </h2>
        </FadeIn>

        {/* Two condensed paragraphs */}
        <FadeIn delay={200}>
          <div className="mt-12 space-y-6 text-left">
            <p className="text-xl leading-relaxed text-slate-700">
              When my grandmother was diagnosed with dementia, my mother became her full-time caregiver. Not because she chose to — but because professional care was out of reach. I watched the logistics slowly consume her: the same questions answered on a loop, medications managed around the clock, the quiet exhaustion that never let up.
            </p>
            <p className="text-xl leading-relaxed text-slate-700">
              She wasn&apos;t just tired. She was a daughter who couldn&apos;t find room to grieve because she was too busy managing. I built Memvella to carry that repetitive weight — a companion with infinite patience for my grandmother, so my mother could put down the clipboard and just be her daughter again.
            </p>
          </div>
        </FadeIn>

        {/* Signature */}
        <FadeIn delay={300}>
          <span className="mt-12 block font-headline text-lg font-semibold tracking-tight text-slate-900">
            — Joshua Knott, Founder of Memvella
          </span>
        </FadeIn>

      </div>
    </section>
  );
}
