"use client";

import type { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className = "", delay = 0 }: FadeInProps) {
  return (
    <div
      className={className}
      style={{
        animation: `memvella-fade-in 700ms ${delay}ms cubic-bezier(0.16, 1, 0.3, 1) both`,
      }}
    >
      {children}
    </div>
  );
}
