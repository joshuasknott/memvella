"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function CircleHeader() {
  const path = usePathname();
  const topLevel = [
    "/circle",
    "/circle/memories",
    "/circle/routines",
    "/circle/settings",
  ].includes(path);
  const parent =
    path.includes("memory") || path.includes("memories")
      ? "/circle/memories"
      : path.includes("routine")
        ? "/circle/routines"
        : path.includes("people") || path.includes("person")
          ? "/circle/people"
          : "/circle/settings";
  return (
    <header
      className={`circle-mobile-header ${topLevel ? "circle-top-level" : ""}`}
    >
      {!topLevel ? (
        <Link
          href={parent === path ? "/circle/settings" : parent}
          className="quiet-link"
        >
          <ArrowLeft size={20} aria-hidden="true" /> Back
        </Link>
      ) : null}
      <Link
        href="/circle"
        className="circle-wordmark"
        aria-label="Memvella home"
      >
        Memvella
      </Link>
    </header>
  );
}
