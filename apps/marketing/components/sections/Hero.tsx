import Link from "next/link";

export function Hero() {
  return (
    <section className="bg-white px-6 py-24 lg:py-40">
      <div className="mx-auto max-w-7xl text-center">

        <h1 className="mx-auto max-w-4xl font-headline text-5xl font-extrabold tracking-tight text-slate-900 md:text-6xl lg:text-7xl text-balance leading-[1.08]">
          The voice-first memory companion for early-stage cognitive decline.
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-slate-600 text-balance">
          Empowering seniors to maintain independence, while giving families a quiet, shared surface to coordinate care and preserve dignity.
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
          <Link
            href="#waitlist"
            className="inline-flex h-16 w-full items-center justify-center rounded-full bg-purple-800 px-10 text-lg font-bold text-white shadow-lg shadow-purple-900/10 transition-colors hover:bg-purple-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-700 focus-visible:ring-offset-2 sm:w-auto"
          >
            Request Early Access
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-1.5 text-lg font-semibold text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-purple-700 focus-visible:ring-offset-2"
          >
            Learn how it works <span aria-hidden="true">↓</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
