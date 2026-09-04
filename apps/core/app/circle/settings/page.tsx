"use client";

import Link from "next/link";
import {
  Bell,
  ChevronRight,
  Tablet,
  User,
  Users,
  Heart,
  MessageCircle,
} from "lucide-react";
import { useCircleProfile } from "@/lib/use-circle-profile";

export default function SettingsPage() {
  const { isOrganiser, seniorDisplayName } = useCircleProfile();
  const sections = [
    {
      title: `For ${seniorDisplayName}`,
      items: [
        ...(isOrganiser
          ? [
              {
                href: "/circle/settings/pairing",
                title: "Companion tablet",
                description: "Connect or manage a tablet",
                icon: Tablet,
              },
            ]
          : []),
        {
          href: "/circle/people",
          title: "Familiar people",
          description: "The people they know and the stories they share",
          icon: Heart,
        },
      ],
    },
    {
      title: "Sharing & account",
      items: [
        {
          href: "/circle/settings/members",
          title: "Supporters",
          description: "The trusted people helping here",
          icon: Users,
        },
        {
          href: "/circle/settings/account",
          title: "Account details",
          description: "Your name, sign-in, and personal details",
          icon: User,
        },
        ...(isOrganiser
          ? [
              {
                href: "/circle/settings/notifications",
                title: "Notifications",
                description: "Choose what you hear about",
                icon: Bell,
              },
              {
                href: "/circle/insights",
                title: "Updates to review",
                description: "Conversation notes and follow-ups",
                icon: MessageCircle,
              },
            ]
          : []),
      ],
    },
  ];
  return (
    <div className="page-stack settings-page">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Make it yours</p>
          <h1>Settings</h1>
          <p>A few things to keep everyone connected.</p>
        </div>
      </section>
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="settings-section-title">{section.title}</h2>
          <div className="settings-list">
            {section.items.map(({ href, title, description, icon: Icon }) => (
              <Link key={href} href={href}>
                <Icon size={24} aria-hidden="true" />
                <span>
                  <strong>{title}</strong>
                  <span>{description}</span>
                </span>
                <ChevronRight size={20} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
