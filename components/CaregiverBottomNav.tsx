"use client";

import Link from 'next/link';
import { Home, Calendar, BookOpen, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function CaregiverBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 pb-safe z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center px-4 pb-8 pt-4">
        <Link href="/caregiver" className={`flex flex-col items-center justify-center rounded-full px-6 py-2 transition-transform active:scale-90 ${pathname === '/caregiver' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-primary/5'}`}>
          <Home className={`w-6 h-6 ${pathname === '/caregiver' ? 'fill-primary/20' : ''}`} />
          <span className="font-lexend text-[10px] font-bold mt-1">Home</span>
        </Link>
        <Link href="/caregiver/routines" className={`flex flex-col items-center justify-center rounded-full px-6 py-2 transition-transform active:scale-90 ${pathname === '/caregiver/routines' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-primary/5'}`}>
          <Calendar className="w-6 h-6" />
          <span className="font-lexend text-[10px] font-semibold mt-1">Routines</span>
        </Link>
        <Link href="/caregiver/memories" className={`flex flex-col items-center justify-center rounded-full px-6 py-2 transition-transform active:scale-90 ${pathname === '/caregiver/memories' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-primary/5'}`}>
          <BookOpen className="w-6 h-6" />
          <span className="font-lexend text-[10px] font-semibold mt-1">Memories</span>
        </Link>
        <Link href="/caregiver/settings" className={`flex flex-col items-center justify-center rounded-full px-6 py-2 transition-transform active:scale-90 ${pathname === '/caregiver/settings' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-primary/5'}`}>
          <Settings className="w-6 h-6" />
          <span className="font-lexend text-[10px] font-semibold mt-1">Settings</span>
        </Link>
      </div>
    </nav>
  );
}
