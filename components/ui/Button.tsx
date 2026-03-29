import { ButtonHTMLAttributes, forwardRef, AnchorHTMLAttributes } from 'react';
import Link from 'next/link';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement> & {
  href?: string;
};

export const PrimaryButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className = '', children, href, ...props }, ref) => {
    const classes = `h-16 w-full rounded-full bg-linear-to-r from-[#4e0078] to-[#7a2e9e] text-white font-semibold text-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${className}`;
    
    if (href) {
      return (
        <Link href={href} className={classes} {...(props as any)} ref={ref as any}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref as any} className={classes} {...(props as any)}>
        {children}
      </button>
    );
  }
);
PrimaryButton.displayName = 'PrimaryButton';

export const SecondaryButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className = '', children, href, ...props }, ref) => {
    const classes = `h-16 w-full rounded-full bg-white text-[#4e0078] border-2 border-[#4e0078]/10 font-semibold text-xl shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${className}`;
    
    if (href) {
      return (
        <Link href={href} className={classes} {...(props as any)} ref={ref as any}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref as any} className={classes} {...(props as any)}>
        {children}
      </button>
    );
  }
);
SecondaryButton.displayName = 'SecondaryButton';
