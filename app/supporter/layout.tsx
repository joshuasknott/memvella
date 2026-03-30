"use client";

import { usePathname } from "next/navigation";
import SupporterBottomNav from "@/components/SupporterBottomNav";
import SupporterHeader from "@/components/SupporterHeader";
import SupporterProfileBootstrap from "@/components/supporter/SupporterProfileBootstrap";

export default function SupporterLayout({
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
      <SupporterProfileBootstrap />
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col bg-surface shadow-2xl">
        <SupporterHeader />
        <main className="flex flex-1 flex-col overflow-y-auto pb-24 pt-24">
          {children}
        </main>
        <SupporterBottomNav />
      </div>
    </div>
  );
}
