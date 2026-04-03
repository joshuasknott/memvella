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
        className={`bg-white/80 backdrop-blur-xl rounded-4xl p-6 md:p-8 shadow-xl shadow-[#4e0078]/5 border border-white ${className}`}
        {...(props as Record<string, unknown>)}
      >
        {children}
      </Component>
    );
  }
);
FormCard.displayName = 'FormCard';
