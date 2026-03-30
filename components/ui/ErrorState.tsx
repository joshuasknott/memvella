"use client";

type ErrorStateProps = {
  title: string;
  description: string;
  actionLabel: string;
  onRetry: () => void;
};

export function ErrorState({
  title,
  description,
  actionLabel,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-surface px-6 py-10">
      <div className="w-full max-w-xl rounded-[32px] border border-outline-variant/40 bg-white p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">
          Memvella
        </p>
        <h1 className="mt-4 font-headline text-3xl font-extrabold tracking-tight text-on-surface">
          {title}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-on-surface-variant">
          {description}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex min-h-[56px] items-center justify-center rounded-full bg-[#6B21A8] px-6 text-base font-semibold text-white transition-transform active:scale-95"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
