"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function SupporterError({
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
      title="Supporter tools are temporarily unavailable"
      description="The Supporter workspace hit an unexpected error while loading this route. Retry to restore the latest FamilySpace data."
      actionLabel="Retry Supporter view"
      onRetry={unstable_retry}
    />
  );
}
