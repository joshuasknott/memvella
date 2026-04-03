import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import Link from "next/link";

type SharedButtonProps = {
  children: ReactNode;
  className?: string;
};

type ButtonVariantProps = SharedButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type LinkVariantProps = SharedButtonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export type ButtonProps = ButtonVariantProps | LinkVariantProps;

function isLinkProps(props: ButtonProps): props is LinkVariantProps {
  return typeof props.href === "string";
}

function primaryClasses(className = "") {
  return `flex h-[72px] w-full items-center justify-center gap-2 rounded-full bg-[#6B21A8] px-6 text-lg font-semibold text-white shadow-md transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${className}`;
}

function secondaryClasses(className = "") {
  return `flex h-[72px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#1D4ED8]/15 bg-white px-6 text-lg font-semibold text-[#1D4ED8] shadow-sm transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${className}`;
}

function ghostClasses(className = "") {
  return `flex h-[72px] w-full items-center justify-center gap-2 rounded-full px-6 text-lg font-semibold text-on-surface hover:bg-surface-container-low transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${className}`;
}

export function PrimaryButton(props: ButtonProps) {
  if (isLinkProps(props)) {
    const { className = "", children, href, ...linkProps } = props;
    return (
      <Link href={href} className={primaryClasses(className)} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { className = "", children, ...buttonProps } = props;
  return (
    <button className={primaryClasses(className)} {...buttonProps}>
      {children}
    </button>
  );
}

export function SecondaryButton(props: ButtonProps) {
  if (isLinkProps(props)) {
    const { className = "", children, href, ...linkProps } = props;
    return (
      <Link href={href} className={secondaryClasses(className)} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { className = "", children, ...buttonProps } = props;
  return (
    <button className={secondaryClasses(className)} {...buttonProps}>
      {children}
    </button>
  );
}

export function GhostButton(props: ButtonProps) {
  if (isLinkProps(props)) {
    const { className = "", children, href, ...linkProps } = props;
    return (
      <Link href={href} className={ghostClasses(className)} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { className = "", children, ...buttonProps } = props;
  return (
    <button className={ghostClasses(className)} {...buttonProps}>
      {children}
    </button>
  );
}
