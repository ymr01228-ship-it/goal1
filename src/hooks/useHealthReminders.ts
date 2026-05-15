import { useState, useEffect, useCallback } from 'react';
import { useHealthStore } from '@/stores/useHealthStore';

export type ReminderType = 'water' | 'stretch' | 'eyes' | 'posture' | 'breathe' | 'nutrition';

interface ActiveReminder {
  type: ReminderType;
  message: string;
  emoji: string;
}

const REMINDER_CONFIG: Record<ReminderType, { emoji: string; messageKey: string }> = {
  water: { emoji: '💧', messageKey: 'health.water' },
  stretch: { emoji: '🏃', messageKey: 'health.stretch' },
  eyes: { emoji: '👁️', messageKey: 'health.eyes' },
  posture: { emoji: '🪑', messageKey: 'health.posture' },
  breathe: { emoji: '🌬️', messageKey: 'health.breathe' },
  nutrition: { emoji: '🍎', messageKey: 'health.nutrition' },
};

export function useHealthReminders() {
  const store = useHealthStore();
  const [activeReminder, setActiveReminder] = useState<ActiveReminder | null>(null);

  const checkReminders = useCallback(() => {
    if (!store.reminderSettings.enabled) return;

    const { reminderSettings } = store;
    const checks: { type: ReminderType; interval: number }[] = [
      { type: 'water', interval: reminderSettings.waterInterval },
      { type: 'stretch', interval: reminderSettings.stretchInterval },
      { type: 'eyes', interval: reminderSettings.eyeRestInterval },
      { type: 'posture', interval: reminderSettings.postureInterval },
      { type: 'breathe', interval: reminderSettings.breathInterval },
    ];

    for (const { type, interval } of checks) {
      if (store.shouldShowReminder(type, interval)) {
        const config = REMINDER_CONFIG[type];
        setActiveReminder({
          type,
          message: config.messageKey,
          emoji: config.emoji,
        });
        store.updateLastReminder(type);
        break;
      }
    }
  }, [store]);

  useEffect(() => {
    const timer = setInterval(checkReminders, 60000);
    // Check once on mount
    setTimeout(checkReminders, 5000);
    return () => clearInterval(timer);
  }, [checkReminders]);

  const dismissReminder = useCallback((type?: ReminderType) => {
    if (type === 'water' || activeReminder?.type === 'water') {
      store.logWater();
    }
    setActiveReminder(null);
  }, [store, activeReminder]);

  return {
    activeReminder,
    dismissReminder,
    todayWater: store.getTodayWater(),
    logWater: store.logWater,
  };
}
