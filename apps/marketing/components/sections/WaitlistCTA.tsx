import WaitlistForm from "@/components/ui/WaitlistForm";

export function WaitlistCTA() {
  return (
    <section id="waitlist" className="bg-surface-inverse py-20 md:py-28">
      <div className="mx-auto max-w-2xl px-6 text-center md:px-8">
        <h2 className="font-headline text-4xl font-extrabold tracking-tight text-white text-balance md:text-5xl">
          Bring Memvella to your care routine early.
        </h2>
        <p className="mx-auto mb-8 mt-6 max-w-2xl text-lg leading-relaxed text-text-inverse-muted md:text-xl">
          Early access is for families and trusted supporters who want a calmer way to set up routines, memories, People context, and a companion tablet before the wider release.
        </p>

        <div className="mt-10 text-left">
          <WaitlistForm />
        </div>

        <p className="mt-4 text-center text-sm text-text-muted">
          Memvella is a digital wellness companion. It is not a medical device, not a diagnostic tool, and not a replacement for professional care.
        </p>
      </div>
    </section>
  );
}
