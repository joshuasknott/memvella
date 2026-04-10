import { Mic, Tablet, Heart } from "lucide-react";

const tenets = [
  {
    icon: Mic,
    headline: "Voice stays primary.",
    body: "Every senior-facing interaction is designed around spoken creation. One action at a time, calm confirmations, and no unnecessary typing or menus.",
  },
  {
    icon: Tablet,
    headline: "No new hardware required.",
    body: "Use a tablet you already own, or start on a personal phone. Memvella works with the devices your family already has—pairing is straightforward and takes minutes.",
  },
  {
    icon: Heart,
    headline: "A companion, not a clinic.",
    body: "Memvella is a digital wellness companion. It is not a medical device, not a diagnostic tool, and not a replacement for professional care. It is designed to support daily life with dignity.",
  },
];

export function TrustAndDignity() {
  return (
    <section id="trust" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="mb-16 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-700">
            Trust & Dignity
          </p>
          <h2 className="mt-4 font-headline text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl text-balance">
            Built with honesty, for families who need clarity.
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-slate-600">
            We believe the best technology gets out of the way. These are the principles that guide every decision we make.
          </p>
        </div>

        <div className="flex flex-col divide-y divide-slate-100 border-y border-slate-100">
          {tenets.map((tenet) => {
            const Icon = tenet.icon;
            return (
              <div
                key={tenet.headline}
                className="flex flex-col gap-6 py-12 md:flex-row md:items-start md:gap-12"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-800">
                  <Icon className="h-7 w-7" aria-hidden />
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-extrabold text-slate-900 md:text-3xl">
                    {tenet.headline}
                  </h3>
                  <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
                    {tenet.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
