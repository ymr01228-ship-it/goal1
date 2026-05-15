import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateId } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (type: ToastType, title: string, message?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    return { toast: () => {} };
  }
  return context;
};

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS = {
  success: 'border-[#30D158] text-[#30D158]',
  error: 'border-[#FF3B30] text-[#FF3B30]',
  info: 'border-[#F0A500] text-[#F0A500]',
  warning: 'border-[#FF6B00] text-[#FF6B00]',
};

const ToastItemComponent: React.FC<{ item: ToastItem; onRemove: (id: string) => void }> = ({ item, onRemove }) => {
  const Icon = ICONS[item.type];

  React.useEffect(() => {
    const timer = setTimeout(() => onRemove(item.id), item.duration || 5000);
    return () => clearTimeout(timer);
  }, [item.id, item.duration, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl bg-[#0F0F0F] border shadow-xl shadow-black/30 min-w-[300px] max-w-[420px]',
        COLORS[item.type]
      )}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{item.title}</p>
        {item.message && <p className="text-xs text-[#888] mt-0.5">{item.message}</p>}
      </div>
      <button
        onClick={() => onRemove(item.id)}
        className="p-0.5 text-[#888] hover:text-white shrink-0"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration?: number) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" dir="ltr">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItemComponent key={t.id} item={t} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const Toast = ToastItemComponent;
