import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.memo(React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, className, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080808] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]';

    const variants = {
      primary: 'bg-gradient-to-r from-[#F0A500] to-[#FF6B00] text-black hover:shadow-lg hover:shadow-[#F0A500]/25 focus:ring-[#F0A500]',
      secondary: 'bg-[#161616] text-white border border-[#1E1E1E] hover:bg-[#1E1E1E] hover:border-[#333] focus:ring-[#333]',
      danger: 'bg-[#FF3B30] text-white hover:bg-[#FF3B30]/90 focus:ring-[#FF3B30]',
      ghost: 'text-[#888] hover:text-white hover:bg-[#161616] focus:ring-[#333]',
      success: 'bg-[#30D158] text-black hover:bg-[#30D158]/90 focus:ring-[#30D158]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
));

Button.displayName = 'Button';
