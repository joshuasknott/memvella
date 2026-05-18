"use client";

import { Button } from "@memvella/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="hq-panel rounded-lg p-6">
      <p className="text-sm font-bold uppercase text-status-alert">HQ error</p>
      <h1 className="mt-2 text-2xl font-bold text-text-primary">
        This HQ view could not load.
      </h1>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{error.message}</p>
      <Button className="mt-5 rounded-md" onClick={reset} type="button">
        Try again
      </Button>
    </div>
  );
}
