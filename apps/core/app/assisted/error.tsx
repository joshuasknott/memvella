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
      title="The companion tablet needs a retry"
      description="This companion tablet screen stopped rendering unexpectedly. Retry to bring the session back without a blank screen."
      actionLabel="Retry companion screen"
      onRetry={unstable_retry}
    />
  );
}
