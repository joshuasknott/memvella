/**
 * Legacy-compatible convenience wrappers around the core `Button` component.
 *
 * These components preserve the PrimaryButton / SecondaryButton / HighContrastButton API
 * that the apps/core codebase relies on:
 *   • Accepts `href` → renders a Next.js `<Link>` via `asChild`
 *   • Accepts normal button props otherwise
 *
 * New code should prefer `<Button variant="…" size="senior" asChild>` directly.
 */

"use client";

import * as React from "react";
import { Button, type buttonVariants } from "./button";
import type { VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

/* ---------- shared types ---------- */

type SharedButtonProps = {
  children: React.ReactNode;
  className?: string;
};

type LegacyButtonProps = SharedButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: string;
  };

/* ---------- internal renderer ---------- */

function LegacyButton({
  variant,
  className,
  href,
  children,
  ...rest
}: LegacyButtonProps & { variant: NonNullable<VariantProps<typeof buttonVariants>["variant"]> }) {
  if (href) {
    return (
      <Button variant={variant} size="senior" className={className} asChild>
        <a href={href} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
          {children}
        </a>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size="senior"
      className={cn(className)}
      {...rest}
    >
      {children}
    </Button>
  );
}

/* ---------- public exports ---------- */

export function PrimaryButton(props: LegacyButtonProps) {
  return <LegacyButton variant="default" {...props} />;
}

export function SecondaryButton(props: LegacyButtonProps) {
  return <LegacyButton variant="secondary" {...props} />;
}

export function GhostButton(props: LegacyButtonProps) {
  return <LegacyButton variant="ghost" {...props} />;
}

export function HighContrastButton(props: LegacyButtonProps) {
  return <LegacyButton variant="highContrast" {...props} />;
}

export type { LegacyButtonProps as ButtonProps };
