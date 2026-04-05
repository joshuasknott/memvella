"use client";

import { usePathname } from "next/navigation";
import OrganiserBottomNav from "@/components/OrganiserBottomNav";
import OrganiserHeader from "@/components/OrganiserHeader";
import OrganiserProfileBootstrap from "@/components/organiser/OrganiserProfileBootstrap";

export default function OrganiserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/supporter/signin";

  if (isAuthPage) {
    return (
      <div className="relative flex min-h-screen w-full flex-col bg-surface font-body text-on-surface">
        {children}
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-surface font-body text-on-surface">
      <OrganiserProfileBootstrap />
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-surface shadow-2xl">
        <OrganiserHeader />
        <main className="flex flex-1 flex-col overflow-y-auto pb-24 pt-24">
          {children}
        </main>
        <OrganiserBottomNav />
      </div>
    </div>
  );
}
