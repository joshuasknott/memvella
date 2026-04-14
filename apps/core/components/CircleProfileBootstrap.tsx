"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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

  useEffect(() => {
    if (isLoading || !isAuthenticated || profile === undefined) {
      return;
    }

    const pendingSeniorDisplayName = normalizeName(
      localStorage.getItem("memvella_pendingSeniorDisplayName"),
    );
    const organiserName = normalizeName(session?.user?.name);

    const syncProfile = async () => {
      try {
        if (profile === null) {
          await createProfile({
            organiserName,
            seniorDisplayName: pendingSeniorDisplayName,
            role: "organiser",
          });
        } else if (
          pendingSeniorDisplayName &&
          pendingSeniorDisplayName !== profile.seniorDisplayName
        ) {
          await patchProfile({
            seniorDisplayName: pendingSeniorDisplayName,
          });
        }

        if (pendingSeniorDisplayName) {
          localStorage.removeItem("memvella_pendingSeniorDisplayName");
        }
      } catch (error) {
        console.warn("Profile bootstrap deferred:", error);
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

  return null;
}
