import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@memvella/ui";

export function FamilyAuthLayout({
  children,
  backHref = "/organiser/signin",
  backLabel = "Back to sign in",
}: {
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-surface px-6 py-8 font-body text-text-primary md:py-12">
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <header className="relative mb-8 flex h-14 items-center justify-between">
          <Link
            href={backHref}
            className="z-10 flex w-fit items-center gap-2 font-semibold text-family-primary transition-opacity hover:opacity-80"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} /> {backLabel}
          </Link>
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <BrandLogo standalone className="h-8 w-auto md:h-10" />
          </div>
          <div className="w-[120px]" aria-hidden="true" />
        </header>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center pb-12">
          {children}
        </div>
      </div>
    </div>
  );
}
