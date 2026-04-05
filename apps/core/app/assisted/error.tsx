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
      title="The Tablet User screen needs a retry"
      description="This Tablet User route stopped rendering unexpectedly. Retry to bring the session back without a blank screen."
      actionLabel="Retry Assisted screen"
      onRetry={unstable_retry}
    />
  );
}
