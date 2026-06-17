import Link from "next/link";
import { BrandLogo } from "@memvella/ui";

const NAV_LINKS = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Our Story", href: "#origin-story" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-surface/60 backdrop-blur-2xl border-b border-border/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
        <Link href="/" aria-label="Memvella home">
          <BrandLogo />
        </Link>

        {/* Desktop nav hidden on mobile. */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-semibold text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA visible on all screen sizes. */}
        <Link
          href="#waitlist"
          className="inline-flex h-10 items-center justify-center rounded-full bg-family-primary px-5 text-sm font-semibold text-white transition-all duration-300 ease-out hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-family-primary focus-visible:ring-offset-2 md:h-11 md:px-7 md:text-base"
        >
          Request early access
        </Link>
      </div>
    </header>
  );
}
