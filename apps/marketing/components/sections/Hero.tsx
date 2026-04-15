import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/components/ui/FadeIn";

export function Hero() {
  return (
    <section className="bg-surface px-6 py-24 lg:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">

          {/* Left column — copy + CTA */}
          <div className="flex flex-col">
            <FadeIn>
              <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-text-primary md:text-6xl lg:text-7xl text-balance leading-none">
                A voice-first companion for them. Peace of mind for you.
              </h1>
            </FadeIn>

            <FadeIn delay={100}>
              <p className="mt-8 text-xl leading-relaxed text-text-secondary max-w-lg">
                Your loved one gets a kind, familiar voice to lean on throughout their day. You get to stop managing every detail and go back to being family.
              </p>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="#waitlist"
                  className="inline-flex h-16 w-full items-center justify-center rounded-full bg-family-primary px-10 text-lg font-bold text-white shadow-lg shadow-family-primary/10 transition-all duration-300 ease-out hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-family-primary focus-visible:ring-offset-2 sm:w-auto"
                >
                  Request Early Access
                </Link>
                <Link
                  href="#how-it-works"
                  className="flex items-center justify-center gap-2 text-lg font-semibold text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-family-primary focus-visible:ring-offset-2"
                >
                  Learn how it works <span aria-hidden="true">↓</span>
                </Link>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={150} className="w-full">
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl border border-border/50 shadow-inner">
              <Image
                src="/images/hero-ambient-companion.png"
                alt="Senior woman relaxing comfortably at home with an ambient tablet"
                fill
                className="object-cover"
                priority
              />
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}
