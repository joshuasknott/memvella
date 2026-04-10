"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-2xl border-b border-slate-200/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
        <Link href="/" onClick={() => setOpen(false)} aria-label="Memvella home">
          <BrandLogo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="#how-it-works"
            className="text-base font-semibold text-slate-700 transition-colors hover:text-slate-900"
          >
            How it Works
          </Link>
          <Link
            href="#trust"
            className="text-base font-semibold text-slate-700 transition-colors hover:text-slate-900"
          >
            Trust &amp; Dignity
          </Link>
        </nav>

        <div className="hidden md:block">
          <Link
            href="#waitlist"
            className="inline-flex h-11 items-center justify-center rounded-full bg-purple-800 px-7 text-base font-semibold text-white transition-all duration-300 ease-out hover:bg-purple-900 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-700 focus-visible:ring-offset-2"
          >
            Get Early Access
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-700"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-200/50 bg-white/80 backdrop-blur-2xl px-6 py-6 md:hidden">
          <nav className="flex flex-col gap-6">
            <Link
              href="#how-it-works"
              className="text-xl font-semibold text-slate-800 hover:text-purple-800"
              onClick={() => setOpen(false)}
            >
              How it Works
            </Link>
            <Link
              href="#trust"
              className="text-xl font-semibold text-slate-800 hover:text-purple-800"
              onClick={() => setOpen(false)}
            >
              Trust &amp; Dignity
            </Link>
            <Link
              href="#waitlist"
              className="inline-flex h-14 items-center justify-center rounded-full bg-purple-800 px-6 text-xl font-semibold text-white transition-colors hover:bg-purple-900"
              onClick={() => setOpen(false)}
            >
              Get Early Access
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
