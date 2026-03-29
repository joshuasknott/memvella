"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const TAB_ROUTES = [
  "/caregiver",
  "/caregiver/routines",
  "/caregiver/memories",
  "/caregiver/settings",
];

/** Map sub-route path segments to human-readable titles. */
const SUB_ROUTE_TITLES: Record<string, string> = {
  "add-memory": "Add a Memory",
  "add-memory/text": "Write a Story",
  "add-memory/voice": "Record Voice Note",
  "add-memory/audio": "Favorite Song",
  "add-memory/media": "Photo or Video",
  "add-person": "Add Person",
  "add-routine": "Add a Routine",
  insights: "Insights",
  "settings/account": "Account",
  "settings/notifications": "Notifications",
  "settings/pairing": "Device Pairing",
};

function getTitleFromPath(pathname: string): string {
  // Strip the /caregiver/ prefix and match against known sub-routes
  const sub = pathname.replace("/caregiver/", "");
  return SUB_ROUTE_TITLES[sub] ?? "Back";
}

export default function CaregiverHeader() {
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
