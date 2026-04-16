"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-canvas font-sans">
        <div className="flex min-h-dvh items-center justify-center px-6 py-10">
          <div className="w-full max-w-xl rounded-[32px] border border-border bg-white p-8 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-family-primary/70">
              Memvella
            </p>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary">
              Memvella needs to reload
            </h1>
            <p className="mt-3 text-lg leading-relaxed text-text-secondary">
              The app hit an unexpected failure before the main layout could finish. Retry to restore the latest Circle state.
            </p>
            <button
              type="button"
              onClick={unstable_retry}
              className="mt-6 inline-flex min-h-[56px] items-center justify-center rounded-full bg-senior-primary px-6 text-base font-semibold text-white transition-transform active:scale-95"
            >
              Reload Memvella
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
