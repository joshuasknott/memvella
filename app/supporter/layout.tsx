"use client";

import { usePathname } from 'next/navigation';
import SupporterBottomNav from '@/components/SupporterBottomNav';
import SupporterHeader from '@/components/SupporterHeader';

export default function SupporterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/supporter/signin';

  if (isAuthPage) {
    return (
      <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col relative w-full">
        {children}
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col relative">
      <div className="relative mx-auto max-w-md w-full min-h-dvh bg-surface shadow-2xl flex flex-col">
        <SupporterHeader />
        <main className="flex-1 pt-24 pb-24 overflow-y-auto flex flex-col">
          {children}
        </main>
        <SupporterBottomNav />
      </div>
    </div>
  );
}
