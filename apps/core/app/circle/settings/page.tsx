"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import {
  Bell,
  ChevronRight,
  KeyRound,
  MonitorSmartphone,
  User,
  Users,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useCircleProfile } from "@/lib/use-circle-profile";

export default function OrganiserSettingsPage() {
  const { isOrganiser, seniorDisplayName } = useCircleProfile();
  const assistedSessions = useQuery(
    api.organiser.listAssistedDeviceSessions,
    isOrganiser ? undefined : "skip",
  );
  const activeSessionCount = assistedSessions?.length ?? 0;

  return (
    <div className="flex w-full flex-col gap-6 px-4">
      <div>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-gray-900">
          Settings
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          {isOrganiser
            ? "Manage your account, people, and Circle access."
            : "Manage your account and stay in sync with your Circle."}
        </p>
      </div>

      <section className="space-y-3">
        <Link
          href="/circle/settings/account"
          className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition-colors active:bg-gray-50"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-xl bg-gray-100 p-2.5">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <span className="text-lg font-semibold text-gray-900">
              Account Details
            </span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </Link>
        <Link
          href="/circle/settings/members"
          className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition-colors active:bg-gray-50"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-xl bg-gray-100 p-2.5">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <span className="text-lg font-semibold text-gray-900">
              Circle Members
            </span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </Link>
        {isOrganiser ? (
          <Link
            href="/circle/settings/invite"
            className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition-colors active:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center rounded-xl bg-gray-100 p-2.5">
                <KeyRound className="h-5 w-5 text-gray-600" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Invite Codes
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        ) : null}
        {isOrganiser ? (
          <Link
            href="/circle/settings/notifications"
            className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition-colors active:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center rounded-xl bg-gray-100 p-2.5">
                <Bell className="h-5 w-5 text-gray-600" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Notifications
              </span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        ) : null}
      </section>

      {isOrganiser ? (
        <section>
        <div className="mb-3 px-2">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">
            Connections
          </span>
        </div>
        <Link
          href="/circle/settings/pairing"
          className="mt-2 flex items-center justify-between rounded-3xl border border-purple-200 bg-purple-50/30 p-5 shadow-sm transition-colors active:bg-purple-50/60"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-xl bg-purple-100 p-2.5">
              <MonitorSmartphone className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-lg font-semibold text-gray-900">
                Pair Tablet User Device
              </span>
              <span className="mt-1 text-sm font-medium text-purple-600/70">
                {activeSessionCount > 0
                  ? `${activeSessionCount} active tablet session${activeSessionCount === 1 ? "" : "s"} for ${seniorDisplayName}`
                  : `Link a new tablet for ${seniorDisplayName}`}
              </span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-purple-400" />
        </Link>
        </section>
      ) : null}
    </div>
  );
}
