import { ElementType, HTMLAttributes, forwardRef } from 'react';

export interface FormCardProps extends Omit<HTMLAttributes<HTMLElement>, 'onSubmit'> {
  as?: ElementType;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const FormCard = forwardRef<HTMLElement, FormCardProps>(
  ({ className = '', as: Component = 'div', children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={`bg-surface rounded-xl p-4 md:p-6 shadow-card border border-border ${className}`}
        {...(props as Record<string, unknown>)}
      >
        {children}
      </Component>
    );
  }
);
FormCard.displayName = 'FormCard';
