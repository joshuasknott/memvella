"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ChevronRight, UserRound, UserRoundPlus } from "lucide-react";
import { api } from "@memvella/backend";
import { Button, PrimaryButton } from "@memvella/ui";
import { useCircleProfile } from "@/lib/use-circle-profile";

function PeopleSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-xl border border-border bg-surface p-5 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-surface-muted" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-24 rounded bg-surface-muted" />
              <div className="h-5 w-40 rounded bg-surface-muted" />
              <div className="h-4 w-full rounded bg-surface-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CirclePeoplePage() {
  const { isOrganiser, profile, seniorDisplayName } = useCircleProfile();
  const people = useQuery(
    api.people.listPeople,
    profile !== undefined ? {} : "skip",
  );

  return (
    <div className="flex w-full flex-col gap-6 px-4 pb-32">
      <section className="rounded-xl border border-family-primary/15 bg-surface p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-family-primary">
              People Context
            </p>
            <h1 className="mt-2 font-family text-3xl font-extrabold tracking-tight text-text-primary">
              People
            </h1>
            <p className="mt-2 text-lg leading-relaxed text-text-secondary">
              People {seniorDisplayName} knows who help Memvella understand memories and
              conversations for {seniorDisplayName}.
            </p>
          </div>
          {isOrganiser ? (
            <Button variant="family" size="default" asChild>
              <Link href="/circle/add-person" data-testid="people-add-person-link">
                <UserRoundPlus className="h-4 w-4" />
                Add
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="mt-5 rounded-xl bg-family-primary/5 p-4 text-base leading-relaxed text-family-primary">
          People are not Supporters. Supporters are the signed-in helpers listed in Settings; People are context for the companion.
        </div>
      </section>

      {people === undefined ? (
        <PeopleSkeleton />
      ) : people.length === 0 ? (
        <section
          className="rounded-xl border border-dashed border-border bg-surface p-8 text-center shadow-sm"
          data-testid="people-empty-state"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-family-primary/10 text-family-primary">
            <UserRound className="h-7 w-7" />
          </div>
          <p className="mt-4 text-lg font-bold text-text-primary">
            No People added yet
          </p>
          <p className="mt-2 text-lg leading-relaxed text-text-secondary">
            Add the first Person so memories and voice conversations can use
            clearer context.
          </p>
          {isOrganiser ? (
            <div className="mt-6">
              <PrimaryButton href="/circle/add-person">
                Add the first Person
              </PrimaryButton>
            </div>
          ) : (
            <p className="mt-5 rounded-xl bg-surface-muted p-4 text-base font-medium text-text-secondary">
              Ask the Workspace owner to add People for this Workspace.
            </p>
          )}
        </section>
      ) : (
        <div className="space-y-3" data-testid="people-list">
          {people.map((person) => (
            <Link
              key={person.id}
              href={`/circle/people/${person.id}`}
              className="block rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-family-primary/20"
              data-testid={`person-card-${person.id}`}
            >
              <div className="flex items-center gap-4">
                {person.photoUrl ? (
                  <Image
                    src={person.photoUrl}
                    alt={person.name}
                    width={72}
                    height={72}
                    unoptimized
                    className="h-[72px] w-[72px] shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl bg-family-primary/10 text-family-primary">
                    <UserRound className="h-8 w-8" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-family-accent">
                    {person.relationship}
                  </p>
                  <p className="mt-1 text-xl font-bold leading-tight text-text-primary">
                    {person.name}
                  </p>
                  <p className="mt-2 line-clamp-2 text-base leading-relaxed text-text-secondary">
                    {person.aiContext || "No context added yet."}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-text-secondary" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
