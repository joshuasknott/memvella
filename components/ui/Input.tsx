import { InputHTMLAttributes, forwardRef } from 'react';

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`h-16 w-full rounded-2xl px-6 bg-white border-2 border-gray-200 text-lg shadow-sm appearance-none outline-none focus:outline-none focus:ring-2 focus:ring-[#4e0078]/50 focus:border-transparent transition-all placeholder:text-outline/50 ${className}`}
        {...props}
      />
    );
  }
);
TextInput.displayName = 'TextInput';
