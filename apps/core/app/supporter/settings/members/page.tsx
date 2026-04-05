"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowLeft, Mail, ShieldCheck, UserPlus, Users } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { PrimaryButton } from "@/components/ui/Button";
import { FormCard } from "@/components/ui/FormCard";
import { useFamilySpaceProfile } from "@/lib/use-family-space-profile";

function formatJoinedAt(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CircleMembersPage() {
  const { isOrganiser } = useFamilySpaceProfile();
  const members = useQuery(api.familyInvites.listCircleMembers);

  return (
    <div className="flex w-full flex-col gap-6 px-4 pb-12">
      <div className="mb-2">
        <Link
          href="/circle/settings"
          className="inline-flex items-center gap-2 font-semibold text-[#4e0078] transition-opacity hover:opacity-80"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.5} /> Back to Settings
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#4e0078]">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-gray-900">
              Circle Members
            </h1>
          </div>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
            See who currently has family-side access to this Circle and what role each person holds.
          </p>
        </div>

        {isOrganiser ? (
          <PrimaryButton href="/circle/settings/invite">
            <UserPlus className="mr-2 h-5 w-5" />
            Invite a Member
          </PrimaryButton>
        ) : null}
      </div>

      <FormCard className="flex flex-col gap-4">
        {members === undefined ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm font-medium text-slate-600">
            Loading your Circle members...
          </div>
        ) : members.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm font-medium text-slate-600">
            No family-side members are linked to this Circle yet.
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">
                      {member.displayName}
                    </h2>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      {member.roleLabel}
                    </span>
                    {member.isCurrentAccount ? (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">
                        You
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Joined {formatJoinedAt(member.joinedAt)}
                  </p>
                  {member.authEmail ? (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      <Mail className="h-4 w-4" />
                      {member.authEmail}
                    </div>
                  ) : null}
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))
        )}
      </FormCard>
    </div>
  );
}
