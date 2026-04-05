"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useFamilySpaceProfile() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const profile = useQuery(
    api.supporter.getSupporterProfile,
    isAuthenticated ? undefined : "skip",
  );

  return {
    isAuthenticated,
    isLoading,
    profile,
    organiserName: profile?.organiserName?.trim() || "Organiser",
    seniorDisplayName: profile?.seniorDisplayName?.trim() || "your senior",
  };
}
