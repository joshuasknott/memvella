const tenets = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-7 w-7"
      >
        <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    ),
    headline: "Voice stays primary.",
    body: "Every senior-facing interaction is designed around spoken creation. One action at a time, calm confirmations, and no unnecessary typing or menus.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-7 w-7"
      >
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
    headline: "No new hardware required.",
    body: "Use a tablet you already own, or start on a personal phone. Memvella works with the devices your family already has—pairing is straightforward and takes minutes.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="h-7 w-7"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      </svg>
    ),
    headline: "A companion, not a clinic.",
    body: "Memvella is a digital wellness companion. It is not a medical device, not a diagnostic tool, and not a replacement for professional care. It is designed to support daily life with dignity.",
  },
];

export function TrustAndDignity() {
  return (
    <section id="trust" className="bg-white py-24 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 max-w-2xl">
          <p className="text-base font-extrabold tracking-widest text-slate-600 uppercase">
            Trust &amp; Dignity
          </p>
          <h2 className="mt-4 font-headline text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl text-balance">
            Built with honesty, for families who need clarity.
          </h2>
          <p className="mt-6 text-xl leading-relaxed text-slate-600">
            We believe the best technology gets out of the way. These are the principles that guide every decision we make.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-3">
          {tenets.map((tenet) => (
            <div key={tenet.headline} className="flex flex-col gap-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                {tenet.icon}
              </div>
              <div>
                <h3 className="font-headline text-xl font-extrabold text-slate-900">
                  {tenet.headline}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-slate-600">
                  {tenet.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
