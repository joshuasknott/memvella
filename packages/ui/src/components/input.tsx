import * as React from "react";

import { cn } from "../lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full rounded-xl border border-input-border bg-surface px-4 text-base shadow-sm",
        "outline-none transition-all text-text-primary",
        "placeholder:text-text-secondary",
        "focus:border-family-primary focus:ring-2 focus:ring-family-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

/** @deprecated Use `Input` directly. Kept for migration compatibility. */
const TextInput = Input;

export { Input, TextInput };
