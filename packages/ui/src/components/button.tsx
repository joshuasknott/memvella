import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-family-primary text-white shadow-md hover:bg-family-primary/90",
        secondary:
          "border-2 border-family-primary bg-surface text-family-primary shadow-sm hover:bg-canvas",
        ghost:
          "text-text-primary hover:bg-canvas",
        destructive:
          "bg-status-alert text-white shadow-md hover:bg-status-alert/90",
        outline:
          "border border-border bg-surface text-text-primary shadow-sm hover:bg-canvas",
        link:
          "text-family-primary underline-offset-4 hover:underline",
        senior:
          "bg-senior-primary text-white shadow-md hover:bg-senior-primary/90",
        family:
          "bg-family-primary text-white shadow-md hover:bg-family-primary/90",
        familyAccent:
          "bg-family-accent text-white shadow-md hover:bg-family-accent/90",
        highContrast:
          "border-2 border-family-primary bg-surface text-family-primary shadow-sm hover:bg-canvas",
      },
      size: {
        default: "h-10 px-5 text-sm",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
        senior: "h-[72px] w-full px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
