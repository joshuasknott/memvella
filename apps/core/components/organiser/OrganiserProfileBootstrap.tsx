"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { useFamilySpaceProfile } from "@/lib/use-family-space-profile";

function normalizeName(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export default function OrganiserProfileBootstrap() {
  const { data: session } = authClient.useSession();
  const { isAuthenticated, isLoading, profile } = useFamilySpaceProfile();
  const createProfile = useMutation(api.organiser.createOrganiserProfile);
  const patchProfile = useMutation(api.organiser.patchOrganiserProfile);

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
