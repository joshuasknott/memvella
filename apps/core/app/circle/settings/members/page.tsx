"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { UserPlus } from "lucide-react";
import { api } from "@memvella/backend";
import { useCircleProfile } from "@/lib/use-circle-profile";

export default function CircleMembersPage() {
  const { profile, isOrganiser, seniorDisplayName } = useCircleProfile();
  const members = useQuery(
    api.circleInvites.listCircleMembers,
    profile ? {} : "skip",
  );
  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <h1>Supporters</h1>
          <p>Trusted people helping {seniorDisplayName}, together.</p>
        </div>
        {isOrganiser ? (
          <Link href="/circle/settings/invite" className="action-button">
            <UserPlus size={20} aria-hidden="true" /> Invite a Supporter
          </Link>
        ) : null}
      </section>
      {members === undefined ? (
        <p className="loading-message" role="status">
          Loading Supporters…
        </p>
      ) : members.length === 0 ? (
        <div className="empty-state">
          <h2>No Supporters yet</h2>
          <p>Invite someone you trust to help with memories.</p>
        </div>
      ) : (
        <section
          className="panel routine-schedules"
          aria-label="Supporters with access"
        >
          {members.map((member) => (
            <article key={member.id}>
              <div className="min-w-0 flex-1">
                <h2>
                  {member.displayName}
                  {member.isCurrentAccount ? " (you)" : ""}
                </h2>
                {member.authEmail ? (
                  <p className="break-words">{member.authEmail}</p>
                ) : null}
                <p>
                  {member.roleLabel} · Joined{" "}
                  {new Date(member.joinedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
