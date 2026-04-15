"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@memvella/ui";

const TAB_ROUTES = [
  "/circle",
  "/circle/routines",
  "/circle/memories",
  "/circle/settings",
];

/** Map sub-route path segments to human-readable titles. */
const SUB_ROUTE_TITLES: Record<string, string> = {
  "add-memory": "Add a Memory",
  "add-memory/text": "Write a Story",
  "add-memory/voice": "Record Voice Note",
  "add-memory/audio": "Audio Memory",
  "add-memory/media": "Photo or Video",
  "add-person": "Add Person",
  "add-routine": "Add a Routine",
  insights: "Insights",
  "settings/account": "Account",
  "settings/notifications": "Notifications",
  "settings/pairing": "Device Pairing",
};

function getTitleFromPath(pathname: string): string {
  // Strip the /circle/ prefix and match against known sub-routes.
  const sub = pathname.replace("/circle/", "");
  if (sub.startsWith("memories/") && sub.endsWith("/edit")) {
    return "Edit Memory";
  }
  if (sub.startsWith("memories/")) {
    return "Memory Detail";
  }
  return SUB_ROUTE_TITLES[sub] ?? "Back";
}

export default function CircleHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const isTabRoute = TAB_ROUTES.includes(pathname);

  return (
    <header className="fixed top-0 w-full max-w-md bg-[#faf9f6]/90 backdrop-blur-md z-50 h-20 flex items-center px-6 border-b border-gray-100">
      {isTabRoute ? (
        <BrandLogo />
      ) : (
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={() => router.back()}
            className="active:scale-95 duration-150 hover:opacity-80 transition-opacity text-primary"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-headline font-bold text-xl text-on-surface tracking-tight">
            {getTitleFromPath(pathname)}
          </h1>
        </div>
      )}
    </header>
  );
}
