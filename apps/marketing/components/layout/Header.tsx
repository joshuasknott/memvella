import Link from "next/link";
import BrandLogo from "@/components/ui/BrandLogo";

const NAV_LINKS = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Our Story", href: "#origin-story" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-2xl border-b border-slate-200/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
        <Link href="/" aria-label="Memvella home">
          <BrandLogo />
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-semibold text-slate-700 transition-colors hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA — visible on all screen sizes */}
        <Link
          href="#waitlist"
          className="inline-flex h-10 items-center justify-center rounded-full bg-purple-800 px-5 text-sm font-semibold text-white transition-all duration-300 ease-out hover:bg-purple-900 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-700 focus-visible:ring-offset-2 md:h-11 md:px-7 md:text-base"
        >
          Get Early Access
        </Link>
      </div>
    </header>
  );
}
