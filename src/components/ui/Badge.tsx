import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gold';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Badge = React.memo(React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'sm', className, children, ...props }, ref) => {
    const variants = {
      default: 'bg-[#1E1E1E] text-[#888]',
      success: 'bg-[#30D158]/15 text-[#30D158]',
      warning: 'bg-[#FF6B00]/15 text-[#FF6B00]',
      danger: 'bg-[#FF3B30]/15 text-[#FF3B30]',
      gold: 'bg-[#F0A500]/15 text-[#F0A500]',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-[10px]',
      md: 'px-3 py-1 text-xs',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-semibold rounded-full',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
));

Badge.displayName = 'Badge';
