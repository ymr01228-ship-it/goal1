import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getToday } from '@/lib/utils';

interface ReminderSettings {
  waterInterval: number;
  stretchInterval: number;
  eyeRestInterval: number;
  postureInterval: number;
  breathInterval: number;
  enabled: boolean;
  soundEnabled: boolean;
  volume: number;
}

interface HealthStore {
  waterIntake: Record<string, number>;
  lastReminderTimes: Record<string, number>;
  reminderSettings: ReminderSettings;
  bedtime: string;
  logWater: () => void;
  getTodayWater: () => number;
  updateLastReminder: (type: string) => void;
  updateReminderSettings: (settings: Partial<ReminderSettings>) => void;
  setBedtime: (time: string) => void;
  shouldShowReminder: (type: string, intervalMinutes: number) => boolean;
}

export const useHealthStore = create<HealthStore>()(
  persist(
    (set, get) => ({
      waterIntake: {},
      lastReminderTimes: {},
      reminderSettings: {
        waterInterval: 45,
        stretchInterval: 60,
        eyeRestInterval: 20,
        postureInterval: 90,
        breathInterval: 120,
        enabled: true,
        soundEnabled: true,
        volume: 0.5,
      },
      bedtime: '23:00',

      logWater: () => {
        const today = getToday();
        set((state) => ({
          waterIntake: {
            ...state.waterIntake,
            [today]: (state.waterIntake[today] || 0) + 1,
          },
        }));
      },

      getTodayWater: () => {
        const today = getToday();
        return get().waterIntake[today] || 0;
      },

      updateLastReminder: (type) => {
        set((state) => ({
          lastReminderTimes: {
            ...state.lastReminderTimes,
            [type]: Date.now(),
          },
        }));
      },

      updateReminderSettings: (settings) => {
        set((state) => ({
          reminderSettings: { ...state.reminderSettings, ...settings },
        }));
      },

      setBedtime: (time) => set({ bedtime: time }),

      shouldShowReminder: (type, intervalMinutes) => {
        const lastTime = get().lastReminderTimes[type];
        if (!lastTime) return true;
        const elapsed = (Date.now() - lastTime) / (1000 * 60);
        return elapsed >= intervalMinutes;
      },
    }),
    {
      name: 'focusos-health',
    }
  )
);
