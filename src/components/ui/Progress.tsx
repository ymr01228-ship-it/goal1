import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'gold' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = React.memo(({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const barColors = {
    default: 'bg-white/80',
    gold: 'bg-gradient-to-r from-[#F0A500] to-[#FF6B00]',
    success: 'bg-[#30D158]',
    danger: 'bg-[#FF3B30]',
  };

  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-[#888] mb-1">
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-[#1E1E1E] rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', barColors[variant])}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
});

Progress.displayName = 'Progress';
