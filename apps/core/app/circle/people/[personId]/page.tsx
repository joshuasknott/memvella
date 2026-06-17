"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Pencil, Trash2, UserRound } from "lucide-react";
import type { Id } from "@memvella/backend/dataModel";
import { api } from "@memvella/backend";
import { PrimaryButton, SecondaryButton } from "@memvella/ui";
import { useToast } from "@/components/ui/ToastProvider";
import { useCircleProfile } from "@/lib/use-circle-profile";

export default function PersonDetailPage() {
  const params = useParams<{ personId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { isOrganiser, profile } = useCircleProfile();
  const personId = params.personId as Id<"people">;
  const person = useQuery(
    api.people.getPersonDetail,
    profile !== undefined ? { personId } : "skip",
  );
  const deletePerson = useMutation(api.people.deletePerson);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!person || isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePerson({ personId });
      toast({
        tone: "success",
        title: "Person deleted",
        description: `${person.name} was removed from People context.`,
      });
      router.push("/circle/people");
    } catch (error) {
      toast({
        tone: "error",
        title: "Person was not deleted",
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (person === undefined) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-family-primary" />
        <p className="text-lg font-medium text-text-secondary">
          Loading this Person...
        </p>
      </div>
    );
  }

  if (person === null) {
    return (
      <div className="flex w-full flex-col gap-6 px-4 pb-32">
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center shadow-sm">
          <p className="text-lg font-bold text-text-primary">Person not found</p>
          <p className="mt-2 text-lg leading-relaxed text-text-secondary">
            This Person is no longer available in the current Workspace.
          </p>
        </div>
        <SecondaryButton href="/circle/people">Back to People</SecondaryButton>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6 px-4 pb-32">
      <section
        className="rounded-xl border border-family-primary/15 bg-surface p-6 shadow-sm"
        data-testid="person-detail"
      >
        <div className="flex items-start gap-5">
          {person.photoUrl ? (
            <Image
              src={person.photoUrl}
              alt={person.name}
              width={96}
              height={96}
              unoptimized
              className="h-24 w-24 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-family-primary/10 text-family-primary">
              <UserRound className="h-10 w-10" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-family-primary">
              Person
            </p>
            <h1 className="mt-2 font-family text-3xl font-extrabold tracking-tight text-text-primary">
              {person.name}
            </h1>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-family-accent/10 px-3 py-2 text-sm font-semibold text-family-accent">
                {person.relationship}
              </span>
              <span className="rounded-full bg-surface-muted px-3 py-2 text-sm font-semibold text-text-secondary">
                {person.isLiving ? "Living" : "In Memory"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="font-family text-lg font-bold text-text-primary">
          Context for Memvella
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-lg leading-relaxed text-text-secondary">
          {person.aiContext || "No additional context has been added yet."}
        </p>
      </section>

      <section className="rounded-xl bg-family-primary/5 p-5 text-base leading-relaxed text-family-primary">
        This Person is context for the companion. They are not a signed-in
        Supporter unless they also appear in Settings under Supporters.
      </section>

      <div className="space-y-3">
        {isOrganiser ? (
          <>
            <PrimaryButton href={`/circle/people/${person.id}/edit`}>
              <Pencil className="h-5 w-5" />
              Edit Person
            </PrimaryButton>

            {showDeleteConfirm ? (
              <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-5">
                <p className="text-base font-bold text-red-700">
                  Delete &quot;{person.name}&quot;?
                </p>
                <p className="text-sm text-red-600">
                  This cannot be undone. Memories remain, but this People
                  context will be removed from the Workspace.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    data-testid="confirm-delete-person-button"
                    className="flex h-[48px] items-center justify-center gap-2 rounded-full bg-status-alert px-5 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95 disabled:opacity-60"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex h-[48px] items-center justify-center rounded-full border border-border bg-surface px-5 text-sm font-semibold text-text-secondary disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                data-testid="delete-person-button"
                className="flex h-[72px] w-full items-center justify-center gap-2 rounded-full bg-status-alert px-6 text-lg font-semibold text-white shadow-md transition-transform active:scale-95"
              >
                <Trash2 className="h-5 w-5" />
                Delete Person
              </button>
            )}
          </>
        ) : (
          <div
            className="rounded-xl border border-border bg-surface p-5 text-base leading-relaxed text-text-secondary"
            data-testid="person-member-readonly-note"
          >
            Supporters can view People context. Ask the Workspace owner to make changes.
          </div>
        )}

        <SecondaryButton href="/circle/people">Back to People</SecondaryButton>
      </div>
    </div>
  );
}
