import React, { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
  preventClose?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = React.memo(({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  preventClose = false,
  className,
}) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !preventClose) {
      onClose();
    }
  }, [onClose, preventClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    // Always restore on cleanup (handles both isOpen change and unmount)
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, handleKeyDown]);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] max-h-[95vh]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={preventClose ? undefined : onClose}
            aria-hidden="true"
          />
          <motion.div
            className={cn(
              'relative w-full rounded-2xl bg-[#0F0F0F] border border-[#1E1E1E] shadow-2xl overflow-auto max-h-[90vh]',
              sizes[size],
              className
            )}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {(title || showClose) && (
              <div className="flex items-center justify-between p-5 border-b border-[#1E1E1E]">
                {title && (
                  <h2 className="text-lg font-bold text-white">{title}</h2>
                )}
                {showClose && !preventClose && (
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-[#1E1E1E] transition-colors"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            <div className="p-5">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

Modal.displayName = 'Modal';
