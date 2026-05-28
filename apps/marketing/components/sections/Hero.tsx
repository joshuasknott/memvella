import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";
import { ProductMockup } from "@/components/ui/ProductMockup";

export function Hero() {
  return (
    <section className="bg-surface px-6 pb-16 pt-14 lg:pb-20 lg:pt-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="flex flex-col">
            <FadeIn>
              <h1 className="font-headline text-4xl font-extrabold leading-[1.02] text-text-primary text-balance md:text-6xl">
                Voice-first daily support, built around family rhythm.
              </h1>
            </FadeIn>

            <FadeIn delay={100}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary md:text-xl">
                Memvella helps a senior move through routines, memories, and quiet check-ins while the Circle stays coordinated without constant admin.
              </p>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
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
            <ProductMockup variant="hero" />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
