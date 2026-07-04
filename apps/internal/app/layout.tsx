import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Figtree } from "next/font/google";
import { HqLoginForm } from "@/components/login-form";
import { HqShell } from "@/components/hq-shell";
import { EmptyState, StatusPill } from "@/components/hq-primitives";
import { getHqAccessState, getHqSession } from "@/lib/hq-auth";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-senior",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const figtree = Figtree({
  variable: "--font-family",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Memvella HQ",
  description: "Disabled-by-default internal tools for Memvella.",
};

export const dynamic = "force-dynamic";

function AccessDisabled({
  missing,
  enabled,
}: {
  missing: string[];
  enabled: boolean;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-xl space-y-4">
        <StatusPill tone="bad">HQ disabled</StatusPill>
        <EmptyState title="Memvella HQ is not available">
          {enabled
            ? `HQ is enabled but missing required configuration: ${missing.join(", ")}.`
            : "Set MEMVELLA_HQ_ENABLED=1 and configure HQ access before using HQ."}
        </EmptyState>
      </div>
    </main>
  );
}

function LoginScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="hq-panel w-full max-w-md rounded-lg p-6">
        <div className="mb-6">
          <StatusPill tone="info">restricted access</StatusPill>
          <h1 className="mt-4 text-3xl font-bold text-text-primary">Memvella HQ</h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Internal tools are separate from product Workspace access.
          </p>
        </div>
        <HqLoginForm />
      </div>
    </main>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const accessState = getHqAccessState();
  const session = await getHqSession();

  return (
    <html
      lang="en"
      className={`${atkinson.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="font-family min-h-full">
        {!accessState.configured ? (
          <AccessDisabled
            enabled={accessState.enabled}
            missing={accessState.missing}
          />
        ) : !session ? (
          <LoginScreen />
        ) : (
          <HqShell
            environment={accessState.environment}
            session={session}
            testMode={accessState.testMode}
          >
            {children}
          </HqShell>
        )}
      </body>
    </html>
  );
}
