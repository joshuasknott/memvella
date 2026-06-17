import Link from "next/link";
import { BrandLogo } from "@memvella/ui";
import { logoutHq } from "@/app/actions";
import type { HqSession } from "@/lib/hq-auth";
import { StatusPill } from "@/components/hq-primitives";

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
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface/92 px-5 py-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" aria-label="Memvella HQ home">
            <BrandLogo className="h-8 w-auto" />
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={environment === "production" ? "warn" : "good"}>
              {environment}
            </StatusPill>
            <StatusPill tone={testMode ? "warn" : "neutral"}>
              test mode {testMode ? "on" : "off"}
            </StatusPill>
            <StatusPill tone="info">role {session.role}</StatusPill>
            <form action={logoutHq} className="ml-0 sm:ml-2">
              <button className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-6 lg:py-8">{children}</main>
    </div>
  );
}
