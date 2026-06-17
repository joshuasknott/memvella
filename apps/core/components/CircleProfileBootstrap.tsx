"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@memvella/backend";
import { authClient } from "@/lib/auth-client";
import { useCircleProfile } from "@/lib/use-circle-profile";
import { PrimaryButton, SecondaryButton } from "@memvella/ui";

function normalizeName(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export default function CircleProfileBootstrap() {
  const { data: session } = authClient.useSession();
  const { isAuthenticated, isLoading, profile } = useCircleProfile();
  const createProfile = useMutation(api.profile.createOrganiserProfile);
  const patchProfile = useMutation(api.profile.patchOrganiserProfile);
  const hasBootstrapInFlightRef = useRef(false);
  const lastAppliedSeniorDisplayNameRef = useRef<string | null>(null);
  const [bootstrapAttempt, setBootstrapAttempt] = useState(0);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const nextPath = `${window.location.pathname}${window.location.search}`;
      window.location.replace(`/organiser/signin?next=${encodeURIComponent(nextPath)}`);
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (
      isLoading ||
      !isAuthenticated ||
      profile === undefined ||
      hasBootstrapInFlightRef.current
    ) {
      return;
    }

    const pendingSeniorDisplayName = normalizeName(
      localStorage.getItem("memvella_pendingSeniorDisplayName"),
    );

    if (
      pendingSeniorDisplayName &&
      pendingSeniorDisplayName === lastAppliedSeniorDisplayNameRef.current
    ) {
      return;
    }

    const organiserName = normalizeName(session?.user?.name);

    const syncProfile = async () => {
      hasBootstrapInFlightRef.current = true;
      setBootstrapError(null);

      try {
        let appliedSeniorDisplayName = false;

        if (profile === null) {
          await createProfile({
            organiserName,
            seniorDisplayName: pendingSeniorDisplayName,
          });
          appliedSeniorDisplayName = Boolean(pendingSeniorDisplayName);
        } else if (
          pendingSeniorDisplayName &&
          pendingSeniorDisplayName !== profile.seniorDisplayName
        ) {
          await patchProfile({
            seniorDisplayName: pendingSeniorDisplayName,
          });
          appliedSeniorDisplayName = true;
        } else if (
          pendingSeniorDisplayName &&
          pendingSeniorDisplayName === profile.seniorDisplayName
        ) {
          appliedSeniorDisplayName = true;
        }

        if (appliedSeniorDisplayName) {
          lastAppliedSeniorDisplayNameRef.current = pendingSeniorDisplayName ?? null;
          localStorage.removeItem("memvella_pendingSeniorDisplayName");
        }
      } catch (error) {
        console.error("Circle bootstrap failed:", error);
        setBootstrapError(
          error instanceof Error
            ? error.message
            : "Your Workspace could not be prepared right now.",
        );
      } finally {
        hasBootstrapInFlightRef.current = false;
      }
    };

    void syncProfile();
  }, [
    createProfile,
    bootstrapAttempt,
    isAuthenticated,
    isLoading,
    patchProfile,
    profile,
    session?.user?.name,
  ]);

  const readyStatus = !isAuthenticated
    ? "unauthenticated"
    : isLoading || profile === undefined
      ? "loading"
      : profile === null || hasBootstrapInFlightRef.current
        ? "bootstrapping"
        : "ready";

  return (
    <>
      <div
        data-testid="circle-ready"
        data-status={bootstrapError ? "error" : readyStatus}
        data-role={profile?.role ?? ""}
        hidden
      />
      {bootstrapError ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-canvas/95 px-6">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 text-center shadow-lg">
            <h1 className="font-family text-2xl font-bold text-text-primary">
              Your Workspace could not be prepared
            </h1>
            <p className="mt-3 text-base leading-relaxed text-text-secondary">
              {bootstrapError}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <PrimaryButton
                type="button"
                onClick={() => setBootstrapAttempt((attempt) => attempt + 1)}
                data-testid="circle-bootstrap-retry-button"
              >
                Try again
              </PrimaryButton>
              <SecondaryButton
                type="button"
                onClick={() => {
                  void authClient.signOut().finally(() => {
                    window.location.replace("/organiser/signin");
                  });
                }}
              >
                Sign out
              </SecondaryButton>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
