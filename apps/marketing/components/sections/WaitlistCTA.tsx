import WaitlistForm from "@/components/ui/WaitlistForm";

export function WaitlistCTA() {
  return (
    <section id="waitlist" className="bg-slate-900 py-24 md:py-32">
      <div className="mx-auto max-w-2xl px-6 text-center md:px-8">
        <h2 className="font-headline text-4xl font-extrabold tracking-tight text-white md:text-5xl text-balance">
          Be the first to bring Memvella to your family.
        </h2>
        <p className="mx-auto mt-6 text-xl leading-relaxed text-slate-300">
          Join the waitlist for early access.
        </p>

        <div className="mt-12 text-left">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
