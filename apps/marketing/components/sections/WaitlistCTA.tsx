import WaitlistForm from "@/components/ui/WaitlistForm";

export function WaitlistCTA() {
  return (
    <section id="waitlist" className="bg-surface-inverse py-24 md:py-32">
      <div className="mx-auto max-w-2xl px-6 text-center md:px-8">
        <h2 className="font-headline text-4xl font-extrabold tracking-tight text-white md:text-5xl text-balance">
          Be the first to bring Memvella to your family.
        </h2>
        <p className="mx-auto mt-6 text-lg leading-relaxed text-text-inverse-muted md:text-xl max-w-2xl mb-10">
          We know what caregivers carry. The medication schedules, the repeated questions at 2am, the quiet guilt that follows you everywhere. Memvella isn&apos;t here to replace your love. It&apos;s here to carry the repetitive weight of it, so you can stop being an administrator and go back to being their son, daughter, or partner.
        </p>

        <div className="mt-12 text-left">
          <WaitlistForm />
        </div>

        <p className="mt-4 text-sm text-text-muted text-center">
          Memvella is a digital wellness companion. It is not a medical device, not a diagnostic tool, and not a replacement for professional care.
        </p>
      </div>
    </section>
  );
}
