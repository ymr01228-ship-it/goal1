import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card = React.memo(React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className, children, ...props }, ref) => {
    const variants = {
      default: 'bg-[#0F0F0F] border border-[#1E1E1E]',
      glass: 'bg-[#0F0F0F]/80 backdrop-blur-xl border border-white/5',
      elevated: 'bg-[#161616] border border-[#1E1E1E] shadow-xl shadow-black/20',
      bordered: 'bg-transparent border-2 border-[#1E1E1E]',
    };

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-7',
    };

    return (
      <div
        ref={ref}
        className={cn('rounded-2xl transition-all duration-200', variants[variant], paddings[padding], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
));

Card.displayName = 'Card';
