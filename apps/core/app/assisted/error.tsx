"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function AssistedError({
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
      title="The Assisted Senior screen needs a retry"
      description="This Assisted Senior route stopped rendering unexpectedly. Retry to bring the session back without a blank screen."
      actionLabel="Retry Assisted screen"
      onRetry={unstable_retry}
    />
  );
}
