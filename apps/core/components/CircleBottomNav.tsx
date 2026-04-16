"use client";

import Link from 'next/link';
import { Home, Calendar, BookOpen, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function CircleBottomNav() {
  const pathname = usePathname();
  const isHomeRoute = pathname === '/circle';
  const isRoutinesRoute = pathname.startsWith('/circle/routines') || pathname.startsWith('/circle/add-routine');
  const isMemoriesRoute = pathname.startsWith('/circle/memories') || pathname.startsWith('/circle/add-memory');
  const isSettingsRoute = pathname.startsWith('/circle/settings');

  return (
    <nav className="fixed bottom-0 w-full max-w-3xl bg-surface border-t border-border pb-safe z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center px-4 pb-8 pt-4">
        <Link href="/circle" data-testid="circle-nav-home" className={`flex flex-col items-center justify-center rounded-full px-6 py-2 transition-transform active:scale-90 ${isHomeRoute ? 'bg-family-primary/10 text-family-primary' : 'text-text-secondary hover:bg-family-primary/5'}`}>
          <Home className={`w-6 h-6 ${isHomeRoute ? 'fill-family-primary/20' : ''}`} />
          <span className="mt-1 font-family text-sm font-bold">Home</span>
        </Link>
        <Link href="/circle/routines" data-testid="circle-nav-routines" className={`flex flex-col items-center justify-center rounded-full px-6 py-2 transition-transform active:scale-90 ${isRoutinesRoute ? 'bg-family-primary/10 text-family-primary' : 'text-text-secondary hover:bg-family-primary/5'}`}>
          <Calendar className="w-6 h-6" />
          <span className="mt-1 font-family text-sm font-semibold">Routines</span>
        </Link>
        <Link href="/circle/memories" data-testid="circle-nav-memories" className={`flex flex-col items-center justify-center rounded-full px-6 py-2 transition-transform active:scale-90 ${isMemoriesRoute ? 'bg-family-primary/10 text-family-primary' : 'text-text-secondary hover:bg-family-primary/5'}`}>
          <BookOpen className="w-6 h-6" />
          <span className="mt-1 font-family text-sm font-semibold">Memories</span>
        </Link>
        <Link href="/circle/settings" data-testid="circle-nav-settings" className={`flex flex-col items-center justify-center rounded-full px-6 py-2 transition-transform active:scale-90 ${isSettingsRoute ? 'bg-family-primary/10 text-family-primary' : 'text-text-secondary hover:bg-family-primary/5'}`}>
          <Settings className="w-6 h-6" />
          <span className="mt-1 font-family text-sm font-semibold">Settings</span>
        </Link>
      </div>
    </nav>
  );
}
