"use client";

import Link from 'next/link';
import { Home, Calendar, BookOpen, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function SupporterBottomNav() {
  const pathname = usePathname();
  const isHomeRoute = pathname === '/supporter';
  const isRoutinesRoute = pathname.startsWith('/supporter/routines') || pathname.startsWith('/supporter/add-routine');
  const isMemoriesRoute = pathname.startsWith('/supporter/memories') || pathname.startsWith('/supporter/add-memory');
  const isSettingsRoute = pathname.startsWith('/supporter/settings');

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 pb-safe z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center px-4 pb-8 pt-4">
        <Link href="/supporter" className={`flex flex-col items-center justify-center rounded-full px-6 py-2 transition-transform active:scale-90 ${isHomeRoute ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-primary/5'}`}>
          <Home className={`w-6 h-6 ${isHomeRoute ? 'fill-primary/20' : ''}`} />
          <span className="mt-1 font-lexend text-sm font-bold">Home</span>
        </Link>
        <Link href="/supporter/routines" className={`flex flex-col items-center justify-center rounded-full px-6 py-2 transition-transform active:scale-90 ${isRoutinesRoute ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-primary/5'}`}>
          <Calendar className="w-6 h-6" />
          <span className="mt-1 font-lexend text-sm font-semibold">Routines</span>
        </Link>
        <Link href="/supporter/memories" className={`flex flex-col items-center justify-center rounded-full px-6 py-2 transition-transform active:scale-90 ${isMemoriesRoute ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-primary/5'}`}>
          <BookOpen className="w-6 h-6" />
          <span className="mt-1 font-lexend text-sm font-semibold">Memories</span>
        </Link>
        <Link href="/supporter/settings" className={`flex flex-col items-center justify-center rounded-full px-6 py-2 transition-transform active:scale-90 ${isSettingsRoute ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-primary/5'}`}>
          <Settings className="w-6 h-6" />
          <span className="mt-1 font-lexend text-sm font-semibold">Settings</span>
        </Link>
      </div>
    </nav>
  );
}
