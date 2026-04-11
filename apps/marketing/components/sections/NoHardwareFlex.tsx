import { FadeIn } from "@/components/ui/FadeIn";

export function NoHardwareFlex() {
  return (
    <section id="no-hardware" className="bg-[#f5f5f7] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FadeIn>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-base font-extrabold tracking-widest text-slate-600 uppercase">
              Frictionless Setup
            </p>
            <h2 className="mt-4 font-headline text-4xl font-extrabold tracking-tighter text-slate-900 md:text-5xl lg:text-6xl text-balance leading-[1.05]">
              Nothing new to buy.{" "}
              <span className="text-purple-800">Nothing new to learn.</span>
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-slate-600">
              Memvella runs on the iPads, tablets, and smartphones your family already owns. Pair a device, send an invite to your Circle, and it&apos;s ready in minutes. No instruction manual, no IT degree, no extra trip to the electronics store.
            </p>
          </div>
        </FadeIn>

      </div>
    </section>
  );
}
