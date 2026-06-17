"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function AppError({
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
      title="This screen ran into a problem"
      description="Memvella could not finish rendering this route. Try the screen again to recover your Workspace session."
      actionLabel="Try again"
      onRetry={unstable_retry}
    />
  );
}
