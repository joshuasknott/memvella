"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowLeft, Mail, ShieldCheck, UserPlus, Users } from "lucide-react";
import { api } from "@memvella/backend";
import { PrimaryButton } from "@memvella/ui";
import { FormCard } from "@/components/ui/FormCard";
import { useCircleProfile } from "@/lib/use-circle-profile";

function formatJoinedAt(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function CircleMembersPage() {
  const { isOrganiser } = useCircleProfile();
  const members = useQuery(api.circleInvites.listCircleMembers);

  return (
    <div className="flex w-full flex-col gap-6 px-4 pb-12">
      <div className="mb-2">
        <Link
          href="/circle/settings"
          className="inline-flex items-center gap-2 font-semibold text-family-primary transition-opacity hover:opacity-80"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2.5} /> Back to Settings
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-family-accent/15 text-family-primary">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="font-family text-3xl font-extrabold tracking-tight text-text-primary">
              Supporters
            </h1>
          </div>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">
            See who currently has access to this Workspace and what each person can do.
          </p>
        </div>

        {isOrganiser ? (
          <PrimaryButton href="/circle/settings/invite">
            <UserPlus className="mr-2 h-5 w-5" />
            Invite a Supporter
          </PrimaryButton>
        ) : null}
      </div>

      <FormCard className="flex flex-col gap-4">
        {members === undefined ? (
          <div className="rounded-xl bg-surface-muted px-4 py-6 text-center text-sm font-medium text-text-secondary">
            Loading Supporters...
          </div>
        ) : members.length === 0 ? (
          <div className="rounded-xl bg-surface-muted px-4 py-6 text-center text-sm font-medium text-text-secondary">
            No Supporters are linked to this Workspace yet.
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="rounded-xl border border-border bg-surface p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-bold text-text-primary">
                      {member.displayName}
                    </h2>
                    <span className="rounded-full bg-surface-muted px-3 py-1 text-sm font-semibold text-text-secondary">
                      {member.roleLabel}
                    </span>
                    {member.isCurrentAccount ? (
                      <span className="rounded-full bg-family-accent/10 px-3 py-1 text-sm font-semibold text-family-accent">
                        You
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">
                    Joined {formatJoinedAt(member.joinedAt)}
                  </p>
                  {member.authEmail ? (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-surface-muted px-3 py-2 text-sm text-text-secondary">
                      <Mail className="h-4 w-4" />
                      {member.authEmail}
                    </div>
                  ) : null}
                </div>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-text-secondary">
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
