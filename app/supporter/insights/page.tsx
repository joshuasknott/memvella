"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useFamilySpaceProfile } from "@/lib/use-family-space-profile";

export default function InsightsPlaceholderPage() {
  const { seniorDisplayName } = useFamilySpaceProfile();

  return (
    <div className="flex flex-1 w-full flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <p className="mb-2 font-headline text-lg font-bold text-gray-900">
        No new insights to review today.
      </p>
      <p className="mb-6 max-w-[240px] text-base leading-relaxed text-gray-500">
        When Memvella learns something new about {seniorDisplayName}, it will appear here for your approval.
      </p>
      <Link
        href="/supporter"
        className="rounded-full bg-gray-100 px-6 py-4 text-base font-bold text-gray-700 shadow-sm transition-transform active:scale-95"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
