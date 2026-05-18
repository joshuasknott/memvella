import Link from "next/link";
import { BrandLogo } from "@memvella/ui";
import { logoutHq } from "@/app/actions";
import type { HqSession } from "@/lib/hq-auth";
import { StatusPill } from "@/components/hq-primitives";

const navItems = [
  { href: "/", label: "Mission Control" },
  { href: "/company", label: "Company" },
  { href: "/product", label: "Product" },
  { href: "/growth", label: "Growth" },
  { href: "/research", label: "Research" },
  { href: "/operations", label: "Operations" },
  { href: "/trust-safety", label: "Trust & Safety" },
  { href: "/voice-ai", label: "Voice & AI" },
  { href: "/observability", label: "Observability" },
  { href: "/qa", label: "QA / Dev" },
  { href: "/automation", label: "Automation" },
  { href: "/runbooks", label: "Runbooks" },
];

export function HqShell({
  children,
  session,
  environment,
  testMode,
}: {
  children: React.ReactNode;
  session: HqSession;
  environment: string;
  testMode: boolean;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-border bg-surface/92 px-5 py-4 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 lg:block">
          <Link href="/" aria-label="Memvella HQ home">
            <BrandLogo className="h-8 w-auto" />
          </Link>
          <div className="lg:mt-5">
            <StatusPill tone="info">Memvella HQ</StatusPill>
          </div>
        </div>
        <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible">
          {navItems.map((item) => (
            <Link
              className="block whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold text-text-secondary transition hover:bg-surface-muted hover:text-text-primary"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="border-b border-border bg-surface/85 px-5 py-3 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <StatusPill tone={environment === "production" ? "warn" : "good"}>
                {environment}
              </StatusPill>
              <StatusPill tone="good">read-only</StatusPill>
              <StatusPill tone={testMode ? "warn" : "neutral"}>
                test mode {testMode ? "on" : "off"}
              </StatusPill>
              <StatusPill tone="info">role {session.role}</StatusPill>
            </div>
            <form action={logoutHq}>
              <button className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary">
                Sign out
              </button>
            </form>
          </div>
        </header>
        <main className="px-5 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
