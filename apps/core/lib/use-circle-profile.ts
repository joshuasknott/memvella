"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@memvella/backend";

export function useCircleProfile() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const profile = useQuery(
    api.profile.getOrganiserProfile,
    isAuthenticated ? undefined : "skip",
  );
  const role = profile?.role ?? null;
  const isOrganiser = role === "organiser";
  const isMember = role === "member";

  return {
    isAuthenticated,
    isLoading,
    profile,
    role,
    isOrganiser,
    isMember,
    organiserName: profile?.organiserName?.trim() || "Your account",
    seniorDisplayName: profile?.seniorDisplayName?.trim() || "your senior",
  };
}
