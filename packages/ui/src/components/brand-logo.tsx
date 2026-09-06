import * as React from "react";
import { cn } from "../lib/utils";

export interface BrandLogoProps extends React.HTMLAttributes<HTMLSpanElement> {
  mono?: boolean;
  standalone?: boolean;
}

function BrandLogo({
  className,
  mono = false,
  standalone: _standalone,
  ...props
}: BrandLogoProps) {
  return (
    <span
      role="img"
      aria-label="Memvella"
      className={cn(
        "brand-logo inline-flex shrink-0 items-center gap-2 font-family text-[32px] font-medium leading-none tracking-[-1.4px]",
        mono ? "text-current" : "text-text-primary",
        className,
      )}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        width="28"
        height="28"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={mono ? "" : "text-family-accent"}
      >
        {/* Lucide Flower, the same mark used by the marketing header. */}
        <circle cx="12" cy="12" r="3" />
        <path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5M12 7.5V9M7.5 12H9M16.5 12H15M12 16.5V15m-4-7 1.88 1.88m4.24 0L16 8m-8 8 1.88-1.88m4.24 0L16 16" />
      </svg>
      memvella
    </span>
  );
}
export { BrandLogo };
