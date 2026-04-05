import Link from "next/link";
import type { ReactNode } from "react";
import BrandLogo from "@/components/ui/BrandLogo";

type ActivePage = "home" | "experience" | "philosophy" | "waitlist";

function navLinkClass(isActive: boolean) {
  return `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
    isActive
      ? "bg-purple-100 text-purple-900"
      : "text-slate-600 hover:bg-white hover:text-slate-900"
  }`;
}

export function MarketingShell({
  activePage,
  children,
}: {
  activePage: ActivePage;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f2fb] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-white/70 bg-[#f7f2fb]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 md:px-8">
          <Link href="/" className="flex items-center gap-3 text-slate-900">
            <BrandLogo standalone animated className="h-9 w-auto" />
            <span className="font-headline text-xl font-extrabold tracking-tight">
              Memvella
            </span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link href="/" className={navLinkClass(activePage === "home")}>
              Home
            </Link>
            <Link
              href="/experience"
              className={navLinkClass(activePage === "experience")}
            >
              Experience
            </Link>
            <Link
              href="/philosophy"
              className={navLinkClass(activePage === "philosophy")}
            >
              Philosophy
            </Link>
            <Link
              href="/waitlist"
              className={navLinkClass(activePage === "waitlist")}
            >
              Waitlist
            </Link>
          </nav>

          <Link
            href="/waitlist"
            className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#6B21A8] px-6 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Request Early Access
          </Link>
        </div>
      </header>

      {children}

      <footer className="border-t border-white/70 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="text-sm text-slate-500">© 2026 Memvella.</p>
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>
            <Link href="/experience" className="hover:text-slate-900">
              Experience
            </Link>
            <Link href="/philosophy" className="hover:text-slate-900">
              Philosophy
            </Link>
            <Link href="/waitlist" className="hover:text-slate-900">
              Waitlist
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
