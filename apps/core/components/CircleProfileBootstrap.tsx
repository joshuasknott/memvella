"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@memvella/backend";
import { authClient } from "@/lib/auth-client";
import { useCircleProfile } from "@/lib/use-circle-profile";

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

      try {
        let appliedSeniorDisplayName = false;

        if (profile === null) {
          await createProfile({
            organiserName,
            seniorDisplayName: pendingSeniorDisplayName,
            role: "organiser",
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
        console.warn("Profile bootstrap deferred:", error);
      } finally {
        hasBootstrapInFlightRef.current = false;
      }
    };

    void syncProfile();
  }, [
    createProfile,
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
    <div
      data-testid="circle-ready"
      data-status={readyStatus}
      data-role={profile?.role ?? ""}
      hidden
    />
  );
}
