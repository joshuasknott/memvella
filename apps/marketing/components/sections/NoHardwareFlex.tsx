import { FadeIn } from "@/components/ui/FadeIn";

export function NoHardwareFlex() {
  return (
    <section id="no-hardware" className="bg-surface-muted py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-base font-extrabold tracking-widest text-text-secondary uppercase">
              Frictionless Setup
            </p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold tracking-tighter text-text-primary md:text-5xl lg:text-6xl text-balance leading-[1.05]">
              Nothing new to buy.{" "}
              <span className="text-family-primary">Nothing new to learn.</span>
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-text-secondary">
              Memvella runs on the iPads, tablets, and smartphones your family already owns. Connect a companion tablet for the senior, invite trusted Supporters into the Workspace, and keep setup work away from the senior surface.
            </p>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
