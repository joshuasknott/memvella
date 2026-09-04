"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ChevronRight, UserRound, Plus } from "lucide-react";
import { api } from "@memvella/backend";
import { useCircleProfile } from "@/lib/use-circle-profile";

export default function CirclePeoplePage() {
  const { isOrganiser, profile, seniorDisplayName } = useCircleProfile();
  const people = useQuery(api.people.listPeople, profile ? {} : "skip");
  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <h1>Familiar people</h1>
          <p>
            Help the companion recognise the people in {seniorDisplayName}
            &apos;s stories.
          </p>
        </div>
        {isOrganiser ? (
          <Link
            href="/circle/add-person"
            className="action-button"
            data-testid="people-add-person-link"
          >
            <Plus size={20} aria-hidden="true" /> Add a person
          </Link>
        ) : null}
      </section>
      {people === undefined ? (
        <p role="status" className="loading-message">
          Loading familiar people…
        </p>
      ) : people.length === 0 ? (
        <div className="empty-state" data-testid="people-empty-state">
          <UserRound size={32} aria-hidden="true" />
          <h2>A name makes a story more familiar.</h2>
          <p>Add someone {seniorDisplayName} knows, and a little about them.</p>
          {!isOrganiser ? (
            <p>A Supporter with owner access can add people.</p>
          ) : null}
        </div>
      ) : (
        <div className="panel settings-list" data-testid="people-list">
          {people.map((person) => (
            <Link
              key={person.id}
              href={`/circle/people/${person.id}`}
              data-testid={`person-card-${person.id}`}
            >
              {person.photoUrl ? (
                <Image
                  src={person.photoUrl}
                  alt=""
                  width={72}
                  height={72}
                  unoptimized
                  className="h-[72px] w-[72px] shrink-0 rounded-lg object-cover"
                />
              ) : (
                <UserRound size={32} aria-hidden="true" />
              )}
              <span>
                <strong>{person.name}</strong>
                <span>{person.relationship}</span>
                {person.aiContext ? (
                  <span className="line-clamp-2">{person.aiContext}</span>
                ) : null}
              </span>
              <ChevronRight size={20} aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
      <p className="editor-help">
        Adding a person helps with conversation. To give someone account access,{" "}
        <Link
          href="/circle/settings/members"
          className="underline underline-offset-4"
        >
          manage Supporters
        </Link>
        .
      </p>
    </div>
  );
}
