"use client";

import Link from "next/link";
import { CalendarDays, Images, Clock3, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCircleProfile } from "@/lib/use-circle-profile";

const destinations = [
  { href: "/circle", label: "Today", icon: CalendarDays, testId: "home" },
  {
    href: "/circle/memories",
    label: "Memories",
    icon: Images,
    testId: "memories",
  },
  {
    href: "/circle/routines",
    label: "Routines",
    icon: Clock3,
    testId: "routines",
  },
  {
    href: "/circle/settings",
    label: "Settings",
    icon: Settings,
    testId: "settings",
  },
];

export default function CircleBottomNav() {
  const pathname = usePathname();
  const { seniorDisplayName } = useCircleProfile();
  return (
    <aside className="circle-navigation">
      <Link
        href="/circle"
        className="circle-wordmark"
        aria-label="Memvella home"
      >
        Memvella
      </Link>
      <p className="circle-for">For {seniorDisplayName}</p>
      <nav aria-label="Main navigation">
        {destinations.map(({ href, label, icon: Icon, testId }) => {
          const active =
            href === "/circle"
              ? pathname === href
              : pathname.startsWith(href) ||
                (testId === "memories" &&
                  pathname.startsWith("/circle/add-memory")) ||
                (testId === "routines" &&
                  pathname.startsWith("/circle/add-routine")) ||
                (testId === "settings" &&
                  (pathname.startsWith("/circle/people") ||
                    pathname.startsWith("/circle/add-person") ||
                    pathname.startsWith("/circle/insights")));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              data-testid={`circle-nav-${testId}`}
              className={
                testId === "settings" ? "circle-settings-link" : undefined
              }
            >
              <Icon size={23} strokeWidth={1.7} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
