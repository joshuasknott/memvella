"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function OrganiserError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title="Workspace tools are temporarily unavailable"
      description="The Workspace hit an unexpected error while loading this route. Retry to restore the latest data."
      actionLabel="Retry Workspace"
      onRetry={unstable_retry}
    />
  );
}
