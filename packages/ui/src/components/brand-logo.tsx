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
        "inline-block shrink-0 font-editorial text-[32px] leading-none tracking-[-1.4px]",
        mono ? "text-current" : "text-family-primary",
        className,
      )}
      {...props}
    >
      Memvella
    </span>
  );
}
export { BrandLogo };
