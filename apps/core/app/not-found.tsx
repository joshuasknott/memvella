import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-surface px-6 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-text-primary">
        Page not found
      </h1>
      <p className="max-w-md text-lg leading-relaxed text-text-secondary">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex min-h-[56px] items-center rounded-full bg-family-primary px-8 text-lg font-semibold text-white shadow-md transition-transform active:scale-95"
      >
        Go home
      </Link>
    </main>
  );
}
