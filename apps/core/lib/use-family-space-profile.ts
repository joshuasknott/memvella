"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useFamilySpaceProfile() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const profile = useQuery(
    api.organiser.getOrganiserProfile,
    isAuthenticated ? undefined : "skip",
  );
  const role = profile?.role ?? null;
  const isOrganiser = role === "organiser" || role === "supporter";
  const isMember = role === "member";

  return {
    isAuthenticated,
    isLoading,
    profile,
    role,
    isOrganiser,
    isMember,
    organiserName: profile?.organiserName?.trim() || "Organiser",
    seniorDisplayName: profile?.seniorDisplayName?.trim() || "your senior",
  };
}
