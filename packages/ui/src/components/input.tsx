import * as React from "react";

import { cn } from "../lib/utils";

function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-16 w-full rounded-2xl border-2 border-border bg-white px-6 text-lg shadow-sm",
        "outline-none transition-all",
        "placeholder:text-text-secondary/50",
        "focus:border-senior-primary focus:ring-2 focus:ring-senior-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "appearance-none",
        className
      )}
      {...props}
    />
  );
}

/** @deprecated Use `Input` directly. Kept for migration compatibility. */
const TextInput = Input;

export { Input, TextInput };
