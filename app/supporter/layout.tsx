"use client";

import { usePathname } from 'next/navigation';
import CaregiverBottomNav from '@/components/CaregiverBottomNav';
import CaregiverHeader from '@/components/CaregiverHeader';

export default function CaregiverLayout({ children }: { children: React.ReactNode }) {
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
        <CaregiverHeader />
        <main className="flex-1 pt-24 pb-24 overflow-y-auto flex flex-col">
          {children}
        </main>
        <CaregiverBottomNav />
      </div>
    </div>
  );
}
