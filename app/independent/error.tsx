"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function IndependentError({
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
      title="The Independent Senior view needs a retry"
      description="This route hit an unexpected rendering failure. Retry to reopen the FamilySpace experience."
      actionLabel="Retry Independent view"
      onRetry={unstable_retry}
    />
  );
}
